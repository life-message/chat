import { SPA } from '/cdn/js/utils/spa.js';

function initChat() {
  const match = window.location.pathname.match(/\/chat\/([^/?]+)/);
  const room_id = match ? match[1] : null;
  const wsUrl = `ws://127.0.0.1:3000/ws/${room_id}`;
  const ws = new WebSocket(wsUrl);

  const display = document.getElementById('Message');
  const textarea = document.querySelector('textarea');
  const resetBtn = document.getElementById('reset');

  const userData = {
    avatar: localStorage.getItem('avatar'),
    senderId: localStorage.getItem('senderId'),
    uid: localStorage.getItem('uid'),
    username: localStorage.getItem('username')
  };

  if (window.UsersManager) {
    window.UsersManager.init(userData.senderId);
  }

  ws.onopen = () => {
    ws.send(JSON.stringify({ ...userData, type: 'join' }));
  };

  ws.onmessage = (event) => {
    try {
      let msg = JSON.parse(event.data);

      // Список всех пользователей в комнате
      if (msg.type === 'users_list') {
        if (window.UsersManager) {
          window.UsersManager.clear();
          msg.users.forEach(user => {
            window.UsersManager.add(user);
          });
        }
        return;
      }

      // Новый пользователь подключился
      if (msg.type === 'user_joined') {
        if (window.UsersManager) {
          window.UsersManager.add(msg);
        }
        display.textContent = `${msg.avatar} ${msg.username} подключился`;
        return;
      }

      // Пользователь отключился
      if (msg.type === 'user_left') {
        if (window.UsersManager && msg.senderId) {
          window.UsersManager.remove(msg.senderId);
        }
        display.textContent = `${msg.avatar} ${msg.username} отключился`;
        return;
      }

      // Обычное сообщение
      if (msg.username !== undefined && msg.text !== undefined) {
        display.textContent = `${msg.username}: ${msg.text}`;
      }
    } catch (error) { }
  };

  textarea.addEventListener('input', () => {
    const text = textarea.value;
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ ...userData, text: text }));
    }
  });

  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      textarea.value = '';
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ ...userData, text: '' }));
      }
    });
  }

  // Возвращаем объект для возможности закрытия соединения
  return {
    close: () => ws.close(),
    ws: ws
  };
}


let currentChat = null; // Храним текущий инстанс здесь

// 1. Функция для очистки (закрытия) чата
function cleanupChat() {
  if (currentChat) {
    currentChat.close(); // Или .destroy(), смотря какой у тебя API
    currentChat = null;
  }
}

// 2. Настраиваем слежение за появлением #Message
SPA((element) => {
  // Если чат уже есть, сначала закрываем его
  cleanupChat();

  // Создаем новый
  currentChat = initChat();
}, {
  id: 'Message',
  continuous: true
});

// 3. Слушаем уход со страницы (навигацию SPA)
window.addEventListener('spa:navigate', () => {
  cleanupChat();
});
