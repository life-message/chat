export class UsersManager {
  constructor() {
    this.users = new Map();
  }

  add(user) { if (user.uid) this.users.set(user.uid, user); }
  update(user) { if (this.users.has(user.uid)) this.users.set(user.uid, user); }
  remove(id) { this.users.delete(id); }
  clear() { this.users.clear(); }
  getList() { return [...this.users.values()]; }
  get(id) { return this.users.get(id); }
}
