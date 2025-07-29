import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { User, Address } from '../models/user.model';

// Vérification de l'environnement
const isBrowser = typeof window !== 'undefined' && typeof localStorage !== 'undefined';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private userSubject = new BehaviorSubject<User | null>(null);
  user$ = this.userSubject.asObservable();

  constructor() {
    // Charger l'utilisateur depuis localStorage seulement côté client
    if (isBrowser) {
      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        this.userSubject.next(JSON.parse(savedUser));
      }
    }
  }

  login(email: string, password: string): Observable<User | null> {
    // Simulation d'authentification avec rôles
    if (email === 'admin@afrimarket.com' && password === 'admin123') {
      const adminUser: User = {
        id: 1,
        name: 'Administrateur',
        email: email,
        role: 'admin'
      };
      this.userSubject.next(adminUser);
      if (isBrowser) {
        localStorage.setItem('user', JSON.stringify(adminUser));
      }
      return of(adminUser);
    } else if (email === 'client@afrimarket.com' && password === 'client123') {
      const clientUser: User = {
        id: 2,
        name: 'Client',
        email: email,
        role: 'client'
      };
      this.userSubject.next(clientUser);
      if (isBrowser) {
        localStorage.setItem('user', JSON.stringify(clientUser));
      }
      return of(clientUser);
    } else {
      return of(null);
    }
  }

  register(name: string, email: string, password: string): Observable<User | null> {
    // Simulation d'inscription - tous les nouveaux utilisateurs sont des clients
    const newUser: User = {
      id: Date.now(),
      name: name,
      email: email,
      role: 'client'
    };
    this.userSubject.next(newUser);
    if (isBrowser) {
      localStorage.setItem('user', JSON.stringify(newUser));
    }
    return of(newUser);
  }

  logout() {
    this.userSubject.next(null);
    if (isBrowser) {
      localStorage.removeItem('user');
    }
  }

  getCurrentUser(): User | null {
    return this.userSubject.value;
  }

  getUser(): User | null {
    return this.getCurrentUser();
  }

  isLoggedIn(): boolean {
    return !!this.userSubject.value;
  }

  isAdmin(): boolean {
    const user = this.getUser();
    return user?.role === 'admin';
  }

  isClient(): boolean {
    const user = this.getUser();
    return user?.role === 'client';
  }

  canModifyProducts(): boolean {
    return this.isAdmin();
  }

  canModifyCategories(): boolean {
    return this.isAdmin();
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
    if (!isBrowser) {
      return [];
    }
    
    const saved = localStorage.getItem(`addresses_${userId}`);
    return saved ? JSON.parse(saved) : [];
  }

  addAddress(userId: number, address: Address) {
    if (!isBrowser) {
      return;
    }
    
    const addresses = this.getAddressesForUser(userId);
    addresses.push({ ...address, id: Date.now() });
    localStorage.setItem(`addresses_${userId}`, JSON.stringify(addresses));
  }

  updateAddress(userId: number, addressId: number, updatedAddress: Address) {
    if (!isBrowser) {
      return;
    }
    
    const addresses = this.getAddressesForUser(userId);
    const index = addresses.findIndex(a => a.id === addressId);
    if (index !== -1) {
      addresses[index] = { ...updatedAddress, id: addressId };
      localStorage.setItem(`addresses_${userId}`, JSON.stringify(addresses));
    }
  }

  deleteAddress(userId: number, addressId: number) {
    if (!isBrowser) {
      return;
    }
    
    const addresses = this.getAddressesForUser(userId);
    const filtered = addresses.filter(a => a.id !== addressId);
    localStorage.setItem(`addresses_${userId}`, JSON.stringify(filtered));
  }

  // Gestion des utilisateurs (admin seulement)
  getAllUsers(): Observable<User[]> {
    if (!this.isAdmin()) {
      return of([]);
    }
    
    // Simuler une liste d'utilisateurs
    const users: User[] = [
      {
        id: 1,
        name: 'Administrateur',
        email: 'admin@afrimarket.com',
        role: 'admin'
      },
      {
        id: 2,
        name: 'Client Test',
        email: 'client@afrimarket.com',
        role: 'client'
      },
      {
        id: 3,
        name: 'Marie Dupont',
        email: 'marie@example.com',
        role: 'client'
      },
      {
        id: 4,
        name: 'Jean Martin',
        email: 'jean@example.com',
        role: 'client'
      }
    ];
    
    return of(users);
  }

  updateUserRole(userId: number, newRole: 'admin' | 'client'): Observable<boolean> {
    if (!this.isAdmin()) {
      return of(false);
    }
    
    // Simulation de mise à jour du rôle
    console.log(`Rôle de l'utilisateur ${userId} mis à jour vers: ${newRole}`);
    return of(true);
  }

  deleteUser(userId: number): Observable<boolean> {
    if (!this.isAdmin()) {
      return of(false);
    }
    
    // Simulation de suppression d'utilisateur
    console.log(`Utilisateur ${userId} supprimé`);
    return of(true);
  }
} 