import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../features/catalog/services/product.service';
import { Product } from '../../features/catalog/models/product.model';

@Component({
  selector: 'app-admin-products',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <h2 class="admin-title">Gestion des produits</h2>
    
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
          <tr><th>Nom</th><th>Prix</th><th>Stock</th><th>Catégorie</th><th>Marque</th><th></th></tr>
        </thead>
        <tbody>
          <tr *ngFor="let prod of products">
            <td>{{ prod.name }}</td>
            <td>{{ prod.price | currency:'FCFA':'symbol':'1.0-0':'fr' }}</td>
            <td>
              <span [class.low-stock]="prod.stock < 5" [class.out-of-stock]="prod.stock === 0">
                {{ prod.stock }}
              </span>
            </td>
            <td>{{ prod.category }}</td>
            <td>{{ prod.brand }}</td>
            <td>
              <button class="admin-btn admin-btn-edit" (click)="editProduct(prod)" [disabled]="saving">
                <span *ngIf="!saving">Modifier</span>
                <span *ngIf="saving">...</span>
              </button>
              <button class="admin-btn admin-btn-delete" (click)="deleteProduct(prod)" [disabled]="saving">
                <span *ngIf="!saving">Supprimer</span>
                <span *ngIf="saving">...</span>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    
    <button class="admin-btn admin-btn-add" (click)="startAddProduct()" [disabled]="saving">
      <span *ngIf="!saving">+ Ajouter un produit</span>
      <span *ngIf="saving">Chargement...</span>
    </button>

    <!-- Bouton de reset pour vider le cache -->
    <button class="admin-btn admin-btn-reset" (click)="resetProducts()" [disabled]="saving" style="margin-left: 12px; background: #f59e0b; color: white;">
      <span *ngIf="!saving">🔄 Reset Cache</span>
      <span *ngIf="saving">Chargement...</span>
    </button>

    <form *ngIf="showForm" (ngSubmit)="saveProduct()" class="admin-form" #productForm="ngForm">
      <input type="hidden" [(ngModel)]="form.id" name="id">
      
      <div class="admin-form-row">
        <label>Nom *</label>
        <input [(ngModel)]="form.name" name="name" required minlength="2" maxlength="100" 
               [class.invalid]="productForm.submitted && !form.name" 
               placeholder="Nom du produit">
        <div *ngIf="productForm.submitted && !form.name" class="error-text">Le nom est requis</div>
        <div *ngIf="productForm.submitted && form.name && form.name.length < 2" class="error-text">Le nom doit contenir au moins 2 caractères</div>
      </div>
      
      <div class="admin-form-row">
        <label>Description *</label>
        <input [(ngModel)]="form.description" name="description" required minlength="5" maxlength="200"
               [class.invalid]="productForm.submitted && !form.description"
               placeholder="Description courte">
        <div *ngIf="productForm.submitted && !form.description" class="error-text">La description est requise</div>
        <div *ngIf="productForm.submitted && form.description && form.description.length < 5" class="error-text">La description doit contenir au moins 5 caractères</div>
      </div>
      
      <div class="admin-form-row">
        <label>Prix (FCFA) *</label>
        <input type="number" [(ngModel)]="form.price" name="price" required min="0" step="0.01"
               [class.invalid]="productForm.submitted && (!form.price || form.price < 0)"
               placeholder="0.00">
        <div *ngIf="productForm.submitted && (!form.price || form.price < 0)" class="error-text">Le prix doit être positif</div>
      </div>
      
      <div class="admin-form-row">
        <label>Stock *</label>
        <input type="number" [(ngModel)]="form.stock" name="stock" required min="0"
               [class.invalid]="productForm.submitted && (!form.stock || form.stock < 0)"
               placeholder="0">
        <div *ngIf="productForm.submitted && (!form.stock || form.stock < 0)" class="error-text">Le stock doit être positif</div>
      </div>
      
      <div class="admin-form-row">
        <label>Catégorie *</label>
        <input [(ngModel)]="form.category" name="category" required minlength="2"
               [class.invalid]="productForm.submitted && !form.category"
               placeholder="Catégorie du produit">
        <div *ngIf="productForm.submitted && !form.category" class="error-text">La catégorie est requise</div>
      </div>
      
      <div class="admin-form-row">
        <label>Marque *</label>
        <input [(ngModel)]="form.brand" name="brand" required minlength="2"
               [class.invalid]="productForm.submitted && !form.brand"
               placeholder="Marque du produit">
        <div *ngIf="productForm.submitted && !form.brand" class="error-text">La marque est requise</div>
      </div>
      
      <div class="admin-form-row">
        <label>Image principale (URL) *</label>
        <input [(ngModel)]="form.image" name="image" required type="url"
               [class.invalid]="productForm.submitted && !form.image"
               placeholder="https://example.com/image.jpg">
        <div *ngIf="productForm.submitted && !form.image" class="error-text">L'URL de l'image est requise</div>
        <div *ngIf="productForm.submitted && form.image && !isValidUrl(form.image)" class="error-text">URL invalide</div>
      </div>
      
      <div class="admin-form-row">
        <label>Images (URLs séparées par des virgules)</label>
        <input [(ngModel)]="form.imagesStr" name="imagesStr" type="text"
               placeholder="https://example.com/img1.jpg, https://example.com/img2.jpg">
        <div *ngIf="productForm.submitted && form.imagesStr && !areValidUrls(form.imagesStr)" class="error-text">Une ou plusieurs URLs sont invalides</div>
      </div>
      
      <div class="admin-form-row" style="flex:1;">
        <label>Description longue</label>
        <textarea [(ngModel)]="form.longDescription" name="longDescription" rows="3"
                  placeholder="Description détaillée du produit (optionnel)"></textarea>
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
    
    .low-stock { color: #f59e0b; font-weight: 600; }
    .out-of-stock { color: #e11d48; font-weight: 600; }
    
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
    .admin-btn-reset { background: #f59e0b; color: white; }
    .admin-btn-reset:hover:not(:disabled) { background: #d97706; }
    
    .admin-form { 
      display: flex; flex-wrap: wrap; gap: 18px; align-items: flex-start; 
      background: #f5f7fa; padding: 18px 12px; border-radius: 8px; margin-top: 32px; 
      box-shadow: 0 2px 8px rgba(0,0,0,0.04); 
    }
    .admin-form-row { 
      display: flex; flex-direction: column; gap: 6px; min-width: 180px; flex: 1 1 180px; 
    }
    .admin-form-row label { font-weight: 600; color: #374151; }
    .admin-form-row input, .admin-form-row textarea { 
      padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 0.9rem;
      transition: border-color 0.2s;
    }
    .admin-form-row input:focus, .admin-form-row textarea:focus { 
      outline: none; border-color: #2563eb; box-shadow: 0 0 0 3px rgba(37,99,235,0.1);
    }
    .admin-form-row input.invalid, .admin-form-row textarea.invalid { 
      border-color: #e11d48; 
    }
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
export class AdminProducts {
  products: Product[] = [];
  showForm = false;
  form: any = {};
  editing = false;
  loading = false;
  saving = false;
  message = '';
  messageType: 'success' | 'error' = 'success';

  constructor(private productService: ProductService) {
    this.refresh();
  }

  refresh() {
    this.loading = true;
    this.productService.getProducts().subscribe(prods => {
      this.products = prods;
      this.loading = false;
    });
  }

  startAddProduct() {
    this.form = {};
    this.form.imagesStr = '';
    this.showForm = true;
    this.editing = false;
    this.clearMessage();
  }

  editProduct(prod: Product) {
    this.form = { ...prod, imagesStr: prod.images ? prod.images.join(',') : '' };
    this.showForm = true;
    this.editing = true;
    this.clearMessage();
  }

  saveProduct() {
    if (!this.validateForm()) {
      return;
    }

    this.saving = true;
    
    try {
      const prod: Product = {
        id: this.editing && this.form.id ? this.form.id : Date.now(),
        name: this.form.name.trim(),
        description: this.form.description.trim(),
        price: Number(this.form.price),
        image: this.form.image.trim(),
        images: this.form.imagesStr ? this.form.imagesStr.split(',').map((s: string) => s.trim()).filter((s: string) => s) : [],
        longDescription: this.form.longDescription?.trim() || '',
        category: this.form.category.trim(),
        stock: Number(this.form.stock),
        brand: this.form.brand.trim()
      };

      if (this.editing) {
        this.productService.updateProduct(prod);
        this.showMessage('Produit modifié avec succès !', 'success');
      } else {
        this.productService.addProduct(prod);
        this.showMessage('Produit ajouté avec succès !', 'success');
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

  deleteProduct(prod: Product) {
    if (confirm(`Êtes-vous sûr de vouloir supprimer "${prod.name}" ?`)) {
      this.saving = true;
      try {
        this.productService.deleteProduct(prod.id);
        this.showMessage('Produit supprimé avec succès !', 'success');
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
    if (!this.form.description?.trim()) return false;
    if (!this.form.price || this.form.price < 0) return false;
    if (!this.form.stock || this.form.stock < 0) return false;
    if (!this.form.category?.trim()) return false;
    if (!this.form.brand?.trim()) return false;
    if (!this.form.image?.trim()) return false;
    return true;
  }

  isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  areValidUrls(urlsStr: string): boolean {
    if (!urlsStr) return true;
    const urls = urlsStr.split(',').map(s => s.trim()).filter(s => s);
    return urls.every(url => this.isValidUrl(url));
  }

  showMessage(text: string, type: 'success' | 'error') {
    this.message = text;
    this.messageType = type;
    setTimeout(() => this.clearMessage(), 5000);
  }

  clearMessage() {
    this.message = '';
  }

  resetProducts() {
    if (confirm('Êtes-vous sûr de vouloir réinitialiser le cache des produits ? Cela va recharger tous les produits.')) {
      this.saving = true;
      try {
        // Vider le localStorage
        localStorage.removeItem('products');
        // Recharger les produits
        this.refresh();
        this.showMessage('Cache réinitialisé avec succès ! Les nouveaux produits sont maintenant visibles.', 'success');
      } catch (e: any) {
        this.showMessage(`Erreur: ${e.message || 'Une erreur est survenue.'}`, 'error');
      } finally {
        this.saving = false;
      }
    }
  }
} 