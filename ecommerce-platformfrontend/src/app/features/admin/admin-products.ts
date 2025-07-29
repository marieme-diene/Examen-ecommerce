import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../catalog/services/product.service';
import { Product } from '../catalog/models/product.model';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';

@Component({
  selector: 'app-admin-products',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    MatButtonModule, 
    MatIconModule, 
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatOptionModule
  ],
  template: `
    <div class="admin-products">
      <h2>Gestion des produits</h2>
      
      <!-- Messages de feedback -->
      <div *ngIf="message" class="feedback-message" [class.success]="messageType === 'success'" [class.error]="messageType === 'error'">
        {{ message }}
        <button class="close-btn" (click)="clearMessage()">×</button>
      </div>

      <!-- Formulaire d'ajout/modification -->
      <form *ngIf="showForm" (ngSubmit)="saveProduct()" class="admin-form" #form="ngForm">
        <input type="hidden" [(ngModel)]="productForm.id" name="id">
        
        <div class="admin-form-row">
          <label>Nom *</label>
          <input [(ngModel)]="productForm.name" name="name" required minlength="2" maxlength="100" 
                 [class.invalid]="form.submitted && !productForm.name" 
                 placeholder="Nom du produit">
          <div *ngIf="form.submitted && !productForm.name" class="error-text">Le nom est requis</div>
        </div>
        
        <div class="admin-form-row">
          <label>Description *</label>
          <input [(ngModel)]="productForm.description" name="description" required minlength="5" maxlength="200"
                 [class.invalid]="form.submitted && !productForm.description"
                 placeholder="Description courte">
          <div *ngIf="form.submitted && !productForm.description" class="error-text">La description est requise</div>
          <div *ngIf="form.submitted && productForm.description && productForm.description.length < 5" class="error-text">La description doit contenir au moins 5 caractères</div>
        </div>
        
        <div class="admin-form-row">
          <label>Prix (FCFA) *</label>
          <input type="number" [(ngModel)]="productForm.price" name="price" required min="0" step="0.01"
                 [class.invalid]="form.submitted && (!productForm.price || productForm.price < 0)"
                 placeholder="0.00">
          <div *ngIf="form.submitted && (!productForm.price || productForm.price < 0)" class="error-text">Le prix doit être positif</div>
        </div>
        
        <div class="admin-form-row">
          <label>Stock *</label>
          <input type="number" [(ngModel)]="productForm.stock" name="stock" required min="0"
                 [class.invalid]="form.submitted && (!productForm.stock || productForm.stock < 0)"
                 placeholder="0">
          <div *ngIf="form.submitted && (!productForm.stock || productForm.stock < 0)" class="error-text">Le stock doit être positif</div>
        </div>
        
        <div class="admin-form-row">
          <label>Catégorie *</label>
          <input [(ngModel)]="productForm.category" name="category" required minlength="2"
                 [class.invalid]="form.submitted && !productForm.category"
                 placeholder="Catégorie du produit">
          <div *ngIf="form.submitted && !productForm.category" class="error-text">La catégorie est requise</div>
        </div>
        
        <div class="admin-form-row">
          <label>Marque *</label>
          <input [(ngModel)]="productForm.brand" name="brand" required minlength="2"
                 [class.invalid]="form.submitted && !productForm.brand"
                 placeholder="Marque du produit">
          <div *ngIf="form.submitted && !productForm.brand" class="error-text">La marque est requise</div>
        </div>
        
        <div class="admin-form-row">
          <label>Image principale (URL) *</label>
          <input [(ngModel)]="productForm.image" name="image" required type="url"
                 [class.invalid]="form.submitted && !productForm.image"
                 placeholder="https://example.com/image.jpg">
          <div *ngIf="form.submitted && !productForm.image" class="error-text">L'URL de l'image est requise</div>
          <div *ngIf="form.submitted && productForm.image && !isValidUrl(productForm.image)" class="error-text">URL invalide</div>
        </div>
        
        <div class="admin-form-row">
          <label>Images (URLs séparées par des virgules)</label>
          <input [(ngModel)]="productForm.imagesStr" name="imagesStr" type="text"
                 placeholder="https://example.com/img1.jpg, https://example.com/img2.jpg">
          <div *ngIf="form.submitted && productForm.imagesStr && !areValidUrls(productForm.imagesStr)" class="error-text">Une ou plusieurs URLs sont invalides</div>
        </div>
        
        <div class="admin-form-row" style="flex:1;">
          <label>Description longue</label>
          <textarea [(ngModel)]="productForm.longDescription" name="longDescription" rows="3"
                    placeholder="Description détaillée du produit..."></textarea>
        </div>
        
        <div class="admin-form-actions">
          <button type="submit" class="admin-btn admin-btn-save" [disabled]="saving">
            <span *ngIf="!saving">{{ editingProduct ? 'Modifier' : 'Ajouter' }}</span>
            <span *ngIf="saving">Enregistrement...</span>
          </button>
          <button type="button" class="admin-btn admin-btn-cancel" (click)="cancelEdit()" [disabled]="saving">
            Annuler
          </button>
        </div>
      </form>

      <!-- Liste des produits -->
      <mat-card class="products-list-card">
        <mat-card-header>
          <mat-card-title>Produits existants ({{ products.length }})</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <div class="products-grid">
            <div class="product-item" *ngFor="let product of products">
              <div class="product-image">
                <img [src]="product.image" [alt]="product.name" (error)="onImageError($event)">
              </div>
              <div class="product-info">
                <h3>{{ product.name }}</h3>
                <p class="description">{{ product.description }}</p>
                <div class="product-details">
                  <span class="price">{{ product.price | currency:'FCFA':'symbol':'1.0-0':'fr' }}</span>
                  <span class="stock" [class.low]="product.stock < 5" [class.out]="product.stock === 0">
                    Stock: {{ product.stock }}
                  </span>
                </div>
                <div class="product-meta">
                  <span class="category">{{ product.category }}</span>
                  <span class="brand">{{ product.brand }}</span>
                </div>
              </div>
              <div class="product-actions">
                <button mat-icon-button color="primary" (click)="editProduct(product)" matTooltip="Modifier">
                  <mat-icon>edit</mat-icon>
                </button>
                <button mat-icon-button color="warn" (click)="deleteProduct(product.id)" matTooltip="Supprimer">
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
    .admin-products {
      max-width: 1200px;
      margin: 0 auto;
    }
    
    .admin-products h2 {
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
    
    .product-form-card {
      margin-bottom: 24px;
    }
    
    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      margin-bottom: 16px;
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
    
    .products-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 20px;
    }
    
    .product-item {
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      overflow: hidden;
      transition: box-shadow 0.2s;
    }
    
    .product-item:hover {
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    }
    
    .product-image {
      height: 200px;
      overflow: hidden;
      background: #f9fafb;
    }
    
    .product-image img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    
    .product-info {
      padding: 16px;
    }
    
    .product-info h3 {
      margin: 0 0 8px 0;
      font-size: 1.1rem;
      color: #1f2937;
    }
    
    .description {
      color: #6b7280;
      font-size: 0.9rem;
      margin-bottom: 12px;
      line-height: 1.4;
    }
    
    .product-details {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
    }
    
    .price {
      font-weight: bold;
      color: #2563eb;
      font-size: 1.1rem;
    }
    
    .stock {
      font-size: 0.9rem;
      padding: 4px 8px;
      border-radius: 4px;
      background: #d1fae5;
      color: #065f46;
    }
    
    .stock.low {
      background: #fef3c7;
      color: #92400e;
    }
    
    .stock.out {
      background: #fee2e2;
      color: #991b1b;
    }
    
    .product-meta {
      display: flex;
      gap: 12px;
      font-size: 0.8rem;
      color: #6b7280;
    }
    
    .product-actions {
      display: flex;
      justify-content: flex-end;
      padding: 12px 16px;
      background: #f9fafb;
      border-top: 1px solid #e5e7eb;
    }
    
    @media (max-width: 768px) {
      .form-row {
        grid-template-columns: 1fr;
      }
      
      .products-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class AdminProducts implements OnInit {
  products: Product[] = [];
  categories = ['Électronique', 'Mode', 'Maison', 'Beauté', 'Sport', 'Livres', 'Chaussures femme', 'Serviette', 'Bijoux', 'Table'];
  message = '';
  messageType: 'success' | 'error' = 'success';
  editingProduct: Product | null = null;
  showForm = false; // Control visibility of the form
  saving = false; // Control saving state
  
  productForm: Partial<Product> & { imagesStr?: string } = {
    name: '',
    description: '',
    price: 0,
    category: '',
    brand: '',
    stock: 0,
    image: '',
    longDescription: '',
    imagesStr: '' // New field for multiple images
  };

  constructor(private productService: ProductService) {}

  ngOnInit() {
    this.loadProducts();
  }

  loadProducts() {
    this.productService.getProducts().subscribe(products => {
      this.products = products;
    });
  }

  saveProduct() {
    // Remove form validation for now since we don't have form reference
    this.saving = true;
    if (this.editingProduct) {
      // Modification
      const updatedProduct = { ...this.editingProduct, ...this.productForm };
      this.productService.updateProduct(updatedProduct);
      this.showMessage('Produit modifié avec succès', 'success');
      this.loadProducts();
      this.cancelEdit();
      this.saving = false;
    } else {
      // Ajout
      const newProduct: Product = {
        id: Date.now(), // Temporary ID for new products
        name: this.productForm.name!,
        description: this.productForm.description!,
        price: this.productForm.price!,
        category: this.productForm.category!,
        brand: this.productForm.brand!,
        stock: this.productForm.stock!,
        image: this.productForm.image!,
        longDescription: this.productForm.longDescription,
        images: this.productForm.imagesStr ? this.productForm.imagesStr.split(',').map((url: string) => url.trim()) : [] // Handle multiple images
      };
      this.productService.addProduct(newProduct);
      this.showMessage('Produit ajouté avec succès', 'success');
      this.loadProducts();
      this.cancelEdit();
      this.saving = false;
    }
  }

  editProduct(product: Product) {
    this.editingProduct = product;
    this.productForm = { 
      ...product,
      imagesStr: product.images ? product.images.join(', ') : ''
    };
    this.showForm = true; // Show the form for editing
  }

  deleteProduct(id: number) {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) {
      this.productService.deleteProduct(id);
      this.showMessage('Produit supprimé avec succès', 'success');
      this.loadProducts();
    }
  }

  cancelEdit() {
    this.editingProduct = null;
    this.productForm = {
      name: '',
      description: '',
      price: 0,
      category: '',
      brand: '',
      stock: 0,
      image: '',
      longDescription: '',
      imagesStr: ''
    };
    this.showForm = false; // Hide the form
  }

  showMessage(message: string, type: 'success' | 'error') {
    this.message = message;
    this.messageType = type;
    setTimeout(() => this.clearMessage(), 5000);
  }

  clearMessage() {
    this.message = '';
  }

  onImageError(event: any) {
    event.target.src = 'https://via.placeholder.com/300x200?text=Image+non+disponible';
  }

  // Helper to validate single URL
  isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch (e) {
      return false;
    }
  }

  // Helper to validate multiple URLs
  areValidUrls(urlsStr: string): boolean {
    if (!urlsStr) return true; // No URLs provided, consider valid
    const urls = urlsStr.split(',').map(url => url.trim());
    return urls.every(this.isValidUrl);
  }
} 