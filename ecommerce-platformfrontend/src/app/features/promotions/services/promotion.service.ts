import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { Promotion, PromotionUsage, PromotionValidation, CartWithPromotion } from '../models/promotion.model';
import { CartItem } from '../../cart/models/cart-item.model';
import { AuthService } from '../../account/services/auth.service';
import { NotificationService } from '../../../shared/services/notification.service';

@Injectable({
  providedIn: 'root'
})
export class PromotionService {
  private readonly PROMOTIONS_KEY = 'afrimarket_promotions';
  private readonly PROMOTION_USAGE_KEY = 'afrimarket_promotion_usage';
  
  private promotionsSubject = new BehaviorSubject<Promotion[]>([]);
  public promotions$ = this.promotionsSubject.asObservable();
  
  private appliedPromotionsSubject = new BehaviorSubject<Promotion[]>([]);
  public appliedPromotions$ = this.appliedPromotionsSubject.asObservable();

  constructor(
    private authService: AuthService,
    private notificationService: NotificationService
  ) {
    this.loadPromotions();
    this.initializeDefaultPromotions();
  }

  // Charger les promotions depuis localStorage
  private loadPromotions(): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      const savedPromotions = localStorage.getItem(this.PROMOTIONS_KEY);
      if (savedPromotions) {
        const promotions = JSON.parse(savedPromotions).map((promotion: any) => ({
          ...promotion,
          startDate: new Date(promotion.startDate),
          endDate: new Date(promotion.endDate)
        }));
        this.promotionsSubject.next(promotions);
      }
    }
  }

  // Sauvegarder les promotions dans localStorage
  private savePromotions(promotions: Promotion[]): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(this.PROMOTIONS_KEY, JSON.stringify(promotions));
    }
  }

  // Initialiser des promotions par défaut
  private initializeDefaultPromotions(): void {
    const currentPromotions = this.promotionsSubject.value;
    if (currentPromotions.length === 0) {
      const defaultPromotions: Promotion[] = [
        {
          id: 1,
          code: 'WELCOME10',
          name: 'Bienvenue -10%',
          description: '10% de réduction sur votre première commande',
          type: 'percentage',
          value: 10,
          minAmount: 5000,
          maxDiscount: 10000,
          startDate: new Date(),
          endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 an
          isActive: true,
          usageLimit: 1000,
          usageCount: 0,
          userUsageLimit: 1,
          firstTimeOnly: true,
          stackable: false,
          autoApply: false
        },
        {
          id: 2,
          code: 'FLASH20',
          name: 'Flash Sale -20%',
          description: '20% de réduction sur tous les produits',
          type: 'percentage',
          value: 20,
          minAmount: 10000,
          maxDiscount: 50000,
          startDate: new Date(),
          endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 semaine
          isActive: true,
          usageLimit: 500,
          usageCount: 0,
          stackable: true,
          autoApply: false
        },
        {
          id: 3,
          code: 'FREESHIP',
          name: 'Livraison gratuite',
          description: 'Livraison gratuite pour les commandes de plus de 50 000 FCFA',
          type: 'free_shipping',
          value: 0,
          minAmount: 50000,
          startDate: new Date(),
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 jours
          isActive: true,
          usageLimit: 2000,
          usageCount: 0,
          stackable: true,
          autoApply: true
        },
        {
          id: 4,
          code: 'FIXED5000',
          name: 'Réduction fixe 5000 FCFA',
          description: '5000 FCFA de réduction sur votre commande',
          type: 'fixed',
          value: 5000,
          minAmount: 25000,
          startDate: new Date(),
          endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 jours
          isActive: true,
          usageLimit: 300,
          usageCount: 0,
          stackable: false,
          autoApply: false
        }
      ];
      
      this.promotionsSubject.next(defaultPromotions);
      this.savePromotions(defaultPromotions);
    }
  }

  // Obtenir toutes les promotions actives
  getActivePromotions(): Observable<Promotion[]> {
    return this.promotions$.pipe(
      map(promotions => promotions.filter(p => 
        p.isActive && 
        new Date() >= p.startDate && 
        new Date() <= p.endDate &&
        (!p.usageLimit || p.usageCount < p.usageLimit)
      ))
    );
  }

  // Valider un code promo
  validatePromoCode(code: string, cartItems: CartItem[], userId?: number): Observable<PromotionValidation> {
    return this.getActivePromotions().pipe(
      map(promotions => {
        const promotion = promotions.find(p => p.code.toUpperCase() === code.toUpperCase());
        
        if (!promotion) {
          return { isValid: false, error: 'Code promo invalide' };
        }

        // Vérifier les conditions
        const validation = this.checkPromotionConditions(promotion, cartItems, userId);
        if (!validation.isValid) {
          return validation;
        }

        // Calculer la réduction
        const subtotal = cartItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
        const discountAmount = this.calculateDiscount(promotion, subtotal);
        const finalAmount = subtotal - discountAmount;

        return {
          isValid: true,
          discountAmount,
          finalAmount
        };
      })
    );
  }

  // Vérifier les conditions d'une promotion
  private checkPromotionConditions(promotion: Promotion, cartItems: CartItem[], userId?: number): PromotionValidation {
    const subtotal = cartItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
    const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

    // Vérifier le montant minimum
    if (promotion.minAmount && subtotal < promotion.minAmount) {
      return {
        isValid: false,
        error: `Montant minimum requis : ${promotion.minAmount.toLocaleString()} FCFA`
      };
    }

    // Vérifier le nombre minimum d'articles
    if (promotion.minimumItems && itemCount < promotion.minimumItems) {
      return {
        isValid: false,
        error: `Nombre minimum d'articles requis : ${promotion.minimumItems}`
      };
    }

    // Vérifier les catégories applicables
    if (promotion.applicableCategories && promotion.applicableCategories.length > 0) {
      const hasApplicableCategory = cartItems.some(item => 
        promotion.applicableCategories!.includes(item.product.category)
      );
      if (!hasApplicableCategory) {
        return {
          isValid: false,
          error: 'Ce code ne s\'applique pas aux produits de votre panier'
        };
      }
    }

    // Vérifier les produits exclus
    if (promotion.excludedProducts && promotion.excludedProducts.length > 0) {
      const hasExcludedProduct = cartItems.some(item => 
        promotion.excludedProducts!.includes(item.product.id)
      );
      if (hasExcludedProduct) {
        return {
          isValid: false,
          error: 'Ce code ne s\'applique pas à certains produits de votre panier'
        };
      }
    }

    // Vérifier la limite d'utilisation par utilisateur
    if (userId && promotion.userUsageLimit) {
      const userUsage = this.getUserPromotionUsage(promotion.id, userId);
      if (userUsage >= promotion.userUsageLimit) {
        return {
          isValid: false,
          error: 'Vous avez déjà utilisé ce code le nombre maximum de fois autorisé'
        };
      }
    }

    return { isValid: true };
  }

  // Calculer la réduction
  private calculateDiscount(promotion: Promotion, subtotal: number): number {
    let discount = 0;

    switch (promotion.type) {
      case 'percentage':
        discount = (subtotal * promotion.value) / 100;
        break;
      case 'fixed':
        discount = promotion.value;
        break;
      case 'free_shipping':
        // Pour la livraison gratuite, on considère un coût de livraison fixe
        discount = 2000; // Coût de livraison estimé
        break;
    }

    // Appliquer la réduction maximale
    if (promotion.maxDiscount && discount > promotion.maxDiscount) {
      discount = promotion.maxDiscount;
    }

    // Ne pas dépasser le montant total
    if (discount > subtotal) {
      discount = subtotal;
    }

    return Math.round(discount);
  }

  // Appliquer une promotion
  applyPromotion(promotion: Promotion, cartItems: CartItem[]): void {
    const currentApplied = this.appliedPromotionsSubject.value;
    
    // Vérifier si la promotion est déjà appliquée
    if (currentApplied.find(p => p.id === promotion.id)) {
      this.notificationService.addNotification({
        type: 'warning',
        title: 'Promotion déjà appliquée',
        message: 'Cette promotion est déjà appliquée à votre panier',
        category: 'promotion'
      });
      return;
    }

    // Vérifier si les promotions sont empilables
    if (!promotion.stackable && currentApplied.length > 0) {
      this.notificationService.addNotification({
        type: 'warning',
        title: 'Promotion non empilable',
        message: 'Cette promotion ne peut pas être combinée avec d\'autres',
        category: 'promotion'
      });
      return;
    }

    const newApplied = promotion.stackable ? [...currentApplied, promotion] : [promotion];
    this.appliedPromotionsSubject.next(newApplied);

    this.notificationService.addNotification({
      type: 'success',
      title: 'Promotion appliquée',
      message: `${promotion.name} a été appliquée à votre panier`,
      category: 'promotion'
    });
  }

  // Retirer une promotion
  removePromotion(promotionId: number): void {
    const currentApplied = this.appliedPromotionsSubject.value;
    const promotion = currentApplied.find(p => p.id === promotionId);
    
    if (promotion) {
      const newApplied = currentApplied.filter(p => p.id !== promotionId);
      this.appliedPromotionsSubject.next(newApplied);

      this.notificationService.addNotification({
        type: 'info',
        title: 'Promotion retirée',
        message: `${promotion.name} a été retirée de votre panier`,
        category: 'promotion'
      });
    }
  }

  // Calculer le panier avec promotions
  calculateCartWithPromotions(cartItems: CartItem[]): Observable<CartWithPromotion> {
    return this.appliedPromotions$.pipe(
      map(appliedPromotions => {
        const subtotal = cartItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
        let totalDiscount = 0;

        // Calculer les réductions pour chaque promotion appliquée
        appliedPromotions.forEach(promotion => {
          const discount = this.calculateDiscount(promotion, subtotal - totalDiscount);
          totalDiscount += discount;
        });

        const finalAmount = Math.max(0, subtotal - totalDiscount);

        return {
          items: cartItems,
          subtotal,
          discountAmount: totalDiscount,
          finalAmount,
          appliedPromotions,
          availablePromotions: []
        };
      })
    );
  }

  // Obtenir l'utilisation d'une promotion par un utilisateur
  private getUserPromotionUsage(promotionId: number, userId: number): number {
    if (typeof window !== 'undefined' && window.localStorage) {
      const savedUsage = localStorage.getItem(this.PROMOTION_USAGE_KEY);
      if (savedUsage) {
        const usage: PromotionUsage[] = JSON.parse(savedUsage);
        return usage.filter(u => u.promotionId === promotionId && u.userId === userId).length;
      }
    }
    return 0;
  }

  // Enregistrer l'utilisation d'une promotion
  recordPromotionUsage(promotionId: number, userId: number, orderId: string, discountAmount: number, originalAmount: number, finalAmount: number): void {
    const usage: PromotionUsage = {
      id: Date.now(),
      promotionId,
      userId,
      orderId,
      usedAt: new Date(),
      discountAmount,
      originalAmount,
      finalAmount
    };

    // Sauvegarder l'utilisation
    if (typeof window !== 'undefined' && window.localStorage) {
      const savedUsage = localStorage.getItem(this.PROMOTION_USAGE_KEY);
      const allUsage: PromotionUsage[] = savedUsage ? JSON.parse(savedUsage) : [];
      allUsage.push(usage);
      localStorage.setItem(this.PROMOTION_USAGE_KEY, JSON.stringify(allUsage));
    }

    // Incrémenter le compteur d'utilisation
    const currentPromotions = this.promotionsSubject.value;
    const updatedPromotions = currentPromotions.map(p => 
      p.id === promotionId ? { ...p, usageCount: p.usageCount + 1 } : p
    );
    this.promotionsSubject.next(updatedPromotions);
    this.savePromotions(updatedPromotions);
  }

  // Réinitialiser les promotions appliquées
  clearAppliedPromotions(): void {
    this.appliedPromotionsSubject.next([]);
  }

  // Obtenir les promotions disponibles pour un panier
  getAvailablePromotions(cartItems: CartItem[], userId?: number): Observable<Promotion[]> {
    return this.getActivePromotions().pipe(
      map(promotions => {
        return promotions.filter(promotion => {
          const validation = this.checkPromotionConditions(promotion, cartItems, userId);
          return validation.isValid;
        });
      })
    );
  }
} 