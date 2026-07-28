import { SPA } from "https://cdn.jsdelivr.net/gh/live-message/cdn@0.3.1/js/utils/spa.js";

const originalSetItem = localStorage.setItem.bind(localStorage);

localStorage.setItem = function (key, value) {
  originalSetItem(key, value);
  if (key === 'color') {
    showActiveLogo();
  }
};

function showActiveLogo() {
  const colorValue = localStorage.getItem('color');
  if (!colorValue || isNaN(parseInt(colorValue))) {
    document.querySelectorAll('#logos h1.accent').forEach(el => {
      el.hidden = true;
    });
    return;
  }

  const color = parseInt(colorValue);

  const ranges = {
    lime: { min: 0, max: 30 },
    blueberry: { min: 31, max: 139 },
    grape: { min: 140, max: 189 },
    tomato: { min: 190, max: 239 },
    carrot: { min: 240, max: 305 },
    lemon: { min: 306, max: 360 },
  };

  let activeName = '';
  for (const [name, range] of Object.entries(ranges)) {
    if (color >= range.min && color <= range.max) {
      activeName = name;
      break;
    }
  }

  document.querySelectorAll('#logos h1.accent').forEach(el => {
    el.hidden = (el.dataset.color !== activeName);
  });
}

window.addEventListener('storage', (e) => {
  if (e.key === 'color') {
    showActiveLogo();
  }
});

SPA(showActiveLogo, {
  id: 'logos',
  continuous: true
});
