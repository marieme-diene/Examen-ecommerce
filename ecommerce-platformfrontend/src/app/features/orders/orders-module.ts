import { Routes } from '@angular/router';
import { Checkout } from './components/checkout/checkout';
import { OrderSuccess } from './pages/order-success/order-success';

export const ORDERS_ROUTES: Routes = [
  { path: 'checkout', component: Checkout },
  { path: 'success/:orderId', component: OrderSuccess }
]; 