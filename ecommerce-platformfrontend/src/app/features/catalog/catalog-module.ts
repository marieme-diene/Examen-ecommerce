import { Routes } from '@angular/router';
import { CatalogList } from './pages/catalog-list/catalog-list';
import { ProductDetail } from './pages/product-detail/product-detail';
import { BrandProducts } from './pages/brand-products/brand-products';

export const CATALOG_ROUTES: Routes = [
  { path: '', component: CatalogList },
  { path: 'brand/:brand', component: BrandProducts },
  { path: ':id', component: ProductDetail }
];
