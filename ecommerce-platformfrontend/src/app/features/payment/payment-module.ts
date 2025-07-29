import { Routes } from '@angular/router';
import { PaymentPageComponent } from './payment-page/payment-page.component';
import { PaymentSuccessComponent } from './payment-success/payment-success.component';

export const PAYMENT_ROUTES: Routes = [
  { path: 'checkout', component: PaymentPageComponent },
  { path: 'success', component: PaymentSuccessComponent }
]; 