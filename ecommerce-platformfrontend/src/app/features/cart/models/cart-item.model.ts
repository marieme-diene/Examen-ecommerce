import { Product } from '../../catalog/models/product.model';

export interface CartItem {
  product: Product;
  quantity: number;
} 