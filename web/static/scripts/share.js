function handleShareClick(event) {
  // Функция для показа уведомлений (предполагаем, что она у вас есть глобально)
  const showNotification = (msg) => {
    if (typeof notification === 'function') {
      notification(msg);
    } else {
      alert(msg); // Fallback если функции notification нет
    }
  };

  if (navigator.share) {
    navigator
      .share({
        title: "live message",
        text: "Приглашение в чат\n",
        url: window.location.href,
      })
      .then(() => {
        showNotification("Ссылка скопирована в буфер обмена!");
      })
      .catch((error) => {
        // Игнорируем ошибку отмены пользователем
        if (error.name !== 'AbortError') {
          showNotification("Ошибка при попытке поделиться");
          console.error(error);
        }
      });
  } else {
    // Fallback для старых браузеров или десктопов без Web Share API
    const textarea = document.createElement("textarea");
    textarea.value = window.location.href;
    textarea.style.position = "fixed"; // Чтобы не скроллило страницу
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.select();

    try {
      document.execCommand("copy");
      showNotification("Ссылка скопирована в буфер обмена!");
    } catch (err) {
      showNotification("Не удалось скопировать ссылку");
    } finally {
      document.body.removeChild(textarea);
    }
  }
}

SPA(() => {
  const btn = document.getElementById("share");

  // Проверка нужна, чтобы не вешать дублирующиеся слушатели
  // если функция вызывается несколько раз для одного элемента
  if (btn && !btn.dataset.shareHandlerAttached) {
    btn.addEventListener("click", handleShareClick);
    btn.dataset.shareHandlerAttached = "true"; // Маркер, что обработчик уже добавлен
  }
}, {
  id: "share"
});
