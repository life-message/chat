function generateRandomString(length = 32) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";
  const array = new Uint32Array(length);
  crypto.getRandomValues(array);

  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars[array[i] % chars.length];
  }
  return result;
}

(function initChatId() {
  const tryInit = () => {
    const input = document.getElementById("chat-id");
    if (!input) return false;

    if (!input.value && input.placeholder === "Введите ID чата") {
      input.placeholder = generateRandomString(48);
    }

    const btn = document.querySelector('#open-chat');
    if (!btn || btn.dataset.handlerAttached) return true;

    const openChat = () => {
      const chatId = input.value.trim() || input.placeholder;

      if (typeof window.page === 'function') {
        window.page(`/chat/${encodeURIComponent(chatId)}`);
      }
    };

    btn.addEventListener('click', openChat);

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        openChat();
      }
    });

    btn.dataset.handlerAttached = "true";
    return true;
  };

  if (tryInit()) return;

  const observer = new MutationObserver((mutations, obs) => {
    if (tryInit()) {
      obs.disconnect();
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });
})();
