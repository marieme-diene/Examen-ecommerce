import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { ProductService } from '../../services/product.service';
import { Product } from '../../models/product.model';
import { ProductCard } from '../../components/product-card/product-card';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../account/services/auth.service';

@Component({
  selector: 'app-catalog-list',
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatSelectModule,
    MatButtonModule,
    ProductCard
  ],
  templateUrl: './catalog-list.html',
  styleUrl: './catalog-list.css'
})
export class CatalogList {
  products: Product[] = [];
  filteredProducts: Product[] = [];
  paginatedProducts: Product[] = [];
  categories: string[] = [
    'Électronique', 'Mode', 'Maison', 'Beauté', 'Sport', 'Livres',
    'Chaussures femme', 'Serviette', 'Bijoux', 'Table'
  ];
  search = '';
  searchTerm = '';
  selectedCategory = '';

  // Favoris (local)
  favorites: Set<number> = new Set();

  // Pour affichage par marque
  brands: string[] = [];
  productsByBrand: { [brand: string]: Product[] } = {};

  // Pagination
  currentPage = 1;
  pageSize = 20;
  totalPages = 1;

  minPrice: number | null = null;
  maxPrice: number | null = null;
  selectedBrand: string = '';

  loading = false;
  message = '';
  messageType: 'success' | 'error' | 'info' = 'info';
  isAdmin = false;

  constructor(
    private productService: ProductService,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService
  ) {
    this.loading = true;
    this.isAdmin = this.authService.isAdmin();
    this.productService.getProducts().subscribe(products => {
      this.products = products;
      this.applyFilters();
      this.loading = false;
    });
  }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (params['search']) {
        this.search = params['search'];
        this.searchTerm = params['search'];
      }
      this.productService.getProducts().subscribe(prods => {
        this.products = prods;
        this.applyFilters();
        this.groupByBrand();
      });
    });
  }

  groupByBrand() {
    const map: { [brand: string]: Product[] } = {};
    for (const p of this.filteredProducts) {
      if (!map[p.brand]) {
        map[p.brand] = [];
      }
      map[p.brand].push(p);
    }
    this.brands = Object.keys(map);
    this.productsByBrand = map;
  }

  onSearchChange(value: string) {
    this.search = value;
    this.searchTerm = value;
    this.currentPage = 1;
    this.applyFilters();
  }

  onCategoryChange(value: string) {
    this.selectedCategory = value;
    this.currentPage = 1;
    this.applyFilters();
  }

  onBrandChange(value: string) {
    this.selectedBrand = value;
    this.currentPage = 1;
    this.applyFilters();
  }

  onInput(event: Event) {
    const target = event.target as HTMLInputElement;
    this.onSearchChange(target.value);
  }

  applyFilters() {
    let filtered = this.products;

    // Filtre par recherche
    if (this.searchTerm) {
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        p.description.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        p.brand.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    }

    // Filtre par catégorie
    if (this.selectedCategory) {
      filtered = filtered.filter(p => p.category === this.selectedCategory);
    }

    // Filtre par marque
    if (this.selectedBrand) {
      filtered = filtered.filter(p => p.brand === this.selectedBrand);
    }

    // Filtre par prix
    if (this.minPrice !== null) {
      filtered = filtered.filter(p => p.price >= this.minPrice!);
    }
    if (this.maxPrice !== null) {
      filtered = filtered.filter(p => p.price <= this.maxPrice!);
    }

    this.filteredProducts = filtered;
    this.updatePaginatedProducts();
    this.groupByBrand();

    if (this.filteredProducts.length === 0) {
      this.showMessage('Aucun produit trouvé pour vos critères de recherche.', 'info');
    } else {
      this.clearMessage();
    }
  }

  updatePaginatedProducts() {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.paginatedProducts = this.filteredProducts.slice(startIndex, endIndex);
    this.totalPages = Math.ceil(this.filteredProducts.length / this.pageSize);
  }

  onVoirPlus(brand: string) {
    // Navigation vers la page dédiée de la marque
    this.router.navigate(['/catalog/brand', encodeURIComponent(brand)]);
  }

  clearFilters() {
    this.searchTerm = '';
    this.search = '';
    this.selectedCategory = '';
    this.minPrice = null;
    this.maxPrice = null;
    this.selectedBrand = '';
    this.currentPage = 1;
    this.applyFilters();
    this.showMessage('Filtres réinitialisés.', 'info');
  }

  showMessage(text: string, type: 'success' | 'error' | 'info') {
    this.message = text;
    this.messageType = type;
    setTimeout(() => this.clearMessage(), 5000);
  }

  clearMessage() {
    this.message = '';
  }

  toggleFavorite(productId: number) {
    if (this.favorites.has(productId)) {
      this.favorites.delete(productId);
    } else {
      this.favorites.add(productId);
    }
  }

  // Méthodes réservées aux admins
  editBrand(brand: string) {
    if (this.isAdmin) {
      // Logique d'édition de marque
      console.log('Édition de la marque:', brand);
      // Ici on pourrait ouvrir un modal ou naviguer vers une page d'édition
    }
  }

  deleteBrand(brand: string) {
    if (this.isAdmin && confirm(`Êtes-vous sûr de vouloir supprimer la marque "${brand}" ?`)) {
      // Logique de suppression de marque
      console.log('Suppression de la marque:', brand);
      // Ici on pourrait supprimer tous les produits de cette marque
    }
  }
}
