import { getKaomoji } from './kaomoji.js';
import { SPA } from "https://cdn.jsdelivr.net/gh/live-message/cdn@0.3.0/js/utils/spa.js";

const kaomoji = await getKaomoji()

function createKaomojiButton(kaomoji, isActive) {
  const button = document.createElement('button');
  button.className = 'kaomoji' + (isActive ? ' active' : '');
  button.textContent = kaomoji;
  return button;
}

function createKaomojiSelector(kaomojis, currentKaomoji) {
  const container = document.getElementById('select-kaomojis');
  container.innerHTML = '';

  kaomojis.forEach((kaomoji) => {
    const button = createKaomojiButton(kaomoji, kaomoji === currentKaomoji);
    container.appendChild(button);
  });

  return container;
}

function findSelectedKaomoji(event, container) {
  const button = event.target.closest('.kaomoji');

  if (!button) return null;

  return {
    kaomoji: button.textContent,
    button: button
  };
}

function getActiveKaomojiButtons(container) {
  return Array.from(container.querySelectorAll('.kaomoji.active'));
}

function createClickHandlerResult(selectedKaomoji, activeButtons, clickedButton) {
  return {
    selectedKaomoji,
    shouldUpdateStorage: true,
    uiUpdates: {
      removeActiveFrom: activeButtons,
      addActiveTo: clickedButton
    }
  };
}


function init() {
  const selector = createKaomojiSelector(kaomoji, localStorage.getItem('kaomoji'));
}

SPA(init, {
  id: 'select-kaomojis',
  continuous: true
});
