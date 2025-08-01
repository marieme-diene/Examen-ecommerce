import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CartService } from '../../services/cart.service';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { PromotionService } from '../../../promotions/services/promotion.service';
import { CartWithPromotion } from '../../../promotions/models/promotion.model';
import { AuthService } from '../../../account/services/auth.service';
import { PromoCodeForm } from '../../../promotions/components/promo-code-form/promo-code-form';

@Component({
  selector: 'app-cart-list',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, PromoCodeForm],
  templateUrl: './cart-list.html',
  styleUrl: './cart-list.css'
})
export class CartList implements OnInit {
  confirmationMessage = '';
  cartWithPromotions: CartWithPromotion | null = null;
  userId?: number;

  constructor(
    public cartService: CartService, 
    private router: Router,
    public promotionService: PromotionService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.loadCartWithPromotions();
    this.authService.currentUser$.subscribe(user => {
      this.userId = user?.id;
      this.loadCartWithPromotions();
    });
  }

  private loadCartWithPromotions() {
    const cartItems = this.cartService.getItems();
    this.promotionService.calculateCartWithPromotions(cartItems).subscribe(cart => {
      this.cartWithPromotions = cart;
    });
  }

  remove(productId: number) {
    this.cartService.removeFromCart(productId);
  }

  clear() {
    this.cartService.clearCart();
  }

  increment(productId: number) {
    const item = this.cartService.getItems().find((i: any) => i.product.id === productId);
    if (item) {
      item.quantity++;
      this.cartService.save();
    }
  }
  decrement(productId: number) {
    const item = this.cartService.getItems().find((i: any) => i.product.id === productId);
    if (item && item.quantity > 1) {
      item.quantity--;
      this.cartService.save();
    }
  }
  updateQuantity(productId: number, event: Event) {
    const value = (event.target as HTMLInputElement)?.value || '1';
    const qty = Math.max(1, parseInt(value, 10) || 1);
    const item = this.cartService.getItems().find((i: any) => i.product.id === productId);
    if (item) {
      item.quantity = qty;
      this.cartService.save();
    }
  }

  goToCheckout() {
    this.router.navigate(['/orders/checkout']).then(() => {
      this.confirmationMessage = 'Redirection vers la page de commande...';
      setTimeout(() => this.confirmationMessage = '', 3000);
    });
  }

  onPromotionApplied() {
    this.loadCartWithPromotions();
  }
}
