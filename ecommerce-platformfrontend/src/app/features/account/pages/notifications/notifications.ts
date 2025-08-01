import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';
import { NotificationService } from '../../../../shared/services/notification.service';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  category: 'order' | 'product' | 'system' | 'promotion';
  read: boolean;
  timestamp: Date;
  action?: {
    label: string;
    url: string;
    callback?: () => void;
  };
}

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatTabsModule,
    MatChipsModule,
    MatMenuModule
  ],
  template: `
    <div class="notifications-container">
      <!-- En-tête -->
      <div class="notifications-header">
        <h1>🔔 Centre de notifications</h1>
        <div class="header-actions">
          <button mat-stroked-button (click)="markAllAsRead()" [disabled]="unreadCount === 0">
            <mat-icon>mark_email_read</mat-icon>
            Tout marquer comme lu
          </button>
          <button mat-stroked-button (click)="clearAllNotifications()" [disabled]="totalCount === 0">
            <mat-icon>delete_sweep</mat-icon>
            Tout effacer
          </button>
        </div>
      </div>

      <!-- Statistiques -->
      <div class="notification-stats">
        <div class="stat-card">
          <div class="stat-number">{{ totalCount }}</div>
          <div class="stat-label">Total</div>
        </div>
        <div class="stat-card unread">
          <div class="stat-number">{{ unreadCount }}</div>
          <div class="stat-label">Non lues</div>
        </div>
        <div class="stat-card">
          <div class="stat-number">{{ orderCount }}</div>
          <div class="stat-label">Commandes</div>
        </div>
        <div class="stat-card">
          <div class="stat-number">{{ productCount }}</div>
          <div class="stat-label">Produits</div>
        </div>
      </div>

      <!-- Onglets -->
      <mat-tab-group (selectedTabChange)="onTabChange($event)">
        <mat-tab label="Toutes" value="all">
          <div class="notifications-list">
            <div *ngIf="allNotifications.length === 0" class="no-notifications">
              <mat-icon>notifications_off</mat-icon>
              <h3>Aucune notification</h3>
              <p>Vous n'avez pas encore reçu de notifications</p>
            </div>
            
            <div *ngFor="let notification of allNotifications" 
                 class="notification-item"
                 [class.unread]="!notification.read">
              <div class="notification-content">
                <div class="notification-icon">
                  <mat-icon [class]="getNotificationIconClass(notification.type)">
                    {{ getNotificationIcon(notification.type) }}
                  </mat-icon>
                </div>
                
                <div class="notification-details">
                  <div class="notification-header">
                    <h3 class="notification-title">{{ notification.title }}</h3>
                    <div class="notification-meta">
                      <span class="notification-time">{{ getTimeAgo(notification.timestamp) }}</span>
                      <mat-chip-set>
                        <mat-chip [class]="'category-' + notification.category">
                          {{ getCategoryLabel(notification.category) }}
                        </mat-chip>
                      </mat-chip-set>
                    </div>
                  </div>
                  
                  <p class="notification-message">{{ notification.message }}</p>
                  
                  <div class="notification-actions" *ngIf="notification.action">
                    <button mat-stroked-button 
                            [routerLink]="notification.action.url"
                            (click)="executeAction(notification)">
                      {{ notification.action.label }}
                    </button>
                  </div>
                </div>
              </div>
              
              <div class="notification-actions-menu">
                <button mat-icon-button [matMenuTriggerFor]="actionMenu">
                  <mat-icon>more_vert</mat-icon>
                </button>
                <mat-menu #actionMenu="matMenu">
                  <button mat-menu-item 
                          (click)="markAsRead(notification.id)"
                          *ngIf="!notification.read">
                    <mat-icon>mark_email_read</mat-icon>
                    Marquer comme lu
                  </button>
                  <button mat-menu-item (click)="deleteNotification(notification.id)">
                    <mat-icon>delete</mat-icon>
                    Supprimer
                  </button>
                </mat-menu>
              </div>
            </div>
          </div>
        </mat-tab>

        <mat-tab label="Non lues" value="unread">
          <div class="notifications-list">
            <div *ngIf="unreadNotifications.length === 0" class="no-notifications">
              <mat-icon>mark_email_read</mat-icon>
              <h3>Aucune notification non lue</h3>
              <p>Toutes vos notifications ont été lues</p>
            </div>
            
            <div *ngFor="let notification of unreadNotifications" 
                 class="notification-item unread">
              <!-- Même contenu que pour toutes les notifications -->
              <div class="notification-content">
                <div class="notification-icon">
                  <mat-icon [class]="getNotificationIconClass(notification.type)">
                    {{ getNotificationIcon(notification.type) }}
                  </mat-icon>
                </div>
                
                <div class="notification-details">
                  <div class="notification-header">
                    <h3 class="notification-title">{{ notification.title }}</h3>
                    <div class="notification-meta">
                      <span class="notification-time">{{ getTimeAgo(notification.timestamp) }}</span>
                      <mat-chip-set>
                        <mat-chip [class]="'category-' + notification.category">
                          {{ getCategoryLabel(notification.category) }}
                        </mat-chip>
                      </mat-chip-set>
                    </div>
                  </div>
                  
                  <p class="notification-message">{{ notification.message }}</p>
                  
                  <div class="notification-actions" *ngIf="notification.action">
                    <button mat-stroked-button 
                            [routerLink]="notification.action.url"
                            (click)="executeAction(notification)">
                      {{ notification.action.label }}
                    </button>
                  </div>
                </div>
              </div>
              
              <div class="notification-actions-menu">
                <button mat-icon-button [matMenuTriggerFor]="actionMenu">
                  <mat-icon>more_vert</mat-icon>
                </button>
                <mat-menu #actionMenu="matMenu">
                  <button mat-menu-item (click)="markAsRead(notification.id)">
                    <mat-icon>mark_email_read</mat-icon>
                    Marquer comme lu
                  </button>
                  <button mat-menu-item (click)="deleteNotification(notification.id)">
                    <mat-icon>delete</mat-icon>
                    Supprimer
                  </button>
                </mat-menu>
              </div>
            </div>
          </div>
        </mat-tab>

        <mat-tab label="Commandes" value="orders">
          <div class="notifications-list">
            <div *ngIf="orderNotifications.length === 0" class="no-notifications">
              <mat-icon>local_shipping</mat-icon>
              <h3>Aucune notification de commande</h3>
              <p>Vous n'avez pas encore reçu de notifications concernant vos commandes</p>
            </div>
            
            <div *ngFor="let notification of orderNotifications" 
                 class="notification-item"
                 [class.unread]="!notification.read">
              <!-- Même contenu -->
            </div>
          </div>
        </mat-tab>

        <mat-tab label="Produits" value="products">
          <div class="notifications-list">
            <div *ngIf="productNotifications.length === 0" class="no-notifications">
              <mat-icon>inventory</mat-icon>
              <h3>Aucune notification de produit</h3>
              <p>Vous n'avez pas encore reçu de notifications concernant les produits</p>
            </div>
            
            <div *ngFor="let notification of productNotifications" 
                 class="notification-item"
                 [class.unread]="!notification.read">
              <!-- Même contenu -->
            </div>
          </div>
        </mat-tab>
      </mat-tab-group>
    </div>
  `,
  styles: [`
    .notifications-container {
      max-width: 800px;
      margin: 0 auto;
      padding: 24px;
    }

    .notifications-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
    }

    .notifications-header h1 {
      margin: 0;
      color: #333;
    }

    .header-actions {
      display: flex;
      gap: 12px;
    }

    .notification-stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
      gap: 16px;
      margin-bottom: 24px;
    }

    .stat-card {
      background: white;
      padding: 16px;
      border-radius: 8px;
      text-align: center;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      border: 1px solid #e0e0e0;
    }

    .stat-card.unread {
      background: #e3f2fd;
      border-color: #2196f3;
    }

    .stat-number {
      font-size: 24px;
      font-weight: bold;
      color: #333;
    }

    .stat-label {
      font-size: 12px;
      color: #666;
      margin-top: 4px;
    }

    .notifications-list {
      margin-top: 16px;
    }

    .no-notifications {
      text-align: center;
      padding: 48px 24px;
      color: #666;
    }

    .no-notifications mat-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      margin-bottom: 16px;
      opacity: 0.5;
    }

    .no-notifications h3 {
      margin: 0 0 8px 0;
      color: #333;
    }

    .notification-item {
      display: flex;
      align-items: flex-start;
      background: white;
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      margin-bottom: 12px;
      transition: all 0.2s;
    }

    .notification-item:hover {
      box-shadow: 0 4px 8px rgba(0,0,0,0.1);
    }

    .notification-item.unread {
      background: #e3f2fd;
      border-color: #2196f3;
    }

    .notification-content {
      display: flex;
      flex: 1;
      padding: 16px;
    }

    .notification-icon {
      margin-right: 16px;
      margin-top: 4px;
    }

    .notification-icon mat-icon {
      font-size: 24px;
      width: 24px;
      height: 24px;
    }

    .notification-icon .success {
      color: #4caf50;
    }

    .notification-icon .error {
      color: #f44336;
    }

    .notification-icon .warning {
      color: #ff9800;
    }

    .notification-icon .info {
      color: #2196f3;
    }

    .notification-details {
      flex: 1;
    }

    .notification-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 8px;
    }

    .notification-title {
      margin: 0;
      font-size: 16px;
      font-weight: 500;
      color: #333;
    }

    .notification-meta {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .notification-time {
      font-size: 12px;
      color: #999;
    }

    .notification-message {
      margin: 0 0 12px 0;
      color: #666;
      line-height: 1.5;
    }

    .notification-actions {
      margin-top: 8px;
    }

    .notification-actions-menu {
      padding: 8px;
    }

    .category-order {
      background: #e3f2fd;
      color: #1976d2;
    }

    .category-product {
      background: #e8f5e8;
      color: #388e3c;
    }

    .category-system {
      background: #fff3e0;
      color: #f57c00;
    }

    .category-promotion {
      background: #fce4ec;
      color: #c2185b;
    }

    @media (max-width: 768px) {
      .notifications-container {
        padding: 16px;
      }

      .notifications-header {
        flex-direction: column;
        gap: 16px;
        align-items: stretch;
      }

      .header-actions {
        justify-content: center;
      }

      .notification-stats {
        grid-template-columns: repeat(2, 1fr);
      }

      .notification-header {
        flex-direction: column;
        gap: 8px;
      }
    }
  `]
})
export class Notifications implements OnInit {
  allNotifications: Notification[] = [];
  unreadNotifications: Notification[] = [];
  orderNotifications: Notification[] = [];
  productNotifications: Notification[] = [];

  totalCount = 0;
  unreadCount = 0;
  orderCount = 0;
  productCount = 0;

  constructor(private notificationService: NotificationService) {}

  ngOnInit() {
    this.loadNotifications();
    this.loadCounts();
  }

  loadNotifications() {
    this.notificationService.notifications$.subscribe((notifications: any[]) => {
      this.allNotifications = notifications;
      this.unreadNotifications = notifications.filter((n: any) => !n.read);
      this.orderNotifications = notifications.filter((n: any) => n.category === 'order');
      this.productNotifications = notifications.filter((n: any) => n.category === 'product');
    });
  }

  loadCounts() {
    this.notificationService.counts$.subscribe((counts: any) => {
      this.totalCount = counts.total;
      this.unreadCount = counts.unread;
      this.orderCount = counts.byCategory.order;
      this.productCount = counts.byCategory.product;
    });
  }

  onTabChange(event: any) {
    // Gérer le changement d'onglet si nécessaire
  }

  markAsRead(notificationId: string) {
    this.notificationService.markAsRead(notificationId);
  }

  markAllAsRead() {
    this.notificationService.markAllAsRead();
  }

  deleteNotification(notificationId: string) {
    this.notificationService.deleteNotification(notificationId);
  }

  clearAllNotifications() {
    if (confirm('Êtes-vous sûr de vouloir effacer toutes les notifications ?')) {
      this.notificationService.clearAllNotifications();
    }
  }

  executeAction(notification: Notification) {
    this.notificationService.markAsRead(notification.id);
    if (notification.action?.callback) {
      notification.action.callback();
    }
  }

  getNotificationIcon(type: string): string {
    switch (type) {
      case 'success': return 'check_circle';
      case 'error': return 'error';
      case 'warning': return 'warning';
      case 'info': return 'info';
      default: return 'notifications';
    }
  }

  getNotificationIconClass(type: string): string {
    return type;
  }

  getCategoryLabel(category: string): string {
    switch (category) {
      case 'order': return 'Commande';
      case 'product': return 'Produit';
      case 'system': return 'Système';
      case 'promotion': return 'Promotion';
      default: return category;
    }
  }

  getTimeAgo(timestamp: Date): string {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'À l\'instant';
    if (minutes < 60) return `Il y a ${minutes} min`;
    if (hours < 24) return `Il y a ${hours}h`;
    if (days < 7) return `Il y a ${days}j`;
    return timestamp.toLocaleDateString();
  }
} 