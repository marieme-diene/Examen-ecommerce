import { Routes } from '@angular/router';
import { AdminHome } from './admin-home';
import { AdminLogin } from './admin-login';
import { AdminProducts } from './admin-products';
import { AdminCategories } from './admin-categories';
import { AdminOrders } from './admin-orders';
import { AdminUsers } from './admin-users';
import { AdminStats } from './admin-stats';
import { AdminTest } from './admin-test';

export const ADMIN_ROUTES: Routes = [
  { path: '', component: AdminHome },
  { path: 'products', component: AdminProducts },
  { path: 'categories', component: AdminCategories },
  { path: 'orders', component: AdminOrders },
  { path: 'users', component: AdminUsers },
  { path: 'stats', component: AdminStats },
  { path: 'test', component: AdminTest },
  { path: 'login', component: AdminLogin }
];
