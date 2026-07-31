import { CallManager } from "./CallManager.js";

export class CallUI {
  constructor(ws, userData) {
    this.userData = userData;
    this.manager = new CallManager(ws, userData);

    this.panel = document.getElementById("call-panel");
    this.peersBox = document.getElementById("call-peers");
    this.timeEl = document.getElementById("call-time");
    this.muteBtn = document.getElementById("call-mute");
    this.enlargeBtn = document.getElementById("call-enlarge");

    this.btn = document.getElementById("login-call");
    if (this.btn) this.btn.onclick = () => (this.manager.inCall ? this.manager.leave() : this.manager.join());
    this.muteBtn.onclick = () => this.manager.toggleMute();
    document.getElementById("call-leave").onclick = () => this.manager.leave();
    this.enlargeBtn.onclick = () => this._toggleEnlarge();

    this._wire();
  }

  _wire() {
    const m = this.manager;
    m.onSelfJoined = () => this._show();
    m.onSelfLeft = () => this._hide();
    m.onPeerJoined = (uid, user) => this._addCard(uid, user);
    m.onPeerLeft = (uid) => this._removeCard(uid);
    m.onRemoteStream = (uid, s) => this._addAudio(uid, s);
    m.onMuteChange = (uid, mut) => this._setMute(uid, mut);
  }

  _show() {
    this.peersBox.innerHTML = "";
    this._addCard(this.userData.uid, this.userData, true);
    this.panel.hidden = false;
    this.btn?.classList.add("is-active");
    this._startTimer();
  }

  _hide() {
    this._stopTimer();
    this.panel.querySelectorAll("audio").forEach((a) => {
      a.srcObject?.getTracks().forEach((t) => t.stop());
      a.remove();
    });
    this.peersBox.innerHTML = "";
    this.panel.hidden = true;
    this.btn?.classList.remove("is-active");
  }

  _addCard(uid, user, self = false) {
    this.peersBox.insertAdjacentHTML("beforeend",
      `<div class="call-card${self ? " call-card--self" : ""}" data-uid="${uid}">
         <p>${user.kaomoji}</p>
         <span class="call-card__mute" hidden>🔇</span>
       </div>`);
  }

  _removeCard(uid) {
    this.peersBox.querySelector(`.call-card[data-uid="${uid}"]`)?.remove();
    const a = this.panel.querySelector(`audio[data-uid="${uid}"]`);
    if (a) { a.srcObject?.getTracks().forEach((t) => t.stop()); a.remove(); }
  }

  _addAudio(uid, stream) {
    const a = new Audio();
    a.srcObject = stream;
    a.dataset.uid = uid;
    a.autoplay = true;
    a.volume = this.manager.participants.get(uid).volume;
    this.panel.append(a);
  }

  _setMute(uid, muted) {
    const badge = this.peersBox.querySelector(`.call-card[data-uid="${uid}"] .call-card__mute`);
    if (badge) badge.hidden = !muted;
    if (uid === this.userData.uid) this.muteBtn.classList.toggle("is-muted", muted);
  }

  // v: 0..1, по умолчанию 1 (100%). Кнопок пока нет — зови откуда угодно.
  setVolume(uid, v) {
    this.manager.participants.setVolume(uid, v);
    const a = this.panel.querySelector(`audio[data-uid="${uid}"]`);
    if (a) a.volume = v;
  }

  _startTimer() {
    this._t0 = Date.now();
    this._timer = setInterval(() => {
      const s = Math.floor((Date.now() - this.manager.startedAt) / 1000);
      this.timeEl.textContent = `${String((s / 60) | 0).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
    }, 1000);
  }

  _stopTimer() {
    clearInterval(this._timer);
    this.timeEl.textContent = "00:00";
  }

  _toggleEnlarge() {
    const min = this.panel.classList.toggle("minimized");
    this.enlargeBtn.firstElementChild.className = min ? "iconoir-enlarge" : "iconoir-reduce";
  }

  destroy() {
    this.manager.leave();
    if (this.btn) this.btn.onclick = null;
  }
}
