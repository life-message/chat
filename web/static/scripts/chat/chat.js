import { ChatWebSocket } from "./websocket.js";
import { ChatUI } from "./ui.js";
import { UsersManager } from "./users.js";
import { SPA } from "https://cdn.jsdelivr.net/gh/live-message/cdn@0.3.0/js/utils/spa.js";

let currentChat = null;

function cleanupChat() {
  if (currentChat) {
    currentChat.close();
    currentChat.ui.clearTextarea?.();
    currentChat = null;
  }
}

function initChat() {
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

  const ws = new ChatWebSocket(roomId, userData);
  const usersManager = new UsersManager();
  const ui = new ChatUI(usersManager);
  ui.displayDiv();

  ws.on("users/welcome", (msg) => {
    if (msg.uid === userData.uid) return;
    usersManager.add(msg);
    ui.displayDiv();
  })
    .on("users/join", (msg) => {
      if (msg.uid === userData.uid) return;
      usersManager.add(msg);
      ui.displayDiv();
      notification(`${msg.username} подключился`);
      ws.send({ ...getCurrentUserData(), type: "users/welcome" });
    })
    .on("users/exit", (msg) => {
      if (msg.uid === userData.uid) return;
      if (msg.uid) {
        usersManager.remove(msg.uid);
      }
      ui.displayDiv();
      notification(`${msg.username} отключился`);
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

  ws.connect();

  return {
    close: () => ws.close(),
    ws,
    ui,
    usersManager,
  };
}

SPA(
  () => {
    cleanupChat();
    currentChat = initChat();
  },
  {
    id: "message",
    continuous: true,
  },
);
