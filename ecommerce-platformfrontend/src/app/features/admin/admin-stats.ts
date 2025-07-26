import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrderService, Order } from '../../features/account/services/order.service';
import { UserService, User } from './user.service';
import { ProductService } from '../../features/catalog/services/product.service';
import { Product } from '../../features/catalog/models/product.model';

@Component({
  selector: 'app-admin-stats',
  standalone: true,
  imports: [CommonModule],
  template: `
    <h2 class="admin-title">Statistiques du site</h2>
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-label">Utilisateurs</div>
        <div class="stat-value">{{ totalUsers }}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Produits</div>
        <div class="stat-value">{{ totalProducts }}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Commandes</div>
        <div class="stat-value">{{ totalOrders }}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Chiffre d'affaires</div>
        <div class="stat-value">{{ totalCA | currency:'FCFA':'symbol':'1.0-0':'fr' }}</div>
      </div>
    </div>
    <div class="stats-section">
      <h3 class="stats-section-title">Évolution des commandes</h3>
      <div class="stats-chart-placeholder">
        <div style="margin-bottom: 12px;">Commandes par mois</div>
        <div style="display: flex; gap: 8px; justify-content: center; flex-wrap: wrap;">
          <div *ngFor="let month of monthlyOrders" style="background: #2563eb; color: white; padding: 8px 12px; border-radius: 6px; font-size: 0.9rem;">
            {{ month.month }}: {{ month.count }}
          </div>
        </div>
      </div>
    </div>
    <div class="stats-section">
      <h3 class="stats-section-title">Top produits</h3>
      <table class="admin-table" *ngIf="bestSellers.length > 0; else noSales">
        <thead>
          <tr><th>Produit</th><th>Quantité vendue</th><th>Prix unitaire</th><th>Total</th></tr>
        </thead>
        <tbody>
          <tr *ngFor="let product of bestSellers">
            <td>{{ product.name }}</td>
            <td>{{ product.qty }}</td>
            <td>{{ product.price | currency:'FCFA':'symbol':'1.0-0':'fr' }}</td>
            <td>{{ product.qty * product.price | currency:'FCFA':'symbol':'1.0-0':'fr' }}</td>
          </tr>
        </tbody>
      </table>
      <ng-template #noSales>
        <div style="text-align: center; padding: 24px; color: #64748b;">Aucune vente enregistrée</div>
      </ng-template>
    </div>
    <div class="stats-section">
      <h3 class="stats-section-title">Statistiques par catégorie</h3>
      <table class="admin-table" *ngIf="categoryStats.length > 0">
        <thead>
          <tr><th>Catégorie</th><th>Produits</th><th>Ventes</th><th>CA</th></tr>
        </thead>
        <tbody>
          <tr *ngFor="let cat of categoryStats">
            <td>{{ cat.name }}</td>
            <td>{{ cat.productCount }}</td>
            <td>{{ cat.salesCount }}</td>
            <td>{{ cat.revenue | currency:'FCFA':'symbol':'1.0-0':'fr' }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  `,
  styles: [`
    .admin-title { font-size: 2rem; font-weight: bold; margin-bottom: 24px; color: #2563eb; }
    .stats-grid { display: flex; gap: 24px; flex-wrap: wrap; margin-bottom: 32px; }
    .stat-card { background: #fff; border-radius: 10px; box-shadow: 0 2px 8px rgba(0,0,0,0.04); padding: 24px 32px; min-width: 180px; flex: 1 1 180px; display: flex; flex-direction: column; align-items: flex-start; transition: box-shadow 0.2s; }
    .stat-card:hover { box-shadow: 0 4px 16px rgba(37,99,235,0.10); }
    .stat-label { color: #64748b; font-size: 1.1rem; margin-bottom: 8px; }
    .stat-value { color: #2563eb; font-size: 2.2rem; font-weight: bold; }
    .stats-section { background: #f5f7fa; border-radius: 10px; padding: 24px 18px; margin-bottom: 32px; box-shadow: 0 2px 8px rgba(0,0,0,0.03); }
    .stats-section-title { color: #2563eb; font-size: 1.3rem; margin-bottom: 18px; }
    .stats-chart-placeholder { background: #e0e7ff; color: #2563eb; border-radius: 8px; padding: 32px; text-align: center; font-size: 1.1rem; margin-bottom: 12px; }
    .admin-table { width: 100%; border-collapse: collapse; background: #fff; box-shadow: 0 2px 8px rgba(0,0,0,0.04); margin-top: 12px; }
    .admin-table th, .admin-table td { padding: 10px 8px; text-align: left; }
    .admin-table th { background: #f5f7fa; color: #2563eb; font-weight: 600; }
    .admin-table tr:nth-child(even) { background: #f8fafc; }
    .admin-table tr:hover { background: #e0e7ff; }
    @media (max-width: 900px) {
      .stats-grid { flex-direction: column; gap: 12px; }
      .stat-card { min-width: 100%; }
    }
  `]
})
export class AdminStats implements OnInit {
  totalCA = 0;
  totalOrders = 0;
  totalUsers = 0;
  totalProducts = 0;
  bestSellers: { name: string; qty: number; price: number }[] = [];
  monthlyOrders: { month: string; count: number }[] = [];
  categoryStats: { name: string; productCount: number; salesCount: number; revenue: number }[] = [];

  constructor(
    private orderService: OrderService,
    private userService: UserService,
    private productService: ProductService
  ) {}

  ngOnInit() {
    this.computeStats();
  }

  computeStats() {
    // Récupérer tous les utilisateurs
    this.totalUsers = this.userService.getUsers().length;
    
    // Récupérer tous les produits
    this.productService.getProducts().subscribe(products => {
      this.totalProducts = products.length;
    });

    // Récupérer toutes les commandes
    const allOrders: Order[] = [];
    const users = this.userService.getUsers();
    
    users.forEach(user => {
      const userOrders = this.orderService.getOrdersForUser(user.id);
      if (userOrders && Array.isArray(userOrders)) {
        allOrders.push(...userOrders);
      }
    });

    this.totalOrders = allOrders.length;
    this.totalCA = allOrders.reduce((sum, order) => sum + (order.total || 0), 0);

    // Calculer les meilleures ventes
    this.calculateBestSellers(allOrders);
    
    // Calculer les commandes par mois
    this.calculateMonthlyOrders(allOrders);
    
    // Calculer les statistiques par catégorie
    this.calculateCategoryStats(allOrders);
  }

  calculateBestSellers(orders: Order[]) {
    const productMap: { [name: string]: { qty: number; price: number } } = {};
    
    orders.forEach(order => {
      if (order.items && Array.isArray(order.items)) {
        order.items.forEach(item => {
          const name = item.product.name;
          if (!productMap[name]) {
            productMap[name] = { qty: 0, price: item.product.price };
          }
          productMap[name].qty += item.quantity || 1;
        });
      }
    });

    this.bestSellers = Object.entries(productMap)
      .map(([name, data]) => ({ name, qty: data.qty, price: data.price }))
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 10);
  }

  calculateMonthlyOrders(orders: Order[]) {
    const monthMap: { [month: string]: number } = {};
    
    orders.forEach(order => {
      if (order.date) {
        const date = new Date(order.date);
        const monthKey = `${date.getMonth() + 1}/${date.getFullYear()}`;
        monthMap[monthKey] = (monthMap[monthKey] || 0) + 1;
      }
    });

    this.monthlyOrders = Object.entries(monthMap)
      .map(([month, count]) => ({ month, count }))
      .sort((a, b) => {
        const [aMonth, aYear] = a.month.split('/').map(Number);
        const [bMonth, bYear] = b.month.split('/').map(Number);
        return aYear - bYear || aMonth - bMonth;
      });
  }

  calculateCategoryStats(orders: Order[]) {
    const categoryMap: { [name: string]: { productCount: number; salesCount: number; revenue: number } } = {};
    
    // Compter les produits par catégorie
    this.productService.getProducts().subscribe(products => {
      products.forEach(product => {
        if (!categoryMap[product.category]) {
          categoryMap[product.category] = { productCount: 0, salesCount: 0, revenue: 0 };
        }
        categoryMap[product.category].productCount++;
      });

      // Calculer les ventes par catégorie
      orders.forEach(order => {
        if (order.items && Array.isArray(order.items)) {
          order.items.forEach(item => {
            const category = item.product.category;
            if (categoryMap[category]) {
              categoryMap[category].salesCount += item.quantity || 1;
              categoryMap[category].revenue += (item.product.price * (item.quantity || 1));
            }
          });
        }
      });

      this.categoryStats = Object.entries(categoryMap)
        .map(([name, data]) => ({ name, ...data }))
        .sort((a, b) => b.revenue - a.revenue);
    });
  }
} 