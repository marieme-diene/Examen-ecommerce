import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatExpansionModule } from '@angular/material/expansion';
import { ProductService } from '../../services/product.service';
import { Product } from '../../models/product.model';
import { ProductCard } from '../../components/product-card/product-card';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../account/services/auth.service';
import { FavoritesService } from '../../services/favorites.service';
import { AdvancedFilters } from '../../components/advanced-filters/advanced-filters';
import { AdvancedFiltersService, FilterCriteria } from '../../services/advanced-filters.service';
import { CartService } from '../../../cart/services/cart.service';

@Component({
  selector: 'app-catalog-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatSelectModule,
    MatButtonModule,
    MatCardModule,
    MatExpansionModule,
    ProductCard,
    AdvancedFilters
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
    'Chaussures femme', 'Serviette', 'Bijoux', 'Table', 'Mobilier', 'Électroménager'
  ];
  search = '';
  searchTerm = '';
  selectedCategory = '';

  // Favoris (utilise le service)
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

  // Filtres avancés
  showAdvancedFilters = false;
  filterStats: any = null;

  constructor(
    private productService: ProductService,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private favoritesService: FavoritesService,
    private advancedFiltersService: AdvancedFiltersService,
    private cartService: CartService
  ) {
    this.loading = true;
    this.isAdmin = this.authService.isAdmin();
    
    // S'abonner aux changements de favoris
    this.favoritesService.favorites$.subscribe(favorites => {
      this.favorites = favorites;
    });
    
    this.productService.getProducts().subscribe(products => {
      this.products = products;
      this.setupAdvancedFilters();
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
    const product = this.products.find(p => p.id === productId);
    const productName = product ? product.name : 'Produit';
    
    this.favoritesService.toggleFavorite(productId);
    
    // Afficher un message de confirmation
    if (this.favoritesService.isFavorite(productId)) {
      this.showMessage(`${productName} ajouté aux favoris`, 'success');
    } else {
      this.showMessage(`${productName} retiré des favoris`, 'info');
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

  setupAdvancedFilters() {
    // Extraire les catégories et marques uniques des produits
    const uniqueCategories = [...new Set(this.products.map(p => p.category))].sort();
    const uniqueBrands = [...new Set(this.products.map(p => p.brand))].sort();
    
    // Mettre à jour les statistiques des filtres
    this.advancedFiltersService.getFilterStats(this.products).subscribe(stats => {
      this.filterStats = stats;
    });
  }

  toggleAdvancedFilters() {
    this.showAdvancedFilters = !this.showAdvancedFilters;
  }

  onFiltersChanged(criteria: FilterCriteria) {
    this.advancedFiltersService.applyFilters(this.products).subscribe(filteredProducts => {
      this.filteredProducts = filteredProducts;
      this.updatePaginatedProducts();
      this.groupByBrand();
      
      if (this.filteredProducts.length === 0) {
        this.showMessage('Aucun produit trouvé avec ces critères.', 'info');
      } else {
        this.showMessage(`${this.filteredProducts.length} produit(s) trouvé(s).`, 'success');
      }
    });
  }

  addToCart(product: Product) {
    this.cartService.addToCart(product);
    this.showMessage(`${product.name} ajouté au panier !`, 'success');
  }
}
