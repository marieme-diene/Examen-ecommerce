import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { OrderService, Order, OrderStatus } from '../account/services/order.service';
import { User } from '../account/models/user.model';
import { AuthService } from '../account/services/auth.service';

interface OrderWithUser extends Order {
  userName: string;
  isPaid: boolean;
}

@Component({
  selector: 'app-admin-orders',
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
    MatOptionModule,
    MatDialogModule
  ],
  template: `
    <div class="admin-orders">
      <h2>Gestion des commandes</h2>
      
      <!-- Messages de feedback -->
      <div *ngIf="message" class="feedback-message" [class.success]="messageType === 'success'" [class.error]="messageType === 'error'">
        {{ message }}
        <button class="close-btn" (click)="clearMessage()">×</button>
      </div>

      <!-- Filtres -->
      <mat-card class="filters-card">
        <mat-card-content>
          <div class="filters-row">
            <mat-form-field appearance="outline">
              <mat-label>Rechercher</mat-label>
              <input matInput [(ngModel)]="searchTerm" (input)="applyFilters()" placeholder="ID, email client...">
            </mat-form-field>
            
            <mat-form-field appearance="outline">
              <mat-label>Statut</mat-label>
              <mat-select [(ngModel)]="selectedStatus" (selectionChange)="applyFilters()">
                <mat-option value="">Tous</mat-option>
                <mat-option value="En attente">En attente</mat-option>
                <mat-option value="Confirmée">Confirmée</mat-option>
                <mat-option value="En cours de livraison">En cours de livraison</mat-option>
                <mat-option value="Livrée">Livrée</mat-option>
                <mat-option value="Annulée">Annulée</mat-option>
              </mat-select>
            </mat-form-field>
            
            <mat-form-field appearance="outline">
              <mat-label>Paiement</mat-label>
              <mat-select [(ngModel)]="selectedPayment" (selectionChange)="applyFilters()">
                <mat-option value="">Tous</mat-option>
                <mat-option value="payé">Payé</mat-option>
                <mat-option value="non payé">Non payé</mat-option>
              </mat-select>
            </mat-form-field>
          </div>
        </mat-card-content>
      </mat-card>

      <!-- Statistiques rapides -->
      <div class="stats-grid">
        <mat-card class="stat-card">
          <mat-card-content>
            <div class="stat-value">{{ filteredOrders.length }}</div>
            <div class="stat-label">Commandes filtrées</div>
          </mat-card-content>
        </mat-card>
        <mat-card class="stat-card">
          <mat-card-content>
            <div class="stat-value">{{ totalRevenue | currency:'FCFA':'symbol':'1.0-0':'fr' }}</div>
            <div class="stat-label">Revenus totaux</div>
          </mat-card-content>
        </mat-card>
        <mat-card class="stat-card">
          <mat-card-content>
            <div class="stat-value">{{ pendingOrdersCount }}</div>
            <div class="stat-label">En attente</div>
          </mat-card-content>
        </mat-card>
        <mat-card class="stat-card">
          <mat-card-content>
            <div class="stat-value">{{ unpaidOrdersCount }}</div>
            <div class="stat-label">Non payées</div>
          </mat-card-content>
        </mat-card>
      </div>

      <!-- Liste des commandes -->
      <mat-card class="orders-list-card">
        <mat-card-header>
          <mat-card-title>Commandes ({{ filteredOrders.length }})</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <div class="orders-table">
            <div class="table-header">
              <div class="header-cell">ID</div>
              <div class="header-cell">Client</div>
              <div class="header-cell">Produits</div>
              <div class="header-cell">Total</div>
              <div class="header-cell">Statut</div>
              <div class="header-cell">Paiement</div>
              <div class="header-cell">Date</div>
              <div class="header-cell">Actions</div>
            </div>
            
            <div class="table-row" *ngFor="let order of filteredOrders">
              <div class="table-cell">#{{ order.id }}</div>
              
              <div class="table-cell">
                <div class="client-info">
                  <div class="client-name">{{ order.userName }}</div>
                  <div class="client-email">{{ order.clientEmail }}</div>
                </div>
              </div>
              
              <div class="table-cell">
                <div class="products-summary">
                  <div class="product-count">{{ order.items.length }} produit(s)</div>
                  <div class="product-list">
                    <span *ngFor="let item of order.items.slice(0, 2)" class="product-name">
                      {{ item.name }}
                    </span>
                    <span *ngIf="order.items.length > 2" class="more-products">
                      +{{ order.items.length - 2 }} autres
                    </span>
                  </div>
                </div>
              </div>
              
              <div class="table-cell">
                <div class="total-amount">{{ order.total | currency:'FCFA':'symbol':'1.0-0':'fr' }}</div>
              </div>
              
              <div class="table-cell">
                <span class="status-badge" [class]="getStatusClass(order.status)">
                  {{ order.status }}
                </span>
              </div>
              
              <div class="table-cell">
                <span class="payment-badge" [class]="order.isPaid ? 'paid' : 'unpaid'">
                  {{ order.isPaid ? 'Payé' : 'Non payé' }}
                </span>
              </div>
              
              <div class="table-cell">
                <div class="order-date">{{ order.date | date:'dd/MM/yyyy' }}</div>
                <div class="order-time">{{ order.date | date:'HH:mm' }}</div>
              </div>
              
              <div class="table-cell actions">
                <button mat-icon-button color="primary" (click)="viewOrderDetails(order)" matTooltip="Voir détails">
                  <mat-icon>visibility</mat-icon>
                </button>
                <button mat-icon-button color="accent" (click)="updateOrderStatus(order)" matTooltip="Modifier statut">
                  <mat-icon>edit</mat-icon>
                </button>
                <button mat-icon-button color="warn" (click)="cancelOrder(order.id)" matTooltip="Annuler" 
                        [disabled]="order.status === 'Annulée' || order.status === 'Livrée'">
                  <mat-icon>cancel</mat-icon>
                </button>
              </div>
            </div>
          </div>
        </mat-card-content>
      </mat-card>
    </div>

    <!-- Dialog pour modifier le statut -->
    <div *ngIf="showStatusDialog" class="status-dialog-overlay" (click)="closeStatusDialog()">
      <div class="status-dialog" (click)="$event.stopPropagation()">
        <h3>Modifier le statut de la commande #{{ selectedOrder?.id }}</h3>
        
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Nouveau statut</mat-label>
          <mat-select [(ngModel)]="newStatus">
            <mat-option value="En attente">En attente</mat-option>
            <mat-option value="Confirmée">Confirmée</mat-option>
            <mat-option value="En cours de livraison">En cours de livraison</mat-option>
            <mat-option value="Livrée">Livrée</mat-option>
            <mat-option value="Annulée">Annulée</mat-option>
          </mat-select>
        </mat-form-field>
        
        <mat-form-field appearance="outline" class="full-width" *ngIf="newStatus === 'En cours de livraison'">
          <mat-label>Numéro de suivi</mat-label>
          <input matInput [(ngModel)]="trackingNumber" placeholder="TRK123456789">
        </mat-form-field>
        
        <div class="dialog-actions">
          <button mat-stroked-button (click)="closeStatusDialog()">Annuler</button>
          <button mat-raised-button color="primary" (click)="confirmStatusUpdate()" [disabled]="!newStatus">
            Confirmer
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .admin-orders {
      max-width: 1400px;
      margin: 0 auto;
    }
    
    .admin-orders h2 {
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
    
    .filters-card {
      margin-bottom: 24px;
    }
    
    .filters-row {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 16px;
    }
    
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
      margin-bottom: 24px;
    }
    
    .stat-card {
      text-align: center;
    }
    
    .stat-value {
      font-size: 1.5rem;
      font-weight: bold;
      color: #2563eb;
      margin-bottom: 4px;
    }
    
    .stat-label {
      color: #6b7280;
      font-size: 0.9rem;
    }
    
    .orders-table {
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      overflow: hidden;
    }
    
    .table-header {
      display: grid;
      grid-template-columns: 80px 2fr 2fr 1fr 1fr 1fr 1fr 1fr;
      background: #f9fafb;
      border-bottom: 1px solid #e5e7eb;
    }
    
    .header-cell {
      padding: 16px 12px;
      font-weight: 600;
      color: #374151;
      border-right: 1px solid #e5e7eb;
    }
    
    .header-cell:last-child {
      border-right: none;
    }
    
    .table-row {
      display: grid;
      grid-template-columns: 80px 2fr 2fr 1fr 1fr 1fr 1fr 1fr;
      border-bottom: 1px solid #e5e7eb;
      transition: background-color 0.2s;
    }
    
    .table-row:hover {
      background: #f9fafb;
    }
    
    .table-row:last-child {
      border-bottom: none;
    }
    
    .table-cell {
      padding: 16px 12px;
      border-right: 1px solid #e5e7eb;
      display: flex;
      align-items: center;
    }
    
    .table-cell:last-child {
      border-right: none;
    }
    
    .client-info {
      display: flex;
      flex-direction: column;
    }
    
    .client-name {
      font-weight: 500;
      color: #1f2937;
    }
    
    .client-email {
      font-size: 0.8rem;
      color: #6b7280;
    }
    
    .products-summary {
      display: flex;
      flex-direction: column;
    }
    
    .product-count {
      font-weight: 500;
      color: #1f2937;
      margin-bottom: 4px;
    }
    
    .product-list {
      display: flex;
      flex-wrap: wrap;
      gap: 4px;
    }
    
    .product-name {
      font-size: 0.8rem;
      color: #6b7280;
    }
    
    .more-products {
      font-size: 0.8rem;
      color: #2563eb;
      font-style: italic;
    }
    
    .total-amount {
      font-weight: 600;
      color: #10b981;
    }
    
    .status-badge {
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 0.8rem;
      font-weight: 500;
    }
    
    .status-badge.en-attente {
      background: #fef3c7;
      color: #92400e;
    }
    
    .status-badge.confirmée {
      background: #dbeafe;
      color: #1e40af;
    }
    
    .status-badge.en-cours-de-livraison {
      background: #d1fae5;
      color: #065f46;
    }
    
    .status-badge.livrée {
      background: #d1fae5;
      color: #065f46;
    }
    
    .status-badge.annulée {
      background: #fee2e2;
      color: #991b1b;
    }
    
    .payment-badge {
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 0.8rem;
      font-weight: 500;
    }
    
    .payment-badge.paid {
      background: #d1fae5;
      color: #065f46;
    }
    
    .payment-badge.unpaid {
      background: #fee2e2;
      color: #991b1b;
    }
    
    .order-date {
      font-weight: 500;
      color: #1f2937;
    }
    
    .order-time {
      font-size: 0.8rem;
      color: #6b7280;
    }
    
    .actions {
      display: flex;
      gap: 4px;
    }
    
    .status-dialog-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }
    
    .status-dialog {
      background: white;
      padding: 24px;
      border-radius: 8px;
      min-width: 400px;
      max-width: 500px;
    }
    
    .status-dialog h3 {
      margin-bottom: 20px;
      color: #1f2937;
    }
    
    .full-width {
      width: 100%;
      margin-bottom: 16px;
    }
    
    .dialog-actions {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      margin-top: 20px;
    }
    
    @media (max-width: 1024px) {
      .table-header,
      .table-row {
        grid-template-columns: 1fr;
        gap: 8px;
      }
      
      .header-cell,
      .table-cell {
        border-right: none;
        border-bottom: 1px solid #e5e7eb;
        padding: 8px 16px;
      }
      
      .filters-row {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class AdminOrders implements OnInit {
  orders: OrderWithUser[] = [];
  filteredOrders: OrderWithUser[] = [];
  searchTerm = '';
  selectedStatus = '';
  selectedPayment = '';
  message = '';
  messageType: 'success' | 'error' = 'success';
  
  // Dialog de statut
  showStatusDialog = false;
  selectedOrder: OrderWithUser | null = null;
  newStatus: OrderStatus = 'En attente';
  trackingNumber = '';

  constructor(
    private orderService: OrderService,
    private authService: AuthService,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    this.loadOrders();
  }

  loadOrders() {
    this.orderService.getAllOrders().subscribe(orders => {
      // Simuler les données utilisateur et paiement
      this.orders = orders.map(order => ({
        ...order,
        userName: this.getUserName(order.userId),
        isPaid: this.isOrderPaid(order)
      }));
      this.applyFilters();
    });
  }

  getUserName(userId: number): string {
    // Simulation - en réalité, on récupérerait depuis le service utilisateur
    const userNames: { [key: number]: string } = {
      1: 'Admin Principal',
      2: 'Marie Dupont',
      3: 'Jean Martin',
      4: 'Sophie Bernard'
    };
    return userNames[userId] || 'Utilisateur inconnu';
  }

  isOrderPaid(order: Order): boolean {
    // Simulation - en réalité, on vérifierait le statut de paiement
    return order.status === 'Livrée' || order.status === 'En cours de livraison';
  }

  applyFilters() {
    this.filteredOrders = this.orders.filter(order => {
      const matchesSearch = !this.searchTerm || 
        order.id.toString().includes(this.searchTerm) ||
        order.clientEmail.toLowerCase().includes(this.searchTerm.toLowerCase());
      
      const matchesStatus = !this.selectedStatus || order.status === this.selectedStatus;
      
      const matchesPayment = !this.selectedPayment || 
        (this.selectedPayment === 'payé' && order.isPaid) ||
        (this.selectedPayment === 'non payé' && !order.isPaid);
      
      return matchesSearch && matchesStatus && matchesPayment;
    });
  }

  getStatusClass(status: string): string {
    return status.toLowerCase().replace(' ', '-');
  }

  viewOrderDetails(order: OrderWithUser) {
    // Ici on pourrait ouvrir un dialog avec les détails complets
    this.showMessage(`Détails de la commande #${order.id} - Fonctionnalité à implémenter`, 'info');
  }

  updateOrderStatus(order: OrderWithUser) {
    this.selectedOrder = order;
    this.newStatus = order.status;
    this.trackingNumber = order.trackingNumber || '';
    this.showStatusDialog = true;
  }

  confirmStatusUpdate() {
    if (!this.selectedOrder || !this.newStatus) return;
    
    this.orderService.updateOrderStatus(
      this.selectedOrder.userId,
      this.selectedOrder.id,
      this.newStatus,
      this.trackingNumber
    ).subscribe(() => {
      this.showMessage('Statut de la commande mis à jour avec succès', 'success');
      this.loadOrders();
      this.closeStatusDialog();
    });
  }

  cancelOrder(orderId: number) {
    if (confirm('Êtes-vous sûr de vouloir annuler cette commande ?')) {
      this.orderService.cancelOrder(orderId).subscribe(() => {
        this.showMessage('Commande annulée avec succès', 'success');
        this.loadOrders();
      });
    }
  }

  closeStatusDialog() {
    this.showStatusDialog = false;
    this.selectedOrder = null;
    this.newStatus = 'En attente';
    this.trackingNumber = '';
  }

  get totalRevenue(): number {
    return this.filteredOrders.reduce((sum, order) => sum + order.total, 0);
  }

  get pendingOrdersCount(): number {
    return this.filteredOrders.filter(order => order.status === 'En attente').length;
  }

  get unpaidOrdersCount(): number {
    return this.filteredOrders.filter(order => !order.isPaid).length;
  }

  showMessage(message: string, type: 'success' | 'error' | 'info') {
    this.message = message;
    this.messageType = type as 'success' | 'error';
    setTimeout(() => this.clearMessage(), 5000);
  }

  clearMessage() {
    this.message = '';
  }
} 