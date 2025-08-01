import { Routes } from '@angular/router';
import { AccountHome } from './pages/account-home/account-home';
import { Login } from './pages/login/login';
import { Register } from './pages/register/register';
import { Favorites } from './pages/favorites/favorites';
import { Notifications } from './pages/notifications/notifications';

export const ACCOUNT_ROUTES: Routes = [
  { path: '', component: AccountHome },
  { path: 'login', component: Login },
  { path: 'register', component: Register },
  { path: 'orders', component: AccountHome },
  { path: 'favorites', component: Favorites },
  { path: 'notifications', component: Notifications }
]; 