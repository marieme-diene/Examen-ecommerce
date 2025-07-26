import { Injectable } from '@angular/core';
import { Product } from '../../catalog/models/product.model';
import { BehaviorSubject } from 'rxjs';

const isBrowser = typeof window !== 'undefined' && typeof localStorage !== 'undefined';

@Injectable({ providedIn: 'root' })
export class CartService {
  private items: { product: Product, quantity: number }[] = [];
  private countSubject = new BehaviorSubject<number>(0);
  count$ = this.countSubject.asObservable();

  constructor() {
    if (isBrowser) {
      const saved = localStorage.getItem('cart');
      if (saved) {
        this.items = JSON.parse(saved);
        this.countSubject.next(this.getCount());
      }
    }
  }

  private save() {
    if (isBrowser) {
      localStorage.setItem('cart', JSON.stringify(this.items));
      this.countSubject.next(this.getCount());
    }
  }

  getItems() {
    return this.items;
  }

  addToCart(product: Product) {
    const found = this.items.find(i => i.product.id === product.id);
    if (found) {
      found.quantity++;
    } else {
      this.items.push({ product, quantity: 1 });
    }
    this.save();
  }

  removeFromCart(productId: number) {
    this.items = this.items.filter(i => i.product.id !== productId);
    this.save();
  }

  clearCart() {
    this.items = [];
    this.save();
  }

  getTotal() {
    return this.items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);
  }

  getCount() {
    return this.items.reduce((sum, i) => sum + i.quantity, 0);
  }
} 