import { User } from '../types/user';

export class UserRepository {
  private users: Record<string, User> = {};

  createUser(user: User) {
    this.users[user.id] = user;
  }

  getUser(userId: string): User | undefined {
    return this.users[userId];
  }

  updateUser(user: User) {
    this.users[user.id] = user;
  }
}
