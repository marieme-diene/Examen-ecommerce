import { Routes } from '@angular/router';
import { AccountHome } from './pages/account-home/account-home';
import { Login } from './pages/login/login';
import { Register } from './pages/register/register';

export const ACCOUNT_ROUTES: Routes = [
  { path: '', component: AccountHome },
  { path: 'login', component: Login },
  { path: 'register', component: Register },
  { path: 'orders', component: AccountHome }
];
