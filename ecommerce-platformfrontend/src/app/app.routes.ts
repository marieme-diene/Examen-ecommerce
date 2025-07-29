import { Routes } from '@angular/router';
import { OrderPageComponent } from './features/help/help-pages/order-page/order-page.component';
import { PaymentPageComponent } from './features/help/help-pages/payment-page/payment-page.component';
import { PaymentPageComponent as PaymentPage } from './features/payment/payment-page/payment-page.component';
import { PaymentSuccessComponent } from './features/payment/payment-success/payment-success.component';

export const routes: Routes = [
  {
    path: 'catalog',
    loadChildren: () => import('./features/catalog/catalog-module').then(m => m.CATALOG_ROUTES)
  },
  {
    path: 'cart',
    loadChildren: () => import('./features/cart/cart-module').then(m => m.CART_ROUTES)
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
