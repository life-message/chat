import { PeerConnection } from "./PeerConnection.js";

/**
 * CallManager — оркестратор mesh-звонка.
 *
 * Владеет Map<uid, PeerConnection>, локальным MediaStream и сигналингом.
 * Сам ничего не рисует — наружу торчат колбэки, UI подписывается на них.
 *
 * Колбэки (навешиваются как свойства):
 *   onSelfJoined()                  — локальный юзер вошёл
 *   onSelfLeft()                    — локальный юзер вышел
 *   onPeerJoined(uid, user)         — в звонке появился участник (user = сообщение call/join)
 *   onPeerLeft(uid)                 — участник вышел
 *   onRemoteStream(uid, stream)     — пришёл удалённый MediaStream (вешать на <audio>)
 *   onMuteChange(uid, muted)        — участник сменил мьют (включая себя)
 */
export class CallManager {
  constructor(ws, userData) {
    this.ws = ws;
    this.userData = userData;
    this.uid = userData.uid;
    this.peers = new Map();
    this.localStream = null;
    this.inCall = false;
    this.muted = false;

    this.onSelfJoined = null;
    this.onSelfLeft = null;
    this.onPeerJoined = null;
    this.onPeerLeft = null;
    this.onRemoteStream = null;
    this.onMuteChange = null;

    this._bind();
  }

  // ── Публичное API ─────────────────────────────────────────────

  async join() {
    if (this.inCall) return;
    this.localStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    this.inCall = true;
    this.ws.send({ type: "call/join", ...this.userData });
    this.onSelfJoined?.();
  }

  leave() {
    if (!this.inCall) return;
    this.ws.send({ type: "call/leave", uid: this.uid });
    this._teardown();
    this.onSelfLeft?.();
  }

  toggleMute() {
    if (!this.inCall) return;
    this.muted = !this.muted;
    this.localStream.getAudioTracks().forEach((t) => (t.enabled = !this.muted));
    this.ws.send({ type: "call/mute", uid: this.uid, muted: this.muted });
    this.onMuteChange?.(this.uid, this.muted);
  }

  // ── Сигналинг ─────────────────────────────────────────────────

  _bind() {
    this.ws.on("call/join", (m) => this._onJoin(m));
    this.ws.on("call/offer", (m) => this._onOffer(m));
    this.ws.on("call/answer", (m) => this._onAnswer(m));
    this.ws.on("call/ice", (m) => this._onIce(m));
    this.ws.on("call/leave", (m) => this._onLeave(m));
    this.ws.on("call/mute", (m) => this._onMute(m));
  }

  async _onJoin(m) {
    if (!this.inCall || m.uid === this.uid) return;
    this.onPeerJoined?.(m.uid, m);
    const offer = await this._getPeer(m.uid).createOffer();
    this.ws.send({ type: "call/offer", uid: this.uid, targetUid: m.uid, sdp: offer });
  }

  async _onOffer(m) {
    if (!this.inCall || m.targetUid !== this.uid) return;
    const peer = this._getPeer(m.uid);
    if (peer.glare) {
      if (this.uid > m.uid) return;
      await peer.rollback();
    }
    const answer = await peer.handleOffer(m.sdp);
    this.ws.send({ type: "call/answer", uid: this.uid, targetUid: m.uid, sdp: answer });
  }

  _onAnswer(m) {
    if (!this.inCall || m.targetUid !== this.uid) return;
    this.peers.get(m.uid)?.handleAnswer(m.sdp);
  }

  _onIce(m) {
    if (!this.inCall || m.targetUid !== this.uid) return;
    this.peers.get(m.uid)?.addIceCandidate(m.candidate);
  }

  _onLeave(m) {
    if (m.uid === this.uid) return;
    this._removePeer(m.uid);
    this.onPeerLeft?.(m.uid);
  }

  _onMute(m) {
    if (m.uid === this.uid) return;
    this.onMuteChange?.(m.uid, m.muted);
  }

  // ── Внутреннее ────────────────────────────────────────────────

  _getPeer(uid) {
    if (!this.peers.has(uid)) {
      const peer = new PeerConnection(
        uid,
        (remoteUid, candidate) =>
          this.ws.send({ type: "call/ice", uid: this.uid, targetUid: remoteUid, candidate }),
        (remoteUid, stream) => this.onRemoteStream?.(remoteUid, stream)
      );
      this.localStream.getTracks().forEach((t) => peer.addTrack(t, this.localStream));
      this.peers.set(uid, peer);
    }
    return this.peers.get(uid);
  }

  _removePeer(uid) {
    this.peers.get(uid)?.close();
    this.peers.delete(uid);
  }

  _teardown() {
    this.peers.forEach((_, uid) => this._removePeer(uid));
    this.localStream?.getTracks().forEach((t) => t.stop());
    this.localStream = null;
    this.inCall = false;
    this.muted = false;
  }
}
