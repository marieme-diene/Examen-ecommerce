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
import { OrderService } from '../orders/services/order.service';
import { User } from '../account/models/user.model';
import { AuthService } from '../account/services/auth.service';
import { Order as OrderModel, OrderStatus, PaymentStatus } from '../orders/models/order.model';

interface OrderWithUser extends OrderModel {
  userName: string;
  isPaid: boolean;
  clientEmail: string;
  date: Date;
  total: number;
  paymentStatus: PaymentStatus;
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
                 <mat-option value="pending">En attente</mat-option>
                 <mat-option value="confirmed">Confirmée</mat-option>
                 <mat-option value="processing">En cours de traitement</mat-option>
                 <mat-option value="shipped">Expédiée</mat-option>
                 <mat-option value="delivered">Livrée</mat-option>
                 <mat-option value="cancelled">Annulée</mat-option>
              </mat-select>
            </mat-form-field>
            
            <mat-form-field appearance="outline">
              <mat-label>Paiement</mat-label>
              <mat-select [(ngModel)]="selectedPayment" (selectionChange)="applyFilters()">
                                 <mat-option value="">Tous</mat-option>
                 <mat-option value="paid">Payé</mat-option>
                 <mat-option value="pending">Non payé</mat-option>
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
                       {{ item.productName }}
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
                   {{ getStatusLabel(order.status) }}
                 </span>
               </div>
              
              <div class="table-cell">
                <span class="payment-badge" [class]="getPaymentStatusClass(order)">
                  {{ getPaymentStatusLabel(order) }}
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
                                 <button mat-icon-button color="success" (click)="markPaymentAsPaid(order.id.toString())" matTooltip="Marquer comme payé"
                                                  [disabled]="order.paymentStatus === 'paid' || order.status === 'cancelled'">
                   <mat-icon>payment</mat-icon>
                 </button>
                 <button mat-icon-button color="warn" (click)="markPaymentAsFailed(order.id.toString())" matTooltip="Marquer paiement échoué"
                                                  [disabled]="order.paymentStatus === 'failed' || order.status === 'cancelled'">
                   <mat-icon>payment_off</mat-icon>
                 </button>
                 <button mat-icon-button color="warn" (click)="cancelOrder(order.id.toString())" matTooltip="Annuler" 
                                                  [disabled]="order.status === 'cancelled' || order.status === 'delivered'">
                   <mat-icon>cancel</mat-icon>
                 </button>
              </div>
            </div>
            
            <!-- Message quand aucune commande -->
            <div *ngIf="filteredOrders.length === 0" class="no-orders-message">
              <div style="text-align: center; padding: 40px; color: #666;">
                <mat-icon style="font-size: 48px; color: #ccc; margin-bottom: 16px;">shopping_cart</mat-icon>
                <h3>Aucune commande trouvée</h3>
                <p>Il n'y a actuellement aucune commande à afficher.</p>
                <p>Aucune commande n'est disponible pour le moment.</p>
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
                         <mat-option value="pending">En attente</mat-option>
             <mat-option value="confirmed">Confirmée</mat-option>
             <mat-option value="processing">En cours de traitement</mat-option>
             <mat-option value="shipped">Expédiée</mat-option>
             <mat-option value="delivered">Livrée</mat-option>
             <mat-option value="cancelled">Annulée</mat-option>
          </mat-select>
        </mat-form-field>
        
                 <mat-form-field appearance="outline" class="full-width" *ngIf="newStatus === 'shipped'">
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
    
    .payment-badge.pending {
      background: #fef3c7;
      color: #92400e;
    }
    
    .payment-badge.failed {
      background: #fee2e2;
      color: #991b1b;
    }
    
    .payment-badge.refunded {
      background: #dbeafe;
      color: #1e40af;
    }
    
    .payment-badge.partially-refunded {
      background: #f3e8ff;
      color: #7c3aed;
    }
    
    .payment-badge.unknown {
      background: #f3f4f6;
      color: #6b7280;
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
  newStatus: OrderStatus = 'pending';
  trackingNumber = '';

  constructor(
    private orderService: OrderService,
    private authService: AuthService,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    // Attendre que le DOM soit prêt pour éviter les problèmes SSR
    if (typeof window !== 'undefined') {
      setTimeout(() => {
        this.loadOrders();
      }, 0);
    } else {
      // Côté serveur, initialiser avec des données vides
      this.orders = [];
      this.applyFilters();
    }
  }



  loadOrders() {
    // Utiliser le service pour récupérer toutes les commandes
    this.orderService.getAllOrders().subscribe(orders => {
      console.log('Commandes récupérées via le service:', orders.length);
      
      // Mapper les commandes avec les données utilisateur
      this.orders = orders.map(order => ({
        ...order,
        userName: this.getUserName(order.userId),
        isPaid: this.isOrderPaid(order),
        clientEmail: order.shippingAddress?.email || 'Email non disponible',
        date: order.createdAt,
        total: order.totalAmount
      }));
      
      console.log('Commandes mappées:', this.orders.length);
      this.applyFilters();
    });
  }

  getUserName(userId: number): string {
    // Simulation - en réalité, on récupérerait depuis le service utilisateur
    const userNames: { [key: number]: string } = {
      1: 'Admin Principal',
      2: 'Marie Dupont',
      3: 'Jean Martin',
      4: 'Sophie Bernard',
      5: 'Fatou Diop',
      6: 'Khadija Ndiaye'
    };
    return userNames[userId] || 'Utilisateur inconnu';
  }

  isOrderPaid(order: OrderModel): boolean {
    return order.paymentStatus === 'paid';
  }

  getPaymentStatusLabel(order: OrderModel): string {
    switch (order.paymentStatus) {
      case 'paid': return 'Payé';
      case 'pending': return 'En attente';
      case 'failed': return 'Échoué';
      case 'refunded': return 'Remboursé';
      case 'partially_refunded': return 'Partiellement remboursé';
      default: return 'Inconnu';
    }
  }

  getPaymentStatusClass(order: OrderModel): string {
    switch (order.paymentStatus) {
      case 'paid': return 'paid';
      case 'pending': return 'pending';
      case 'failed': return 'failed';
      case 'refunded': return 'refunded';
      case 'partially_refunded': return 'partially-refunded';
      default: return 'unknown';
    }
  }

  applyFilters() {
    this.filteredOrders = this.orders.filter(order => {
      const matchesSearch = !this.searchTerm || 
        order.id.toString().includes(this.searchTerm) ||
        order.clientEmail.toLowerCase().includes(this.searchTerm.toLowerCase());
      
      const matchesStatus = !this.selectedStatus || order.status === this.selectedStatus;
      
      const matchesPayment = !this.selectedPayment || 
        (this.selectedPayment === 'paid' && order.isPaid) ||
        (this.selectedPayment === 'pending' && !order.isPaid);
      
      return matchesSearch && matchesStatus && matchesPayment;
    });
  }

  getStatusClass(status: string): string {
    return status.toLowerCase().replace(' ', '-');
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'pending': return 'En attente';
      case 'confirmed': return 'Confirmée';
      case 'processing': return 'En cours de traitement';
      case 'shipped': return 'Expédiée';
      case 'delivered': return 'Livrée';
      case 'cancelled': return 'Annulée';
      case 'refunded': return 'Remboursée';
      default: return status;
    }
  }

  viewOrderDetails(order: OrderWithUser) {
    // Ici on pourrait ouvrir un dialog avec les détails complets
    this.showMessage(`Détails de la commande #${order.id} - Fonctionnalité à implémenter`, 'info');
  }

  updateOrderStatus(order: OrderWithUser) {
    this.selectedOrder = order;
    this.newStatus = order.status as OrderStatus;
    this.trackingNumber = order.trackingNumber || '';
    this.showStatusDialog = true;
  }

  confirmStatusUpdate() {
    if (!this.selectedOrder || !this.newStatus) return;
    
    this.orderService.updateOrderStatus(
      this.selectedOrder.id,
      this.newStatus,
      this.trackingNumber
    ).subscribe(() => {
      this.showMessage('Statut de la commande mis à jour avec succès', 'success');
      this.loadOrders();
      this.closeStatusDialog();
    });
  }

  cancelOrder(orderId: string) {
    if (confirm('Êtes-vous sûr de vouloir annuler cette commande ?')) {
      this.orderService.cancelOrder(orderId).subscribe(() => {
        this.showMessage('Commande annulée avec succès', 'success');
        this.loadOrders();
      });
    }
  }

  markPaymentAsPaid(orderId: string) {
    if (confirm('Marquer cette commande comme payée ?')) {
      this.orderService.markPaymentAsPaid(orderId).subscribe(() => {
        this.loadOrders();
        this.showMessage('Paiement marqué comme effectué', 'success');
      });
    }
  }

  markPaymentAsFailed(orderId: string) {
    if (confirm('Marquer le paiement de cette commande comme échoué ?')) {
      this.orderService.markPaymentAsFailed(orderId).subscribe(() => {
        this.loadOrders();
        this.showMessage('Paiement marqué comme échoué', 'success');
      });
    }
  }

  closeStatusDialog() {
    this.showStatusDialog = false;
    this.selectedOrder = null;
    this.newStatus = 'pending';
    this.trackingNumber = '';
  }

  get totalRevenue(): number {
    return this.filteredOrders.reduce((sum, order) => sum + order.total, 0);
  }

  get pendingOrdersCount(): number {
    return this.filteredOrders.filter(order => order.status === 'pending').length;
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

  // Méthodes de test pour créer des commandes
  createTestOrders() {
    // Vérifier si nous sommes côté client
    if (typeof window === 'undefined') {
      this.showMessage('localStorage non disponible (SSR)', 'error');
      return;
    }

    const testOrders = [
      {
        id: '1',
        userId: 2,
        orderNumber: 'CMD001',
        status: 'pending' as OrderStatus,
        items: [
          {
            id: 1,
            productId: 1,
            productName: 'iPhone 14 128GB',
            productImage: 'https://via.placeholder.com/100',
            price: 450000,
            quantity: 1,
            subtotal: 450000,
            category: 'Électronique'
          }
        ],
        subtotal: 450000,
        discountAmount: 0,
        shippingCost: 2000,
        taxAmount: 81000,
        totalAmount: 533000,
        appliedPromotions: [],
        shippingAddress: {
          firstName: 'Marie',
          lastName: 'Dupont',
          email: 'marie.dupont@email.com',
          phone: '77 123 45 67',
          street: '123 Rue de la Paix',
          city: 'Dakar',
          state: 'Dakar',
          postalCode: '10000',
          country: 'Sénégal'
        },
        billingAddress: {
          firstName: 'Marie',
          lastName: 'Dupont',
          email: 'marie.dupont@email.com',
          phone: '77 123 45 67',
          street: '123 Rue de la Paix',
          city: 'Dakar',
          state: 'Dakar',
          postalCode: '10000',
          country: 'Sénégal'
        },
        paymentMethod: {
          type: 'orange_money',
          details: {
            mobileNumber: '77 123 45 67',
            provider: 'orange'
          }
        },
        paymentStatus: 'pending' as any,
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-01-15'),
        estimatedDelivery: new Date('2024-01-22')
      },
      {
        id: '2',
        userId: 3,
        orderNumber: 'CMD002',
        status: 'confirmed' as OrderStatus,
        items: [
          {
            id: 1,
            productId: 2,
            productName: 'Samsung Galaxy A16',
            productImage: 'https://via.placeholder.com/100',
            price: 45000,
            quantity: 1,
            subtotal: 45000,
            category: 'Électronique'
          },
          {
            id: 2,
            productId: 3,
            productName: 'Sac à main cuir',
            productImage: 'https://via.placeholder.com/100',
            price: 15000,
            quantity: 2,
            subtotal: 30000,
            category: 'Mode'
          }
        ],
        subtotal: 75000,
        discountAmount: 5000,
        shippingCost: 2000,
        taxAmount: 12600,
        totalAmount: 84600,
        appliedPromotions: [],
        shippingAddress: {
          firstName: 'Jean',
          lastName: 'Martin',
          email: 'jean.martin@email.com',
          phone: '76 987 65 43',
          street: '456 Avenue du Port',
          city: 'Rufisque',
          state: 'Rufisque',
          postalCode: '11000',
          country: 'Sénégal'
        },
        billingAddress: {
          firstName: 'Jean',
          lastName: 'Martin',
          email: 'jean.martin@email.com',
          phone: '76 987 65 43',
          street: '456 Avenue du Port',
          city: 'Rufisque',
          state: 'Rufisque',
          postalCode: '11000',
          country: 'Sénégal'
        },
        paymentMethod: {
          type: 'card',
          details: {
            cardNumber: '**** **** **** 5678',
            cardType: 'Mastercard'
          }
        },
        paymentStatus: 'paid' as any,
        createdAt: new Date('2024-01-14'),
        updatedAt: new Date('2024-01-16'),
        estimatedDelivery: new Date('2024-01-21')
      },
      {
        id: '3',
        userId: 4,
        orderNumber: 'CMD003',
        status: 'delivered' as OrderStatus,
        items: [
          {
            id: 1,
            productId: 4,
            productName: 'Frigo Samsung 400L',
            productImage: 'https://via.placeholder.com/100',
            price: 350000,
            quantity: 1,
            subtotal: 350000,
            category: 'Électroménager'
          }
        ],
        subtotal: 350000,
        discountAmount: 0,
        shippingCost: 0,
        taxAmount: 63000,
        totalAmount: 413000,
        appliedPromotions: [],
        shippingAddress: {
          firstName: 'Sophie',
          lastName: 'Bernard',
          email: 'sophie.bernard@email.com',
          phone: '78 555 12 34',
          street: '789 Boulevard de la Liberté',
          city: 'Thiès',
          state: 'Thiès',
          postalCode: '12000',
          country: 'Sénégal'
        },
        billingAddress: {
          firstName: 'Sophie',
          lastName: 'Bernard',
          email: 'sophie.bernard@email.com',
          phone: '78 555 12 34',
          street: '789 Boulevard de la Liberté',
          city: 'Thiès',
          state: 'Thiès',
          postalCode: '12000',
          country: 'Sénégal'
        },
        paymentMethod: {
          type: 'card' as any,
          details: {
            cardNumber: '**** **** **** 1234',
            cardType: 'Visa'
          }
        },
        paymentStatus: 'paid' as any,
        createdAt: new Date('2024-01-10'),
        updatedAt: new Date('2024-01-17'),
        estimatedDelivery: new Date('2024-01-17'),
        deliveredAt: new Date('2024-01-17')
      }
    ];

    // Sauvegarder les commandes de test dans localStorage
    localStorage.setItem('afrimarket_orders', JSON.stringify(testOrders));
    
    // Mettre à jour le service OrderService
    this.orderService['ordersSubject'].next(testOrders as OrderModel[]);
    
    // Recharger les commandes
    this.loadOrders();
    
    this.showMessage('Commandes de test créées avec succès !', 'success');
  }

  clearAllOrders() {
    if (confirm('Êtes-vous sûr de vouloir supprimer toutes les commandes ?')) {
      // Vider le localStorage
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.removeItem('afrimarket_orders');
      }
      
      // Mettre à jour le service
      this.orderService['ordersSubject'].next([]);
      
      // Recharger
      this.loadOrders();
      this.showMessage('Toutes les commandes ont été supprimées', 'success');
    }
  }

  refreshOrders() {
    this.loadOrders();
    this.showMessage('Commandes actualisées', 'success');
  }

  createClientOrder() {
    // Simuler une commande créée par un client (Khadija Ndiaye)
    const clientOrder = {
      id: Date.now().toString(),
      userId: 6,
      orderNumber: `CMD${Date.now().toString().slice(-6)}`,
      status: 'pending' as OrderStatus,
      items: [
        {
          id: 1,
          productId: 5,
          productName: 'Sac a main',
          productImage: 'https://via.placeholder.com/100',
          price: 15000,
          quantity: 2,
          subtotal: 30000,
          category: 'Mode'
        }
      ],
      subtotal: 30000,
      discountAmount: 0,
      shippingCost: 2000,
      taxAmount: 5400,
      totalAmount: 37400,
      appliedPromotions: [],
      shippingAddress: {
        firstName: 'khadija',
        lastName: 'ndiaye',
        email: 'khadija.ndiaye@email.com',
        phone: '784738807',
        street: 'Medina',
        city: 'Dakar',
        state: 'Dakar',
        postalCode: '11000',
        country: 'Sénégal'
      },
      billingAddress: {
        firstName: 'khadija',
        lastName: 'ndiaye',
        email: 'khadija.ndiaye@email.com',
        phone: '784738807',
        street: 'Medina',
        city: 'Dakar',
        state: 'Dakar',
        postalCode: '11000',
        country: 'Sénégal'
      },
      paymentMethod: {
        type: 'orange_money',
        details: {
          mobileNumber: '784738807',
          provider: 'orange'
        }
      },
      paymentStatus: 'pending' as any,
      createdAt: new Date(),
      updatedAt: new Date(),
      estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    };

    // Récupérer les commandes existantes et ajouter la nouvelle
    const currentOrders = this.orderService['ordersSubject'].value;
    const updatedOrders = [clientOrder, ...currentOrders];
    
    // Mettre à jour le service
    this.orderService['ordersSubject'].next(updatedOrders as OrderModel[]);
    
    // Sauvegarder dans localStorage
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem('afrimarket_orders', JSON.stringify(updatedOrders));
    }
    
    // Recharger
    this.loadOrders();
    
    this.showMessage('Commande client créée avec succès !', 'success');
  }
} 