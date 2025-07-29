import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-admin-test',
  standalone: true,
  imports: [CommonModule, RouterLink, MatButtonModule],
  template: `
    <div style="padding: 20px; text-align: center;">
      <h2>Test de Navigation Admin</h2>
      <p>Si vous voyez cette page, la navigation fonctionne !</p>
      
      <div style="margin: 20px 0;">
        <a mat-raised-button routerLink="/admin/products" style="margin: 10px;">
          Test Produits
        </a>
        <a mat-raised-button routerLink="/admin/categories" style="margin: 10px;">
          Test Catégories
        </a>
        <a mat-raised-button routerLink="/admin/orders" style="margin: 10px;">
          Test Commandes
        </a>
        <a mat-raised-button routerLink="/admin/users" style="margin: 10px;">
          Test Utilisateurs
        </a>
        <a mat-raised-button routerLink="/admin/stats" style="margin: 10px;">
          Test Statistiques
        </a>
      </div>
      
      <a mat-stroked-button routerLink="/admin">Retour au Dashboard</a>
    </div>
  `
})
export class AdminTest {} 