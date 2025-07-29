import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { AuthService } from '../account/services/auth.service';
import { User } from '../account/models/user.model';

interface UserWithStats extends User {
  orderCount: number;
  totalSpent: number;
  lastOrderDate?: Date;
}

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    MatButtonModule, 
    MatIconModule, 
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatOptionModule
  ],
  template: `
    <div class="admin-users">
      <h2>Gestion des utilisateurs</h2>
      
      <!-- Messages de feedback -->
      <div *ngIf="message" class="feedback-message" [class.success]="messageType === 'success'" [class.error]="messageType === 'error'">
        {{ message }}
        <button class="close-btn" (click)="clearMessage()">×</button>
      </div>

      <!-- Statistiques -->
      <div class="stats-grid">
        <mat-card class="stat-card">
          <mat-card-content>
            <div class="stat-value">{{ users.length }}</div>
            <div class="stat-label">Total utilisateurs</div>
          </mat-card-content>
        </mat-card>
        <mat-card class="stat-card">
          <mat-card-content>
            <div class="stat-value">{{ clientsCount }}</div>
            <div class="stat-label">Clients</div>
          </mat-card-content>
        </mat-card>
        <mat-card class="stat-card">
          <mat-card-content>
            <div class="stat-value">{{ adminsCount }}</div>
            <div class="stat-label">Administrateurs</div>
          </mat-card-content>
        </mat-card>
        <mat-card class="stat-card">
          <mat-card-content>
            <div class="stat-value">{{ activeUsersCount }}</div>
            <div class="stat-label">Utilisateurs actifs</div>
          </mat-card-content>
        </mat-card>
      </div>

      <!-- Filtres -->
      <mat-card class="filters-card">
        <mat-card-content>
          <div class="filters-row">
            <mat-form-field appearance="outline">
              <mat-label>Rechercher</mat-label>
              <input matInput [(ngModel)]="searchTerm" (input)="applyFilters()" placeholder="Nom ou email...">
            </mat-form-field>
            
            <mat-form-field appearance="outline">
              <mat-label>Rôle</mat-label>
              <mat-select [(ngModel)]="selectedRole" (selectionChange)="applyFilters()">
                <mat-option value="">Tous</mat-option>
                <mat-option value="client">Clients</mat-option>
                <mat-option value="admin">Administrateurs</mat-option>
              </mat-select>
            </mat-form-field>
          </div>
        </mat-card-content>
      </mat-card>

      <!-- Liste des utilisateurs -->
      <mat-card class="users-list-card">
        <mat-card-header>
          <mat-card-title>Utilisateurs ({{ filteredUsers.length }})</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <div class="users-table">
            <div class="table-header">
              <div class="header-cell">Utilisateur</div>
              <div class="header-cell">Email</div>
              <div class="header-cell">Rôle</div>
              <div class="header-cell">Commandes</div>
              <div class="header-cell">Total dépensé</div>
              <div class="header-cell">Dernière commande</div>
              <div class="header-cell">Actions</div>
            </div>
            
            <div class="table-row" *ngFor="let user of filteredUsers">
              <div class="table-cell user-info">
                <div class="user-avatar">{{ user.name.charAt(0).toUpperCase() }}</div>
                <div class="user-details">
                  <div class="user-name">{{ user.name }}</div>
                  <div class="user-id">ID: {{ user.id }}</div>
                </div>
              </div>
              
              <div class="table-cell">{{ user.email }}</div>
              
              <div class="table-cell">
                <span class="role-badge" [class.admin]="user.role === 'admin'">
                  {{ user.role === 'admin' ? 'Administrateur' : 'Client' }}
                </span>
              </div>
              
              <div class="table-cell">{{ user.orderCount }}</div>
              
              <div class="table-cell">{{ user.totalSpent | currency:'FCFA':'symbol':'1.0-0':'fr' }}</div>
              
              <div class="table-cell">
                {{ user.lastOrderDate ? (user.lastOrderDate | date:'dd/MM/yyyy') : 'Aucune' }}
              </div>
              
              <div class="table-cell actions">
                <button mat-icon-button color="primary" (click)="editUser(user)" matTooltip="Modifier">
                  <mat-icon>edit</mat-icon>
                </button>
                <button mat-icon-button color="warn" (click)="deleteUser(user.id)" matTooltip="Supprimer" [disabled]="user.role === 'admin'">
                  <mat-icon>delete</mat-icon>
                </button>
              </div>
            </div>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .admin-users {
      max-width: 1400px;
      margin: 0 auto;
    }
    
    .admin-users h2 {
      margin-bottom: 24px;
      color: #2563eb;
    }
    
    .feedback-message {
      padding: 12px 16px;
      border-radius: 8px;
      margin-bottom: 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .feedback-message.success {
      background: #d1fae5;
      color: #065f46;
      border: 1px solid #a7f3d0;
    }
    
    .feedback-message.error {
      background: #fee2e2;
      color: #991b1b;
      border: 1px solid #fca5a5;
    }
    
    .close-btn {
      background: none;
      border: none;
      font-size: 18px;
      cursor: pointer;
      color: inherit;
    }
    
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
      margin-bottom: 24px;
    }
    
    .stat-card {
      text-align: center;
    }
    
    .stat-value {
      font-size: 2rem;
      font-weight: bold;
      color: #2563eb;
      margin-bottom: 8px;
    }
    
    .stat-label {
      color: #6b7280;
      font-size: 0.9rem;
    }
    
    .filters-card {
      margin-bottom: 24px;
    }
    
    .filters-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }
    
    .users-table {
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      overflow: hidden;
    }
    
    .table-header {
      display: grid;
      grid-template-columns: 2fr 2fr 1fr 1fr 1fr 1fr 1fr;
      background: #f9fafb;
      border-bottom: 1px solid #e5e7eb;
    }
    
    .header-cell {
      padding: 16px;
      font-weight: 600;
      color: #374151;
      border-right: 1px solid #e5e7eb;
    }
    
    .header-cell:last-child {
      border-right: none;
    }
    
    .table-row {
      display: grid;
      grid-template-columns: 2fr 2fr 1fr 1fr 1fr 1fr 1fr;
      border-bottom: 1px solid #e5e7eb;
      transition: background-color 0.2s;
    }
    
    .table-row:hover {
      background: #f9fafb;
    }
    
    .table-row:last-child {
      border-bottom: none;
    }
    
    .table-cell {
      padding: 16px;
      border-right: 1px solid #e5e7eb;
      display: flex;
      align-items: center;
    }
    
    .table-cell:last-child {
      border-right: none;
    }
    
    .user-info {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    
    .user-avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: #2563eb;
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
    }
    
    .user-name {
      font-weight: 500;
      color: #1f2937;
    }
    
    .user-id {
      font-size: 0.8rem;
      color: #6b7280;
    }
    
    .role-badge {
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 0.8rem;
      background: #dbeafe;
      color: #1e40af;
    }
    
    .role-badge.admin {
      background: #fef3c7;
      color: #92400e;
    }
    
    .actions {
      display: flex;
      gap: 8px;
    }
    
    @media (max-width: 1024px) {
      .table-header,
      .table-row {
        grid-template-columns: 1fr;
        gap: 8px;
      }
      
      .header-cell,
      .table-cell {
        border-right: none;
        border-bottom: 1px solid #e5e7eb;
        padding: 8px 16px;
      }
      
      .header-cell:before,
      .table-cell:before {
        content: attr(data-label);
        font-weight: 600;
        margin-right: 8px;
        color: #6b7280;
      }
    }
  `]
})
export class AdminUsers implements OnInit {
  users: UserWithStats[] = [];
  filteredUsers: UserWithStats[] = [];
  searchTerm = '';
  selectedRole = '';
  message = '';
  messageType: 'success' | 'error' = 'success';

  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    // Simuler des utilisateurs avec statistiques
    this.users = [
      {
        id: 1,
        name: 'Admin Principal',
        email: 'admin@afrimarket.com',
        role: 'admin',
        orderCount: 0,
        totalSpent: 0
      },
      {
        id: 2,
        name: 'Marie Dupont',
        email: 'client@afrimarket.com',
        role: 'client',
        orderCount: 3,
        totalSpent: 125000,
        lastOrderDate: new Date('2024-01-15')
      },
      {
        id: 3,
        name: 'Jean Martin',
        email: 'jean.martin@email.com',
        role: 'client',
        orderCount: 1,
        totalSpent: 45000,
        lastOrderDate: new Date('2024-01-10')
      },
      {
        id: 4,
        name: 'Sophie Bernard',
        email: 'sophie.bernard@email.com',
        role: 'client',
        orderCount: 0,
        totalSpent: 0
      }
    ];
    this.applyFilters();
  }

  applyFilters() {
    this.filteredUsers = this.users.filter(user => {
      const matchesSearch = !this.searchTerm || 
        user.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(this.searchTerm.toLowerCase());
      
      const matchesRole = !this.selectedRole || user.role === this.selectedRole;
      
      return matchesSearch && matchesRole;
    });
  }

  editUser(user: UserWithStats) {
    // Ici on pourrait ouvrir un dialog pour modifier l'utilisateur
    this.showMessage(`Modification de ${user.name} - Fonctionnalité à implémenter`, 'info');
  }

  deleteUser(userId: number) {
    const user = this.users.find(u => u.id === userId);
    if (user && user.role === 'admin') {
      this.showMessage('Impossible de supprimer un administrateur', 'error');
      return;
    }
    
    if (confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
      this.users = this.users.filter(u => u.id !== userId);
      this.applyFilters();
      this.showMessage('Utilisateur supprimé avec succès', 'success');
    }
  }

  get clientsCount(): number {
    return this.users.filter(u => u.role === 'client').length;
  }

  get adminsCount(): number {
    return this.users.filter(u => u.role === 'admin').length;
  }

  get activeUsersCount(): number {
    return this.users.filter(u => u.orderCount > 0).length;
  }

  showMessage(message: string, type: 'success' | 'error' | 'info') {
    this.message = message;
    this.messageType = type as 'success' | 'error';
    setTimeout(() => this.clearMessage(), 5000);
  }

  clearMessage() {
    this.message = '';
  }
} 