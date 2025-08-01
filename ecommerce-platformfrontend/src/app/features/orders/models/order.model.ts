import { CartItem } from '../../cart/models/cart-item.model';
import { Promotion } from '../../promotions/models/promotion.model';

export interface Order {
  id: string;
  userId: number;
  orderNumber: string;
  status: OrderStatus;
  items: OrderItem[];
  subtotal: number;
  discountAmount: number;
  shippingCost: number;
  taxAmount: number;
  totalAmount: number;
  appliedPromotions: Promotion[];
  shippingAddress: Address;
  billingAddress: Address;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  createdAt: Date;
  updatedAt: Date;
  estimatedDelivery?: Date;
  deliveredAt?: Date;
  notes?: string;
  trackingNumber?: string;
}

export interface OrderItem {
  id: number;
  productId: number;
  productName: string;
  productImage: string;
  price: number;
  quantity: number;
  subtotal: number;
  category: string;
}

export interface Address {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault?: boolean;
}

export interface PaymentMethod {
  type: 'card' | 'orange_money' | 'wave';
  details?: {
    cardNumber?: string;
    cardType?: string;
    expiryDate?: string;
    mobileNumber?: string;
    provider?: string;
    accountNumber?: string;
    bankName?: string;
  };
}

export type OrderStatus = 
  | 'pending' 
  | 'confirmed' 
  | 'processing' 
  | 'shipped' 
  | 'delivered' 
  | 'cancelled' 
  | 'refunded';

export type PaymentStatus = 
  | 'pending' 
  | 'paid' 
  | 'failed' 
  | 'refunded' 
  | 'partially_refunded';

export interface OrderSummary {
  totalOrders: number;
  totalSpent: number;
  averageOrderValue: number;
  ordersByStatus: Record<OrderStatus, number>;
  recentOrders: Order[];
}

export interface OrderFilters {
  status?: OrderStatus;
  dateFrom?: Date;
  dateTo?: Date;
  minAmount?: number;
  maxAmount?: number;
  search?: string;
}

export interface OrderCreateRequest {
  items: CartItem[];
  shippingAddress: Address;
  billingAddress: Address;
  paymentMethod: PaymentMethod;
  appliedPromotions: Promotion[];
  notes?: string;
}

export interface OrderUpdateRequest {
  status?: OrderStatus;
  trackingNumber?: string;
  estimatedDelivery?: Date;
  notes?: string;
} 