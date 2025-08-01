import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatStepperModule } from '@angular/material/stepper';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatRadioModule } from '@angular/material/radio';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Router } from '@angular/router';
import { CartService } from '../../../cart/services/cart.service';
import { OrderService } from '../../services/order.service';
import { PromotionService } from '../../../promotions/services/promotion.service';
import { AuthService } from '../../../account/services/auth.service';
import { NotificationService } from '../../../../shared/services/notification.service';
import { CartItem } from '../../../cart/models/cart-item.model';
import { Order, Address, PaymentMethod } from '../../models/order.model';
import { CartWithPromotion } from '../../../promotions/models/promotion.model';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatStepperModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatSelectModule,
    MatCheckboxModule,
    MatRadioModule,
    MatDividerModule,
    MatProgressSpinnerModule
  ],
  template: `
    <div class="checkout-container">
      <div class="checkout-header">
        <h1>Finaliser votre commande</h1>
        <p>Remplissez les informations pour compléter votre achat</p>
      </div>

      <div class="checkout-content">
        <!-- Stepper -->
        <mat-stepper #stepper class="checkout-stepper">
          
          <!-- Étape 1: Adresse de livraison -->
          <mat-step [stepControl]="shippingForm" label="Adresse de livraison">
            <form [formGroup]="shippingForm">
              <div class="step-content">
                <h3>Adresse de livraison</h3>
                
                <div class="form-row">
                  <mat-form-field appearance="outline">
                    <mat-label>Prénom</mat-label>
                    <input matInput formControlName="firstName" required>
                    <mat-error *ngIf="shippingForm.get('firstName')?.hasError('required')">
                      Le prénom est requis
                    </mat-error>
                  </mat-form-field>

                  <mat-form-field appearance="outline">
                    <mat-label>Nom</mat-label>
                    <input matInput formControlName="lastName" required>
                    <mat-error *ngIf="shippingForm.get('lastName')?.hasError('required')">
                      Le nom est requis
                    </mat-error>
                  </mat-form-field>
                </div>

                <div class="form-row">
                  <mat-form-field appearance="outline">
                    <mat-label>Email</mat-label>
                    <input matInput type="email" formControlName="email" required>
                    <mat-error *ngIf="shippingForm.get('email')?.hasError('required')">
                      L'email est requis
                    </mat-error>
                    <mat-error *ngIf="shippingForm.get('email')?.hasError('email')">
                      Format d'email invalide
                    </mat-error>
                  </mat-form-field>

                  <mat-form-field appearance="outline">
                    <mat-label>Téléphone</mat-label>
                    <input matInput formControlName="phone" required>
                    <mat-error *ngIf="shippingForm.get('phone')?.hasError('required')">
                      Le téléphone est requis
                    </mat-error>
                  </mat-form-field>
                </div>

                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Adresse</mat-label>
                  <input matInput formControlName="street" required>
                  <mat-error *ngIf="shippingForm.get('street')?.hasError('required')">
                    L'adresse est requise
                  </mat-error>
                </mat-form-field>

                <div class="form-row">
                  <mat-form-field appearance="outline">
                    <mat-label>Ville</mat-label>
                    <input matInput formControlName="city" required>
                    <mat-error *ngIf="shippingForm.get('city')?.hasError('required')">
                      La ville est requise
                    </mat-error>
                  </mat-form-field>

                  <mat-form-field appearance="outline">
                    <mat-label>Région/État</mat-label>
                    <input matInput formControlName="state" required>
                    <mat-error *ngIf="shippingForm.get('state')?.hasError('required')">
                      La région est requise
                    </mat-error>
                  </mat-form-field>
                </div>

                <div class="form-row">
                  <mat-form-field appearance="outline">
                    <mat-label>Code postal</mat-label>
                    <input matInput formControlName="postalCode" required>
                    <mat-error *ngIf="shippingForm.get('postalCode')?.hasError('required')">
                      Le code postal est requis
                    </mat-error>
                  </mat-form-field>

                  <mat-form-field appearance="outline">
                    <mat-label>Pays</mat-label>
                    <mat-select formControlName="country" required>
                      <mat-option value="Côte d'Ivoire">Côte d'Ivoire</mat-option>
                      <mat-option value="Sénégal">Sénégal</mat-option>
                      <mat-option value="Mali">Mali</mat-option>
                      <mat-option value="Burkina Faso">Burkina Faso</mat-option>
                      <mat-option value="Niger">Niger</mat-option>
                      <mat-option value="Togo">Togo</mat-option>
                      <mat-option value="Bénin">Bénin</mat-option>
                      <mat-option value="Ghana">Ghana</mat-option>
                      <mat-option value="Guinée">Guinée</mat-option>
                      <mat-option value="Cameroun">Cameroun</mat-option>
                    </mat-select>
                    <mat-error *ngIf="shippingForm.get('country')?.hasError('required')">
                      Le pays est requis
                    </mat-error>
                  </mat-form-field>
                </div>

                <div class="step-actions">
                  <button mat-button matStepperNext [disabled]="shippingForm.invalid">
                    Suivant
                  </button>
                </div>
              </div>
            </form>
          </mat-step>

          <!-- Étape 2: Méthode de paiement -->
          <mat-step [stepControl]="paymentForm" label="Paiement">
            <form [formGroup]="paymentForm">
              <div class="step-content">
                <h3>Méthode de paiement</h3>
                
                <div class="payment-methods">
                  <mat-radio-group formControlName="paymentType" class="payment-options">
                    <mat-radio-button value="orange_money" class="payment-option">
                      <div class="payment-option-content">
                        <mat-icon>smartphone</mat-icon>
                        <div>
                          <h4>Orange Money</h4>
                          <p>Paiement via Orange Money</p>
                        </div>
                      </div>
                    </mat-radio-button>

                    <mat-radio-button value="wave" class="payment-option">
                      <div class="payment-option-content">
                        <mat-icon>smartphone</mat-icon>
                        <div>
                          <h4>Wave</h4>
                          <p>Paiement via Wave</p>
                        </div>
                      </div>
                    </mat-radio-button>

                    <mat-radio-button value="card" class="payment-option">
                      <div class="payment-option-content">
                        <mat-icon>credit_card</mat-icon>
                        <div>
                          <h4>Carte bancaire</h4>
                          <p>Visa, Mastercard, American Express</p>
                        </div>
                      </div>
                    </mat-radio-button>
                  </mat-radio-group>
                </div>

                <!-- Détails de paiement selon le type -->
                <div *ngIf="paymentForm.get('paymentType')?.value === 'orange_money'" class="payment-details">
                  <mat-form-field appearance="outline">
                    <mat-label>Numéro Orange Money</mat-label>
                    <input matInput formControlName="mobileNumber" placeholder="Ex: +2250701234567">
                    <mat-error *ngIf="paymentForm.get('mobileNumber')?.hasError('required')">
                      Le numéro Orange Money est requis
                    </mat-error>
                  </mat-form-field>
                </div>

                <div *ngIf="paymentForm.get('paymentType')?.value === 'wave'" class="payment-details">
                  <mat-form-field appearance="outline">
                    <mat-label>Numéro Wave</mat-label>
                    <input matInput formControlName="mobileNumber" placeholder="Ex: +2250701234567">
                    <mat-error *ngIf="paymentForm.get('mobileNumber')?.hasError('required')">
                      Le numéro Wave est requis
                    </mat-error>
                  </mat-form-field>
                </div>

                <div *ngIf="paymentForm.get('paymentType')?.value === 'card'" class="payment-details">
                  <mat-form-field appearance="outline">
                    <mat-label>Numéro de carte</mat-label>
                    <input matInput formControlName="cardNumber" placeholder="1234 5678 9012 3456">
                  </mat-form-field>

                  <div class="form-row">
                    <mat-form-field appearance="outline">
                      <mat-label>Date d'expiration</mat-label>
                      <input matInput formControlName="expiryDate" placeholder="MM/AA">
                    </mat-form-field>

                    <mat-form-field appearance="outline">
                      <mat-label>CVV</mat-label>
                      <input matInput formControlName="cvv" placeholder="123">
                    </mat-form-field>
                  </div>
                </div>

                <div class="step-actions">
                  <button mat-button matStepperPrevious>Précédent</button>
                  <button mat-button matStepperNext [disabled]="paymentForm.invalid">
                    Suivant
                  </button>
                </div>
              </div>
            </form>
          </mat-step>

          <!-- Étape 3: Récapitulatif -->
          <mat-step label="Récapitulatif">
            <div class="step-content">
              <h3>Récapitulatif de votre commande</h3>
              
              <!-- Résumé de la commande -->
              <div class="order-summary" *ngIf="cartWithPromotions">
                <h4>Articles commandés</h4>
                <div class="order-items">
                  <div *ngFor="let item of cartWithPromotions.items" class="order-item">
                    <img [src]="item.product.image" [alt]="item.product.name" class="item-image">
                    <div class="item-details">
                      <h5>{{ item.product.name }}</h5>
                      <p>Quantité: {{ item.quantity }}</p>
                      <p class="item-price">{{ item.product.price * item.quantity | currency:'FCFA':'symbol':'1.0-0':'fr' }}</p>
                    </div>
                  </div>
                </div>

                <mat-divider></mat-divider>

                <!-- Adresse de livraison -->
                <div class="summary-section">
                  <h4>Adresse de livraison</h4>
                  <div class="address-summary">
                    <p>{{ shippingForm.value.firstName }} {{ shippingForm.value.lastName }}</p>
                    <p>{{ shippingForm.value.street }}</p>
                    <p>{{ shippingForm.value.city }}, {{ shippingForm.value.state }} {{ shippingForm.value.postalCode }}</p>
                    <p>{{ shippingForm.value.country }}</p>
                    <p>Tél: {{ shippingForm.value.phone }}</p>
                  </div>
                </div>

                <mat-divider></mat-divider>

                <!-- Méthode de paiement -->
                <div class="summary-section">
                  <h4>Méthode de paiement</h4>
                  <p>{{ getPaymentMethodLabel(paymentForm.value.paymentType) }}</p>
                </div>

                <mat-divider></mat-divider>

                <!-- Calculs -->
                <div class="price-breakdown">
                  <div class="price-row">
                    <span>Sous-total:</span>
                    <span>{{ cartWithPromotions.subtotal | currency:'FCFA':'symbol':'1.0-0':'fr' }}</span>
                  </div>
                  
                  <div class="price-row discount" *ngIf="cartWithPromotions.discountAmount > 0">
                    <span>Réduction:</span>
                    <span>-{{ cartWithPromotions.discountAmount | currency:'FCFA':'symbol':'1.0-0':'fr' }}</span>
                  </div>
                  
                  <div class="price-row">
                    <span>Livraison:</span>
                    <span>{{ getShippingCost() }}</span>
                  </div>
                  
                  <div class="price-row">
                    <span>TVA (18%):</span>
                    <span>{{ (cartWithPromotions.subtotal - cartWithPromotions.discountAmount) * 0.18 | currency:'FCFA':'symbol':'1.0-0':'fr' }}</span>
                  </div>
                  
                  <div class="price-row total">
                    <span>Total:</span>
                    <span>{{ getTotalAmount() | currency:'FCFA':'symbol':'1.0-0':'fr' }}</span>
                  </div>
                </div>
              </div>

              <div class="step-actions">
                <button mat-button matStepperPrevious>Précédent</button>
                <button 
                  mat-raised-button 
                  color="primary" 
                  (click)="placeOrder()"
                  [disabled]="isPlacingOrder">
                  <mat-spinner *ngIf="isPlacingOrder" diameter="20"></mat-spinner>
                  <span *ngIf="!isPlacingOrder">Confirmer la commande</span>
                </button>
              </div>
            </div>
          </mat-step>
        </mat-stepper>
      </div>
    </div>
  `,
  styles: [`
    .checkout-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 24px;
    }

    .checkout-header {
      text-align: center;
      margin-bottom: 32px;
    }

    .checkout-header h1 {
      margin: 0 0 8px 0;
      color: #333;
    }

    .checkout-header p {
      color: #666;
      margin: 0;
    }

    .checkout-content {
      display: grid;
      grid-template-columns: 1fr 400px;
      gap: 32px;
    }

    .checkout-stepper {
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      padding: 24px;
    }

    .step-content {
      padding: 24px 0;
    }

    .step-content h3 {
      margin: 0 0 24px 0;
      color: #333;
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

    .payment-methods {
      margin-bottom: 24px;
    }

    .payment-options {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .payment-option {
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      padding: 16px;
      transition: all 0.2s;
    }

    .payment-option:hover {
      border-color: #2196f3;
      background: #f5f5f5;
    }

    .payment-option-content {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .payment-option-content mat-icon {
      font-size: 32px;
      width: 32px;
      height: 32px;
      color: #2196f3;
    }

    .payment-option-content h4 {
      margin: 0 0 4px 0;
      color: #333;
    }

    .payment-option-content p {
      margin: 0;
      color: #666;
      font-size: 14px;
    }

    .payment-details {
      background: #f8f9fa;
      border-radius: 8px;
      padding: 16px;
      margin-bottom: 24px;
    }

    .step-actions {
      display: flex;
      justify-content: space-between;
      margin-top: 24px;
    }

    .order-summary {
      background: #f8f9fa;
      border-radius: 8px;
      padding: 24px;
    }

    .order-summary h4 {
      margin: 0 0 16px 0;
      color: #333;
    }

    .order-items {
      margin-bottom: 24px;
    }

    .order-item {
      display: flex;
      gap: 16px;
      padding: 12px 0;
      border-bottom: 1px solid #e0e0e0;
    }

    .order-item:last-child {
      border-bottom: none;
    }

    .item-image {
      width: 60px;
      height: 60px;
      object-fit: cover;
      border-radius: 4px;
    }

    .item-details h5 {
      margin: 0 0 4px 0;
      color: #333;
    }

    .item-details p {
      margin: 0 0 4px 0;
      color: #666;
      font-size: 14px;
    }

    .item-price {
      font-weight: 500;
      color: #333 !important;
    }

    .summary-section {
      margin: 24px 0;
    }

    .summary-section h4 {
      margin: 0 0 12px 0;
      color: #333;
    }

    .address-summary p {
      margin: 0 0 4px 0;
      color: #666;
    }

    .price-breakdown {
      margin-top: 24px;
    }

    .price-row {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      font-size: 16px;
    }

    .price-row.discount {
      color: #4caf50;
    }

    .price-row.total {
      font-weight: bold;
      font-size: 18px;
      border-top: 2px solid #e0e0e0;
      margin-top: 8px;
      padding-top: 16px;
    }

    @media (max-width: 768px) {
      .checkout-content {
        grid-template-columns: 1fr;
      }

      .form-row {
        grid-template-columns: 1fr;
      }

      .step-actions {
        flex-direction: column;
        gap: 12px;
      }
    }
  `]
})
export class Checkout implements OnInit {
  shippingForm: FormGroup;
  paymentForm: FormGroup;
  cartWithPromotions: CartWithPromotion | null = null;
  isPlacingOrder = false;

  constructor(
    private fb: FormBuilder,
    private cartService: CartService,
    private orderService: OrderService,
    private promotionService: PromotionService,
    private authService: AuthService,
    private notificationService: NotificationService,
    private router: Router
  ) {
    this.shippingForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      street: ['', Validators.required],
      city: ['', Validators.required],
      state: ['', Validators.required],
      postalCode: ['', Validators.required],
      country: ['Côte d\'Ivoire', Validators.required]
    });

    this.paymentForm = this.fb.group({
      paymentType: ['orange_money', Validators.required],
      mobileNumber: [''],
      cardNumber: [''],
      expiryDate: [''],
      cvv: ['']
    });
  }

  ngOnInit() {
    this.loadCartWithPromotions();
    this.preFillUserData();
  }

  private loadCartWithPromotions() {
    const cartItems = this.cartService.getItems();
    this.promotionService.calculateCartWithPromotions(cartItems).subscribe(cart => {
      this.cartWithPromotions = cart;
    });
  }

  private preFillUserData() {
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      this.shippingForm.patchValue({
        firstName: currentUser.firstName || '',
        lastName: currentUser.lastName || '',
        email: currentUser.email || ''
      });
    }
  }

  placeOrder() {
    if (!this.cartWithPromotions || this.shippingForm.invalid || this.paymentForm.invalid) {
      return;
    }

    this.isPlacingOrder = true;

    const orderRequest = {
      items: this.cartWithPromotions.items,
      shippingAddress: this.shippingForm.value,
      billingAddress: this.shippingForm.value, // Même adresse pour simplifier
      paymentMethod: this.buildPaymentMethod(),
      appliedPromotions: this.cartWithPromotions.appliedPromotions,
      notes: ''
    };

    this.orderService.createOrder(orderRequest).subscribe({
      next: (order: Order) => {
        this.isPlacingOrder = false;
        
        // Vider le panier
        this.cartService.clearCart();
        this.promotionService.clearAppliedPromotions();
        
        // Rediriger vers la page de succès
        this.router.navigate(['/orders/success', { orderId: order.id }]);
      },
      error: (error) => {
        this.isPlacingOrder = false;
        this.notificationService.addNotification({
          type: 'error',
          title: 'Erreur lors de la commande',
          message: 'Une erreur est survenue lors de la création de votre commande',
          category: 'order'
        });
      }
    });
  }

  private buildPaymentMethod(): PaymentMethod {
    const paymentType = this.paymentForm.value.paymentType;
    
    switch (paymentType) {
      case 'orange_money':
        return {
          type: 'orange_money',
          details: {
            mobileNumber: this.paymentForm.value.mobileNumber,
            provider: 'orange'
          }
        };
      
      case 'wave':
        return {
          type: 'wave',
          details: {
            mobileNumber: this.paymentForm.value.mobileNumber,
            provider: 'wave'
          }
        };
      
      case 'card':
        return {
          type: 'card',
          details: {
            cardNumber: this.paymentForm.value.cardNumber,
            expiryDate: this.paymentForm.value.expiryDate,
            cardType: 'visa' // À déterminer selon le numéro
          }
        };
      
      default:
        return { type: 'orange_money' };
    }
  }

  getPaymentMethodLabel(type: string): string {
    const labels: Record<string, string> = {
      orange_money: 'Orange Money',
      wave: 'Wave',
      card: 'Carte bancaire'
    };
    return labels[type] || type;
  }

  getShippingCost(): string {
    if (!this.cartWithPromotions) return '2 000 FCFA';
    return this.cartWithPromotions.appliedPromotions.some(p => p.type === 'free_shipping') ? 'Gratuit' : '2 000 FCFA';
  }

  getTotalAmount(): number {
    if (!this.cartWithPromotions) return 0;
    const taxAmount = (this.cartWithPromotions.subtotal - this.cartWithPromotions.discountAmount) * 0.18;
    const shippingCost = this.cartWithPromotions.appliedPromotions.some(p => p.type === 'free_shipping') ? 0 : 2000;
    return this.cartWithPromotions.finalAmount + taxAmount + shippingCost;
  }
} 