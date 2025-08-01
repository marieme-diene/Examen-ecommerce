import { Routes } from '@angular/router';
import { PromotionsManagement } from './pages/promotions-management/promotions-management';

export const PROMOTIONS_ROUTES: Routes = [
  { path: '', component: PromotionsManagement },
  { path: 'management', component: PromotionsManagement }
]; 