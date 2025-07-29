import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../account/services/auth.service';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-admin-home',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatButtonModule,
    MatIconModule,
    MatCardModule
  ],
  template: `
    <div *ngIf="!isAdmin" class="access-denied">
      <h2>Accès refusé</h2>
      <p>Vous devez être administrateur pour accéder à cette page.</p>
      <button mat-raised-button color="primary" (click)="goToLogin()">Se connecter</button>
    </div>

    <div *ngIf="isAdmin" class="admin-dashboard">
      <h2>Tableau de bord Administrateur</h2>
      
      <div class="admin-menu">
        <mat-card class="menu-card" routerLink="/admin/products">
          <mat-card-content>
            <mat-icon>inventory</mat-icon>
            <h3>Gestion des produits</h3>
            <p>Ajouter, modifier et supprimer des produits</p>
          </mat-card-content>
        </mat-card>

        <mat-card class="menu-card" routerLink="/admin/categories">
          <mat-card-content>
            <mat-icon>category</mat-icon>
            <h3>Gestion des catégories</h3>
            <p>Gérer les catégories de produits</p>
          </mat-card-content>
        </mat-card>

        <mat-card class="menu-card" routerLink="/admin/orders">
          <mat-card-content>
            <mat-icon>shopping_cart</mat-icon>
            <h3>Gestion des commandes</h3>
            <p>Suivre et modifier le statut des commandes</p>
          </mat-card-content>
        </mat-card>

        <mat-card class="menu-card" routerLink="/admin/users">
          <mat-card-content>
            <mat-icon>people</mat-icon>
            <h3>Gestion des utilisateurs</h3>
            <p>Gérer les comptes clients et administrateurs</p>
          </mat-card-content>
        </mat-card>

        <mat-card class="menu-card" routerLink="/admin/stats">
          <mat-card-content>
            <mat-icon>analytics</mat-icon>
            <h3>Statistiques</h3>
            <p>Consulter les statistiques de vente</p>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .access-denied {
      text-align: center;
      padding: 50px;
      background: #fff;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      margin: 20px;
    }
    
    .admin-dashboard {
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
    }
    
    .admin-dashboard h2 {
      text-align: center;
      color: #2563eb;
      margin-bottom: 40px;
      font-size: 2rem;
    }
    
    .admin-menu {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 24px;
    }
    
    .menu-card {
      cursor: pointer;
      transition: transform 0.2s, box-shadow 0.2s;
      border-radius: 12px;
      overflow: hidden;
    }
    
    .menu-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 25px rgba(0,0,0,0.15);
    }
    
    .menu-card mat-card-content {
      text-align: center;
      padding: 32px 24px;
    }
    
    .menu-card mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      color: #2563eb;
      margin-bottom: 16px;
    }
    
    .menu-card h3 {
      margin: 0 0 12px 0;
      color: #1f2937;
      font-size: 1.3rem;
    }
    
    .menu-card p {
      margin: 0;
      color: #6b7280;
      line-height: 1.5;
    }
    
    @media (max-width: 768px) {
      .admin-menu {
        grid-template-columns: 1fr;
      }
      
      .admin-dashboard {
        padding: 10px;
      }
    }
  `]
})
export class AdminHome implements OnInit {
  isAdmin = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.checkAdminAccess();
  }

  checkAdminAccess() {
    this.isAdmin = this.authService.isAdmin();
    if (!this.isAdmin) {
      this.router.navigate(['/admin/login']);
    }
  }

  goToLogin() {
    this.router.navigate(['/admin/login']);
  }
} 