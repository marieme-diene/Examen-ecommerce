import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

export interface Order {
  id: number;
  date: string;
  status: string;
  total: number;
  pdfUrl: string;
  items?: any[]; // Ajouté pour stocker les produits
  address?: string;
  payment?: string;
}

const isBrowser = typeof window !== 'undefined' && typeof localStorage !== 'undefined';

@Injectable({ providedIn: 'root' })
export class OrderService {
  private storageKey = 'ordersByUser';

  private getOrdersMap(): { [userId: string]: Order[] } {
    if (isBrowser) {
      const raw = localStorage.getItem(this.storageKey);
      return raw ? JSON.parse(raw) : {};
    }
    return {};
  }

  private saveOrdersMap(map: { [userId: string]: Order[] }) {
    if (isBrowser) {
      localStorage.setItem(this.storageKey, JSON.stringify(map));
    }
  }

  getOrdersForUser(userId: number): Observable<Order[]> {
    const map = this.getOrdersMap();
    return of(map[userId] || []);
  }

  addOrder(userId: number, order: Order) {
    const map = this.getOrdersMap();
    if (!map[userId]) map[userId] = [];
    map[userId].unshift(order); // Ajoute la commande en haut
    this.saveOrdersMap(map);
  }

  updateOrderStatus(userId: number, orderId: number, newStatus: string) {
    const map = this.getOrdersMap();
    if (!map[userId]) return;
    map[userId] = map[userId].map(o => o.id === orderId ? { ...o, status: newStatus } : o);
    this.saveOrdersMap(map);
  }

  getAllOrders(): Array<Order & { userId: number }> {
    const map = this.getOrdersMap();
    const all: Array<Order & { userId: number }> = [];
    Object.entries(map).forEach(([userId, orders]) => {
      orders.forEach(order => all.push({ ...order, userId: +userId }));
    });
    return all;
  }
} 