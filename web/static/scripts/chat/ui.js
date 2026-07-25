export class ChatUI {
  constructor(usersManager) {
    this.section = document.getElementById('message');
    this.message = this.section?.querySelector('p');
    this.textarea = document.querySelector('textarea');
    this.resetBtn = document.getElementById('reset');
    this.emptyState = document.getElementById('users-none');
    this.userListEl = document.getElementById('users-list');
    this.users = usersManager;
  }

  displayDiv(hidden = false) {
    if (hidden) {
      console.log("Скрыть всё");
      this.emptyState.hidden = true;  // ← исправлено
      this.userListEl.hidden = true;
      return;
    }

    const users = this.users.getList();
    console.log(users);

    if (!hidden && users.length > 0) {
      this.renderUsers();
      this.userListEl.hidden = false;
      this.emptyState.hidden = true;
    } else {
      this.userListEl.hidden = true;
      this.emptyState.hidden = false;
    }
  }

  updateMessage(text = '', msg) {
    const hasText = text.trim().length > 0;
    if (msg.text === "") {
      this.message.textContent = ''
      this.displayDiv(false);
    }
    else {
      this.message.textContent = text;
      this.displayDiv(true);
    }
  }

  renderUsers() {
    if (!this.userListEl) return;
    this.userListEl.innerHTML = this.users.getList().map(u =>
      `<h4><span>${u.avatar ?? ''}</span> <span>${u.username ?? ''}</span></h4>`
    ).join('');
  }

  onInput(cb) { this.textarea?.addEventListener('input', cb); }
  onReset(cb) { this.resetBtn?.addEventListener('click', cb); }
  onInvite(cb) { this.emptyState?.querySelector('button')?.addEventListener('click', cb); }
  clearTextarea() { if (this.textarea) this.textarea.value = ''; }
}
