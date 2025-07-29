import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CartService } from '../../services/cart.service';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';

@Component({
  selector: 'app-cart-list',
  standalone: true,
  imports: [CommonModule, MatButtonModule],
  templateUrl: './cart-list.html',
  styleUrl: './cart-list.css'
})
export class CartList {
  confirmationMessage = '';
  constructor(public cartService: CartService, private router: Router) {}

  remove(productId: number) {
    this.cartService.removeFromCart(productId);
  }

  clear() {
    this.cartService.clearCart();
  }

  increment(productId: number) {
    const item = this.cartService.getItems().find(i => i.product.id === productId);
    if (item) {
      item.quantity++;
      this.cartService['save']();
    }
  }
  decrement(productId: number) {
    const item = this.cartService.getItems().find(i => i.product.id === productId);
    if (item && item.quantity > 1) {
      item.quantity--;
      this.cartService['save']();
    }
  }
  updateQuantity(productId: number, event: Event) {
    const value = (event.target as HTMLInputElement)?.value || '1';
    const qty = Math.max(1, parseInt(value, 10) || 1);
    const item = this.cartService.getItems().find(i => i.product.id === productId);
    if (item) {
      item.quantity = qty;
      this.cartService['save']();
    }
  }

  goToCheckout() {
    this.router.navigate(['/payment/checkout']).then(() => {
      this.confirmationMessage = 'Redirection vers la page de paiement...';
      setTimeout(() => this.confirmationMessage = '', 3000);
    });
  }
}
