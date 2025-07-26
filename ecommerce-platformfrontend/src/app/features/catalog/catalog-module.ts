import { Routes } from '@angular/router';
import { CatalogList } from './pages/catalog-list/catalog-list';
import { ProductDetail } from './pages/product-detail/product-detail';

export const CATALOG_ROUTES: Routes = [
  { path: '', component: CatalogList },
  { path: ':id', component: ProductDetail }
];
