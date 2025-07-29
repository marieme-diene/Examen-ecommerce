import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatRadioModule } from '@angular/material/radio';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { OrderService, Order } from '../../features/account/services/order.service';
import { AuthService } from '../../features/account/services/auth.service';
import { User, Address } from '../../features/account/models/user.model';
import { CartService } from './services/cart.service';
import { PaymentService, PaymentRequest } from './services/payment.service';

type OrderStatus = 'En attente' | 'Confirmée' | 'En cours de livraison' | 'Livrée' | 'Annulée';

interface PaymentMethod {
  id: string;
  name: string;
  icon: string;
  description: string;
  color: string;
  instructions?: string;
  fees?: number;
  processingTime?: string;
}

@Component({
  selector: 'app-checkout-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatOptionModule,
    MatCardModule,
    MatIconModule,
    MatRadioModule,
    MatCheckboxModule,
    MatProgressSpinnerModule
  ],
  template: `
    <div class="checkout-container">
      <h1>Validation de la commande</h1>
      
      <!-- Résumé de la commande -->
      <div class="order-summary">
        <h3>Résumé de votre commande</h3>
        <div class="cart-items">
          <div class="cart-item" *ngFor="let item of cartService.getItems()">
            <img [src]="item.product.image" [alt]="item.product.name" class="item-image">
            <div class="item-details">
              <h4>{{ item.product.name }}</h4>
              <p>Quantité: {{ item.quantity }}</p>
              <p class="item-price">{{ item.product.price * item.quantity | currency:'FCFA':'symbol':'1.0-0':'fr' }}</p>
            </div>
          </div>
        </div>
        <div class="total-section">
          <h3>Total: {{ cartService.getTotal() | currency:'FCFA':'symbol':'1.0-0':'fr' }}</h3>
        </div>
      </div>

      <form #checkoutForm="ngForm" (ngSubmit)="submit()" *ngIf="!success">
        <!-- Informations de livraison -->
        <div class="form-section">
          <h3>Informations de livraison</h3>
          
          <mat-form-field appearance="outline" *ngIf="addresses.length > 0">
            <mat-label>Adresse de livraison enregistrée</mat-label>
            <mat-select [(ngModel)]="selectedAddressId" name="selectedAddressId" (selectionChange)="onAddressSelect($event.value)">
              <mat-option [value]="null">Saisir une nouvelle adresse</mat-option>
              <mat-option *ngFor="let addr of addresses" [value]="addr.id">
                {{ addr.name }} - {{ addr.street }}, {{ addr.city }}
              </mat-option>
            </mat-select>
          </mat-form-field>
          
          <mat-form-field appearance="outline">
            <mat-label>Nom complet</mat-label>
            <input matInput name="name" [(ngModel)]="name" required>
          </mat-form-field>
          
          <mat-form-field appearance="outline">
            <mat-label>Adresse de livraison</mat-label>
            <input matInput name="address" [(ngModel)]="address" required>
          </mat-form-field>
          
          <mat-form-field appearance="outline">
            <mat-label>Email</mat-label>
            <input matInput name="email" [(ngModel)]="email" required type="email">
          </mat-form-field>
          
          <mat-form-field appearance="outline">
            <mat-label>Téléphone</mat-label>
            <input matInput name="phone" [(ngModel)]="phone" required>
          </mat-form-field>
        </div>

        <!-- Méthodes de paiement -->
        <div class="form-section">
          <h3>Méthode de paiement</h3>
          
          <div class="payment-methods">
            <mat-card 
              *ngFor="let method of paymentMethods" 
              class="payment-method-card"
              [class.selected]="selectedPaymentMethod === method.id"
              (click)="selectPaymentMethod(method.id)">
              <mat-card-content>
                <div class="payment-method-header">
                  <mat-icon [style.color]="method.color">{{ method.icon }}</mat-icon>
                  <div class="payment-method-info">
                    <h4>{{ method.name }}</h4>
                    <p>{{ method.description }}</p>
                  </div>
                  <mat-radio-button [value]="method.id" [(ngModel)]="selectedPaymentMethod" name="paymentMethod"></mat-radio-button>
                </div>
                <div class="payment-instructions" *ngIf="method.instructions && selectedPaymentMethod === method.id">
                  <p>{{ method.instructions }}</p>
                </div>
              </mat-card-content>
            </mat-card>
          </div>

          <!-- Champs spécifiques selon la méthode de paiement -->
          <div class="payment-details" *ngIf="selectedPaymentMethod">
            
            <!-- Carte bancaire -->
            <div *ngIf="selectedPaymentMethod === 'card'" class="card-details">
              <mat-form-field appearance="outline">
                <mat-label>Numéro de carte</mat-label>
                <input matInput name="cardNumber" [(ngModel)]="cardNumber" placeholder="1234 5678 9012 3456" maxlength="19">
              </mat-form-field>
              
              <div class="card-row">
                <mat-form-field appearance="outline">
                  <mat-label>Date d'expiration</mat-label>
                  <input matInput name="cardExpiry" [(ngModel)]="cardExpiry" placeholder="MM/AA" maxlength="5">
                </mat-form-field>
                
                <mat-form-field appearance="outline">
                  <mat-label>CVV</mat-label>
                  <input matInput name="cardCvv" [(ngModel)]="cardCvv" placeholder="123" maxlength="3" type="password">
                </mat-form-field>
              </div>
            </div>

            <!-- Orange Money -->
            <div *ngIf="selectedPaymentMethod === 'orange'" class="orange-money-details">
              <mat-form-field appearance="outline">
                <mat-label>Numéro Orange Money</mat-label>
                <input matInput name="orangeNumber" [(ngModel)]="orangeNumber" placeholder="77 123 45 67">
              </mat-form-field>
              <p class="payment-note">
                <mat-icon>info</mat-icon>
                Vous recevrez un SMS avec un code de paiement. Composez #144#622# sur votre téléphone.
              </p>
            </div>

            <!-- Wave -->
            <div *ngIf="selectedPaymentMethod === 'wave'" class="wave-details">
              <mat-form-field appearance="outline">
                <mat-label>Numéro Wave</mat-label>
                <input matInput name="waveNumber" [(ngModel)]="waveNumber" placeholder="77 123 45 67">
              </mat-form-field>
              <p class="payment-note">
                <mat-icon>info</mat-icon>
                Vous recevrez une notification Wave pour confirmer le paiement.
              </p>
            </div>

            <!-- Paiement à la livraison -->
            <div *ngIf="selectedPaymentMethod === 'cash'" class="cash-details">
              <p class="payment-note">
                <mat-icon>info</mat-icon>
                Vous paierez en espèces lors de la livraison de votre commande.
              </p>
            </div>
          </div>
        </div>

        <!-- Conditions -->
        <div class="form-section">
          <mat-checkbox [(ngModel)]="acceptTerms" name="acceptTerms" required>
            J'accepte les <a href="#" class="terms-link">conditions générales</a> et la 
            <a href="#" class="terms-link">politique de confidentialité</a>
          </mat-checkbox>
        </div>

        <button mat-raised-button color="primary" type="submit" [disabled]="!checkoutForm.form.valid || !acceptTerms" class="submit-btn">
          <mat-icon>payment</mat-icon>
          Payer {{ cartService.getTotal() | currency:'FCFA':'symbol':'1.0-0':'fr' }}
        </button>
      </form>

      <div *ngIf="success" class="success-message">
        <mat-icon class="success-icon">check_circle</mat-icon>
        <h2>Merci pour votre commande !</h2>
        <p>Votre commande a été confirmée et vous recevrez un email de confirmation.</p>
        <p *ngIf="selectedPaymentMethod !== 'cash'">Le paiement sera traité dans les prochaines minutes.</p>
        <button mat-stroked-button color="primary" (click)="goToOrders()">Voir mes commandes</button>
      </div>
    </div>
  `,
  styles: [`
    .checkout-container { 
      max-width: 800px; 
      margin: 48px auto; 
      background: #fff; 
      border-radius: 12px; 
      box-shadow: 0 2px 8px rgba(0,0,0,0.04); 
      padding: 32px 24px; 
    }
    
    .order-summary {
      background: #f8f9fa;
      border-radius: 8px;
      padding: 20px;
      margin-bottom: 24px;
    }
    
    .cart-items {
      margin: 16px 0;
    }
    
    .cart-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 0;
      border-bottom: 1px solid #e9ecef;
    }
    
    .item-image {
      width: 60px;
      height: 60px;
      object-fit: cover;
      border-radius: 8px;
    }
    
    .item-details h4 {
      margin: 0 0 4px 0;
      font-size: 14px;
    }
    
    .item-details p {
      margin: 0;
      font-size: 12px;
      color: #6c757d;
    }
    
    .item-price {
      font-weight: bold;
      color: #2563eb !important;
    }
    
    .total-section {
      text-align: right;
      margin-top: 16px;
      padding-top: 16px;
      border-top: 2px solid #dee2e6;
    }
    
    .form-section {
      margin-bottom: 32px;
    }
    
    .form-section h3 {
      margin-bottom: 16px;
      color: #495057;
    }
    
    form { 
      display: flex; 
      flex-direction: column; 
      gap: 20px; 
    }
    
    .payment-methods {
      display: grid;
      gap: 12px;
      margin-bottom: 20px;
    }
    
    .payment-method-card {
      cursor: pointer;
      transition: all 0.3s ease;
      border: 2px solid transparent;
    }
    
    .payment-method-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    }
    
    .payment-method-card.selected {
      border-color: #2563eb;
      background: #f0f8ff;
    }
    
    .payment-method-header {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    
    .payment-method-info {
      flex: 1;
    }
    
    .payment-method-info h4 {
      margin: 0 0 4px 0;
      font-size: 16px;
    }
    
    .payment-method-info p {
      margin: 0;
      font-size: 14px;
      color: #6c757d;
    }
    
    .payment-instructions {
      margin-top: 12px;
      padding: 12px;
      background: #e3f2fd;
      border-radius: 6px;
      font-size: 14px;
    }
    
    .payment-details {
      margin-top: 20px;
      padding: 20px;
      background: #f8f9fa;
      border-radius: 8px;
    }
    
    .card-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }
    
    .payment-note {
      display: flex;
      align-items: center;
      gap: 8px;
      margin: 12px 0 0 0;
      padding: 12px;
      background: #fff3cd;
      border-radius: 6px;
      font-size: 14px;
      color: #856404;
    }
    
    .terms-link {
      color: #2563eb;
      text-decoration: none;
    }
    
    .terms-link:hover {
      text-decoration: underline;
    }
    
    .submit-btn {
      padding: 16px 32px;
      font-size: 16px;
      font-weight: 500;
    }
    
    .success-message { 
      text-align: center; 
      margin-top: 32px; 
      padding: 40px 20px;
    }
    
    .success-icon {
      font-size: 64px;
      color: #28a745;
      margin-bottom: 16px;
    }
    
    @media (max-width: 768px) {
      .checkout-container {
        margin: 24px 16px;
        padding: 20px 16px;
      }
      
      .card-row {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class CheckoutPage {
  name = '';
  address = '';
  email = '';
  phone = '';
  selectedPaymentMethod = '';
  acceptTerms = false;
  success = false;
  isProcessing = false;
  addresses: Address[] = [];
  selectedAddressId: number | null = null;

  // Champs spécifiques aux méthodes de paiement
  cardNumber = '';
  cardExpiry = '';
  cardCvv = '';
  orangeNumber = '';
  waveNumber = '';

  // Méthodes de paiement disponibles
  paymentMethods: PaymentMethod[] = [
    {
      id: 'card',
      name: 'Carte bancaire',
      icon: 'credit_card',
      description: 'Visa, Mastercard, American Express',
      color: '#2563eb',
      instructions: 'Saisissez les informations de votre carte bancaire'
    },
    {
      id: 'orange',
      name: 'Orange Money',
      icon: 'smartphone',
      description: 'Paiement mobile sécurisé',
      color: '#ff6600',
      instructions: 'Composez #144#622# sur votre téléphone pour obtenir un code de paiement'
    },
    {
      id: 'wave',
      name: 'Wave',
      icon: 'account_balance_wallet',
      description: 'Paiement mobile instantané',
      color: '#00d4aa',
      instructions: 'Vous recevrez une notification Wave pour confirmer le paiement'
    },
    {
      id: 'cash',
      name: 'Paiement à la livraison',
      icon: 'local_shipping',
      description: 'Payer en espèces lors de la livraison',
      color: '#6c757d'
    }
  ];

  constructor(
    private router: Router,
    private orderService: OrderService,
    private auth: AuthService,
    public cartService: CartService,
    private paymentService: PaymentService,
    private snackBar: MatSnackBar
  ) {
    const user = this.auth.getUser();
    if (user) {
      this.addresses = this.auth.getAddressesForUser(user.id);
    }
  }

  selectPaymentMethod(methodId: string) {
    this.selectedPaymentMethod = methodId;
  }

  onAddressSelect(addrId: number) {
    const addr = this.addresses.find(a => a.id === addrId);
    if (addr) {
      this.name = addr.name;
      this.address = `${addr.street}, ${addr.city}, ${addr.postalCode}, ${addr.country}`;
      this.phone = addr.phone;
    }
  }

  submit() {
    const user: User | null = this.auth.getUser();
    if (!user) {
      alert('Vous devez être connecté pour valider une commande.');
      return;
    }
    
    const items = this.cartService.getItems();
    if (items.length === 0) {
      alert('Votre panier est vide.');
      return;
    }
    
    const total = this.cartService.getTotal();
    const selectedAddress = this.addresses.find(a => a.id === this.selectedAddressId) || null;
    
    // Validation spécifique selon la méthode de paiement
    if (!this.validatePaymentMethod()) {
      return;
    }
    
    const orderData = {
      userId: user.id,
      clientEmail: this.email,
      date: new Date(),
      status: 'En attente' as OrderStatus,
      total,
      items: items.map(i => ({ 
        productId: i.product.id, 
        name: i.product.name, 
        price: i.product.price, 
        quantity: i.quantity 
      })),
      address: selectedAddress ? `${selectedAddress.name}, ${selectedAddress.street}, ${selectedAddress.city}, ${selectedAddress.postalCode}, ${selectedAddress.country}, ${selectedAddress.phone}` : this.address,
      payment: this.getPaymentMethodName()
    };
    
    // Simuler le traitement du paiement
    this.processPayment(orderData);
  }

  private validatePaymentMethod(): boolean {
    switch (this.selectedPaymentMethod) {
      case 'card':
        if (!this.cardNumber || !this.cardExpiry || !this.cardCvv) {
          alert('Veuillez remplir tous les champs de la carte bancaire.');
          return false;
        }
        break;
      case 'orange':
        if (!this.orangeNumber) {
          alert('Veuillez saisir votre numéro Orange Money.');
          return false;
        }
        break;
      case 'wave':
        if (!this.waveNumber) {
          alert('Veuillez saisir votre numéro Wave.');
          return false;
        }
        break;
    }
    return true;
  }

  private getPaymentMethodName(): string {
    const method = this.paymentMethods.find(m => m.id === this.selectedPaymentMethod);
    return method ? method.name : 'Non spécifié';
  }

  private processPayment(orderData: any) {
    this.isProcessing = true;
    
    // Simuler le traitement du paiement
    setTimeout(() => {
      this.orderService.createOrder(orderData).subscribe({
        next: (newOrder) => {
          console.log('Commande créée avec succès:', newOrder);
          this.cartService.clearCart();
          this.success = true;
          
          // Rediriger vers la page de succès après 2 secondes
          setTimeout(() => {
            this.router.navigate(['/payment/success'], {
              queryParams: {
                transactionId: `ORDER_${newOrder.id}`,
                amount: newOrder.total,
                orderId: newOrder.id
              }
            });
          }, 2000);
        },
        error: (error) => {
          console.error('Erreur lors de la création de la commande:', error);
          this.snackBar.open('Erreur lors de la création de la commande', 'Fermer', { duration: 3000 });
        },
        complete: () => {
          this.isProcessing = false;
        }
      });
    }, 2000);
  }

  goToOrders() {
    this.router.navigate(['/account']);
  }
} 