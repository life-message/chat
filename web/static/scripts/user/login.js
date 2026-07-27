import { getKaomoji } from './kaomoji.js';

async function getRandomKaomoji() {
  const kaomoji = await getKaomoji();
  const randomIndex = Math.floor(Math.random() * kaomoji.length);
  return kaomoji[randomIndex];
}

function generateUID() {
  return 'uid_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
}

async function checkAndInitializeLocalStorage() {
  if (!localStorage.getItem('uid')) {
    localStorage.setItem('uid', generateUID());
  }

  const currentKaomoji = localStorage.getItem('kaomoji');
  if (!currentKaomoji || currentKaomoji.trim() === '') {
    localStorage.setItem('kaomoji', await getRandomKaomoji());
  }

  if (!localStorage.getItem('username')) {
    const response = await fetch("https://random-word-api.herokuapp.com/word");
    const data = await response.json();
    localStorage.setItem('username', data[0]);
  }
}

await checkAndInitializeLocalStorage();
