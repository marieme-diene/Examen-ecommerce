import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { PaymentService, PaymentRequest } from '../../cart/services/payment.service';

interface PaymentMethod {
  id: string;
  name: string;
  icon: string;
  description: string;
  color: string;
  logo?: string;
  instructions?: string;
  fees?: number;
  processingTime?: string;
}

@Component({
  selector: 'app-payment-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatRadioModule,
    MatProgressSpinnerModule
  ],
  template: `
    <div class="payment-container">
      <div class="payment-header">
        <h1>Paiement sécurisé</h1>
        <p>Choisissez votre méthode de paiement préférée</p>
      </div>

      <div class="payment-content">
        <!-- Résumé de la commande -->
        <mat-card class="order-summary">
          <mat-card-header>
            <mat-card-title>Résumé de votre commande</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="order-details">
              <div class="order-item" *ngFor="let item of orderItems">
                <span class="item-name">{{ item.name }}</span>
                <span class="item-quantity">x{{ item.quantity }}</span>
                <span class="item-price">{{ item.price * item.quantity | currency:'FCFA':'symbol':'1.0-0':'fr' }}</span>
              </div>
              <div class="order-total">
                <strong>Total: {{ totalAmount | currency:'FCFA':'symbol':'1.0-0':'fr' }}</strong>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <!-- Méthodes de paiement -->
        <mat-card class="payment-methods">
          <mat-card-header>
            <mat-card-title>Méthodes de paiement</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="payment-options">
              <div 
                *ngFor="let method of paymentMethods" 
                class="payment-option"
                [class.selected]="selectedMethod === method.id"
                (click)="selectPaymentMethod(method.id)">
                
                <div class="payment-option-header">
                  <div class="payment-logo">
                    <mat-icon [style.color]="method.color">{{ method.icon }}</mat-icon>
                  </div>
                  <div class="payment-info">
                    <h3>{{ method.name }}</h3>
                    <p>{{ method.description }}</p>
                    <div class="payment-details">
                      <span class="processing-time">{{ method.processingTime }}</span>
                      <span class="fees" *ngIf="method.fees">Frais: {{ method.fees | currency:'FCFA':'symbol':'1.0-0':'fr' }}</span>
                    </div>
                  </div>
                  <mat-radio-button [value]="method.id" [(ngModel)]="selectedMethod" name="paymentMethod"></mat-radio-button>
                </div>

                <!-- Instructions spécifiques -->
                <div class="payment-instructions" *ngIf="method.instructions && selectedMethod === method.id">
                  <p>{{ method.instructions }}</p>
                </div>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <!-- Formulaire de paiement -->
        <mat-card class="payment-form" *ngIf="selectedMethod">
          <mat-card-header>
            <mat-card-title>Informations de paiement</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            
            <!-- Carte bancaire -->
            <div *ngIf="selectedMethod === 'card'" class="card-form">
              <div class="card-visual">
                <div class="card-chip"></div>
                <div class="card-number">{{ cardNumber || '•••• •••• •••• ••••' }}</div>
                <div class="card-details">
                  <span class="card-holder">{{ cardHolder || 'NOM PRÉNOM' }}</span>
                  <span class="card-expiry">{{ cardExpiry || 'MM/AA' }}</span>
                </div>
              </div>
              
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Numéro de carte</mat-label>
                <input matInput [(ngModel)]="cardNumber" placeholder="1234 5678 9012 3456" maxlength="19" (input)="formatCardNumber($event)">
              </mat-form-field>
              
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Nom du titulaire</mat-label>
                <input matInput [(ngModel)]="cardHolder" placeholder="NOM PRÉNOM">
              </mat-form-field>
              
              <div class="card-row">
                <mat-form-field appearance="outline">
                  <mat-label>Date d'expiration</mat-label>
                  <input matInput [(ngModel)]="cardExpiry" placeholder="MM/AA" maxlength="5" (input)="formatExpiry($event)">
                </mat-form-field>
                
                <mat-form-field appearance="outline">
                  <mat-label>CVV</mat-label>
                  <input matInput [(ngModel)]="cardCvv" placeholder="123" maxlength="3" type="password">
                </mat-form-field>
              </div>
            </div>

            <!-- Orange Money -->
            <div *ngIf="selectedMethod === 'orange'" class="orange-form">
              <div class="orange-logo">
                <mat-icon style="color: #ff6600; font-size: 48px;">smartphone</mat-icon>
                <h3>Orange Money</h3>
              </div>
              
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Numéro Orange Money</mat-label>
                <input matInput [(ngModel)]="orangeNumber" placeholder="77 123 45 67" (input)="formatPhoneNumber($event)">
              </mat-form-field>
              
              <div class="orange-instructions">
                <mat-icon>info</mat-icon>
                <div>
                  <p><strong>Instructions :</strong></p>
                  <ol>
                    <li>Composez <strong>#144#622#</strong> sur votre téléphone</li>
                    <li>Entrez votre code secret Orange Money</li>
                    <li>Vous recevrez un SMS avec un code de paiement</li>
                    <li>Entrez ce code ci-dessous</li>
                  </ol>
                </div>
              </div>
              
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Code de paiement reçu par SMS</mat-label>
                <input matInput [(ngModel)]="orangeCode" placeholder="123456" maxlength="6">
              </mat-form-field>
            </div>

            <!-- Wave -->
            <div *ngIf="selectedMethod === 'wave'" class="wave-form">
              <div class="wave-logo">
                <mat-icon style="color: #00d4aa; font-size: 48px;">account_balance_wallet</mat-icon>
                <h3>Wave</h3>
              </div>
              
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Numéro Wave</mat-label>
                <input matInput [(ngModel)]="waveNumber" placeholder="77 123 45 67" (input)="formatPhoneNumber($event)">
              </mat-form-field>
              
              <div class="wave-instructions">
                <mat-icon>info</mat-icon>
                <div>
                  <p><strong>Instructions :</strong></p>
                  <ol>
                    <li>Vous recevrez une notification Wave sur votre téléphone</li>
                    <li>Ouvrez l'application Wave</li>
                    <li>Confirmez le paiement dans l'application</li>
                    <li>Le statut sera mis à jour automatiquement</li>
                  </ol>
                </div>
              </div>
            </div>

            <!-- Paiement à la livraison -->
            <div *ngIf="selectedMethod === 'cash'" class="cash-form">
              <div class="cash-logo">
                <mat-icon style="color: #6c757d; font-size: 48px;">local_shipping</mat-icon>
                <h3>Paiement à la livraison</h3>
              </div>
              
              <div class="cash-instructions">
                <mat-icon>info</mat-icon>
                <div>
                  <p><strong>Instructions :</strong></p>
                  <ul>
                    <li>Votre commande sera préparée et expédiée</li>
                    <li>Vous paierez en espèces lors de la livraison</li>
                    <li>Frais de livraison : 500 FCFA</li>
                    <li>Le livreur acceptera les billets et la monnaie</li>
                  </ul>
                </div>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <!-- Bouton de paiement -->
        <div class="payment-actions" *ngIf="selectedMethod">
          <button 
            mat-raised-button 
            color="primary" 
            class="pay-button"
            [disabled]="!isFormValid() || isProcessing"
            (click)="processPayment()">
            
            <mat-spinner *ngIf="isProcessing" diameter="20"></mat-spinner>
            <mat-icon *ngIf="!isProcessing">payment</mat-icon>
            
            <span *ngIf="!isProcessing">
              Payer {{ getTotalWithFees() | currency:'FCFA':'symbol':'1.0-0':'fr' }}
            </span>
            <span *ngIf="isProcessing">Traitement en cours...</span>
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .payment-container {
      max-width: 800px;
      margin: 0 auto;
      padding: 24px;
      background: #f8f9fa;
      min-height: 100vh;
    }

    .payment-header {
      text-align: center;
      margin-bottom: 32px;
    }

    .payment-header h1 {
      color: #2563eb;
      margin-bottom: 8px;
    }

    .payment-header p {
      color: #6c757d;
      font-size: 16px;
    }

    .payment-content {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .order-summary {
      background: white;
    }

    .order-details {
      margin-top: 16px;
    }

    .order-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 0;
      border-bottom: 1px solid #e9ecef;
    }

    .order-total {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 0;
      font-size: 18px;
      border-top: 2px solid #dee2e6;
      margin-top: 16px;
    }

    .payment-methods {
      background: white;
    }

    .payment-options {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .payment-option {
      border: 2px solid #e9ecef;
      border-radius: 12px;
      padding: 20px;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .payment-option:hover {
      border-color: #2563eb;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    }

    .payment-option.selected {
      border-color: #2563eb;
      background: #f0f8ff;
    }

    .payment-option-header {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .payment-logo {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 60px;
      height: 60px;
      background: #f8f9fa;
      border-radius: 12px;
    }

    .payment-info {
      flex: 1;
    }

    .payment-info h3 {
      margin: 0 0 4px 0;
      font-size: 18px;
    }

    .payment-info p {
      margin: 0 0 8px 0;
      color: #6c757d;
    }

    .payment-details {
      display: flex;
      gap: 16px;
      font-size: 14px;
    }

    .processing-time {
      color: #28a745;
    }

    .fees {
      color: #dc3545;
    }

    .payment-instructions {
      margin-top: 16px;
      padding: 16px;
      background: #e3f2fd;
      border-radius: 8px;
      font-size: 14px;
    }

    .payment-form {
      background: white;
    }

    .full-width {
      width: 100%;
    }

    .card-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }

    .card-visual {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 24px;
      border-radius: 12px;
      margin-bottom: 24px;
      font-family: 'Courier New', monospace;
    }

    .card-chip {
      width: 40px;
      height: 30px;
      background: #ffd700;
      border-radius: 4px;
      margin-bottom: 16px;
    }

    .card-number {
      font-size: 20px;
      letter-spacing: 2px;
      margin-bottom: 16px;
    }

    .card-details {
      display: flex;
      justify-content: space-between;
      font-size: 14px;
    }

    .orange-logo, .wave-logo, .cash-logo {
      text-align: center;
      margin-bottom: 24px;
    }

    .orange-instructions, .wave-instructions, .cash-instructions {
      display: flex;
      gap: 12px;
      margin: 24px 0;
      padding: 16px;
      background: #fff3cd;
      border-radius: 8px;
      color: #856404;
    }

    .orange-instructions ol, .wave-instructions ol, .cash-instructions ul {
      margin: 8px 0 0 0;
      padding-left: 20px;
    }

    .orange-instructions li, .wave-instructions li, .cash-instructions li {
      margin-bottom: 4px;
    }

    .payment-actions {
      text-align: center;
    }

    .pay-button {
      padding: 16px 48px;
      font-size: 18px;
      font-weight: 500;
      display: flex;
      align-items: center;
      gap: 12px;
    }

    @media (max-width: 768px) {
      .payment-container {
        padding: 16px;
      }
      
      .card-row {
        grid-template-columns: 1fr;
      }
      
      .payment-option-header {
        flex-direction: column;
        text-align: center;
      }
    }
  `]
})
export class PaymentPageComponent implements OnInit {
  selectedMethod = '';
  isProcessing = false;
  
  // Données de commande
  orderItems: any[] = [];
  totalAmount = 0;
  
  // Champs de paiement
  cardNumber = '';
  cardHolder = '';
  cardExpiry = '';
  cardCvv = '';
  orangeNumber = '';
  orangeCode = '';
  waveNumber = '';

  paymentMethods: PaymentMethod[] = [
    {
      id: 'card',
      name: 'Carte bancaire',
      icon: 'credit_card',
      description: 'Visa, Mastercard, American Express',
      color: '#2563eb',
      processingTime: 'Immédiat',
      fees: 0
    },
    {
      id: 'orange',
      name: 'Orange Money',
      icon: 'smartphone',
      description: 'Paiement mobile sécurisé',
      color: '#ff6600',
      processingTime: '2-5 minutes',
      fees: 0
    },
    {
      id: 'wave',
      name: 'Wave',
      icon: 'account_balance_wallet',
      description: 'Paiement mobile instantané',
      color: '#00d4aa',
      processingTime: '1-3 minutes',
      fees: 0
    },
    {
      id: 'cash',
      name: 'Paiement à la livraison',
      icon: 'local_shipping',
      description: 'Payer en espèces lors de la livraison',
      color: '#6c757d',
      processingTime: 'Lors de la livraison',
      fees: 500
    }
  ];

  constructor(
    private paymentService: PaymentService,
    private snackBar: MatSnackBar,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    // Récupérer les données de commande depuis les paramètres ou le localStorage
    this.loadOrderData();
  }

  loadOrderData() {
    // Simulation de données de commande
    this.orderItems = [
      { name: 'Samsung Galaxy A16', quantity: 1, price: 45000 },
      { name: 'Chaise en bois massif', quantity: 2, price: 22500 }
    ];
    this.totalAmount = this.orderItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  }

  selectPaymentMethod(methodId: string) {
    this.selectedMethod = methodId;
  }

  isFormValid(): boolean {
    switch (this.selectedMethod) {
      case 'card':
        return !!(this.cardNumber && this.cardHolder && this.cardExpiry && this.cardCvv);
      case 'orange':
        return !!(this.orangeNumber && this.orangeCode);
      case 'wave':
        return !!this.waveNumber;
      case 'cash':
        return true;
      default:
        return false;
    }
  }

  getTotalWithFees(): number {
    const method = this.paymentMethods.find(m => m.id === this.selectedMethod);
    return this.totalAmount + (method?.fees || 0);
  }

  formatCardNumber(event: any) {
    let value = event.target.value.replace(/\s/g, '');
    value = value.replace(/\D/g, '');
    value = value.replace(/(\d{4})/g, '$1 ').trim();
    this.cardNumber = value;
  }

  formatExpiry(event: any) {
    let value = event.target.value.replace(/\D/g, '');
    if (value.length >= 2) {
      value = value.substring(0, 2) + '/' + value.substring(2, 4);
    }
    this.cardExpiry = value;
  }

  formatPhoneNumber(event: any) {
    let value = event.target.value.replace(/\D/g, '');
    if (value.length >= 2) {
      value = value.substring(0, 2) + ' ' + value.substring(2, 7) + ' ' + value.substring(7, 9) + ' ' + value.substring(9, 11);
    }
    event.target.value = value;
  }

  async processPayment() {
    if (!this.isFormValid()) {
      this.snackBar.open('Veuillez remplir tous les champs requis', 'Fermer', { duration: 3000 });
      return;
    }

    this.isProcessing = true;

    const paymentRequest: PaymentRequest = {
      method: this.selectedMethod,
      amount: this.getTotalWithFees(),
      currency: 'FCFA',
      orderId: `ORDER_${Date.now()}`,
      customerInfo: {
        name: 'Client Test',
        email: 'client@test.com',
        phone: this.orangeNumber || this.waveNumber
      },
      paymentDetails: {
        cardNumber: this.cardNumber,
        cardExpiry: this.cardExpiry,
        cardCvv: this.cardCvv,
        orangeNumber: this.orangeNumber,
        waveNumber: this.waveNumber
      }
    };

    try {
      const response = await this.paymentService.processPayment(paymentRequest).toPromise();
      
      if (response?.success) {
        this.snackBar.open(response.message, 'Fermer', { duration: 5000 });
        
        // Redirection vers la page de succès
        setTimeout(() => {
          this.router.navigate(['/payment/success'], { 
            queryParams: { 
              transactionId: response.transactionId,
              amount: this.getTotalWithFees()
            }
          });
        }, 2000);
      } else {
        this.snackBar.open('Erreur lors du traitement du paiement', 'Fermer', { duration: 3000 });
      }
    } catch (error: any) {
      this.snackBar.open(error.message || 'Erreur lors du traitement du paiement', 'Fermer', { duration: 3000 });
    } finally {
      this.isProcessing = false;
    }
  }
} 