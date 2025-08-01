import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Product } from '../models/product.model';

@Injectable({
  providedIn: 'root'
})
export class FavoritesService {
  private readonly FAVORITES_KEY = 'afrimarket_favorites';
  private favoritesSubject = new BehaviorSubject<Set<number>>(new Set());
  public favorites$ = this.favoritesSubject.asObservable();

  constructor() {
    this.loadFavorites();
  }

  // Charger les favoris depuis localStorage
  private loadFavorites(): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      const savedFavorites = localStorage.getItem(this.FAVORITES_KEY);
      if (savedFavorites) {
        const favoritesArray = JSON.parse(savedFavorites);
        this.favoritesSubject.next(new Set(favoritesArray));
      }
    }
  }

  // Sauvegarder les favoris dans localStorage
  private saveFavorites(favorites: Set<number>): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(this.FAVORITES_KEY, JSON.stringify(Array.from(favorites)));
    }
  }

  // Ajouter un produit aux favoris
  addToFavorites(productId: number): void {
    const currentFavorites = this.favoritesSubject.value;
    currentFavorites.add(productId);
    this.favoritesSubject.next(new Set(currentFavorites));
    this.saveFavorites(currentFavorites);
  }

  // Retirer un produit des favoris
  removeFromFavorites(productId: number): void {
    const currentFavorites = this.favoritesSubject.value;
    currentFavorites.delete(productId);
    this.favoritesSubject.next(new Set(currentFavorites));
    this.saveFavorites(currentFavorites);
  }

  // Basculer l'état favori d'un produit
  toggleFavorite(productId: number): void {
    const currentFavorites = this.favoritesSubject.value;
    if (currentFavorites.has(productId)) {
      this.removeFromFavorites(productId);
    } else {
      this.addToFavorites(productId);
    }
  }

  // Vérifier si un produit est en favori
  isFavorite(productId: number): boolean {
    return this.favoritesSubject.value.has(productId);
  }

  // Obtenir tous les IDs des favoris
  getFavoriteIds(): Set<number> {
    return this.favoritesSubject.value;
  }

  // Obtenir le nombre de favoris
  getFavoritesCount(): number {
    return this.favoritesSubject.value.size;
  }

  // Vider tous les favoris
  clearFavorites(): void {
    this.favoritesSubject.next(new Set());
    this.saveFavorites(new Set());
  }
} 