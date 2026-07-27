import { ChatWebSocket } from "./websocket.js";
import { ChatUI } from "./ui.js";
import { UsersManager } from "./users.js";
import { SPA } from "https://cdn.jsdelivr.net/gh/live-message/cdn@0.3.0/js/utils/spa.js";

export function initChat() {
  const match = window.location.pathname.match(/\/chat\/([^/?]+)/);
  const roomId = match ? match[1] : null;

  if (!roomId) return null;

  function getCurrentUserData() {
    return {
      avatar: localStorage.getItem("avatar"),
      uid: localStorage.getItem("uid"),
      username: localStorage.getItem("username"),
    };
  }

  const userData = getCurrentUserData();

  // Создаём экземпляры
  const ws = new ChatWebSocket(roomId, userData);
  const usersManager = window.UsersManager || new UsersManager();
  const ui = new ChatUI(usersManager);
  ui.displayDiv();

  if (window.UsersManager) {
    window.UsersManager.init(userData);
  }

  ws.on("users/welcome", (msg) => {
    usersManager.add(msg);
    ui.displayDiv();
  })
    .on("users/join", (msg) => {
      usersManager.add(msg);
      ui.updateMessage(`${msg.username} подключился`, msg);
      ws.send({ ...getCurrentUserData(), type: "users/welcome" });
    })
    .on("users/exit", (msg) => {
      if (msg.uid) {
        usersManager.remove(msg.uid);
      }
      ui.updateMessage(`${msg.username} отключился`, msg);
    })
    .on("message", (msg) => {
      usersManager.update(msg);
      ui.updateMessage(`${msg.username}: ${msg.text}`, msg);
    });

  ui.onInput(() => {
    const text = ui.textarea?.value || "";
    ws.send({ ...getCurrentUserData(), text });
  });

  ui.onReset(() => {
    ui.clearTextarea();
    ws.send({ ...getCurrentUserData(), text: "" });
  });

  // Подключаемся
  ws.connect();

  return {
    close: () => ws.close(),
    ws,
    ui,
    usersManager,
  };
}

let currentChat = null;

function cleanupChat() {
  if (currentChat) {
    currentChat.close();
    currentChat = null;
  }
}

SPA(
  (element) => {
    cleanupChat();
    currentChat = initChat();
  },
  {
    id: "message",
    continuous: true,
  },
);

window.addEventListener("spa:navigate", cleanupChat);
