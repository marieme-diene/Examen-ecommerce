import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { FavoritesService } from '../../../catalog/services/favorites.service';
import { ProductService } from '../../../catalog/services/product.service';
import { Product } from '../../../catalog/models/product.model';
import { ProductCard } from '../../../catalog/components/product-card/product-card';

@Component({
  selector: 'app-favorites',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    ProductCard
  ],
  templateUrl: './favorites.html',
  styleUrl: './favorites.css'
})
export class Favorites implements OnInit {
  favoriteProducts: Product[] = [];
  loading = false;
  message = '';
  messageType: 'success' | 'error' | 'info' = 'info';

  constructor(
    private favoritesService: FavoritesService,
    private productService: ProductService
  ) {}

  ngOnInit() {
    this.loadFavoriteProducts();
    
    // S'abonner aux changements de favoris
    this.favoritesService.favorites$.subscribe(() => {
      this.loadFavoriteProducts();
    });
  }

  loadFavoriteProducts() {
    this.loading = true;
    const favoriteIds = this.favoritesService.getFavoriteIds();
    
    if (favoriteIds.size === 0) {
      this.favoriteProducts = [];
      this.loading = false;
      return;
    }

    this.productService.getProducts().subscribe(products => {
      this.favoriteProducts = products.filter(product => 
        favoriteIds.has(product.id)
      );
      this.loading = false;
    });
  }

  toggleFavorite(productId: number) {
    const product = this.favoriteProducts.find(p => p.id === productId);
    const productName = product ? product.name : 'Produit';
    
    this.favoritesService.toggleFavorite(productId);
    
    // Afficher un message de confirmation
    if (!this.favoritesService.isFavorite(productId)) {
      this.showMessage(`${productName} retiré des favoris`, 'info');
    }
  }

  clearAllFavorites() {
    if (confirm('Êtes-vous sûr de vouloir vider tous vos favoris ?')) {
      this.favoritesService.clearFavorites();
      this.showMessage('Tous les favoris ont été supprimés', 'success');
    }
  }

  showMessage(text: string, type: 'success' | 'error' | 'info') {
    this.message = text;
    this.messageType = type;
    setTimeout(() => this.clearMessage(), 3000);
  }

  clearMessage() {
    this.message = '';
  }
} 