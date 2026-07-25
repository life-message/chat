export class ChatWebSocket {
  constructor(roomId, userData) {
    this.roomId = roomId;
    this.userData = userData;
    this.ws = null;
    this.handlers = new Map();
  }

  connect() {
    const wsUrl = `ws://127.0.0.1:3000/ws/${this.roomId}`;
    this.ws = new WebSocket(wsUrl);

    this.ws.onopen = () => {
      this.send({ ...this.userData, type: 'users/join' });
    };

    this.ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        this.handleMessage(msg);
      } catch (error) {
        console.error('Ошибка разбора сообщения WebSocket:', error);
      }
    };

    return this;
  }

  on(type, handler) {
    if (!this.handlers.has(type)) {
      this.handlers.set(type, []);
    }
    this.handlers.get(type).push(handler);
    return this;
  }

  handleMessage(msg) {
    const handlers = this.handlers.get(msg.type) || [];
    handlers.forEach(handler => handler(msg));

    // Для неизвестных типов
    if (msg.username !== undefined && msg.text !== undefined) {
      const defaultHandlers = this.handlers.get('message') || [];
      defaultHandlers.forEach(handler => handler(msg));
    }
  }

  send(data) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    }
  }

  close() {
    this.ws?.close();
  }

  get readyState() {
    return this.ws?.readyState;
  }
}
