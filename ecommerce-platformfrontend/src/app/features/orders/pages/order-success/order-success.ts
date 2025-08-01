import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { OrderService } from '../../services/order.service';
import { Order } from '../../models/order.model';

@Component({
  selector: 'app-order-success',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatDividerModule
  ],
  template: `
    <div class="success-container">
      <div class="success-content">
        <!-- Icône de succès -->
        <div class="success-icon">
          <mat-icon>check_circle</mat-icon>
        </div>

        <!-- Message de succès -->
        <div class="success-message">
          <h1>Commande confirmée !</h1>
          <p>Votre commande a été créée avec succès. Nous vous remercions pour votre confiance.</p>
        </div>

        <!-- Détails de la commande -->
        <mat-card class="order-details" *ngIf="order">
          <mat-card-header>
            <mat-card-title>Détails de votre commande</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="order-info">
              <div class="info-row">
                <span class="label">Numéro de commande :</span>
                <span class="value order-number">{{ order.orderNumber }}</span>
              </div>
              
              <div class="info-row">
                <span class="label">Date de commande :</span>
                <span class="value">{{ order.createdAt | date:'dd/MM/yyyy à HH:mm' }}</span>
              </div>
              
              <div class="info-row">
                <span class="label">Statut :</span>
                <span class="value status" [style.color]="getStatusColor(order.status)">
                  {{ getStatusLabel(order.status) }}
                </span>
              </div>
              
              <div class="info-row">
                <span class="label">Total :</span>
                <span class="value total">{{ order.totalAmount | currency:'FCFA':'symbol':'1.0-0':'fr' }}</span>
              </div>
            </div>

            <mat-divider></mat-divider>

            <!-- Articles commandés -->
            <div class="order-items">
              <h4>Articles commandés</h4>
              <div class="items-list">
                <div *ngFor="let item of order.items" class="item">
                  <img [src]="item.productImage" [alt]="item.productName" class="item-image">
                  <div class="item-info">
                    <h5>{{ item.productName }}</h5>
                    <p>Quantité: {{ item.quantity }}</p>
                    <p class="item-price">{{ item.subtotal | currency:'FCFA':'symbol':'1.0-0':'fr' }}</p>
                  </div>
                </div>
              </div>
            </div>

            <mat-divider></mat-divider>

            <!-- Adresse de livraison -->
            <div class="delivery-info">
              <h4>Adresse de livraison</h4>
              <div class="address">
                <p>{{ order.shippingAddress.firstName }} {{ order.shippingAddress.lastName }}</p>
                <p>{{ order.shippingAddress.street }}</p>
                <p>{{ order.shippingAddress.city }}, {{ order.shippingAddress.state }} {{ order.shippingAddress.postalCode }}</p>
                <p>{{ order.shippingAddress.country }}</p>
                <p>Tél: {{ order.shippingAddress.phone }}</p>
              </div>
            </div>

            <mat-divider></mat-divider>

            <!-- Méthode de paiement -->
            <div class="payment-info">
              <h4>Méthode de paiement</h4>
              <p>{{ getPaymentMethodLabel(order.paymentMethod.type) }}</p>
              <p *ngIf="order.paymentMethod.details?.mobileNumber">
                Numéro: {{ order.paymentMethod.details?.mobileNumber }}
              </p>
            </div>

            <!-- Prochaines étapes -->
            <div class="next-steps">
              <h4>Prochaines étapes</h4>
              <div class="steps">
                <div class="step">
                  <div class="step-number">1</div>
                  <div class="step-content">
                    <h5>Confirmation</h5>
                    <p>Vous recevrez un email de confirmation dans les prochaines minutes</p>
                  </div>
                </div>
                
                <div class="step">
                  <div class="step-number">2</div>
                  <div class="step-content">
                    <h5>Traitement</h5>
                    <p>Votre commande sera traitée et préparée pour l'expédition</p>
                  </div>
                </div>
                
                <div class="step">
                  <div class="step-number">3</div>
                  <div class="step-content">
                    <h5>Livraison</h5>
                    <p>Livraison estimée le {{ order.estimatedDelivery | date:'dd/MM/yyyy' }}</p>
                  </div>
                </div>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <!-- Actions -->
        <div class="success-actions">
          <button mat-stroked-button (click)="goToOrders()">
            <mat-icon>receipt</mat-icon>
            Voir mes commandes
          </button>
          
          <button mat-raised-button color="primary" (click)="goToCatalog()">
            <mat-icon>shopping_cart</mat-icon>
            Continuer les achats
          </button>
        </div>

        <!-- Support -->
        <div class="support-info">
          <p>Des questions ? Contactez notre service client :</p>
          <div class="contact-info">
            <div class="contact-item">
              <mat-icon>phone</mat-icon>
              <span>+225 27 22 49 28 90</span>
            </div>
            <div class="contact-item">
              <mat-icon>email</mat-icon>
              <span>support&#64;afrimarket.com</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .success-container {
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 40px 20px;
    }

    .success-content {
      max-width: 800px;
      margin: 0 auto;
      text-align: center;
    }

    .success-icon {
      margin-bottom: 24px;
    }

    .success-icon mat-icon {
      font-size: 80px;
      width: 80px;
      height: 80px;
      color: #4caf50;
    }

    .success-message {
      margin-bottom: 32px;
    }

    .success-message h1 {
      color: white;
      margin: 0 0 16px 0;
      font-size: 2.5rem;
    }

    .success-message p {
      color: rgba(255, 255, 255, 0.9);
      font-size: 1.1rem;
      margin: 0;
    }

    .order-details {
      margin-bottom: 32px;
      text-align: left;
    }

    .order-info {
      margin-bottom: 24px;
    }

    .info-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 0;
      border-bottom: 1px solid #f0f0f0;
    }

    .info-row:last-child {
      border-bottom: none;
    }

    .info-row .label {
      font-weight: 500;
      color: #666;
    }

    .info-row .value {
      font-weight: 600;
      color: #333;
    }

    .info-row .order-number {
      color: #2196f3;
      font-size: 1.1rem;
    }

    .info-row .total {
      color: #f0060b;
      font-size: 1.2rem;
    }

    .order-items {
      margin: 24px 0;
    }

    .order-items h4 {
      margin: 0 0 16px 0;
      color: #333;
    }

    .items-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .item {
      display: flex;
      gap: 12px;
      padding: 12px;
      background: #f8f9fa;
      border-radius: 8px;
    }

    .item-image {
      width: 60px;
      height: 60px;
      object-fit: cover;
      border-radius: 4px;
    }

    .item-info h5 {
      margin: 0 0 4px 0;
      color: #333;
    }

    .item-info p {
      margin: 0 0 4px 0;
      color: #666;
      font-size: 14px;
    }

    .item-price {
      font-weight: 500;
      color: #333 !important;
    }

    .delivery-info,
    .payment-info {
      margin: 24px 0;
    }

    .delivery-info h4,
    .payment-info h4 {
      margin: 0 0 12px 0;
      color: #333;
    }

    .address p {
      margin: 0 0 4px 0;
      color: #666;
    }

    .next-steps {
      margin: 24px 0;
    }

    .next-steps h4 {
      margin: 0 0 16px 0;
      color: #333;
    }

    .steps {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .step {
      display: flex;
      align-items: flex-start;
      gap: 16px;
    }

    .step-number {
      width: 32px;
      height: 32px;
      background: #2196f3;
      color: white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      flex-shrink: 0;
    }

    .step-content h5 {
      margin: 0 0 4px 0;
      color: #333;
    }

    .step-content p {
      margin: 0;
      color: #666;
      font-size: 14px;
    }

    .success-actions {
      display: flex;
      gap: 16px;
      justify-content: center;
      margin-bottom: 32px;
    }

    .support-info {
      background: rgba(255, 255, 255, 0.1);
      border-radius: 8px;
      padding: 24px;
      color: white;
    }

    .support-info p {
      margin: 0 0 16px 0;
      font-size: 1.1rem;
    }

    .contact-info {
      display: flex;
      justify-content: center;
      gap: 32px;
      flex-wrap: wrap;
    }

    .contact-item {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .contact-item mat-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
    }

    @media (max-width: 768px) {
      .success-message h1 {
        font-size: 2rem;
      }

      .success-actions {
        flex-direction: column;
        align-items: center;
      }

      .contact-info {
        flex-direction: column;
        gap: 16px;
      }

      .info-row {
        flex-direction: column;
        align-items: flex-start;
        gap: 4px;
      }
    }
  `]
})
export class OrderSuccess implements OnInit {
  order: Order | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private orderService: OrderService
  ) {}

  ngOnInit() {
    const orderId = this.route.snapshot.paramMap.get('orderId');
    if (orderId) {
      this.orderService.getOrderById(orderId).subscribe(order => {
        this.order = order;
      });
    }
  }

  getStatusLabel(status: string): string {
    return this.orderService.getStatusLabel(status as any);
  }

  getStatusColor(status: string): string {
    return this.orderService.getStatusColor(status as any);
  }

  getPaymentMethodLabel(type: string): string {
    const labels: Record<string, string> = {
      orange_money: 'Orange Money',
      wave: 'Wave',
      card: 'Carte bancaire'
    };
    return labels[type] || type;
  }

  goToOrders() {
    this.router.navigate(['/account/orders']);
  }

  goToCatalog() {
    this.router.navigate(['/catalog']);
  }
} 