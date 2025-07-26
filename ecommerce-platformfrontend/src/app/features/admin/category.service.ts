import { Injectable } from '@angular/core';

export interface Category {
  id: number;
  name: string;
}

const isBrowser = typeof window !== 'undefined' && typeof localStorage !== 'undefined';

@Injectable({ providedIn: 'root' })
export class CategoryService {
  private storageKey = 'categories';
  private categories: Category[] = [];

  constructor() {
    if (isBrowser) {
      const saved = localStorage.getItem(this.storageKey);
      if (saved) {
        this.categories = JSON.parse(saved);
      } else {
        this.categories = [
          { id: 1, name: 'Électronique' },
          { id: 2, name: 'Mode' },
          { id: 3, name: 'Maison' },
          { id: 4, name: 'Beauté' },
          { id: 5, name: 'Sport' },
          { id: 6, name: 'Livres' },
          { id: 7, name: 'Chaussures femme' },
          { id: 8, name: 'Serviette' },
          { id: 9, name: 'Bijoux' },
          { id: 10, name: 'Table' }
        ];
        localStorage.setItem(this.storageKey, JSON.stringify(this.categories));
      }
    }
  }

  private save() {
    if (isBrowser) {
      localStorage.setItem(this.storageKey, JSON.stringify(this.categories));
    }
  }

  getCategories(): Category[] {
    return this.categories;
  }

  addCategory(cat: Category) {
    this.categories.unshift(cat);
    this.save();
  }

  updateCategory(cat: Category) {
    this.categories = this.categories.map(c => c.id === cat.id ? cat : c);
    this.save();
  }

  deleteCategory(id: number) {
    this.categories = this.categories.filter(c => c.id !== id);
    this.save();
  }
} 