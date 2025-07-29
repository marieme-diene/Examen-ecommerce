import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Product } from '../../catalog/models/product.model';
import { map } from 'rxjs/operators';

// Vérification de l'environnement
const isBrowser = typeof window !== 'undefined' && typeof localStorage !== 'undefined';

export interface CartItem {
  product: Product;
  quantity: number;
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private cartSubject = new BehaviorSubject<CartItem[]>([]);
  cart$ = this.cartSubject.asObservable();
  count$ = this.cartSubject.pipe(
    map(items => items.reduce((total, item) => total + item.quantity, 0))
  );

  constructor() {
    if (isBrowser) {
      const savedCart = localStorage.getItem('cart');
      if (savedCart) {
        this.cartSubject.next(JSON.parse(savedCart));
      }
    }
  }

  private save() {
    if (isBrowser) {
      localStorage.setItem('cart', JSON.stringify(this.cartSubject.value));
    }
  }

  getItems(): CartItem[] {
    return this.cartSubject.value;
  }

  addToCart(product: Product) {
    const currentItems = this.cartSubject.value;
    const found = currentItems.find(i => i.product.id === product.id);
    
    if (found) {
      found.quantity++;
      this.cartSubject.next([...currentItems]);
    } else {
      this.cartSubject.next([...currentItems, { product, quantity: 1 }]);
    }
    this.save();
  }

  removeFromCart(productId: number) {
    const currentItems = this.cartSubject.value;
    this.cartSubject.next(currentItems.filter(i => i.product.id !== productId));
    this.save();
  }

  updateQuantity(productId: number, quantity: number) {
    const currentItems = this.cartSubject.value;
    const item = currentItems.find(i => i.product.id === productId);
    
    if (item) {
      if (quantity <= 0) {
        this.removeFromCart(productId);
      } else {
        item.quantity = quantity;
        this.cartSubject.next([...currentItems]);
        this.save();
      }
    }
  }

  clearCart() {
    this.cartSubject.next([]);
    this.save();
  }

  getTotal(): number {
    return this.cartSubject.value.reduce((sum, i) => sum + i.product.price * i.quantity, 0);
  }

  getCount(): number {
    return this.cartSubject.value.reduce((sum, i) => sum + i.quantity, 0);
  }
} 