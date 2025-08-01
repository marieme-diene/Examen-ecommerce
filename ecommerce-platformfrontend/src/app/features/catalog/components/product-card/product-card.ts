import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Product } from '../../models/product.model';
import { StarRating } from '../star-rating/star-rating';
import { CartService } from '../../../cart/services/cart.service';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatButtonModule,
    MatIconModule,
    StarRating
  ],
  templateUrl: './product-card.html',
  styleUrl: './product-card.css'
})
export class ProductCard {
  @Input() product!: Product;
  @Input() isFavorite: boolean = false;
  @Output() toggleFavorite = new EventEmitter<number>();
  @Output() addToCartEvent = new EventEmitter<Product>();
  constructor(private cartService: CartService) {}
  onToggleFavorite(event: Event) {
    event.preventDefault();
    event.stopPropagation();
    this.toggleFavorite.emit(this.product.id);
  }
  addToCart(event: Event) {
    event.preventDefault();
    event.stopPropagation();
    this.addToCartEvent.emit(this.product);
  }
} 