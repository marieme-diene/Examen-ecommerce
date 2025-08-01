import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { PromotionService } from '../../services/promotion.service';
import { CartItem } from '../../../cart/models/cart-item.model';
import { Promotion, PromotionValidation } from '../../models/promotion.model';

@Component({
  selector: 'app-promo-code-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatCardModule,
    MatProgressSpinnerModule
  ],
  template: `
    <mat-card class="promo-code-card">
      <mat-card-header>
        <mat-card-title>
          <mat-icon>local_offer</mat-icon>
          Code promo
        </mat-card-title>
      </mat-card-header>
      
      <mat-card-content>
        <form (ngSubmit)="validateCode()" class="promo-form">
          <div class="input-group">
            <mat-form-field appearance="outline" class="code-input">
              <mat-label>Code promo</mat-label>
              <input 
                matInput 
                [(ngModel)]="promoCode" 
                name="promoCode"
                placeholder="Ex: WELCOME10"
                [disabled]="isValidating"
                (input)="onCodeInput()">
              <mat-icon matSuffix>redeem</mat-icon>
            </mat-form-field>
            
            <button 
              mat-raised-button 
              color="primary" 
              type="submit"
              [disabled]="!promoCode.trim() || isValidating"
              class="validate-btn">
              <mat-spinner *ngIf="isValidating" diameter="20"></mat-spinner>
              <span *ngIf="!isValidating">Appliquer</span>
            </button>
          </div>
        </form>

        <!-- Messages de validation -->
        <div *ngIf="validationMessage" class="validation-message" [class.success]="isValid" [class.error]="!isValid">
          <mat-icon>{{ isValid ? 'check_circle' : 'error' }}</mat-icon>
          <span>{{ validationMessage }}</span>
        </div>

        <!-- Détails de la promotion -->
        <div *ngIf="currentPromotion && isValid" class="promotion-details">
          <div class="promotion-header">
            <h4>{{ currentPromotion.name }}</h4>
            <span class="promotion-code">{{ currentPromotion.code }}</span>
          </div>
          <p class="promotion-description">{{ currentPromotion.description }}</p>
          
          <div class="promotion-info">
            <div class="info-item">
              <span class="label">Réduction :</span>
              <span class="value discount">
                <span *ngIf="currentPromotion.type === 'percentage'">{{ currentPromotion.value }}%</span>
                <span *ngIf="currentPromotion.type === 'fixed'">{{ currentPromotion.value | currency:'FCFA':'symbol':'1.0-0':'fr' }}</span>
                <span *ngIf="currentPromotion.type === 'free_shipping'">Livraison gratuite</span>
              </span>
            </div>
            
            <div class="info-item" *ngIf="currentPromotion.minAmount">
              <span class="label">Minimum :</span>
              <span class="value">{{ currentPromotion.minAmount | currency:'FCFA':'symbol':'1.0-0':'fr' }}</span>
            </div>
            
            <div class="info-item" *ngIf="currentPromotion.maxDiscount">
              <span class="label">Maximum :</span>
              <span class="value">{{ currentPromotion.maxDiscount | currency:'FCFA':'symbol':'1.0-0':'fr' }}</span>
            </div>
            
            <div class="info-item" *ngIf="currentPromotion.usageLimit">
              <span class="label">Utilisations :</span>
              <span class="value">{{ currentPromotion.usageCount }}/{{ currentPromotion.usageLimit }}</span>
            </div>
          </div>

          <div class="promotion-actions">
            <button 
              mat-stroked-button 
              color="primary"
              (click)="applyPromotion()"
              [disabled]="isApplying">
              <mat-icon>add_shopping_cart</mat-icon>
              {{ isApplying ? 'Application...' : 'Appliquer au panier' }}
            </button>
          </div>
        </div>

        <!-- Promotions disponibles -->
        <div *ngIf="availablePromotions.length > 0" class="available-promotions">
          <h4>Promotions disponibles</h4>
          <div class="promotion-list">
            <div *ngFor="let promotion of availablePromotions" class="promotion-item">
              <div class="promotion-info">
                <div class="promotion-name">{{ promotion.name }}</div>
                <div class="promotion-code">{{ promotion.code }}</div>
                <div class="promotion-desc">{{ promotion.description }}</div>
              </div>
              <button 
                mat-button 
                color="primary"
                (click)="quickApply(promotion)">
                Appliquer
              </button>
            </div>
          </div>
        </div>
      </mat-card-content>
    </mat-card>
  `,
  styles: [`
    .promo-code-card {
      margin-bottom: 16px;
    }

    .promo-form {
      margin-bottom: 16px;
    }

    .input-group {
      display: flex;
      gap: 12px;
      align-items: flex-end;
    }

    .code-input {
      flex: 1;
    }

    .validate-btn {
      min-width: 120px;
      height: 56px;
    }

    .validation-message {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px;
      border-radius: 6px;
      margin-bottom: 16px;
      font-weight: 500;
    }

    .validation-message.success {
      background: #e8f5e8;
      color: #2e7d32;
      border: 1px solid #4caf50;
    }

    .validation-message.error {
      background: #ffebee;
      color: #c62828;
      border: 1px solid #f44336;
    }

    .promotion-details {
      background: #f8f9fa;
      border: 1px solid #e9ecef;
      border-radius: 8px;
      padding: 16px;
      margin-bottom: 16px;
    }

    .promotion-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
    }

    .promotion-header h4 {
      margin: 0;
      color: #333;
      font-weight: 600;
    }

    .promotion-code {
      background: #2563eb;
      color: white;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: bold;
    }

    .promotion-description {
      color: #666;
      margin-bottom: 12px;
      font-size: 14px;
    }

    .promotion-info {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 8px;
      margin-bottom: 16px;
    }

    .info-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px;
      background: white;
      border-radius: 4px;
      border: 1px solid #e9ecef;
    }

    .info-item .label {
      font-size: 12px;
      color: #666;
    }

    .info-item .value {
      font-weight: 500;
      color: #333;
    }

    .info-item .value.discount {
      color: #2563eb;
      font-weight: 600;
    }

    .promotion-actions {
      text-align: center;
    }

    .available-promotions {
      margin-top: 16px;
    }

    .available-promotions h4 {
      margin: 0 0 12px 0;
      color: #333;
      font-size: 16px;
    }

    .promotion-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .promotion-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px;
      background: white;
      border: 1px solid #e9ecef;
      border-radius: 6px;
      transition: all 0.2s;
    }

    .promotion-item:hover {
      border-color: #2563eb;
      box-shadow: 0 2px 4px rgba(37, 99, 235, 0.1);
    }

    .promotion-item .promotion-info {
      flex: 1;
    }

    .promotion-item .promotion-name {
      font-weight: 500;
      color: #333;
      margin-bottom: 4px;
    }

    .promotion-item .promotion-code {
      font-size: 12px;
      color: #2563eb;
      font-weight: bold;
      margin-bottom: 2px;
    }

    .promotion-item .promotion-desc {
      font-size: 12px;
      color: #666;
    }

    @media (max-width: 768px) {
      .input-group {
        flex-direction: column;
        gap: 8px;
      }
      
      .validate-btn {
        width: 100%;
      }
      
      .promotion-info {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class PromoCodeForm implements OnInit {
  @Input() cartItems: CartItem[] = [];
  @Input() userId?: number;
  @Output() promotionApplied = new EventEmitter<Promotion>();

  promoCode = '';
  isValidating = false;
  isApplying = false;
  isValid = false;
  validationMessage = '';
  currentPromotion: Promotion | null = null;
  availablePromotions: Promotion[] = [];

  constructor(private promotionService: PromotionService) {}

  ngOnInit() {
    this.loadAvailablePromotions();
  }

  onCodeInput() {
    // Réinitialiser la validation quand l'utilisateur tape
    this.isValid = false;
    this.validationMessage = '';
    this.currentPromotion = null;
  }

  validateCode() {
    if (!this.promoCode.trim()) return;

    this.isValidating = true;
    this.validationMessage = '';

    this.promotionService.validatePromoCode(this.promoCode, this.cartItems, this.userId)
      .subscribe({
        next: (validation: PromotionValidation) => {
          this.isValidating = false;
          
          if (validation.isValid) {
            this.isValid = true;
            this.validationMessage = `Code valide ! Réduction de ${validation.discountAmount?.toLocaleString()} FCFA`;
            
            // Trouver la promotion correspondante
            this.promotionService.getActivePromotions().subscribe(promotions => {
              this.currentPromotion = promotions.find(p => p.code.toUpperCase() === this.promoCode.toUpperCase()) || null;
            });
          } else {
            this.isValid = false;
            this.validationMessage = validation.error || 'Code promo invalide';
            this.currentPromotion = null;
          }
        },
        error: (error) => {
          this.isValidating = false;
          this.isValid = false;
          this.validationMessage = 'Erreur lors de la validation du code';
          this.currentPromotion = null;
        }
      });
  }

  applyPromotion() {
    if (!this.currentPromotion) return;

    this.isApplying = true;
    
    this.promotionService.applyPromotion(this.currentPromotion, this.cartItems);
    this.promotionApplied.emit(this.currentPromotion);
    
    // Réinitialiser le formulaire
    setTimeout(() => {
      this.promoCode = '';
      this.isValid = false;
      this.validationMessage = '';
      this.currentPromotion = null;
      this.isApplying = false;
    }, 1000);
  }

  quickApply(promotion: Promotion) {
    this.promoCode = promotion.code;
    this.validateCode();
    
    // Appliquer automatiquement après validation
    setTimeout(() => {
      if (this.isValid && this.currentPromotion) {
        this.applyPromotion();
      }
    }, 500);
  }

  private loadAvailablePromotions() {
    this.promotionService.getAvailablePromotions(this.cartItems, this.userId)
      .subscribe(promotions => {
        this.availablePromotions = promotions;
      });
  }
} 