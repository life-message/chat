// calls/CallUI.js

import { CallManager } from "./CallManager.js";

/**
 * CallUI — UI-слой звонка.
 *
 * Инкапсулирует CallManager и отрисовку: панель участников,
 * кнопки управления, скрытые <audio> для удалённых потоков.
 *
 * Использование:
 *   import { CallUI } from "./calls/CallUI.js";
 *   new CallUI(chatWs, getCurrentUserData());   // chatWs — инстанс ChatWebSocket
 *
 * Точка входа — кнопка #login-call. Один клик — вход/создание,
 * повторный — выход. Кнопка ищется через SPA, поэтому работает
 * и после перерисовки DOM при навигации.
 */
export class CallUI {
  constructor(ws, userData) {
    this.userData = userData;
    this.manager = new CallManager(ws, userData);
    this.panel = null;
    this.audioBox = null;

    // DOM чата уже готов (его дождался внешний SPA на #message)
    this.btn = document.getElementById("login-call");
    if (this.btn)
      this.btn.onclick = () =>
        this.manager.inCall ? this.manager.leave() : this.manager.join();

    this._wire();
  }

  destroy() {
    this.manager.leave();      // шлёт call/leave, закрывает пиры
    this._hidePanel();
    if (this.btn) this.btn.onclick = null;
  }

  _wire() {
    const m = this.manager;
    m.onSelfJoined = () => this._showPanel();
    m.onSelfLeft = () => this._hidePanel();
    m.onPeerJoined = (uid, user) => this._addCard(uid, user);
    m.onPeerLeft = (uid) => this._removeCard(uid);
    m.onRemoteStream = (uid, stream) => this._addAudio(uid, stream);
    m.onMuteChange = (uid, muted) => this._setMute(uid, muted);
  }

  _bindButton() {
    this.btn = document.getElementById("login-call");
    this.btn.onclick = () =>
      this.manager.inCall ? this.manager.leave() : this.manager.join();
  }

  // ── Панель ────────────────────────────────────────────────────

  _showPanel() {
    this._hidePanel();
    document.body.insertAdjacentHTML("beforeend", `
      <aside id="call-panel" class="call-panel">
        <header class="call-panel__head">
          <span class="call-panel__dot"></span>
          <span class="call-panel__title">Звонок</span>
          <span id="call-count" class="call-panel__count">1</span>
        </header>
        <div id="call-peers" class="call-panel__peers"></div>
        <footer class="call-panel__controls">
          <button id="call-mute" class="call-ctrl iconoir-mic" title="Микрофон"></button>
          <button id="call-leave" class="call-ctrl call-ctrl--leave iconoir-phone" title="Выйти"></button>
        </footer>
      </aside>
      <div id="call-audio" hidden></div>
    `);
    this.panel = document.getElementById("call-panel");
    this.audioBox = document.getElementById("call-audio");
    document.getElementById("call-mute").onclick = () => this.manager.toggleMute();
    document.getElementById("call-leave").onclick = () => this.manager.leave();

    this._addCard(this.userData.uid, this.userData, true);
    this.btn?.classList.add("is-active");
  }

  _hidePanel() {
    this.panel?.remove();
    this.audioBox?.remove();
    this.panel = this.audioBox = null;
    this.btn?.classList.remove("is-active");
  }

  // ── Участники ─────────────────────────────────────────────────

  _addCard(uid, user, self = false) {
    document.getElementById("call-peers")?.insertAdjacentHTML("beforeend", `
      <div class="call-card${self ? " call-card--self" : ""}" data-uid="${uid}">
        <div class="call-card__avatar">${user.kaomoji || "(・ω・)"}</div>
        <div class="call-card__name">${user.username}</div>
        <span class="call-card__mute iconoir-mic-mute" hidden></span>
      </div>
    `);
    this._updateCount();
  }

  _removeCard(uid) {
    document.querySelector(`.call-card[data-uid="${uid}"]`)?.remove();
    this.audioBox?.querySelector(`audio[data-uid="${uid}"]`)?.remove();
    this._updateCount();
  }

  _addAudio(uid, stream) {
    const a = new Audio();
    a.srcObject = stream;
    a.dataset.uid = uid;
    a.autoplay = true;
    this.audioBox?.append(a);
  }

  _setMute(uid, muted) {
    const badge = document.querySelector(`.call-card[data-uid="${uid}"] .call-card__mute`);
    if (badge) badge.hidden = !muted;
    if (uid === this.userData.uid)
      document.getElementById("call-mute")?.classList.toggle("is-muted", muted);
  }

  _updateCount() {
    const c = document.getElementById("call-count");
    if (c) c.textContent = document.querySelectorAll(".call-card").length;
  }
}
