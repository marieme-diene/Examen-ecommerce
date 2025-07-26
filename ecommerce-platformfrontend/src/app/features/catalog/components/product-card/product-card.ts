import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Product } from '../../models/product.model';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CartService } from '../../../cart/services/cart.service';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, RouterModule],
  templateUrl: './product-card.html',
  styleUrl: './product-card.css'
})
export class ProductCard {
  @Input() product!: Product;
  @Input() isFavorite: boolean = false;
  @Output() toggleFavorite = new EventEmitter<void>();
  constructor(private cartService: CartService) {}
  addToCart(event: Event) {
    event.preventDefault();
    event.stopPropagation();
    this.cartService.addToCart(this.product);
    alert('Produit ajouté au panier !');
  }
  onToggleFavorite(event: Event) {
    event.preventDefault();
    event.stopPropagation();
    this.toggleFavorite.emit();
  }
} 