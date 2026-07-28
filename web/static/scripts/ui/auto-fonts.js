function adjustFontSize(element) {
  if (!element) return;

  const text = element.innerText.trim();
  const length = text.length;

  const minSize = 1.25;
  const maxSize = 2.5;
  const startShrinking = 10;
  const endShrinking = 150;

  let newSize = maxSize;

  if (length > startShrinking) {
    if (length >= endShrinking) {
      newSize = minSize;
    } else {
      const ratio = (length - startShrinking) / (endShrinking - startShrinking);
      newSize = maxSize - ratio * (maxSize - minSize);
    }
  }

  element.style.fontSize = `${newSize}rem`;
}

function startTextWatcher(element) {
  if (element.__textWatcherActive) return;

  const observer = new MutationObserver(() => {
    adjustFontSize(element);
  });

  observer.observe(element, {
    childList: true,
    characterData: true,
    subtree: true,
  });

  element.__textWatcherActive = true;

  element.__textObserver = observer;
}

SPA(
  (el) => {
    adjustFontSize(el);
    startTextWatcher(el);
  },
  {
    id: "message-text",
    continuous: true,
  },
);
