const ICE = [{ urls: "stun:stun.l.google.com:19302" }];

export class PeerConnection {
  constructor(remoteUid, onIce, onTrack) {
    this.remoteUid = remoteUid;
    this.pc = new RTCPeerConnection({ iceServers: ICE });

    this.pc.onicecandidate = (e) => {
      if (e.candidate) onIce(remoteUid, e.candidate);
    };

    this.pc.ontrack = (e) => onTrack(remoteUid, e.streams[0]);
  }

  addTrack(track, stream) {
    this.pc.addTrack(track, stream);
  }

  get glare() {
    return this.pc.signalingState === "have-local-offer";
  }

  async rollback() {
    await this.pc.setLocalDescription({ type: "rollback" });
  }

  createDataChannel(label, opts) {
    return this.pc.createDataChannel(label, opts);
  }

  onDataChannel(cb) {
    this.pc.ondatachannel = (e) => cb(e.channel);
  }

  async createOffer() {
    const offer = await this.pc.createOffer();
    await this.pc.setLocalDescription(offer);
    return offer;
  }

  async handleOffer(offer) {
    await this.pc.setRemoteDescription(offer);
    const answer = await this.pc.createAnswer();
    await this.pc.setLocalDescription(answer);
    return answer;
  }

  async handleAnswer(answer) {
    await this.pc.setRemoteDescription(answer);
  }

  addIceCandidate(candidate) {
    this.pc.addIceCandidate(candidate);
  }

  close() {
    this.pc.close();
  }
}
