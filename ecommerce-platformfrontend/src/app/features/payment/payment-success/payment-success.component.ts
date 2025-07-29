import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-payment-success',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule
  ],
  template: `
    <div class="success-container">
      <div class="success-content">
        <div class="success-icon">
          <mat-icon>check_circle</mat-icon>
        </div>
        
        <h1>Paiement réussi !</h1>
        <p class="success-message">Votre commande a été confirmée et le paiement a été traité avec succès.</p>
        
        <mat-card class="transaction-details">
          <mat-card-header>
            <mat-card-title>Détails de la transaction</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="detail-row">
              <span class="detail-label">Numéro de transaction :</span>
              <span class="detail-value">{{ transactionId }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Montant payé :</span>
              <span class="detail-value">{{ amount | currency:'FCFA':'symbol':'1.0-0':'fr' }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Date :</span>
              <span class="detail-value">{{ currentDate | date:'dd/MM/yyyy à HH:mm' }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Statut :</span>
              <span class="detail-value status-success">Confirmé</span>
            </div>
          </mat-card-content>
        </mat-card>

        <div class="next-steps">
          <h3>Prochaines étapes</h3>
          <div class="steps-list">
            <div class="step">
              <div class="step-icon">
                <mat-icon>email</mat-icon>
              </div>
              <div class="step-content">
                <h4>Email de confirmation</h4>
                <p>Vous recevrez un email de confirmation avec tous les détails de votre commande.</p>
              </div>
            </div>
            
            <div class="step">
              <div class="step-icon">
                <mat-icon>local_shipping</mat-icon>
              </div>
              <div class="step-content">
                <h4>Préparation et expédition</h4>
                <p>Votre commande sera préparée et expédiée dans les 24-48 heures.</p>
              </div>
            </div>
            
            <div class="step">
              <div class="step-icon">
                <mat-icon>track_changes</mat-icon>
              </div>
              <div class="step-content">
                <h4>Suivi de commande</h4>
                <p>Vous recevrez un numéro de suivi pour suivre votre colis en temps réel.</p>
              </div>
            </div>
          </div>
        </div>

        <div class="action-buttons">
          <button mat-stroked-button color="primary" (click)="goToOrders()">
            <mat-icon>receipt</mat-icon>
            Voir mes commandes
          </button>
          <button mat-raised-button color="primary" (click)="goToHome()">
            <mat-icon>home</mat-icon>
            Retour à l'accueil
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .success-container {
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px;
    }

    .success-content {
      background: white;
      border-radius: 16px;
      padding: 48px;
      max-width: 600px;
      width: 100%;
      text-align: center;
      box-shadow: 0 20px 40px rgba(0,0,0,0.1);
    }

    .success-icon {
      margin-bottom: 24px;
    }

    .success-icon mat-icon {
      font-size: 80px;
      color: #28a745;
      width: 80px;
      height: 80px;
    }

    h1 {
      color: #28a745;
      margin-bottom: 16px;
      font-size: 32px;
      font-weight: 600;
    }

    .success-message {
      color: #6c757d;
      font-size: 18px;
      margin-bottom: 32px;
      line-height: 1.6;
    }

    .transaction-details {
      margin-bottom: 32px;
      text-align: left;
    }

    .detail-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 0;
      border-bottom: 1px solid #e9ecef;
    }

    .detail-row:last-child {
      border-bottom: none;
    }

    .detail-label {
      font-weight: 500;
      color: #495057;
    }

    .detail-value {
      font-weight: 600;
      color: #2563eb;
    }

    .status-success {
      color: #28a745 !important;
    }

    .next-steps {
      margin-bottom: 32px;
      text-align: left;
    }

    .next-steps h3 {
      color: #495057;
      margin-bottom: 24px;
      text-align: center;
    }

    .steps-list {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .step {
      display: flex;
      align-items: flex-start;
      gap: 16px;
      padding: 16px;
      background: #f8f9fa;
      border-radius: 12px;
      border-left: 4px solid #2563eb;
    }

    .step-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 48px;
      height: 48px;
      background: #2563eb;
      color: white;
      border-radius: 50%;
      flex-shrink: 0;
    }

    .step-content h4 {
      margin: 0 0 8px 0;
      color: #495057;
      font-size: 16px;
    }

    .step-content p {
      margin: 0;
      color: #6c757d;
      font-size: 14px;
      line-height: 1.5;
    }

    .action-buttons {
      display: flex;
      gap: 16px;
      justify-content: center;
      flex-wrap: wrap;
    }

    .action-buttons button {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px 24px;
      font-size: 16px;
    }

    @media (max-width: 768px) {
      .success-content {
        padding: 32px 24px;
      }
      
      h1 {
        font-size: 24px;
      }
      
      .success-message {
        font-size: 16px;
      }
      
      .detail-row {
        flex-direction: column;
        align-items: flex-start;
        gap: 4px;
      }
      
      .action-buttons {
        flex-direction: column;
      }
      
      .action-buttons button {
        width: 100%;
        justify-content: center;
      }
    }
  `]
})
export class PaymentSuccessComponent implements OnInit {
  transactionId = '';
  amount = 0;
  currentDate = new Date();

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.transactionId = params['transactionId'] || 'N/A';
      this.amount = parseFloat(params['amount']) || 0;
    });
  }

  goToOrders() {
    this.router.navigate(['/account']);
  }

  goToHome() {
    this.router.navigate(['/']);
  }
} 