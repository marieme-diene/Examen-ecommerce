export interface Promotion {
  id: number;
  code: string;
  name: string;
  description: string;
  type: 'percentage' | 'fixed' | 'free_shipping';
  value: number; // Pourcentage ou montant fixe
  minAmount?: number; // Montant minimum pour appliquer
  maxDiscount?: number; // Réduction maximale
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  usageLimit?: number; // Limite d'utilisation totale
  usageCount: number; // Nombre d'utilisations actuelles
  userUsageLimit?: number; // Limite par utilisateur
  applicableCategories?: string[]; // Catégories applicables
  applicableProducts?: number[]; // Produits spécifiques
  excludedProducts?: number[]; // Produits exclus
  firstTimeOnly?: boolean; // Première commande seulement
  minimumItems?: number; // Nombre minimum d'articles
  stackable: boolean; // Peut être combiné avec d'autres promos
  autoApply?: boolean; // S'applique automatiquement
}

export interface PromotionUsage {
  id: number;
  promotionId: number;
  userId: number;
  orderId: string;
  usedAt: Date;
  discountAmount: number;
  originalAmount: number;
  finalAmount: number;
}

export interface PromotionValidation {
  isValid: boolean;
  error?: string;
  discountAmount?: number;
  finalAmount?: number;
}

export interface CartWithPromotion {
  items: any[];
  subtotal: number;
  discountAmount: number;
  finalAmount: number;
  appliedPromotions: Promotion[];
  availablePromotions: Promotion[];
} 