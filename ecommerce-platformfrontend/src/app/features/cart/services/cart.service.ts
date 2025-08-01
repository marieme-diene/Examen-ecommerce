import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { CartItem } from '../models/cart-item.model';
import { Product } from '../../catalog/models/product.model';
import { NotificationService } from '../../../shared/services/notification.service';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private cartSubject = new BehaviorSubject<CartItem[]>([]);
  public cart$ = this.cartSubject.asObservable();
  public count$ = new Observable<number>();

  constructor(private notificationService: NotificationService) {
    this.loadCart();
    this.count$ = this.cart$.pipe(
      map(items => items.reduce((total, item) => total + item.quantity, 0))
    );
  }

  private loadCart(): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      const savedCart = localStorage.getItem('afrimarket_cart');
      if (savedCart) {
        this.cartSubject.next(JSON.parse(savedCart));
      }
    }
  }

  private saveCart(cart: CartItem[]): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem('afrimarket_cart', JSON.stringify(cart));
    }
  }

  addToCart(product: Product, quantity: number = 1): void {
    const currentCart = this.cartSubject.value;
    const existingItem = currentCart.find(item => item.product.id === product.id);

    if (existingItem) {
      existingItem.quantity += quantity;
      this.cartSubject.next([...currentCart]);
      this.notificationService.addNotification({
        type: 'info',
        title: 'Quantité mise à jour',
        message: `Quantité de ${product.name} mise à jour dans votre panier`,
        category: 'product'
      });
    } else {
      const newItem: CartItem = {
        product,
        quantity
      };
      this.cartSubject.next([...currentCart, newItem]);
      this.notificationService.addNotification({
        type: 'success',
        title: 'Produit ajouté',
        message: `${product.name} a été ajouté à votre panier`,
        category: 'product'
      });
    }

    this.saveCart(this.cartSubject.value);
  }

  removeFromCart(productId: number): void {
    const currentCart = this.cartSubject.value;
    const itemToRemove = currentCart.find(item => item.product.id === productId);

    if (itemToRemove) {
      const updatedCart = currentCart.filter(item => item.product.id !== productId);
      this.cartSubject.next(updatedCart);
      this.saveCart(updatedCart);

      this.notificationService.addNotification({
        type: 'info',
        title: 'Produit retiré',
        message: `${itemToRemove.product.name} a été retiré de votre panier`,
        category: 'product'
      });
    }
  }

  updateQuantity(productId: number, quantity: number): void {
    const currentCart = this.cartSubject.value;
    const item = currentCart.find(item => item.product.id === productId);

    if (item) {
      if (quantity <= 0) {
        this.removeFromCart(productId);
      } else {
        item.quantity = quantity;
        this.cartSubject.next([...currentCart]);
        this.saveCart(currentCart);
      }
    }
  }

  clearCart(): void {
    this.cartSubject.next([]);
    this.saveCart([]);
    this.notificationService.addNotification({
      type: 'info',
      title: 'Panier vidé',
      message: 'Votre panier a été vidé',
      category: 'system'
    });
  }

  getCart(): Observable<CartItem[]> {
    return this.cart$;
  }

  getCartCount(): Observable<number> {
    return this.count$;
  }

  getTotal(): Observable<number> {
    return this.cart$.pipe(
      map(items => items.reduce((total, item) => total + (item.product.price * item.quantity), 0))
    );
  }


  getItems(): CartItem[] {
    return this.cartSubject.value;
  }

  save(): void {
    this.saveCart(this.cartSubject.value);
  }
}
