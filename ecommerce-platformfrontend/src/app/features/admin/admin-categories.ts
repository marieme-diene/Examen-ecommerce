import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CategoryService, Category } from './category.service';

@Component({
  selector: 'app-admin-categories',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <h2 class="admin-title">Gestion des catégories</h2>
    
    <!-- Messages de feedback -->
    <div *ngIf="message" class="feedback-message" [class.success]="messageType === 'success'" [class.error]="messageType === 'error'">
      {{ message }}
      <button class="close-btn" (click)="clearMessage()">×</button>
    </div>

    <!-- Loader pour le chargement -->
    <div *ngIf="loading" class="loader-overlay">
      <div class="loader">Chargement...</div>
    </div>

    <div class="admin-table-wrapper">
      <table class="admin-table">
        <thead>
          <tr><th>Nom</th><th>Nombre de produits</th><th></th></tr>
        </thead>
        <tbody>
          <tr *ngFor="let cat of categories">
            <td>{{ cat.name }}</td>
            <td>{{ getProductCount(cat.name) }}</td>
            <td>
              <button class="admin-btn admin-btn-edit" (click)="editCategory(cat)" [disabled]="saving">
                <span *ngIf="!saving">Modifier</span>
                <span *ngIf="saving">...</span>
              </button>
              <button class="admin-btn admin-btn-delete" (click)="deleteCategory(cat)" [disabled]="saving">
                <span *ngIf="!saving">Supprimer</span>
                <span *ngIf="saving">...</span>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    
    <button class="admin-btn admin-btn-add" (click)="startAddCategory()" [disabled]="saving">
      <span *ngIf="!saving">+ Ajouter une catégorie</span>
      <span *ngIf="saving">Chargement...</span>
    </button>

    <form *ngIf="showForm" (ngSubmit)="saveCategory()" class="admin-form" #categoryForm="ngForm">
      <input type="hidden" [(ngModel)]="form.id" name="id">
      <div class="admin-form-row">
        <label>Nom *</label>
        <input [(ngModel)]="form.name" name="name" required minlength="2" maxlength="50"
               [class.invalid]="categoryForm.submitted && !form.name"
               placeholder="Nom de la catégorie">
        <div *ngIf="categoryForm.submitted && !form.name" class="error-text">Le nom est requis</div>
        <div *ngIf="categoryForm.submitted && form.name && form.name.length < 2" class="error-text">Le nom doit contenir au moins 2 caractères</div>
        <div *ngIf="categoryForm.submitted && form.name && isDuplicateName(form.name)" class="error-text">Cette catégorie existe déjà</div>
      </div>
      <div class="admin-form-actions">
        <button type="submit" class="admin-btn admin-btn-save" [disabled]="saving">
          <span *ngIf="!saving">{{ editing ? 'Modifier' : 'Ajouter' }}</span>
          <span *ngIf="saving">Enregistrement...</span>
        </button>
        <button type="button" class="admin-btn admin-btn-cancel" (click)="cancelForm()" [disabled]="saving">Annuler</button>
      </div>
    </form>
  `,
  styles: [`
    .admin-title { font-size: 2rem; font-weight: bold; margin-bottom: 24px; color: #2563eb; }
    
    .feedback-message { 
      padding: 12px 16px; margin-bottom: 18px; border-radius: 6px; display: flex; justify-content: space-between; align-items: center;
      animation: slideIn 0.3s ease-out;
    }
    .feedback-message.success { background: #dcfce7; color: #166534; border: 1px solid #bbf7d0; }
    .feedback-message.error { background: #fef2f2; color: #b91c1c; border: 1px solid #fecaca; }
    .close-btn { background: none; border: none; font-size: 1.2rem; cursor: pointer; color: inherit; }
    
    .loader-overlay { 
      position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(255,255,255,0.8); 
      display: flex; align-items: center; justify-content: center; z-index: 1000;
    }
    .loader { 
      background: #2563eb; color: white; padding: 16px 24px; border-radius: 8px; 
      box-shadow: 0 4px 12px rgba(37,99,235,0.3);
    }
    
    .admin-table-wrapper { overflow-x: auto; }
    .admin-table { width: 100%; border-collapse: collapse; background: #fff; box-shadow: 0 2px 8px rgba(0,0,0,0.04); }
    .admin-table th, .admin-table td { padding: 10px 8px; text-align: left; }
    .admin-table th { background: #f5f7fa; color: #2563eb; font-weight: 600; }
    .admin-table tr:nth-child(even) { background: #f8fafc; }
    .admin-table tr:hover { background: #e0e7ff; }
    
    .admin-btn { 
      border: none; border-radius: 6px; padding: 7px 16px; font-weight: 500; cursor: pointer; 
      margin-right: 6px; transition: all 0.2s; 
    }
    .admin-btn:disabled { opacity: 0.6; cursor: not-allowed; }
    .admin-btn-edit { background: #2563eb; color: #fff; }
    .admin-btn-edit:hover:not(:disabled) { background: #1e40af; }
    .admin-btn-delete { background: #e11d48; color: #fff; }
    .admin-btn-delete:hover:not(:disabled) { background: #b91c1c; }
    .admin-btn-add { background: #1a8f3c; color: #fff; margin-top: 18px; }
    .admin-btn-add:hover:not(:disabled) { background: #166534; }
    
    .admin-form { 
      display: flex; flex-wrap: wrap; gap: 18px; align-items: flex-start; 
      background: #f5f7fa; padding: 18px 12px; border-radius: 8px; margin-top: 32px; 
      box-shadow: 0 2px 8px rgba(0,0,0,0.04); 
    }
    .admin-form-row { 
      display: flex; flex-direction: column; gap: 6px; min-width: 180px; flex: 1 1 180px; 
    }
    .admin-form-row label { font-weight: 600; color: #374151; }
    .admin-form-row input { 
      padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 0.9rem;
      transition: border-color 0.2s;
    }
    .admin-form-row input:focus { 
      outline: none; border-color: #2563eb; box-shadow: 0 0 0 3px rgba(37,99,235,0.1);
    }
    .admin-form-row input.invalid { border-color: #e11d48; }
    .error-text { color: #e11d48; font-size: 0.8rem; margin-top: 2px; }
    
    .admin-form-actions { display: flex; gap: 12px; align-items: center; }
    .admin-btn-save { background: #2563eb; color: #fff; }
    .admin-btn-save:hover:not(:disabled) { background: #1e40af; }
    .admin-btn-cancel { background: #f5f5f5; color: #111; }
    .admin-btn-cancel:hover:not(:disabled) { background: #e5e5e5; }
    
    @keyframes slideIn {
      from { transform: translateY(-10px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }
    
    @media (max-width: 900px) {
      .admin-form { flex-direction: column; gap: 10px; }
      .admin-form-row { min-width: 100%; }
    }
  `]
})
export class AdminCategories {
  categories: Category[] = [];
  showForm = false;
  form: any = {};
  editing = false;
  loading = false;
  saving = false;
  message = '';
  messageType: 'success' | 'error' = 'success';

  constructor(private categoryService: CategoryService) {
    this.refresh();
  }

  refresh() {
    this.loading = true;
    setTimeout(() => {
      this.categories = this.categoryService.getCategories();
      this.loading = false;
    }, 300);
  }

  startAddCategory() {
    this.form = {};
    this.showForm = true;
    this.editing = false;
    this.clearMessage();
  }

  editCategory(cat: Category) {
    this.form = { ...cat };
    this.showForm = true;
    this.editing = true;
    this.clearMessage();
  }

  saveCategory() {
    if (!this.validateForm()) {
      return;
    }

    this.saving = true;
    
    try {
      const cat: Category = {
        id: this.editing && this.form.id ? this.form.id : Date.now(),
        name: this.form.name.trim()
      };

      if (this.editing) {
        this.categoryService.updateCategory(cat);
        this.showMessage('Catégorie modifiée avec succès !', 'success');
      } else {
        this.categoryService.addCategory(cat);
        this.showMessage('Catégorie ajoutée avec succès !', 'success');
      }

      this.refresh();
      this.showForm = false;
      this.form = {};
      this.editing = false;
    } catch (error) {
      this.showMessage('Erreur lors de l\'enregistrement', 'error');
    } finally {
      this.saving = false;
    }
  }

  deleteCategory(cat: Category) {
    const productCount = this.getProductCount(cat.name);
    const message = productCount > 0 
      ? `Attention : Cette catégorie contient ${productCount} produit(s). Êtes-vous sûr de vouloir la supprimer ?`
      : `Êtes-vous sûr de vouloir supprimer "${cat.name}" ?`;
    
    if (confirm(message)) {
      this.saving = true;
      try {
        this.categoryService.deleteCategory(cat.id);
        this.showMessage('Catégorie supprimée avec succès !', 'success');
        this.refresh();
      } catch (error) {
        this.showMessage('Erreur lors de la suppression', 'error');
      } finally {
        this.saving = false;
      }
    }
  }

  cancelForm() {
    this.showForm = false;
    this.form = {};
    this.editing = false;
    this.clearMessage();
  }

  validateForm(): boolean {
    if (!this.form.name?.trim()) return false;
    if (this.form.name.trim().length < 2) return false;
    if (this.isDuplicateName(this.form.name.trim())) return false;
    return true;
  }

  isDuplicateName(name: string): boolean {
    const existingCategory = this.categories.find(cat => 
      cat.name.toLowerCase() === name.toLowerCase() && cat.id !== this.form.id
    );
    return !!existingCategory;
  }

  getProductCount(categoryName: string): number {
    // Simulation - dans un vrai projet, on récupérerait depuis le service des produits
    const products = JSON.parse(localStorage.getItem('products') || '[]');
    return products.filter((p: any) => p.category === categoryName).length;
  }

  showMessage(text: string, type: 'success' | 'error') {
    this.message = text;
    this.messageType = type;
    setTimeout(() => this.clearMessage(), 5000);
  }

  clearMessage() {
    this.message = '';
  }
} 