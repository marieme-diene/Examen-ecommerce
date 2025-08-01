import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import { Product } from '../models/product.model';
import { ReviewService } from './review.service';

export interface FilterCriteria {
  // Filtres de base
  searchTerm: string;
  category: string;
  brand: string;
  minPrice: number | null;
  maxPrice: number | null;
  
  // Filtres avancés
  minRating: number | null;
  inStock: boolean;
  priceRange: string; // 'low', 'medium', 'high'
  sortBy: string; // 'price-asc', 'price-desc', 'rating', 'name', 'newest'
  
  // Filtres combinés
  onlyFavorites: boolean;
  onlyDiscounted: boolean;
}

export interface PriceRange {
  label: string;
  min: number;
  max: number;
}

@Injectable({
  providedIn: 'root'
})
export class AdvancedFiltersService {
  private filterSubject = new BehaviorSubject<FilterCriteria>({
    searchTerm: '',
    category: '',
    brand: '',
    minPrice: null,
    maxPrice: null,
    minRating: null,
    inStock: false,
    priceRange: '',
    sortBy: 'name',
    onlyFavorites: false,
    onlyDiscounted: false
  });

  public filters$ = this.filterSubject.asObservable();

  // Plages de prix prédéfinies
  readonly priceRanges: PriceRange[] = [
    { label: 'Moins de 10 000 FCFA', min: 0, max: 10000 },
    { label: '10 000 - 50 000 FCFA', min: 10000, max: 50000 },
    { label: '50 000 - 100 000 FCFA', min: 50000, max: 100000 },
    { label: 'Plus de 100 000 FCFA', min: 100000, max: Infinity }
  ];

  // Options de tri
  readonly sortOptions = [
    { value: 'name', label: 'Nom A-Z' },
    { value: 'price-asc', label: 'Prix croissant' },
    { value: 'price-desc', label: 'Prix décroissant' },
    { value: 'rating', label: 'Meilleures notes' },
    { value: 'newest', label: 'Plus récents' }
  ];

  constructor(private reviewService: ReviewService) {}

  // Mettre à jour les filtres
  updateFilters(filters: Partial<FilterCriteria>) {
    const currentFilters = this.filterSubject.value;
    this.filterSubject.next({ ...currentFilters, ...filters });
  }

  // Réinitialiser tous les filtres
  resetFilters() {
    this.filterSubject.next({
      searchTerm: '',
      category: '',
      brand: '',
      minPrice: null,
      maxPrice: null,
      minRating: null,
      inStock: false,
      priceRange: '',
      sortBy: 'name',
      onlyFavorites: false,
      onlyDiscounted: false
    });
  }

  // Appliquer les filtres aux produits
  applyFilters(products: Product[]): Observable<Product[]> {
    return combineLatest([
      this.filters$,
      this.reviewService.getReviews()
    ]).pipe(
      map(([filters, reviews]) => {
        let filteredProducts = [...products];

        // Filtre par recherche
        if (filters.searchTerm) {
          const searchLower = filters.searchTerm.toLowerCase();
          filteredProducts = filteredProducts.filter(product =>
            product.name.toLowerCase().includes(searchLower) ||
            product.description.toLowerCase().includes(searchLower) ||
            product.brand.toLowerCase().includes(searchLower)
          );
        }

        // Filtre par catégorie
        if (filters.category) {
          filteredProducts = filteredProducts.filter(product =>
            product.category === filters.category
          );
        }

        // Filtre par marque
        if (filters.brand) {
          filteredProducts = filteredProducts.filter(product =>
            product.brand === filters.brand
          );
        }

        // Filtre par prix
        if (filters.minPrice !== null) {
          filteredProducts = filteredProducts.filter(product =>
            product.price >= filters.minPrice!
          );
        }
        if (filters.maxPrice !== null) {
          filteredProducts = filteredProducts.filter(product =>
            product.price <= filters.maxPrice!
          );
        }

        // Filtre par plage de prix prédéfinie
        if (filters.priceRange) {
          const range = this.priceRanges.find(r => r.label === filters.priceRange);
          if (range) {
            filteredProducts = filteredProducts.filter(product =>
              product.price >= range.min && product.price <= range.max
            );
          }
        }

        // Filtre par note minimum
        if (filters.minRating !== null) {
          filteredProducts = filteredProducts.filter(product => {
            const productReviews = reviews.filter(review => review.productId === product.id);
            if (productReviews.length === 0) return false;
            const averageRating = productReviews.reduce((sum, review) => sum + review.rating, 0) / productReviews.length;
            return averageRating >= filters.minRating!;
          });
        }

        // Filtre par stock
        if (filters.inStock) {
          filteredProducts = filteredProducts.filter(product => product.stock > 0);
        }

        // Filtre par favoris (à implémenter avec FavoritesService)
        if (filters.onlyFavorites) {
          // TODO: Implémenter avec FavoritesService
        }

        // Filtre par produits en promotion (à implémenter)
        if (filters.onlyDiscounted) {
          // TODO: Implémenter quand on aura des promotions
        }

        // Tri des produits
        filteredProducts = this.sortProducts(filteredProducts, filters.sortBy, reviews);

        return filteredProducts;
      })
    );
  }

  // Trier les produits
  private sortProducts(products: Product[], sortBy: string, reviews: any[]): Product[] {
    switch (sortBy) {
      case 'price-asc':
        return products.sort((a, b) => a.price - b.price);
      
      case 'price-desc':
        return products.sort((a, b) => b.price - a.price);
      
      case 'rating':
        return products.sort((a, b) => {
          const aReviews = reviews.filter(review => review.productId === a.id);
          const bReviews = reviews.filter(review => review.productId === b.id);
          const aRating = aReviews.length > 0 ? aReviews.reduce((sum, review) => sum + review.rating, 0) / aReviews.length : 0;
          const bRating = bReviews.length > 0 ? bReviews.reduce((sum, review) => sum + review.rating, 0) / bReviews.length : 0;
          return bRating - aRating;
        });
      
      case 'newest':
        return products.sort((a, b) => b.id - a.id); // Par ID décroissant (plus récent)
      
      case 'name':
      default:
        return products.sort((a, b) => a.name.localeCompare(b.name));
    }
  }

  // Obtenir les statistiques des filtres
  getFilterStats(products: Product[]): Observable<any> {
    return this.filters$.pipe(
      map(filters => {
        const filteredProducts = products.filter(product => {
          if (filters.category && product.category !== filters.category) return false;
          if (filters.brand && product.brand !== filters.brand) return false;
          if (filters.minPrice !== null && product.price < filters.minPrice!) return false;
          if (filters.maxPrice !== null && product.price > filters.maxPrice!) return false;
          if (filters.inStock && product.stock === 0) return false;
          return true;
        });

        return {
          totalProducts: products.length,
          filteredProducts: filteredProducts.length,
          categories: this.getUniqueValues(products, 'category'),
          brands: this.getUniqueValues(products, 'brand'),
          priceRange: {
            min: Math.min(...products.map(p => p.price)),
            max: Math.max(...products.map(p => p.price))
          }
        };
      })
    );
  }

  private getUniqueValues(products: Product[], property: keyof Product): string[] {
    return [...new Set(products.map(p => p[property] as string))].sort();
  }
} 