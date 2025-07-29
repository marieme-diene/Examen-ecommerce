import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { NotificationService } from './notification.service';

export type OrderStatus = 'En attente' | 'Confirmée' | 'En cours de livraison' | 'Livrée' | 'Annulée';

export interface Order {
  id: number;
  userId: number;
  clientEmail: string;
  date: Date;
  status: OrderStatus;
  total: number;
  items: OrderItem[];
  trackingNumber?: string;
  address?: string;
  payment?: string;
}

export interface OrderItem {
  productId: number;
  name: string;
  quantity: number;
  price: number;
}

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private orders: Order[] = [];
  private readonly STORAGE_KEY = 'afrimarket_orders';

  constructor(private notificationService: NotificationService) {
    // Vérifier si on est côté client avant d'accéder à localStorage
    if (typeof window !== 'undefined' && window.localStorage) {
      // SUPPRESSION TOTALE AU DÉMARRAGE - FORCER LE NETTOYAGE
      this.nuclearCleanup();
      this.loadOrdersFromStorage();
    } else {
      // Côté serveur, initialiser avec un tableau vide
      this.orders = [];
    }
  }

  // Nettoyage nucléaire - supprime TOUT
  private nuclearCleanup() {
    try {
      // Vérifier si localStorage est disponible
      if (typeof window === 'undefined' || !window.localStorage) {
        console.log('localStorage non disponible (côté serveur)');
        return;
      }

      // Supprimer TOUTES les clés possibles
      const allKeys = Object.keys(localStorage);
      const orderKeys = allKeys.filter(key => 
        key.toLowerCase().includes('order') || 
        key.toLowerCase().includes('commande') ||
        key.toLowerCase().includes('afrimarket')
      );
      
      orderKeys.forEach(key => {
        localStorage.removeItem(key);
        console.log(`💥 NUCLÉAIRE: Supprimé ${key}`);
      });
      
      // Vider le tableau en mémoire
      this.orders = [];
      
      console.log('💥 NETTOYAGE NUCLÉAIRE EFFECTUÉ');
      console.log('💥 Toutes les données de commandes supprimées définitivement');
      
    } catch (error) {
      console.error('Erreur lors du nettoyage nucléaire:', error);
    }
  }

  private loadOrdersFromStorage() {
    try {
      // Vérifier si localStorage est disponible
      if (typeof window === 'undefined' || !window.localStorage) {
        console.log('localStorage non disponible (côté serveur)');
        this.orders = [];
        return;
      }

      const storedOrders = localStorage.getItem('afrimarket_orders');
      if (storedOrders) {
        this.orders = JSON.parse(storedOrders);
        console.log('📦 Commandes chargées depuis localStorage:', this.orders.length);
      } else {
        this.orders = [];
        console.log('📦 Aucune commande trouvée dans localStorage');
      }
    } catch (error) {
      console.error('Erreur lors du chargement des commandes:', error);
      this.orders = [];
    }
  }

  private initializeDefaultOrders() {
    // Ne plus initialiser de commandes par défaut
    this.orders = [];
    this.saveOrdersToStorage();
  }

  private saveOrdersToStorage() {
    try {
      // Vérifier si localStorage est disponible
      if (typeof window === 'undefined' || !window.localStorage) {
        console.log('localStorage non disponible (côté serveur)');
        return;
      }

      localStorage.setItem('afrimarket_orders', JSON.stringify(this.orders));
      console.log('💾 Commandes sauvegardées dans localStorage:', this.orders.length);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des commandes:', error);
    }
  }

  private cleanupDefaultOrders() {
    const initialCount = this.orders.length;
    // Supprimer les commandes avec userId: 2 (anciennes commandes par défaut)
    this.orders = this.orders.filter(order => order.userId !== 2);
    
    if (this.orders.length < initialCount) {
      this.saveOrdersToStorage();
      console.log(`Nettoyage effectué: ${initialCount - this.orders.length} anciennes commandes supprimées`);
    }
  }

  private clearAllOrdersFromStorage() {
    try {
      // Supprimer complètement toutes les commandes du localStorage
      localStorage.removeItem('afrimarket_orders');
      console.log('✅ Toutes les anciennes commandes supprimées du localStorage');
      console.log('✅ Chaque client aura maintenant son propre historique');
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
    }
  }

  // Méthode pour s'assurer qu'un client ne voit que ses propres commandes
  getOrdersForUser(userId: number): Observable<Order[]> {
    // FORCER LE NETTOYAGE AVANT DE FILTRER
    this.ultraForceCleanup();
    this.loadOrdersFromStorage();
    
    // Filtrer strictement par userId pour éviter les commandes d'autres clients
    const userOrders = this.orders.filter(order => order.userId === userId);
    console.log(`🔒 Commandes filtrées pour l'utilisateur ${userId}:`, userOrders.length, 'commandes');
    console.log('🔒 Chaque client voit uniquement ses propres commandes');
    return of(userOrders);
  }

  // Méthode pour forcer le nettoyage complet
  forceCleanup(): void {
    this.ultraForceCleanup();
    this.loadOrdersFromStorage();
    console.log('🧹 FORCE CLEANUP: Nettoyage complet effectué');
  }

  // Pour les admins : obtenir toutes les commandes
  getAllOrders(): Observable<Order[]> {
    return of(this.orders);
  }

  // Créer une nouvelle commande
  createOrder(orderData: Partial<Order>): Observable<Order> {
    const newOrder: Order = {
      id: Date.now(),
      userId: orderData.userId!,
      clientEmail: orderData.clientEmail!,
      date: new Date(),
      status: 'En attente',
      total: orderData.total!,
      items: orderData.items!,
      address: orderData.address,
      payment: orderData.payment
    };

    this.orders.push(newOrder);
    this.saveOrdersToStorage();

    // Envoyer email de confirmation
    this.notificationService.sendOrderConfirmationEmail(
      newOrder.clientEmail, 
      newOrder.id, 
      newOrder
    );

    console.log('Nouvelle commande créée:', newOrder);
    console.log('Total des commandes:', this.orders.length);

    return of(newOrder);
  }

  // Mettre à jour le statut d'une commande (admin)
  updateOrderStatus(userId: number, orderId: number, newStatus: OrderStatus, trackingNumber?: string): Observable<Order | null> {
    const order = this.orders.find(o => o.id === orderId && o.userId === userId);
    if (order) {
      order.status = newStatus;
      if (trackingNumber) {
        order.trackingNumber = trackingNumber;
      }

      this.saveOrdersToStorage();

      // Envoyer emails selon le statut
      if (newStatus === 'En cours de livraison' && order.trackingNumber) {
        this.notificationService.sendShippingEmail(
          order.clientEmail, 
          order.id, 
          order.trackingNumber
        );
      } else if (newStatus === 'Livrée') {
        this.notificationService.sendDeliveryEmail(
          order.clientEmail, 
          order.id
        );
      }
      return of(order);
    }
    return of(null);
  }

  // Annuler une commande (admin)
  cancelOrder(orderId: number): Observable<Order | null> {
    const order = this.orders.find(o => o.id === orderId);
    if (order) {
      order.status = 'Annulée';
      this.saveOrdersToStorage();
      this.notificationService.showMessage(`Commande #${orderId} annulée`, 'info');
      return of(order);
    }
    return of(null);
  }

  // Obtenir les statistiques (admin)
  getOrderStatistics(): Observable<any> {
    const stats = {
      total: this.orders.length,
      pending: this.orders.filter(o => o.status === 'En attente').length,
      confirmed: this.orders.filter(o => o.status === 'Confirmée').length,
      shipping: this.orders.filter(o => o.status === 'En cours de livraison').length,
      delivered: this.orders.filter(o => o.status === 'Livrée').length,
      cancelled: this.orders.filter(o => o.status === 'Annulée').length,
      totalRevenue: this.orders
        .filter(o => o.status === 'Livrée')
        .reduce((sum, order) => sum + order.total, 0)
    };
    return of(stats);
  }

  // Méthode pour forcer le rechargement des commandes
  refreshOrders(): void {
    this.loadOrdersFromStorage();
  }

  // Méthode pour nettoyer les anciennes commandes par défaut
  clearDefaultOrders(): void {
    // Supprimer les commandes avec userId: 2 (anciennes commandes par défaut)
    this.orders = this.orders.filter(order => order.userId !== 2);
    this.saveOrdersToStorage();
    console.log('Anciennes commandes par défaut supprimées');
  }

  // Méthode de nettoyage ultra-agressive
  ultraForceCleanup(): void {
    try {
      // Vérifier si localStorage est disponible
      if (typeof window === 'undefined' || !window.localStorage) {
        console.log('localStorage non disponible (côté serveur)');
        this.orders = [];
        return;
      }

      // Supprimer TOUTES les clés possibles liées aux commandes
      const keysToRemove = [
        'afrimarket_orders',
        'afrimarket_orders_backup', 
        'orders',
        'user_orders',
        'client_orders',
        'order_data',
        'shopping_orders',
        'ecommerce_orders'
      ];
      
      keysToRemove.forEach(key => {
        localStorage.removeItem(key);
        console.log(`🗑️ Supprimé: ${key}`);
      });
      
      // Vider le tableau en mémoire
      this.orders = [];
      
      // Forcer la sauvegarde d'un tableau vide
      this.saveOrdersToStorage();
      
      console.log('🔥 ULTRA FORCE CLEANUP: Nettoyage ultra-agressif effectué');
      console.log('🔥 Toutes les données de commandes supprimées');
      
    } catch (error) {
      console.error('Erreur lors du nettoyage ultra-agressif:', error);
    }
  }
} 