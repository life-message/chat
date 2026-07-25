let deferredPrompt;
const installBtn = document.getElementById('install-app');

if (window.matchMedia('(display-mode: standalone)').matches || navigator.standalone) {
  installBtn.hidden = true;
}

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  installBtn.hidden = false;
});

installBtn.addEventListener('click', async () => {
  if (!deferredPrompt) return;
  deferredPrompt.prompt();

  const { outcome } = await deferredPrompt.userChoice;
  console.log(`Результат установки: ${outcome}`);

  deferredPrompt = null;

  if (outcome === 'accepted') {
    installBtn.hidden = true;
  }
});

window.addEventListener('appinstalled', () => {
  installBtn.hidden = true;
  deferredPrompt = null;
});
