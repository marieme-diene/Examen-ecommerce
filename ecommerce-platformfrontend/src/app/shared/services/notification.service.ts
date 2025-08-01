import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  category: 'order' | 'product' | 'promotion' | 'system';
  read: boolean;
  createdAt: Date;
  actionUrl?: string;
}

export interface NotificationCounts {
  total: number;
  unread: number;
  byCategory: Record<string, number>;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private readonly NOTIFICATIONS_KEY = 'afrimarket_notifications';
  
  private notificationsSubject = new BehaviorSubject<Notification[]>([]);
  public notifications$ = this.notificationsSubject.asObservable();
  
  private countsSubject = new BehaviorSubject<NotificationCounts>({
    total: 0,
    unread: 0,
    byCategory: {}
  });
  public counts$ = this.countsSubject.asObservable();

  constructor() {
    this.loadNotifications();
  }

  private loadNotifications(): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      const savedNotifications = localStorage.getItem(this.NOTIFICATIONS_KEY);
      if (savedNotifications) {
        const notifications = JSON.parse(savedNotifications).map((n: any) => ({
          ...n,
          createdAt: new Date(n.createdAt)
        }));
        this.notificationsSubject.next(notifications);
        this.updateCounts();
      }
    }
  }

  private saveNotifications(notifications: Notification[]): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(this.NOTIFICATIONS_KEY, JSON.stringify(notifications));
    }
  }

  private updateCounts(): void {
    const notifications = this.notificationsSubject.value;
    const unread = notifications.filter(n => !n.read).length;
    
    const byCategory: Record<string, number> = {};
    notifications.forEach(n => {
      byCategory[n.category] = (byCategory[n.category] || 0) + 1;
    });

    this.countsSubject.next({
      total: notifications.length,
      unread,
      byCategory
    });
  }

  addNotification(notification: Omit<Notification, 'id' | 'read' | 'createdAt'>): void {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      read: false,
      createdAt: new Date()
    };

    const currentNotifications = this.notificationsSubject.value;
    const updatedNotifications = [newNotification, ...currentNotifications];
    
    this.notificationsSubject.next(updatedNotifications);
    this.saveNotifications(updatedNotifications);
    this.updateCounts();
  }

  markAsRead(notificationId: string): void {
    const currentNotifications = this.notificationsSubject.value;
    const updatedNotifications = currentNotifications.map(n => 
      n.id === notificationId ? { ...n, read: true } : n
    );
    
    this.notificationsSubject.next(updatedNotifications);
    this.saveNotifications(updatedNotifications);
    this.updateCounts();
  }

  markAllAsRead(): void {
    const currentNotifications = this.notificationsSubject.value;
    const updatedNotifications = currentNotifications.map(n => ({ ...n, read: true }));
    
    this.notificationsSubject.next(updatedNotifications);
    this.saveNotifications(updatedNotifications);
    this.updateCounts();
  }

  deleteNotification(notificationId: string): void {
    const currentNotifications = this.notificationsSubject.value;
    const updatedNotifications = currentNotifications.filter(n => n.id !== notificationId);
    
    this.notificationsSubject.next(updatedNotifications);
    this.saveNotifications(updatedNotifications);
    this.updateCounts();
  }

  clearAllNotifications(): void {
    this.notificationsSubject.next([]);
    this.saveNotifications([]);
    this.updateCounts();
  }

  getUnreadCount(): number {
    return this.notificationsSubject.value.filter(n => !n.read).length;
  }

  getNotificationsByCategory(category: string): Notification[] {
    return this.notificationsSubject.value.filter(n => n.category === category);
  }

  // Méthodes spécifiques pour les commandes
  notifyOrderStatus(orderNumber: string, status: string): void {
    const statusLabels: Record<string, string> = {
      'confirmed': 'confirmée',
      'processing': 'en cours de traitement',
      'shipped': 'expédiée',
      'delivered': 'livrée',
      'cancelled': 'annulée'
    };

    this.addNotification({
      type: 'info',
      title: `Commande #${orderNumber}`,
      message: `Votre commande a été ${statusLabels[status] || status}`,
      category: 'order',
      actionUrl: `/account/orders`
    });
  }

  notifyOrderCreated(orderNumber: string): void {
    this.addNotification({
      type: 'success',
      title: 'Commande créée',
      message: `Votre commande #${orderNumber} a été créée avec succès`,
      category: 'order',
      actionUrl: `/account/orders`
    });
  }

  notifyPromotionApplied(promotionName: string): void {
    this.addNotification({
      type: 'success',
      title: 'Promotion appliquée',
      message: `La promotion "${promotionName}" a été appliquée à votre panier`,
      category: 'promotion'
    });
  }

  notifyProductBackInStock(productName: string): void {
    this.addNotification({
      type: 'info',
      title: 'Produit disponible',
      message: `Le produit "${productName}" est de nouveau en stock`,
      category: 'product',
      actionUrl: `/catalog`
    });
  }
} 