import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { OrderService, Order } from '../account/services/order.service';
import { User } from '../account/models/user.model';
import { AuthService } from '../account/services/auth.service';
import { ProductService } from '../catalog/services/product.service';
import { Product } from '../catalog/models/product.model';

interface StatsData {
  totalOrders: number;
  totalRevenue: number;
  totalUsers: number;
  totalProducts: number;
  pendingOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  averageOrderValue: number;
  topProducts: Array<{product: Product, sales: number}>;
  recentOrders: Order[];
  monthlyRevenue: Array<{month: string, revenue: number}>;
}

@Component({
  selector: 'app-admin-stats',
  standalone: true,
  imports: [
    CommonModule, 
    MatButtonModule, 
    MatIconModule, 
    MatCardModule
  ],
  template: `
    <div class="admin-stats">
      <h2>Tableau de bord - Statistiques</h2>
      
      <!-- Statistiques principales -->
      <div class="stats-grid">
        <mat-card class="stat-card primary">
          <mat-card-content>
            <div class="stat-icon">
              <mat-icon>shopping_cart</mat-icon>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ stats.totalOrders }}</div>
              <div class="stat-label">Commandes totales</div>
              <div class="stat-change positive">+12% ce mois</div>
            </div>
          </mat-card-content>
        </mat-card>
        
        <mat-card class="stat-card success">
          <mat-card-content>
            <div class="stat-icon">
              <mat-icon>payments</mat-icon>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ stats.totalRevenue | currency:'FCFA':'symbol':'1.0-0':'fr' }}</div>
              <div class="stat-label">Chiffre d'affaires</div>
              <div class="stat-change positive">+8% ce mois</div>
            </div>
          </mat-card-content>
        </mat-card>
        
        <mat-card class="stat-card info">
          <mat-card-content>
            <div class="stat-icon">
              <mat-icon>people</mat-icon>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ stats.totalUsers }}</div>
              <div class="stat-label">Utilisateurs</div>
              <div class="stat-change positive">+5% ce mois</div>
            </div>
          </mat-card-content>
        </mat-card>
        
        <mat-card class="stat-card warning">
          <mat-card-content>
            <div class="stat-icon">
              <mat-icon>inventory</mat-icon>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ stats.totalProducts }}</div>
              <div class="stat-label">Produits</div>
              <div class="stat-change neutral">Stable</div>
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <!-- Statistiques détaillées -->
      <div class="detailed-stats">
        <div class="stats-row">
          <!-- Statut des commandes -->
          <mat-card class="stats-card">
            <mat-card-header>
              <mat-card-title>Statut des commandes</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div class="status-item">
                <div class="status-info">
                  <span class="status-dot pending"></span>
                  <span>En attente</span>
                </div>
                <span class="status-count">{{ stats.pendingOrders }}</span>
              </div>
              <div class="status-item">
                <div class="status-info">
                  <span class="status-dot completed"></span>
                  <span>Terminées</span>
                </div>
                <span class="status-count">{{ stats.completedOrders }}</span>
              </div>
              <div class="status-item">
                <div class="status-info">
                  <span class="status-dot cancelled"></span>
                  <span>Annulées</span>
                </div>
                <span class="status-count">{{ stats.cancelledOrders }}</span>
              </div>
            </mat-card-content>
          </mat-card>

          <!-- Produits populaires -->
          <mat-card class="stats-card">
            <mat-card-header>
              <mat-card-title>Produits les plus vendus</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div class="product-item" *ngFor="let item of stats.topProducts.slice(0, 5)">
                <div class="product-info">
                  <img [src]="item.product.image" [alt]="item.product.name" class="product-img">
                  <div class="product-details">
                    <div class="product-name">{{ item.product.name }}</div>
                    <div class="product-sales">{{ item.sales }} ventes</div>
                  </div>
                </div>
                <div class="product-revenue">{{ (item.product.price * item.sales) | currency:'FCFA':'symbol':'1.0-0':'fr' }}</div>
              </div>
            </mat-card-content>
          </mat-card>
        </div>

        <div class="stats-row">
          <!-- Commandes récentes -->
          <mat-card class="stats-card full-width">
            <mat-card-header>
              <mat-card-title>Commandes récentes</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div class="orders-table">
                <div class="table-header">
                  <div class="header-cell">ID</div>
                  <div class="header-cell">Client</div>
                  <div class="header-cell">Montant</div>
                  <div class="header-cell">Statut</div>
                  <div class="header-cell">Date</div>
                </div>
                
                <div class="table-row" *ngFor="let order of stats.recentOrders.slice(0, 10)">
                  <div class="table-cell">#{{ order.id }}</div>
                  <div class="table-cell">{{ order.clientEmail }}</div>
                  <div class="table-cell">{{ order.total | currency:'FCFA':'symbol':'1.0-0':'fr' }}</div>
                  <div class="table-cell">
                    <span class="status-badge" [class]="getStatusClass(order.status)">
                      {{ order.status }}
                    </span>
                  </div>
                  <div class="table-cell">{{ order.date | date:'dd/MM/yyyy' }}</div>
                </div>
              </div>
            </mat-card-content>
          </mat-card>
        </div>

        <!-- Graphique des revenus mensuels -->
        <div class="stats-row">
          <mat-card class="stats-card full-width">
            <mat-card-header>
              <mat-card-title>Évolution des revenus</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div class="revenue-chart">
                <div class="chart-bars">
                  <div class="chart-bar" *ngFor="let month of stats.monthlyRevenue" 
                       [style.height.%]="getBarHeight(month.revenue)">
                    <div class="bar-tooltip">{{ month.revenue | currency:'FCFA':'symbol':'1.0-0':'fr' }}</div>
                  </div>
                </div>
                <div class="chart-labels">
                  <span *ngFor="let month of stats.monthlyRevenue">{{ month.month }}</span>
                </div>
              </div>
            </mat-card-content>
          </mat-card>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .admin-stats {
      max-width: 1400px;
      margin: 0 auto;
    }
    
    .admin-stats h2 {
      margin-bottom: 24px;
      color: #2563eb;
    }
    
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
      margin-bottom: 32px;
    }
    
    .stat-card {
      border-radius: 12px;
      overflow: hidden;
    }
    
    .stat-card.primary {
      border-left: 4px solid #2563eb;
    }
    
    .stat-card.success {
      border-left: 4px solid #10b981;
    }
    
    .stat-card.info {
      border-left: 4px solid #3b82f6;
    }
    
    .stat-card.warning {
      border-left: 4px solid #f59e0b;
    }
    
    .stat-card mat-card-content {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 24px;
    }
    
    .stat-icon {
      width: 60px;
      height: 60px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
    }
    
    .stat-card.primary .stat-icon {
      background: #dbeafe;
      color: #2563eb;
    }
    
    .stat-card.success .stat-icon {
      background: #d1fae5;
      color: #10b981;
    }
    
    .stat-card.info .stat-icon {
      background: #dbeafe;
      color: #3b82f6;
    }
    
    .stat-card.warning .stat-icon {
      background: #fef3c7;
      color: #f59e0b;
    }
    
    .stat-content {
      flex: 1;
    }
    
    .stat-value {
      font-size: 1.8rem;
      font-weight: bold;
      color: #1f2937;
      margin-bottom: 4px;
    }
    
    .stat-label {
      color: #6b7280;
      font-size: 0.9rem;
      margin-bottom: 8px;
    }
    
    .stat-change {
      font-size: 0.8rem;
      font-weight: 500;
    }
    
    .stat-change.positive {
      color: #10b981;
    }
    
    .stat-change.negative {
      color: #ef4444;
    }
    
    .stat-change.neutral {
      color: #6b7280;
    }
    
    .detailed-stats {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }
    
    .stats-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
    }
    
    .stats-card.full-width {
      grid-column: 1 / -1;
    }
    
    .status-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 0;
      border-bottom: 1px solid #f3f4f6;
    }
    
    .status-item:last-child {
      border-bottom: none;
    }
    
    .status-info {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    
    .status-dot {
      width: 12px;
      height: 12px;
      border-radius: 50%;
    }
    
    .status-dot.pending {
      background: #f59e0b;
    }
    
    .status-dot.completed {
      background: #10b981;
    }
    
    .status-dot.cancelled {
      background: #ef4444;
    }
    
    .status-count {
      font-weight: 600;
      color: #1f2937;
    }
    
    .product-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 0;
      border-bottom: 1px solid #f3f4f6;
    }
    
    .product-item:last-child {
      border-bottom: none;
    }
    
    .product-info {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    
    .product-img {
      width: 40px;
      height: 40px;
      border-radius: 6px;
      object-fit: cover;
    }
    
    .product-name {
      font-weight: 500;
      color: #1f2937;
      margin-bottom: 2px;
    }
    
    .product-sales {
      font-size: 0.8rem;
      color: #6b7280;
    }
    
    .product-revenue {
      font-weight: 600;
      color: #10b981;
    }
    
    .orders-table {
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      overflow: hidden;
    }
    
    .table-header {
      display: grid;
      grid-template-columns: 1fr 2fr 1fr 1fr 1fr;
      background: #f9fafb;
      border-bottom: 1px solid #e5e7eb;
    }
    
    .header-cell {
      padding: 12px 16px;
      font-weight: 600;
      color: #374151;
    }
    
    .table-row {
      display: grid;
      grid-template-columns: 1fr 2fr 1fr 1fr 1fr;
      border-bottom: 1px solid #e5e7eb;
    }
    
    .table-row:last-child {
      border-bottom: none;
    }
    
    .table-cell {
      padding: 12px 16px;
      display: flex;
      align-items: center;
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
    
    .revenue-chart {
      padding: 20px 0;
    }
    
    .chart-bars {
      display: flex;
      align-items: end;
      gap: 20px;
      height: 200px;
      margin-bottom: 16px;
    }
    
    .chart-bar {
      flex: 1;
      background: linear-gradient(to top, #2563eb, #3b82f6);
      border-radius: 4px 4px 0 0;
      position: relative;
      min-height: 20px;
    }
    
    .bar-tooltip {
      position: absolute;
      top: -30px;
      left: 50%;
      transform: translateX(-50%);
      background: #1f2937;
      color: white;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 0.8rem;
      white-space: nowrap;
      opacity: 0;
      transition: opacity 0.2s;
    }
    
    .chart-bar:hover .bar-tooltip {
      opacity: 1;
    }
    
    .chart-labels {
      display: flex;
      justify-content: space-between;
      padding: 0 10px;
    }
    
    .chart-labels span {
      font-size: 0.8rem;
      color: #6b7280;
    }
    
    @media (max-width: 768px) {
      .stats-grid {
        grid-template-columns: 1fr;
      }
      
      .stats-row {
        grid-template-columns: 1fr;
      }
      
      .table-header,
      .table-row {
        grid-template-columns: 1fr;
        gap: 8px;
      }
      
      .header-cell,
      .table-cell {
        padding: 8px 16px;
      }
      
      .chart-bars {
        gap: 10px;
      }
    }
  `]
})
export class AdminStats implements OnInit {
  stats: StatsData = {
    totalOrders: 0,
    totalRevenue: 0,
    totalUsers: 0,
    totalProducts: 0,
    pendingOrders: 0,
    completedOrders: 0,
    cancelledOrders: 0,
    averageOrderValue: 0,
    topProducts: [],
    recentOrders: [],
    monthlyRevenue: []
  };

  constructor(
    private orderService: OrderService,
    private authService: AuthService,
    private productService: ProductService
  ) {}

  ngOnInit() {
    this.loadStats();
  }

  loadStats() {
    // Charger les données des services
    this.orderService.getAllOrders().subscribe(orders => {
      this.stats.totalOrders = orders.length;
      this.stats.totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
      this.stats.pendingOrders = orders.filter(o => o.status === 'En attente').length;
      this.stats.completedOrders = orders.filter(o => o.status === 'Livrée').length;
      this.stats.cancelledOrders = orders.filter(o => o.status === 'Annulée').length;
      this.stats.averageOrderValue = this.stats.totalOrders > 0 ? this.stats.totalRevenue / this.stats.totalOrders : 0;
      this.stats.recentOrders = orders.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    });

    // Simuler les autres données
    this.stats.totalUsers = 4;
    this.stats.totalProducts = 50;
    
    // Produits populaires simulés
    this.productService.getProducts().subscribe(products => {
      this.stats.topProducts = [
        { product: products[0], sales: 15 },
        { product: products[1], sales: 12 },
        { product: products[2], sales: 10 },
        { product: products[3], sales: 8 },
        { product: products[4], sales: 6 }
      ];
    });

    // Revenus mensuels simulés
    this.stats.monthlyRevenue = [
      { month: 'Jan', revenue: 250000 },
      { month: 'Fév', revenue: 320000 },
      { month: 'Mar', revenue: 280000 },
      { month: 'Avr', revenue: 450000 },
      { month: 'Mai', revenue: 380000 },
      { month: 'Juin', revenue: 520000 }
    ];
  }

  getStatusClass(status: string): string {
    return status.toLowerCase().replace(' ', '-');
  }

  getBarHeight(revenue: number): number {
    const maxRevenue = Math.max(...this.stats.monthlyRevenue.map(m => m.revenue));
    return (revenue / maxRevenue) * 100;
  }
} 