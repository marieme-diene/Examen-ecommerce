import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';

export interface User {
  id: number;
  name: string;
  email: string;
}

export interface Address {
  id: number;
  name: string;
  street: string;
  city: string;
  postalCode: string;
  country: string;
  phone: string;
}

const isBrowser = typeof window !== 'undefined' && typeof localStorage !== 'undefined';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private userSubject = new BehaviorSubject<User | null>(null);
  user$ = this.userSubject.asObservable();

  constructor() {
    if (isBrowser) {
      const saved = localStorage.getItem('user');
      if (saved) {
        this.userSubject.next(JSON.parse(saved));
      }
    }
  }

  login(email: string, password: string): Observable<User | null> {
    const user: User = { id: 1, name: email.split('@')[0], email };
    if (isBrowser) {
      localStorage.setItem('user', JSON.stringify(user));
    }
    this.userSubject.next(user);
    return of(user);
  }

  register(name: string, email: string, password: string): Observable<User> {
    const user: User = { id: 1, name, email };
    if (isBrowser) {
      localStorage.setItem('user', JSON.stringify(user));
    }
    this.userSubject.next(user);
    return of(user);
  }

  logout() {
    if (isBrowser) {
      localStorage.removeItem('user');
    }
    this.userSubject.next(null);
  }

  getUser(): User | null {
    return this.userSubject.value;
  }

  isLoggedIn(): boolean {
    return !!this.userSubject.value;
  }

  // Gestion des adresses utilisateur (localStorage)
  private addressKey = 'addressesByUser';

  private getAddressesMap(): { [userId: string]: Address[] } {
    if (isBrowser) {
      const raw = localStorage.getItem(this.addressKey);
      return raw ? JSON.parse(raw) : {};
    }
    return {};
  }

  private saveAddressesMap(map: { [userId: string]: Address[] }) {
    if (isBrowser) {
      localStorage.setItem(this.addressKey, JSON.stringify(map));
    }
  }

  getAddressesForUser(userId: number): Address[] {
    const map = this.getAddressesMap();
    return map[userId] || [];
  }

  addAddress(userId: number, address: Address) {
    const map = this.getAddressesMap();
    if (!map[userId]) map[userId] = [];
    map[userId].push(address);
    this.saveAddressesMap(map);
  }

  updateAddress(userId: number, address: Address) {
    const map = this.getAddressesMap();
    if (!map[userId]) return;
    map[userId] = map[userId].map(a => a.id === address.id ? address : a);
    this.saveAddressesMap(map);
  }

  deleteAddress(userId: number, addressId: number) {
    const map = this.getAddressesMap();
    if (!map[userId]) return;
    map[userId] = map[userId].filter(a => a.id !== addressId);
    this.saveAddressesMap(map);
  }
} 