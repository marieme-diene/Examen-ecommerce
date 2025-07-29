import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductService } from '../../services/product.service';
import { Product } from '../../models/product.model';
import { ProductCard } from '../../components/product-card/product-card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-brand-products',
  standalone: true,
  imports: [CommonModule, ProductCard, MatButtonModule, MatIconModule],
  template: `
    <div class="brand-products-container">
      <!-- Header de la marque -->
      <div class="brand-header">
        <button mat-button (click)="goBack()" class="back-btn">
          <mat-icon>arrow_back</mat-icon>
          Retour au catalogue
        </button>
        <h1>{{ brandName }}</h1>
        <p>{{ products.length }} produits trouvés</p>
      </div>

      <!-- Loader -->
      <div *ngIf="loading" class="loader">
        <div class="spinner"></div>
        <p>Chargement des produits...</p>
      </div>

      <!-- Produits -->
      <div *ngIf="!loading && products.length > 0" class="products-section">
        <div class="products-grid">
          <app-product-card 
            *ngFor="let product of products"
            [product]="product"
            [isFavorite]="favorites.has(product.id)"
            (toggleFavorite)="toggleFavorite(product.id)">
          </app-product-card>
        </div>
      </div>

      <!-- Aucun produit -->
      <div *ngIf="!loading && products.length === 0" class="no-products">
        <div class="no-products-icon">🔍</div>
        <h3>Aucun produit trouvé pour cette marque</h3>
        <p>Essayez une autre marque ou retournez au catalogue</p>
        <button mat-raised-button color="primary" (click)="goBack()">
          Retour au catalogue
        </button>
      </div>
    </div>
  `,
  styles: [`
    .brand-products-container {
      padding: 24px;
      max-width: 1200px;
      margin: 0 auto;
    }

    .brand-header {
      text-align: center;
      margin-bottom: 32px;
      position: relative;
    }

    .back-btn {
      position: absolute;
      left: 0;
      top: 50%;
      transform: translateY(-50%);
      color: #2563eb;
    }

    .brand-header h1 {
      font-size: 2.5rem;
      color: #2563eb;
      margin: 0 0 8px 0;
      font-weight: bold;
    }

    .brand-header p {
      color: #64748b;
      font-size: 1.1rem;
      margin: 0;
    }

    .products-section {
      margin-top: 24px;
    }

    .products-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 24px;
    }

    .loader {
      text-align: center;
      padding: 48px;
    }

    .spinner {
      border: 4px solid #f3f3f3;
      border-top: 4px solid #2563eb;
      border-radius: 50%;
      width: 40px;
      height: 40px;
      animation: spin 1s linear infinite;
      margin: 0 auto 16px;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .no-products {
      text-align: center;
      padding: 48px;
      color: #64748b;
    }

    .no-products-icon {
      font-size: 4rem;
      margin-bottom: 16px;
    }

    .no-products h3 {
      margin: 0 0 8px 0;
      color: #374151;
    }

    .no-products p {
      margin: 0 0 24px 0;
    }

    @media (max-width: 768px) {
      .brand-products-container {
        padding: 16px;
      }

      .brand-header h1 {
        font-size: 2rem;
      }

      .back-btn {
        position: static;
        transform: none;
        margin-bottom: 16px;
      }

      .products-grid {
        grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
        gap: 16px;
      }
    }
  `]
})
export class BrandProducts implements OnInit {
  brandName: string = '';
  products: Product[] = [];
  loading: boolean = true;
  favorites: Set<number> = new Set();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      const brand = params['brand'];
      if (brand) {
        this.brandName = decodeURIComponent(brand);
        this.loadProductsByBrand(this.brandName);
      }
    });
  }

  loadProductsByBrand(brand: string) {
    this.loading = true;
    this.productService.getProducts().subscribe(allProducts => {
      this.products = allProducts.filter(product => product.brand === brand);
      this.loading = false;
    });
  }

  toggleFavorite(productId: number) {
    if (this.favorites.has(productId)) {
      this.favorites.delete(productId);
    } else {
      this.favorites.add(productId);
    }
  }

  goBack() {
    this.router.navigate(['/catalog']);
  }
} 