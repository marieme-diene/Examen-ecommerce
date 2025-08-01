import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PromotionService } from '../../services/promotion.service';
import { Promotion } from '../../models/promotion.model';

@Component({
  selector: 'app-promotions-management',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatCheckboxModule,
    MatDialogModule
  ],
  template: `
    <div class="promotions-container">
      <div class="header">
        <h1>Gestion des Promotions</h1>
        <button mat-raised-button color="primary" (click)="showAddForm = true">
          <mat-icon>add</mat-icon>
          Nouvelle Promotion
        </button>
      </div>

      <!-- Formulaire d'ajout/édition -->
      <mat-card *ngIf="showAddForm" class="form-card">
        <mat-card-header>
          <mat-card-title>{{ editingPromotion ? 'Modifier' : 'Nouvelle' }} Promotion</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <form [formGroup]="promotionForm" (ngSubmit)="savePromotion()">
            <div class="form-row">
              <mat-form-field appearance="outline">
                <mat-label>Code</mat-label>
                <input matInput formControlName="code" placeholder="Ex: WELCOME10">
                <mat-error *ngIf="promotionForm.get('code')?.hasError('required')">
                  Le code est requis
                </mat-error>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Nom</mat-label>
                <input matInput formControlName="name" placeholder="Nom de la promotion">
                <mat-error *ngIf="promotionForm.get('name')?.hasError('required')">
                  Le nom est requis
                </mat-error>
              </mat-form-field>
            </div>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Description</mat-label>
              <textarea matInput formControlName="description" rows="3" placeholder="Description de la promotion"></textarea>
            </mat-form-field>

            <div class="form-row">
              <mat-form-field appearance="outline">
                <mat-label>Type</mat-label>
                <mat-select formControlName="type">
                  <mat-option value="percentage">Pourcentage</mat-option>
                  <mat-option value="fixed">Montant fixe</mat-option>
                  <mat-option value="free_shipping">Livraison gratuite</mat-option>
                </mat-select>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Valeur</mat-label>
                <input matInput type="number" formControlName="value" placeholder="10">
                <mat-hint *ngIf="promotionForm.get('type')?.value === 'percentage'">%</mat-hint>
                <mat-hint *ngIf="promotionForm.get('type')?.value === 'fixed'">FCFA</mat-hint>
              </mat-form-field>
            </div>

            <div class="form-row">
              <mat-form-field appearance="outline">
                <mat-label>Montant minimum</mat-label>
                <input matInput type="number" formControlName="minAmount" placeholder="5000">
                <mat-hint>FCFA</mat-hint>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Réduction maximale</mat-label>
                <input matInput type="number" formControlName="maxDiscount" placeholder="10000">
                <mat-hint>FCFA</mat-hint>
              </mat-form-field>
            </div>

            <div class="form-row">
              <mat-form-field appearance="outline">
                <mat-label>Date de début</mat-label>
                <input matInput [matDatepicker]="startPicker" formControlName="startDate">
                <mat-datepicker-toggle matSuffix [for]="startPicker"></mat-datepicker-toggle>
                <mat-datepicker #startPicker></mat-datepicker>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Date de fin</mat-label>
                <input matInput [matDatepicker]="endPicker" formControlName="endDate">
                <mat-datepicker-toggle matSuffix [for]="endPicker"></mat-datepicker-toggle>
                <mat-datepicker #endPicker></mat-datepicker>
              </mat-form-field>
            </div>

            <div class="form-row">
              <mat-form-field appearance="outline">
                <mat-label>Limite d'utilisation</mat-label>
                <input matInput type="number" formControlName="usageLimit" placeholder="1000">
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Limite par utilisateur</mat-label>
                <input matInput type="number" formControlName="userUsageLimit" placeholder="1">
              </mat-form-field>
            </div>

            <div class="form-row">
              <mat-form-field appearance="outline">
                <mat-label>Nombre minimum d'articles</mat-label>
                <input matInput type="number" formControlName="minimumItems" placeholder="1">
              </mat-form-field>
            </div>

            <div class="checkbox-group">
              <mat-checkbox formControlName="isActive">Active</mat-checkbox>
              <mat-checkbox formControlName="stackable">Empilable</mat-checkbox>
              <mat-checkbox formControlName="autoApply">Application automatique</mat-checkbox>
              <mat-checkbox formControlName="firstTimeOnly">Première commande seulement</mat-checkbox>
            </div>

            <div class="form-actions">
              <button mat-stroked-button type="button" (click)="cancelEdit()">Annuler</button>
              <button mat-raised-button color="primary" type="submit" [disabled]="promotionForm.invalid">
                {{ editingPromotion ? 'Modifier' : 'Créer' }}
              </button>
            </div>
          </form>
        </mat-card-content>
      </mat-card>

      <!-- Tableau des promotions -->
      <mat-card class="table-card">
        <mat-card-content>
          <table mat-table [dataSource]="promotions" class="promotions-table">
            <!-- Code -->
            <ng-container matColumnDef="code">
              <th mat-header-cell *matHeaderCellDef>Code</th>
              <td mat-cell *matCellDef="let promotion">
                <span class="code-badge">{{ promotion.code }}</span>
              </td>
            </ng-container>

            <!-- Nom -->
            <ng-container matColumnDef="name">
              <th mat-header-cell *matHeaderCellDef>Nom</th>
              <td mat-cell *matCellDef="let promotion">{{ promotion.name }}</td>
            </ng-container>

            <!-- Type -->
            <ng-container matColumnDef="type">
              <th mat-header-cell *matHeaderCellDef>Type</th>
              <td mat-cell *matCellDef="let promotion">
                <span class="type-badge" [class]="promotion.type">
                  {{ getTypeLabel(promotion.type) }}
                </span>
              </td>
            </ng-container>

            <!-- Valeur -->
            <ng-container matColumnDef="value">
              <th mat-header-cell *matHeaderCellDef>Valeur</th>
              <td mat-cell *matCellDef="let promotion">
                <span *ngIf="promotion.type === 'percentage'">{{ promotion.value }}%</span>
                <span *ngIf="promotion.type === 'fixed'">{{ promotion.value | currency:'FCFA':'symbol':'1.0-0':'fr' }}</span>
                <span *ngIf="promotion.type === 'free_shipping'">Gratuit</span>
              </td>
            </ng-container>

            <!-- Utilisations -->
            <ng-container matColumnDef="usage">
              <th mat-header-cell *matHeaderCellDef>Utilisations</th>
              <td mat-cell *matCellDef="let promotion">
                {{ promotion.usageCount }}/{{ promotion.usageLimit || '∞' }}
              </td>
            </ng-container>

            <!-- Statut -->
            <ng-container matColumnDef="status">
              <th mat-header-cell *matHeaderCellDef>Statut</th>
              <td mat-cell *matCellDef="let promotion">
                <span class="status-badge" [class]="getStatusClass(promotion)">
                  {{ getStatusLabel(promotion) }}
                </span>
              </td>
            </ng-container>

            <!-- Actions -->
            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef>Actions</th>
              <td mat-cell *matCellDef="let promotion">
                <button mat-icon-button color="primary" (click)="editPromotion(promotion)">
                  <mat-icon>edit</mat-icon>
                </button>
                <button mat-icon-button color="warn" (click)="deletePromotion(promotion.id)">
                  <mat-icon>delete</mat-icon>
                </button>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
          </table>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .promotions-container {
      padding: 24px;
      max-width: 1200px;
      margin: 0 auto;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
    }

    .header h1 {
      margin: 0;
      color: #333;
    }

    .form-card {
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
    }

    .checkbox-group {
      display: flex;
      gap: 24px;
      margin-bottom: 24px;
      flex-wrap: wrap;
    }

    .form-actions {
      display: flex;
      gap: 12px;
      justify-content: flex-end;
    }

    .table-card {
      margin-top: 24px;
    }

    .promotions-table {
      width: 100%;
    }

    .code-badge {
      background: #2563eb;
      color: white;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: bold;
    }

    .type-badge {
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: 500;
    }

    .type-badge.percentage {
      background: #e3f2fd;
      color: #1976d2;
    }

    .type-badge.fixed {
      background: #e8f5e8;
      color: #2e7d32;
    }

    .type-badge.free_shipping {
      background: #fff3e0;
      color: #f57c00;
    }

    .status-badge {
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: 500;
    }

    .status-badge.active {
      background: #e8f5e8;
      color: #2e7d32;
    }

    .status-badge.inactive {
      background: #ffebee;
      color: #c62828;
    }

    .status-badge.expired {
      background: #f5f5f5;
      color: #666;
    }

    .status-badge.upcoming {
      background: #e3f2fd;
      color: #1976d2;
    }

    @media (max-width: 768px) {
      .promotions-container {
        padding: 16px;
      }

      .header {
        flex-direction: column;
        gap: 16px;
        align-items: stretch;
      }

      .form-row {
        grid-template-columns: 1fr;
      }

      .checkbox-group {
        flex-direction: column;
        gap: 12px;
      }

      .form-actions {
        flex-direction: column;
      }
    }
  `]
})
export class PromotionsManagement implements OnInit {
  promotions: Promotion[] = [];
  displayedColumns = ['code', 'name', 'type', 'value', 'usage', 'status', 'actions'];
  showAddForm = false;
  editingPromotion: Promotion | null = null;
  promotionForm: FormGroup;

  constructor(
    private promotionService: PromotionService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar
  ) {
    this.promotionForm = this.fb.group({
      code: ['', [Validators.required, Validators.pattern(/^[A-Z0-9]+$/)]],
      name: ['', Validators.required],
      description: [''],
      type: ['percentage', Validators.required],
      value: [0, [Validators.required, Validators.min(0)]],
      minAmount: [0, Validators.min(0)],
      maxDiscount: [0, Validators.min(0)],
      startDate: [new Date(), Validators.required],
      endDate: [new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), Validators.required],
      isActive: [true],
      usageLimit: [0, Validators.min(0)],
      userUsageLimit: [0, Validators.min(0)],
      minimumItems: [0, Validators.min(0)],
      stackable: [false],
      autoApply: [false],
      firstTimeOnly: [false]
    });
  }

  ngOnInit() {
    this.loadPromotions();
  }

  loadPromotions() {
    this.promotionService.promotions$.subscribe(promotions => {
      this.promotions = promotions;
    });
  }

  savePromotion() {
    if (this.promotionForm.invalid) return;

    const formValue = this.promotionForm.value;
    const promotion: Promotion = {
      id: this.editingPromotion?.id || Date.now(),
      ...formValue,
      usageCount: this.editingPromotion?.usageCount || 0
    };

    // Ici on ajouterait la logique pour sauvegarder dans le service
    this.snackBar.open(
      `Promotion ${this.editingPromotion ? 'modifiée' : 'créée'} avec succès`,
      'Fermer',
      { duration: 3000 }
    );

    this.cancelEdit();
  }

  editPromotion(promotion: Promotion) {
    this.editingPromotion = promotion;
    this.promotionForm.patchValue(promotion);
    this.showAddForm = true;
  }

  deletePromotion(id: number) {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette promotion ?')) {
      // Ici on ajouterait la logique pour supprimer
      this.snackBar.open('Promotion supprimée', 'Fermer', { duration: 3000 });
    }
  }

  cancelEdit() {
    this.showAddForm = false;
    this.editingPromotion = null;
    this.promotionForm.reset({
      type: 'percentage',
      isActive: true,
      stackable: false,
      autoApply: false,
      firstTimeOnly: false
    });
  }

  getTypeLabel(type: string): string {
    switch (type) {
      case 'percentage': return 'Pourcentage';
      case 'fixed': return 'Montant fixe';
      case 'free_shipping': return 'Livraison gratuite';
      default: return type;
    }
  }

  getStatusLabel(promotion: Promotion): string {
    if (!promotion.isActive) return 'Inactive';
    
    const now = new Date();
    if (now < promotion.startDate) return 'À venir';
    if (now > promotion.endDate) return 'Expirée';
    
    return 'Active';
  }

  getStatusClass(promotion: Promotion): string {
    if (!promotion.isActive) return 'inactive';
    
    const now = new Date();
    if (now < promotion.startDate) return 'upcoming';
    if (now > promotion.endDate) return 'expired';
    
    return 'active';
  }
} 