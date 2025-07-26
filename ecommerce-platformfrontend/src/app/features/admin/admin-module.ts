import { Routes } from '@angular/router';
import { AdminHome } from './admin-home';
import { AdminLogin } from './admin-login';
import { AdminProducts } from './admin-products';
import { AdminCategories } from './admin-categories';
import { AdminOrders } from './admin-orders';
import { AdminUsers } from './admin-users';
import { AdminStats } from './admin-stats';

export const ADMIN_ROUTES: Routes = [
  { path: '', component: AdminHome, children: [
    { path: 'products', component: AdminProducts },
    { path: 'categories', component: AdminCategories },
    { path: 'orders', component: AdminOrders },
    { path: 'users', component: AdminUsers },
    { path: 'stats', component: AdminStats }
  ] },
  { path: 'login', component: AdminLogin }
];
