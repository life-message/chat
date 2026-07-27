export class UsersManager {
  constructor() {
    this.users = new Map();
  }

  add(user) { if (user.uid) this.users.set(user.uid, user); }
  update(user) { if (this.users.has(user.uid)) this.users.set(user.uid, user); }
  remove(uid) { this.users.delete(uid); }
  clear() { this.users.clear(); }
  getList() { return Object.fromEntries(this.users); }
  get(uid) { return this.users.get(uid); }
  toJSON() { return Object.fromEntries(this.users); }
}
