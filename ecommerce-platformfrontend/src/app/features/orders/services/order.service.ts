import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { Order, OrderStatus, PaymentStatus, OrderCreateRequest, OrderUpdateRequest, OrderSummary, OrderFilters } from '../models/order.model';
import { CartItem } from '../../cart/models/cart-item.model';
import { Promotion } from '../../promotions/models/promotion.model';
import { AuthService } from '../../account/services/auth.service';
import { NotificationService } from '../../../shared/services/notification.service';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private readonly ORDERS_KEY = 'afrimarket_orders';
  private readonly ADDRESSES_KEY = 'afrimarket_addresses';
  
  private ordersSubject = new BehaviorSubject<Order[]>([]);
  public orders$ = this.ordersSubject.asObservable();
  
  private addressesSubject = new BehaviorSubject<any[]>([]);
  public addresses$ = this.addressesSubject.asObservable();

  constructor(
    private authService: AuthService,
    private notificationService: NotificationService
  ) {
    this.loadOrders();
    this.loadAddresses();
  }

  // Charger les commandes depuis localStorage
  private loadOrders(): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      const savedOrders = localStorage.getItem(this.ORDERS_KEY);
      if (savedOrders) {
        const orders = JSON.parse(savedOrders).map((order: any) => ({
          ...order,
          createdAt: new Date(order.createdAt),
          updatedAt: new Date(order.updatedAt),
          estimatedDelivery: order.estimatedDelivery ? new Date(order.estimatedDelivery) : undefined,
          deliveredAt: order.deliveredAt ? new Date(order.deliveredAt) : undefined
        }));
        this.ordersSubject.next(orders);
      }
    }
  }

  // Sauvegarder les commandes dans localStorage
  private saveOrders(orders: Order[]): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(this.ORDERS_KEY, JSON.stringify(orders));
    }
  }

  // Charger les adresses depuis localStorage
  private loadAddresses(): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      const savedAddresses = localStorage.getItem(this.ADDRESSES_KEY);
      if (savedAddresses) {
        const addresses = JSON.parse(savedAddresses);
        this.addressesSubject.next(addresses);
      }
    }
  }

  // Sauvegarder les adresses dans localStorage
  private saveAddresses(addresses: any[]): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(this.ADDRESSES_KEY, JSON.stringify(addresses));
    }
  }

  // Créer une nouvelle commande
  createOrder(orderRequest: OrderCreateRequest): Observable<Order> {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      throw new Error('Utilisateur non connecté');
    }

    const orderNumber = this.generateOrderNumber();
    const now = new Date();
    
    // Calculer les montants
    const subtotal = orderRequest.items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
    const discountAmount = orderRequest.appliedPromotions.reduce((sum, promo) => {
      if (promo.type === 'percentage') {
        return sum + (subtotal * promo.value / 100);
      } else if (promo.type === 'fixed') {
        return sum + promo.value;
      } else if (promo.type === 'free_shipping') {
        return sum + 2000; // Coût de livraison estimé
      }
      return sum;
    }, 0);
    
    const shippingCost = orderRequest.appliedPromotions.some(p => p.type === 'free_shipping') ? 0 : 2000;
    const taxAmount = (subtotal - discountAmount) * 0.18; // TVA 18%
    const totalAmount = subtotal - discountAmount + shippingCost + taxAmount;

    // Créer les éléments de commande
    const orderItems = orderRequest.items.map((item, index) => ({
      id: index + 1,
      productId: item.product.id,
      productName: item.product.name,
      productImage: item.product.image,
      price: item.product.price,
      quantity: item.quantity,
      subtotal: item.product.price * item.quantity,
      category: item.product.category
    }));

    // Déterminer le statut de paiement selon le mode de paiement
    let paymentStatus: PaymentStatus = 'pending';
    let orderStatus: OrderStatus = 'pending';
    
    // Tous les paiements sont en attente par défaut
    paymentStatus = 'pending';
    orderStatus = 'pending';

    const newOrder: Order = {
      id: Date.now().toString(),
      userId: currentUser.id,
      orderNumber,
      status: orderStatus,
      items: orderItems,
      subtotal,
      discountAmount,
      shippingCost,
      taxAmount,
      totalAmount,
      appliedPromotions: orderRequest.appliedPromotions,
      shippingAddress: orderRequest.shippingAddress,
      billingAddress: orderRequest.billingAddress,
      paymentMethod: orderRequest.paymentMethod,
      paymentStatus: paymentStatus,
      createdAt: now,
      updatedAt: now,
      estimatedDelivery: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000), // 7 jours
      notes: orderRequest.notes
    };

    // Ajouter la commande
    const currentOrders = this.ordersSubject.value;
    const updatedOrders = [newOrder, ...currentOrders];
    this.ordersSubject.next(updatedOrders);
    this.saveOrders(updatedOrders);

    // Sauvegarder l'adresse si elle n'existe pas
    this.saveAddressIfNew(orderRequest.shippingAddress);

    // Notification
    this.notificationService.addNotification({
      type: 'success',
      title: 'Commande créée',
      message: `Votre commande #${orderNumber} a été créée avec succès`,
      category: 'order'
    });

    return of(newOrder);
  }

  // Obtenir toutes les commandes d'un utilisateur
  getUserOrders(userId: number): Observable<Order[]> {
    return this.orders$.pipe(
      map(orders => orders.filter(order => order.userId === userId))
    );
  }

  // Obtenir toutes les commandes (pour l'admin)
  getAllOrders(): Observable<Order[]> {
    return this.orders$;
  }

  // Obtenir une commande par ID
  getOrderById(orderId: string): Observable<Order | null> {
    return this.orders$.pipe(
      map(orders => orders.find(order => order.id === orderId) || null)
    );
  }

  // Obtenir une commande par numéro
  getOrderByNumber(orderNumber: string): Observable<Order | null> {
    return this.orders$.pipe(
      map(orders => orders.find(order => order.orderNumber === orderNumber) || null)
    );
  }

  // Mettre à jour le statut d'une commande
  updateOrderStatus(orderId: string, status: OrderStatus, notes?: string): Observable<Order | null> {
    const currentOrders = this.ordersSubject.value;
    const orderIndex = currentOrders.findIndex(order => order.id === orderId);
    
    if (orderIndex === -1) {
      return of(null);
    }

    const updatedOrder: Order = {
      ...currentOrders[orderIndex],
      status: status as OrderStatus,
      updatedAt: new Date(),
      notes: notes || currentOrders[orderIndex].notes
    };

    const updatedOrders = [...currentOrders];
    updatedOrders[orderIndex] = updatedOrder;
    
    this.ordersSubject.next(updatedOrders);
    this.saveOrders(updatedOrders);

    // Notification de changement de statut
    this.notificationService.notifyOrderStatus(updatedOrder.orderNumber, status);

    return of(updatedOrder);
  }

  // Mettre à jour le statut de paiement
  updatePaymentStatus(orderId: string, paymentStatus: PaymentStatus): Observable<Order | null> {
    const currentOrders = this.ordersSubject.value;
    const orderIndex = currentOrders.findIndex(order => order.id === orderId);
    
    if (orderIndex === -1) {
      return of(null);
    }

    const updatedOrder = {
      ...currentOrders[orderIndex],
      paymentStatus,
      updatedAt: new Date()
    };

    // Si le paiement est marqué comme payé, mettre à jour le statut de la commande
    if (paymentStatus === 'paid' && updatedOrder.status === 'pending') {
      updatedOrder.status = 'confirmed';
    }

    const updatedOrders = [...currentOrders];
    updatedOrders[orderIndex] = updatedOrder;
    
    this.ordersSubject.next(updatedOrders);
    this.saveOrders(updatedOrders);

    return of(updatedOrder);
  }

  // Marquer le paiement comme effectué (pour l'admin - paiement à la livraison)
  markPaymentAsPaid(orderId: string): Observable<Order | null> {
    return this.updatePaymentStatus(orderId, 'paid');
  }

  // Marquer le paiement comme échoué
  markPaymentAsFailed(orderId: string): Observable<Order | null> {
    return this.updatePaymentStatus(orderId, 'failed');
  }

  // Ajouter un numéro de suivi
  addTrackingNumber(orderId: string, trackingNumber: string): Observable<Order | null> {
    const currentOrders = this.ordersSubject.value;
    const orderIndex = currentOrders.findIndex(order => order.id === orderId);
    
    if (orderIndex === -1) {
      return of(null);
    }

    const updatedOrder = {
      ...currentOrders[orderIndex],
      trackingNumber,
      updatedAt: new Date()
    };

    const updatedOrders = [...currentOrders];
    updatedOrders[orderIndex] = updatedOrder;
    
    this.ordersSubject.next(updatedOrders);
    this.saveOrders(updatedOrders);

    return of(updatedOrder);
  }

  // Annuler une commande
  cancelOrder(orderId: string, reason?: string): Observable<Order | null> {
    return this.updateOrderStatus(orderId, 'cancelled', reason);
  }

  // Marquer comme livrée
  markAsDelivered(orderId: string): Observable<Order | null> {
    const currentOrders = this.ordersSubject.value;
    const orderIndex = currentOrders.findIndex(order => order.id === orderId);
    
    if (orderIndex === -1) {
      return of(null);
    }

    const updatedOrder: Order = {
      ...currentOrders[orderIndex],
      status: 'delivered' as OrderStatus,
      deliveredAt: new Date(),
      updatedAt: new Date()
    };

    const updatedOrders = [...currentOrders];
    updatedOrders[orderIndex] = updatedOrder;
    
    this.ordersSubject.next(updatedOrders);
    this.saveOrders(updatedOrders);

    return of(updatedOrder);
  }

  // Obtenir le résumé des commandes
  getOrderSummary(userId: number): Observable<OrderSummary> {
    return this.getUserOrders(userId).pipe(
      map(orders => {
        const totalOrders = orders.length;
        const totalSpent = orders.reduce((sum, order) => sum + order.totalAmount, 0);
        const averageOrderValue = totalOrders > 0 ? totalSpent / totalOrders : 0;
        
        const ordersByStatus: Record<OrderStatus, number> = {
          pending: 0,
          confirmed: 0,
          processing: 0,
          shipped: 0,
          delivered: 0,
          cancelled: 0,
          refunded: 0
        };

        orders.forEach(order => {
          ordersByStatus[order.status]++;
        });

        const recentOrders = orders
          .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
          .slice(0, 5);

        return {
          totalOrders,
          totalSpent,
          averageOrderValue,
          ordersByStatus,
          recentOrders
        };
      })
    );
  }

  // Filtrer les commandes
  filterOrders(userId: number, filters: OrderFilters): Observable<Order[]> {
    return this.getUserOrders(userId).pipe(
      map(orders => {
        let filtered = orders;

        if (filters.status) {
          filtered = filtered.filter(order => order.status === filters.status);
        }

        if (filters.dateFrom) {
          filtered = filtered.filter(order => order.createdAt >= filters.dateFrom!);
        }

        if (filters.dateTo) {
          filtered = filtered.filter(order => order.createdAt <= filters.dateTo!);
        }

        if (filters.minAmount) {
          filtered = filtered.filter(order => order.totalAmount >= filters.minAmount!);
        }

        if (filters.maxAmount) {
          filtered = filtered.filter(order => order.totalAmount <= filters.maxAmount!);
        }

        if (filters.search) {
          const search = filters.search.toLowerCase();
          filtered = filtered.filter(order => 
            order.orderNumber.toLowerCase().includes(search) ||
            order.items.some(item => item.productName.toLowerCase().includes(search))
          );
        }

        return filtered.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      })
    );
  }

  // Gestion des adresses
  saveAddress(address: any): void {
    const currentAddresses = this.addressesSubject.value;
    const existingIndex = currentAddresses.findIndex(addr => addr.id === address.id);
    
    if (existingIndex >= 0) {
      currentAddresses[existingIndex] = address;
    } else {
      address.id = Date.now();
      currentAddresses.push(address);
    }

    this.addressesSubject.next(currentAddresses);
    this.saveAddresses(currentAddresses);
  }

  private saveAddressIfNew(address: any): void {
    const currentAddresses = this.addressesSubject.value;
    const exists = currentAddresses.some(addr => 
      addr.street === address.street && 
      addr.city === address.city && 
      addr.postalCode === address.postalCode
    );

    if (!exists) {
      this.saveAddress(address);
    }
  }

  // Générer un numéro de commande
  private generateOrderNumber(): string {
    const timestamp = Date.now().toString().slice(-8);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `CMD${timestamp}${random}`;
  }

  // Obtenir le statut en français
  getStatusLabel(status: OrderStatus): string {
    const labels: Record<OrderStatus, string> = {
      pending: 'En attente',
      confirmed: 'Confirmée',
      processing: 'En cours de traitement',
      shipped: 'Expédiée',
      delivered: 'Livrée',
      cancelled: 'Annulée',
      refunded: 'Remboursée'
    };
    return labels[status];
  }

  // Obtenir la couleur du statut
  getStatusColor(status: OrderStatus): string {
    const colors: Record<OrderStatus, string> = {
      pending: '#ff9800',
      confirmed: '#2196f3',
      processing: '#9c27b0',
      shipped: '#3f51b5',
      delivered: '#4caf50',
      cancelled: '#f44336',
      refunded: '#795548'
    };
    return colors[status];
  }
} 