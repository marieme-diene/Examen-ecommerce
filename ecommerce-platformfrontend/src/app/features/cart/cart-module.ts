import { Routes } from '@angular/router';
import { CartList } from './pages/cart-list/cart-list';
import { CheckoutPage } from './checkout.page';

export const CART_ROUTES: Routes = [
  { path: '', component: CartList },
  { path: 'checkout', component: CheckoutPage }
];
