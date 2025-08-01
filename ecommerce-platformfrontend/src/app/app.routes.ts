import { Routes } from '@angular/router';
import { OrderPageComponent } from './features/help/help-pages/order-page/order-page.component';
import { PaymentPageComponent } from './features/help/help-pages/payment-page/payment-page.component';
import { PaymentPageComponent as PaymentPage } from './features/payment/payment-page/payment-page.component';
import { PaymentSuccessComponent } from './features/payment/payment-success/payment-success.component';
import { CartList } from './features/cart/pages/cart-list/cart-list';

export const routes: Routes = [
  {
    path: 'catalog',
    loadChildren: () => import('./features/catalog/catalog-module').then(m => m.CATALOG_ROUTES)
  },
  {
    path: 'cart',
    component: CartList
  },
  {
    path: 'account',
    loadChildren: () => import('./features/account/account-module').then(m => m.ACCOUNT_ROUTES)
  },
  {
    path: 'admin',
    loadChildren: () => import('./features/admin/admin-module').then(m => m.ADMIN_ROUTES)
  },
  {
    path: 'promotions',
    loadChildren: () => import('./features/promotions/promotions-module').then(m => m.PROMOTIONS_ROUTES)
  },
  {
    path: 'orders',
    loadChildren: () => import('./features/orders/orders-module').then(m => m.ORDERS_ROUTES)
  },
  {
    path: 'dashboard',
    loadChildren: () => import('./features/dashboard/dashboard-module').then(m => m.DASHBOARD_ROUTES)
  },
  { path: 'order', component: OrderPageComponent },
  { path: 'payment', component: PaymentPageComponent },
  { path: 'payment/checkout', component: PaymentPage },
  { path: 'payment/success', component: PaymentSuccessComponent },
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },
  {
    path: '**',
    redirectTo: 'dashboard'
  }
];
