import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { NotificationService, NotificationCounts } from '../../services/notification.service';

@Component({
  selector: 'app-notification-badge',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatBadgeModule,
    MatButtonModule,
    MatMenuModule
  ],
  template: `
    <button 
      mat-icon-button 
      [matMenuTriggerFor]="notificationMenu"
      class="notification-btn"
      (click)="onNotificationClick()">
      
      <mat-icon [matBadge]="unreadCount" 
                matBadgeColor="warn"
                [matBadgeHidden]="unreadCount === 0">
        notifications
      </mat-icon>
    </button>

    <mat-menu #notificationMenu="matMenu" class="notification-menu">
      <div class="notification-header">
        <h3>Notifications</h3>
        <div class="notification-actions">
          <button mat-button 
                  (click)="markAllAsRead()"
                  [disabled]="unreadCount === 0">
            Tout marquer comme lu
          </button>
          <button mat-button 
                  (click)="clearAllNotifications()"
                  [disabled]="totalCount === 0">
            Tout effacer
          </button>
        </div>
      </div>

      <div class="notification-content">
        <div *ngIf="totalCount === 0" class="no-notifications">
          <mat-icon>notifications_off</mat-icon>
          <p>Aucune notification</p>
        </div>

        <div *ngIf="totalCount > 0" class="notification-list">
          <div *ngFor="let notification of recentNotifications" 
               class="notification-item"
               [class.unread]="!notification.read"
               (click)="onNotificationItemClick(notification)">
            
            <div class="notification-icon">
              <mat-icon [class]="getNotificationIconClass(notification.type)">
                {{ getNotificationIcon(notification.type) }}
              </mat-icon>
            </div>
            
            <div class="notification-content">
              <div class="notification-title">{{ notification.title }}</div>
              <div class="notification-message">{{ notification.message }}</div>
              <div class="notification-time">
                {{ getTimeAgo(notification.timestamp) }}
              </div>
            </div>
            
            <div class="notification-actions">
              <button mat-icon-button 
                      (click)="deleteNotification(notification.id, $event)"
                      class="delete-btn">
                <mat-icon>close</mat-icon>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="notification-footer" *ngIf="totalCount > 0">
        <button mat-button routerLink="/notifications" class="view-all-btn">
          Voir toutes les notifications
        </button>
      </div>
    </mat-menu>
  `,
  styles: [`
    .notification-btn {
      position: relative;
    }

    .notification-menu {
      min-width: 400px;
      max-width: 500px;
    }

    .notification-header {
      padding: 16px;
      border-bottom: 1px solid #e0e0e0;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .notification-header h3 {
      margin: 0;
      font-size: 16px;
      font-weight: 500;
    }

    .notification-actions {
      display: flex;
      gap: 8px;
    }

    .notification-actions button {
      font-size: 12px;
      padding: 4px 8px;
      min-width: auto;
    }

    .notification-content {
      max-height: 400px;
      overflow-y: auto;
    }

    .no-notifications {
      padding: 32px 16px;
      text-align: center;
      color: #666;
    }

    .no-notifications mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      margin-bottom: 16px;
      opacity: 0.5;
    }

    .notification-list {
      padding: 0;
    }

    .notification-item {
      display: flex;
      align-items: flex-start;
      padding: 12px 16px;
      border-bottom: 1px solid #f0f0f0;
      cursor: pointer;
      transition: background-color 0.2s;
    }

    .notification-item:hover {
      background-color: #f5f5f5;
    }

    .notification-item.unread {
      background-color: #e3f2fd;
    }

    .notification-item.unread:hover {
      background-color: #bbdefb;
    }

    .notification-icon {
      margin-right: 12px;
      margin-top: 2px;
    }

    .notification-icon mat-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
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

    .notification-content {
      flex: 1;
      min-width: 0;
    }

    .notification-title {
      font-weight: 500;
      font-size: 14px;
      margin-bottom: 4px;
      color: #333;
    }

    .notification-message {
      font-size: 13px;
      color: #666;
      margin-bottom: 4px;
      line-height: 1.4;
    }

    .notification-time {
      font-size: 11px;
      color: #999;
    }

    .notification-actions {
      margin-left: 8px;
    }

    .delete-btn {
      opacity: 0;
      transition: opacity 0.2s;
    }

    .notification-item:hover .delete-btn {
      opacity: 1;
    }

    .notification-footer {
      padding: 12px 16px;
      border-top: 1px solid #e0e0e0;
      text-align: center;
    }

    .view-all-btn {
      width: 100%;
    }

    @media (max-width: 768px) {
      .notification-menu {
        min-width: 300px;
        max-width: 350px;
      }
    }
  `]
})
export class NotificationBadge implements OnInit {
  @Output() notificationClick = new EventEmitter<void>();

  unreadCount = 0;
  totalCount = 0;
  recentNotifications: any[] = [];

  constructor(private notificationService: NotificationService) {}

  ngOnInit() {
    // S'abonner aux changements de compteurs
    this.notificationService.counts$.subscribe(counts => {
      this.unreadCount = counts.unread;
      this.totalCount = counts.total;
    });

    // S'abonner aux notifications pour afficher les plus récentes
    this.notificationService.notifications$.subscribe(notifications => {
      this.recentNotifications = notifications.slice(0, 5); // 5 plus récentes
    });
  }

  onNotificationClick() {
    this.notificationClick.emit();
  }

  onNotificationItemClick(notification: any) {
    this.notificationService.markAsRead(notification.id);
    
    // Exécuter l'action si définie
    if (notification.action?.callback) {
      notification.action.callback();
    }
  }

  markAllAsRead() {
    this.notificationService.markAllAsRead();
  }

  clearAllNotifications() {
    if (confirm('Êtes-vous sûr de vouloir effacer toutes les notifications ?')) {
      this.notificationService.clearAllNotifications();
    }
  }

  deleteNotification(notificationId: string, event: Event) {
    event.stopPropagation();
    this.notificationService.deleteNotification(notificationId);
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