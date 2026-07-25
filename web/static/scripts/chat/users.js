export class UsersManager {
  constructor() {
    this.users = new Map();
  }

  add(user) { if (user.uid) this.users.set(user.uid, user); }
  update(user) { if (this.users.has(user.uid)) this.users.set(user.uid, user); }
  remove(id) { this.users.delete(id); }
  clear() { this.users.clear(); }
  getList() { return Object.fromEntries(this.users); }
  get(id) { const u = this.users.get(id); return u ? { [id]: u } : {}; }
  toJSON() { return Object.fromEntries(this.users); }
}
