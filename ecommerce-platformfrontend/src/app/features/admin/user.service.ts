import { Injectable } from '@angular/core';

export interface User {
  id: number;
  name: string;
  email: string;
  registrationDate?: string;
}

const isBrowser = typeof window !== 'undefined' && typeof localStorage !== 'undefined';

@Injectable({ providedIn: 'root' })
export class UserService {
  private storageKey = 'users';
  private users: User[] = [];

  constructor() {
    if (isBrowser) {
      const saved = localStorage.getItem(this.storageKey);
      if (saved) {
        this.users = JSON.parse(saved);
      } else {
        this.users = [
          { id: 1, name: 'admin', email: 'admin@afrimarket.com', registrationDate: '2024-01-01' },
          { id: 2, name: 'client1', email: 'client1@afrimarket.com', registrationDate: '2024-01-15' }
        ];
        localStorage.setItem(this.storageKey, JSON.stringify(this.users));
      }
    }
  }

  private save() {
    if (isBrowser) {
      localStorage.setItem(this.storageKey, JSON.stringify(this.users));
    }
  }

  getUsers(): User[] {
    return this.users;
  }

  addUser(user: User) {
    this.users.unshift(user);
    this.save();
  }

  updateUser(user: User) {
    this.users = this.users.map(u => u.id === user.id ? user : u);
    this.save();
  }

  deleteUser(id: number) {
    this.users = this.users.filter(u => u.id !== id);
    this.save();
  }
} 