import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-admin-home',
  standalone: true,
  imports: [RouterModule],
  template: `
    <div style="display:flex;min-height:100vh;">
      <nav style="width:220px;background:#f5f7fa;padding:32px 0 0 0;box-shadow:1px 0 0 #e5e7eb;display:flex;flex-direction:column;gap:8px;">
        <a routerLink="/admin" routerLinkActive="active" style="padding:14px 24px;display:block;font-weight:600;">Dashboard</a>
        <a routerLink="/admin/products" routerLinkActive="active" style="padding:14px 24px;display:block;">Produits</a>
        <a routerLink="/admin/categories" routerLinkActive="active" style="padding:14px 24px;display:block;">Catégories</a>
        <a routerLink="/admin/orders" routerLinkActive="active" style="padding:14px 24px;display:block;">Commandes</a>
        <a routerLink="/admin/users" routerLinkActive="active" style="padding:14px 24px;display:block;">Utilisateurs</a>
        <a routerLink="/admin/stats" routerLinkActive="active" style="padding:14px 24px;display:block;">Statistiques</a>
        <button (click)="logout()" style="margin:32px 24px 0 24px;padding:10px 0;width:90%;background:#e11d48;color:#fff;border:none;border-radius:6px;font-weight:600;cursor:pointer;">Déconnexion</button>
      </nav>
      <main style="flex:1;padding:40px 32px;">
        <router-outlet></router-outlet>
      </main>
    </div>
  `
})
export class AdminHome {
  constructor(private router: Router) {
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      if (!localStorage.getItem('isAdmin')) {
        this.router.navigate(['/admin/login']);
      }
    }
  }
  logout() {
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      localStorage.removeItem('isAdmin');
    }
    this.router.navigate(['/admin/login']);
  }
} 