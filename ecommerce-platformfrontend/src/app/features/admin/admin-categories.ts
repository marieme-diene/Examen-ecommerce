import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

interface Category {
  id: number;
  name: string;
  description: string;
  productCount: number;
}

@Component({
  selector: 'app-admin-categories',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    MatButtonModule, 
    MatIconModule, 
    MatCardModule,
    MatFormFieldModule,
    MatInputModule
  ],
  template: `
    <div class="admin-categories">
      <h2>Gestion des catégories</h2>
      
      <!-- Messages de feedback -->
      <div *ngIf="message" class="feedback-message" [class.success]="messageType === 'success'" [class.error]="messageType === 'error'">
        {{ message }}
        <button class="close-btn" (click)="clearMessage()">×</button>
      </div>

      <!-- Formulaire d'ajout/modification -->
      <mat-card class="category-form-card">
        <mat-card-header>
          <mat-card-title>{{ editingCategory ? 'Modifier la catégorie' : 'Ajouter une nouvelle catégorie' }}</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <form (ngSubmit)="saveCategory()" #form="ngForm">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Nom de la catégorie *</mat-label>
              <input matInput [(ngModel)]="categoryForm.name" name="name" required minlength="2" maxlength="50">
            </mat-form-field>
            
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Description</mat-label>
              <textarea matInput [(ngModel)]="categoryForm.description" name="description" rows="3" maxlength="200"></textarea>
            </mat-form-field>
            
            <div class="form-actions">
              <button mat-raised-button color="primary" type="submit" [disabled]="!form.form.valid">
                {{ editingCategory ? 'Modifier' : 'Ajouter' }}
              </button>
              <button mat-stroked-button type="button" (click)="cancelEdit()" *ngIf="editingCategory">
                Annuler
              </button>
            </div>
          </form>
        </mat-card-content>
      </mat-card>

      <!-- Liste des catégories -->
      <mat-card class="categories-list-card">
        <mat-card-header>
          <mat-card-title>Catégories existantes ({{ categories.length }})</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <div class="categories-grid">
            <div class="category-item" *ngFor="let category of categories">
              <div class="category-info">
                <h3>{{ category.name }}</h3>
                <p class="description">{{ category.description || 'Aucune description' }}</p>
                <div class="category-meta">
                  <span class="product-count">{{ category.productCount }} produit(s)</span>
                </div>
              </div>
              <div class="category-actions">
                <button mat-icon-button color="primary" (click)="editCategory(category)" matTooltip="Modifier">
                  <mat-icon>edit</mat-icon>
                </button>
                <button mat-icon-button color="warn" (click)="deleteCategory(category.id)" matTooltip="Supprimer" [disabled]="category.productCount > 0">
                  <mat-icon>delete</mat-icon>
                </button>
              </div>
            </div>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .admin-categories {
      max-width: 1200px;
      margin: 0 auto;
    }
    
    .admin-categories h2 {
      margin-bottom: 24px;
      color: #2563eb;
    }
    
    .feedback-message {
      padding: 12px 16px;
      border-radius: 8px;
      margin-bottom: 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .feedback-message.success {
      background: #d1fae5;
      color: #065f46;
      border: 1px solid #a7f3d0;
    }
    
    .feedback-message.error {
      background: #fee2e2;
      color: #991b1b;
      border: 1px solid #fca5a5;
    }
    
    .close-btn {
      background: none;
      border: none;
      font-size: 18px;
      cursor: pointer;
      color: inherit;
    }
    
    .category-form-card {
      margin-bottom: 24px;
    }
    
    .full-width {
      width: 100%;
      margin-bottom: 16px;
    }
    
    .form-actions {
      display: flex;
      gap: 12px;
      margin-top: 16px;
    }
    
    .categories-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 20px;
    }
    
    .category-item {
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      padding: 20px;
      transition: box-shadow 0.2s;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }
    
    .category-item:hover {
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    }
    
    .category-info {
      flex: 1;
    }
    
    .category-info h3 {
      margin: 0 0 8px 0;
      font-size: 1.2rem;
      color: #1f2937;
    }
    
    .description {
      color: #6b7280;
      font-size: 0.9rem;
      margin-bottom: 12px;
      line-height: 1.4;
    }
    
    .category-meta {
      display: flex;
      align-items: center;
    }
    
    .product-count {
      font-size: 0.9rem;
      padding: 4px 8px;
      border-radius: 4px;
      background: #dbeafe;
      color: #1e40af;
    }
    
    .category-actions {
      display: flex;
      gap: 8px;
    }
    
    @media (max-width: 768px) {
      .categories-grid {
        grid-template-columns: 1fr;
      }
      
      .category-item {
        flex-direction: column;
        gap: 16px;
      }
      
      .category-actions {
        align-self: flex-end;
      }
    }
  `]
})
export class AdminCategories implements OnInit {
  categories: Category[] = [];
  message = '';
  messageType: 'success' | 'error' = 'success';
  editingCategory: Category | null = null;
  
  categoryForm: Partial<Category> = {
    name: '',
    description: ''
  };

  constructor() {}

  ngOnInit() {
    this.loadCategories();
  }

  loadCategories() {
    // Simuler des catégories avec comptage de produits
    this.categories = [
      { id: 1, name: 'Électronique', description: 'Produits électroniques et gadgets', productCount: 15 },
      { id: 2, name: 'Mode', description: 'Vêtements et accessoires de mode', productCount: 8 },
      { id: 3, name: 'Maison', description: 'Articles pour la maison et le jardin', productCount: 12 },
      { id: 4, name: 'Beauté', description: 'Produits de beauté et soins', productCount: 6 },
      { id: 5, name: 'Sport', description: 'Équipements et vêtements de sport', productCount: 4 },
      { id: 6, name: 'Livres', description: 'Livres et publications', productCount: 3 }
    ];
  }

  saveCategory() {
    if (this.editingCategory) {
      // Modification
      const index = this.categories.findIndex(c => c.id === this.editingCategory!.id);
      if (index !== -1) {
        this.categories[index] = { ...this.editingCategory, ...this.categoryForm };
        this.showMessage('Catégorie modifiée avec succès', 'success');
      }
    } else {
      // Ajout
      const newCategory: Category = {
        id: Date.now(),
        name: this.categoryForm.name!,
        description: this.categoryForm.description || '',
        productCount: 0
      };
      this.categories.push(newCategory);
      this.showMessage('Catégorie ajoutée avec succès', 'success');
    }
    
    this.resetForm();
  }

  editCategory(category: Category) {
    this.editingCategory = category;
    this.categoryForm = { ...category };
  }

  deleteCategory(id: number) {
    const category = this.categories.find(c => c.id === id);
    if (category && category.productCount > 0) {
      this.showMessage('Impossible de supprimer une catégorie contenant des produits', 'error');
      return;
    }
    
    if (confirm('Êtes-vous sûr de vouloir supprimer cette catégorie ?')) {
      this.categories = this.categories.filter(c => c.id !== id);
      this.showMessage('Catégorie supprimée avec succès', 'success');
    }
  }

  cancelEdit() {
    this.editingCategory = null;
    this.resetForm();
  }

  resetForm() {
    this.categoryForm = {
      name: '',
      description: ''
    };
    this.editingCategory = null;
  }

  showMessage(message: string, type: 'success' | 'error') {
    this.message = message;
    this.messageType = type;
    setTimeout(() => this.clearMessage(), 5000);
  }

  clearMessage() {
    this.message = '';
  }
} 