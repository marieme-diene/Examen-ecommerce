import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatSliderModule } from '@angular/material/slider';
import { AdvancedFiltersService, FilterCriteria } from '../../services/advanced-filters.service';
import { StarRating } from '../star-rating/star-rating';

@Component({
  selector: 'app-advanced-filters',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatCardModule,
    MatIconModule,
    MatExpansionModule,
    MatSliderModule,
    StarRating
  ],
  template: `
    <mat-card class="filters-card">
      <mat-card-header>
        <mat-card-title>
          <mat-icon>filter_list</mat-icon>
          Filtres avancés
        </mat-card-title>
      </mat-card-header>
      
      <mat-card-content>
        <form (ngSubmit)="applyFilters()" class="filters-form">
          
          <!-- Recherche -->
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Rechercher</mat-label>
            <input 
              matInput 
              [(ngModel)]="filters.searchTerm" 
              name="searchTerm"
              placeholder="Nom, description, marque...">
            <mat-icon matSuffix>search</mat-icon>
          </mat-form-field>

          <!-- Tri -->
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Trier par</mat-label>
            <mat-select [(ngModel)]="filters.sortBy" name="sortBy">
              <mat-option *ngFor="let option of filterService.sortOptions" 
                         [value]="option.value">
                {{ option.label }}
              </mat-option>
            </mat-select>
          </mat-form-field>

          <!-- Catégorie -->
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Catégorie</mat-label>
            <mat-select [(ngModel)]="filters.category" name="category">
              <mat-option value="">Toutes les catégories</mat-option>
              <mat-option *ngFor="let category of availableCategories" 
                         [value]="category">
                {{ category }}
              </mat-option>
            </mat-select>
          </mat-form-field>

          <!-- Marque -->
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Marque</mat-label>
            <mat-select [(ngModel)]="filters.brand" name="brand">
              <mat-option value="">Toutes les marques</mat-option>
              <mat-option *ngFor="let brand of availableBrands" 
                         [value]="brand">
                {{ brand }}
              </mat-option>
            </mat-select>
          </mat-form-field>

          <!-- Plage de prix prédéfinie -->
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Plage de prix</mat-label>
            <mat-select [(ngModel)]="filters.priceRange" name="priceRange">
              <mat-option value="">Tous les prix</mat-option>
              <mat-option *ngFor="let range of filterService.priceRanges" 
                         [value]="range.label">
                {{ range.label }}
              </mat-option>
            </mat-select>
          </mat-form-field>

          <!-- Prix personnalisé -->
          <div class="price-range-section">
            <label>Prix personnalisé</label>
            <div class="price-inputs">
              <mat-form-field appearance="outline">
                <mat-label>Min</mat-label>
                <input 
                  matInput 
                  type="number" 
                  [(ngModel)]="filters.minPrice" 
                  name="minPrice"
                  placeholder="0">
              </mat-form-field>
              <span class="price-separator">-</span>
              <mat-form-field appearance="outline">
                <mat-label>Max</mat-label>
                <input 
                  matInput 
                  type="number" 
                  [(ngModel)]="filters.maxPrice" 
                  name="maxPrice"
                  placeholder="∞">
              </mat-form-field>
            </div>
          </div>

          <!-- Note minimum -->
          <div class="rating-filter-section">
            <label>Note minimum</label>
            <app-star-rating 
              [rating]="filters.minRating || 0" 
              (ratingChange)="filters.minRating = $event"
              [readonly]="false"
              [showRating]="true">
            </app-star-rating>
            <button 
              mat-button 
              type="button" 
              (click)="filters.minRating = null"
              class="clear-rating">
              Effacer
            </button>
          </div>

          <!-- Filtres booléens -->
          <div class="boolean-filters">
            <mat-checkbox 
              [(ngModel)]="filters.inStock" 
              name="inStock">
              En stock seulement
            </mat-checkbox>
            
            <mat-checkbox 
              [(ngModel)]="filters.onlyFavorites" 
              name="onlyFavorites">
              Mes favoris seulement
            </mat-checkbox>
            
            <mat-checkbox 
              [(ngModel)]="filters.onlyDiscounted" 
              name="onlyDiscounted">
              Promotions seulement
            </mat-checkbox>
          </div>

          <!-- Actions -->
          <div class="filter-actions">
            <button 
              mat-raised-button 
              color="primary" 
              type="submit"
              class="apply-btn">
              <mat-icon>filter_alt</mat-icon>
              Appliquer les filtres
            </button>
            
            <button 
              mat-stroked-button 
              type="button" 
              (click)="resetFilters()"
              class="reset-btn">
              <mat-icon>clear</mat-icon>
              Réinitialiser
            </button>
          </div>

          <!-- Statistiques -->
          <div class="filter-stats" *ngIf="filterStats">
            <p>{{ filterStats.filteredProducts }} produit(s) trouvé(s) sur {{ filterStats.totalProducts }}</p>
          </div>

        </form>
      </mat-card-content>
    </mat-card>
  `,
  styles: [`
    .filters-card {
      margin-bottom: 24px;
    }

    .filters-form {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .full-width {
      width: 100%;
    }

    .price-range-section {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .price-range-section label {
      font-weight: 500;
      color: #333;
    }

    .price-inputs {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .price-separator {
      font-weight: bold;
      color: #666;
    }

    .rating-filter-section {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .rating-filter-section label {
      font-weight: 500;
      color: #333;
    }

    .clear-rating {
      align-self: flex-start;
      font-size: 12px;
    }

    .boolean-filters {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .filter-actions {
      display: flex;
      gap: 12px;
      margin-top: 16px;
    }

    .apply-btn {
      flex: 1;
    }

    .filter-stats {
      margin-top: 16px;
      padding: 12px;
      background: #f5f5f5;
      border-radius: 8px;
      text-align: center;
      font-size: 14px;
      color: #666;
    }

    @media (max-width: 768px) {
      .price-inputs {
        flex-direction: column;
        gap: 8px;
      }
      
      .filter-actions {
        flex-direction: column;
      }
    }
  `]
})
export class AdvancedFilters implements OnInit {
  @Output() filtersChanged = new EventEmitter<FilterCriteria>();

  filters: FilterCriteria = {
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
  };

  availableCategories: string[] = [];
  availableBrands: string[] = [];
  filterStats: any = null;

  constructor(public filterService: AdvancedFiltersService) {}

  ngOnInit() {
    // S'abonner aux changements de filtres
    this.filterService.filters$.subscribe(filters => {
      this.filters = { ...filters };
    });
  }

  applyFilters() {
    this.filterService.updateFilters(this.filters);
    this.filtersChanged.emit(this.filters);
  }

  resetFilters() {
    this.filterService.resetFilters();
    this.filters = {
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
    };
    this.filtersChanged.emit(this.filters);
  }

  // Méthodes pour mettre à jour les listes disponibles
  updateAvailableCategories(categories: string[]) {
    this.availableCategories = categories;
  }

  updateAvailableBrands(brands: string[]) {
    this.availableBrands = brands;
  }

  updateFilterStats(stats: any) {
    this.filterStats = stats;
  }
} 