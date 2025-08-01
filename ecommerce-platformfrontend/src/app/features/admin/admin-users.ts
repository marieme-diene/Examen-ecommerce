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

      <!-- Bouton Ajouter -->
      <div class="add-user-section">
        <button mat-stroked-button (click)="loadUsers()" matTooltip="Rafraîchir la liste">
          <mat-icon>refresh</mat-icon>
          Rafraîchir
        </button>
        <button mat-raised-button color="primary" (click)="showAddForm = true" *ngIf="!showAddForm">
          <mat-icon>add</mat-icon>
          Ajouter un utilisateur
        </button>
      </div>

      <!-- Formulaire d'ajout -->
      <mat-card *ngIf="showAddForm" class="add-form-card">
        <mat-card-header>
          <mat-card-title>Ajouter un nouvel utilisateur</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <form (ngSubmit)="addUser()" class="add-form">
            <div class="form-row">
              <mat-form-field appearance="outline">
                <mat-label>Nom</mat-label>
                <input matInput [(ngModel)]="addForm.name" name="name" required>
              </mat-form-field>
              
              <mat-form-field appearance="outline">
                <mat-label>Email</mat-label>
                <input matInput [(ngModel)]="addForm.email" name="email" type="email" required>
              </mat-form-field>
            </div>
            
            <div class="form-row">
              <mat-form-field appearance="outline">
                <mat-label>Mot de passe</mat-label>
                <input matInput [(ngModel)]="addForm.password" name="password" type="password" required>
              </mat-form-field>
              
              <mat-form-field appearance="outline">
                <mat-label>Rôle</mat-label>
                <mat-select [(ngModel)]="addForm.role" name="role" required>
                  <mat-option value="client">Client</mat-option>
                  <mat-option value="admin">Administrateur</mat-option>
                </mat-select>
              </mat-form-field>
            </div>
            
            <div class="form-actions">
              <button mat-raised-button color="primary" type="submit">
                Ajouter
              </button>
              <button mat-stroked-button type="button" (click)="cancelAdd()">
                Annuler
              </button>
            </div>
          </form>
        </mat-card-content>
      </mat-card>

      <!-- Formulaire d'édition -->
      <mat-card *ngIf="showEditForm" class="edit-form-card">
        <mat-card-header>
          <mat-card-title>Modifier l'utilisateur</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <form (ngSubmit)="saveUser()" class="edit-form">
            <div class="form-row">
              <mat-form-field appearance="outline">
                <mat-label>Nom</mat-label>
                <input matInput [(ngModel)]="editForm.name" name="name" required>
              </mat-form-field>
              
              <mat-form-field appearance="outline">
                <mat-label>Email</mat-label>
                <input matInput [(ngModel)]="editForm.email" name="email" type="email" required>
              </mat-form-field>
            </div>
            
            <div class="form-row">
              <mat-form-field appearance="outline">
                <mat-label>Rôle</mat-label>
                <mat-select [(ngModel)]="editForm.role" name="role" required>
                  <mat-option value="client">Client</mat-option>
                  <mat-option value="admin">Administrateur</mat-option>
                </mat-select>
              </mat-form-field>
            </div>
            
            <div class="form-actions">
              <button mat-raised-button color="primary" type="submit">
                Enregistrer
              </button>
              <button mat-stroked-button type="button" (click)="cancelEdit()">
                Annuler
              </button>
            </div>
          </form>
        </mat-card-content>
      </mat-card>

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
    
    .add-user-section {
      margin-bottom: 24px;
      text-align: right;
      display: flex;
      justify-content: flex-end;
      gap: 16px;
    }

    .add-form-card {
      margin-bottom: 24px;
      border: 2px solid #10b981;
    }

    .add-form {
      display: flex;
      flex-direction: column;
      gap: 16px;
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
    
    .edit-form-card {
      margin-bottom: 24px;
      border: 2px solid #2563eb;
    }
    
    .edit-form {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    
    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }
    
    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 16px;
      margin-top: 16px;
    }
    
    @media (max-width: 768px) {
      .form-row {
        grid-template-columns: 1fr;
      }
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
  
  // Variables pour l'édition
  showEditForm = false;
  editingUser: UserWithStats | null = null;
  editForm = {
    name: '',
    email: '',
    role: 'client' as 'admin' | 'client'
  };

  // Variables pour l'ajout
  showAddForm = false;
  addForm = {
    name: '',
    email: '',
    password: '',
    role: 'client' as 'admin' | 'client'
  };

  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    // Récupérer les utilisateurs depuis localStorage
    const allUsers: UserWithStats[] = [];
    
    // 1. Ajouter les utilisateurs hardcodés (admins)
    const hardcodedUsers = [
      {
        id: 1,
        name: 'Admin Principal',
        email: 'admin@afrimarket.com',
        role: 'admin' as const,
        orderCount: 0,
        totalSpent: 0
      },
      {
        id: 2,
        name: 'Admin Secondaire',
        email: 'admin2@afrimarket.com',
        role: 'admin' as const,
        orderCount: 0,
        totalSpent: 0
      },
      {
        id: 3,
        name: 'Marie Dupont',
        email: 'client@afrimarket.com',
        role: 'client' as const,
        orderCount: 3,
        totalSpent: 125000,
        lastOrderDate: new Date('2024-01-15')
      }
    ];
    
    allUsers.push(...hardcodedUsers);
    
    // 2. Récupérer les utilisateurs enregistrés depuis localStorage
    if (typeof window !== 'undefined' && window.localStorage) {
      const registeredUsersStr = localStorage.getItem('registeredUsers');
      if (registeredUsersStr) {
        try {
          const registeredUsers = JSON.parse(registeredUsersStr);
          console.log('👥 Utilisateurs enregistrés trouvés:', registeredUsers);
          
          // Récupérer les commandes pour calculer les statistiques
          const ordersStr = localStorage.getItem('orders');
          let orders: any[] = [];
          if (ordersStr) {
            try {
              orders = JSON.parse(ordersStr);
            } catch (e) {
              console.error('❌ Erreur parsing orders:', e);
            }
          }
          
          // Ajouter chaque utilisateur enregistré avec ses statistiques
          registeredUsers.forEach((user: any, index: number) => {
            // Vérifier que l'utilisateur a un ID valide
            if (!user.id) {
              console.warn(`⚠️ Utilisateur sans ID ignoré: ${user.name} (${user.email})`);
              return;
            }
            
            // Calculer les statistiques pour cet utilisateur
            const userOrders = orders.filter((order: any) => 
              order.userId === user.id || order.clientEmail === user.email
            );
            
            console.log(`🔍 Recherche commandes pour ${user.name} (${user.email}):`);
            console.log(`   - ID utilisateur: ${user.id}`);
            console.log(`   - Commandes trouvées: ${userOrders.length}`);
            userOrders.forEach((order: any, orderIndex: number) => {
              console.log(`   - Commande ${orderIndex + 1}: ID=${order.id}, userId=${order.userId}, clientEmail=${order.clientEmail}, total=${order.total}`);
            });
            
            const totalSpent = userOrders.reduce((sum: number, order: any) => 
              sum + (order.total || 0), 0
            );
            
            const lastOrder = userOrders.length > 0 ? 
              userOrders.sort((a: any, b: any) => 
                new Date(b.date).getTime() - new Date(a.date).getTime()
              )[0] : null;
            
            const userWithStats: UserWithStats = {
              id: user.id, // Utiliser l'ID réel de l'utilisateur
              name: user.name,
              email: user.email,
              role: user.role || 'client',
              orderCount: userOrders.length,
              totalSpent: totalSpent,
              lastOrderDate: lastOrder ? new Date(lastOrder.date) : undefined
            };
            
            allUsers.push(userWithStats);
            console.log(`✅ Utilisateur ajouté: ${user.name} (${userOrders.length} commandes, ${totalSpent} FCFA)`);
          });
        } catch (e) {
          console.error('❌ Erreur parsing registeredUsers:', e);
        }
      }
    }
    
    this.users = allUsers;
    console.log(`📊 Total utilisateurs chargés: ${this.users.length}`);
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
    this.editingUser = user;
    this.editForm = {
      name: user.name,
      email: user.email,
      role: user.role
    };
    this.showEditForm = true;
  }

  saveUser() {
    if (!this.editingUser) return;
    
    // Validation
    if (!this.editForm.name.trim() || !this.editForm.email.trim()) {
      this.showMessage('Tous les champs sont obligatoires', 'error');
      return;
    }
    
    // Vérifier si l'email existe déjà (sauf pour l'utilisateur en cours d'édition)
    const emailExists = this.users.some(u => 
      u.email === this.editForm.email && u.id !== this.editingUser!.id
    );
    
    if (emailExists) {
      this.showMessage('Cet email est déjà utilisé par un autre utilisateur', 'error');
      return;
    }
    
    // Mettre à jour l'utilisateur
    const userIndex = this.users.findIndex(u => u.id === this.editingUser!.id);
    if (userIndex !== -1) {
      this.users[userIndex] = {
        ...this.users[userIndex],
        name: this.editForm.name.trim(),
        email: this.editForm.email.trim(),
        role: this.editForm.role as 'admin' | 'client'
      };
      
      this.applyFilters();
      this.showMessage('Utilisateur modifié avec succès', 'success');
      this.cancelEdit();
    }
  }

  cancelEdit() {
    this.showEditForm = false;
    this.editingUser = null;
    this.editForm = {
      name: '',
      email: '',
      role: 'client' as 'admin' | 'client'
    };
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

  addUser() {
    if (!this.addForm.name.trim() || !this.addForm.email.trim() || !this.addForm.password.trim()) {
      this.showMessage('Tous les champs sont obligatoires', 'error');
      return;
    }

    const emailExists = this.users.some(u => u.email === this.addForm.email);
    if (emailExists) {
      this.showMessage('Cet email est déjà utilisé par un autre utilisateur', 'error');
      return;
    }

    const newUserId = Math.max(...this.users.map(u => u.id)) + 1;
    const newUser = {
      id: newUserId,
      name: this.addForm.name.trim(),
      email: this.addForm.email.trim(),
      password: this.addForm.password.trim(),
      role: this.addForm.role as 'admin' | 'client',
      orderCount: 0,
      totalSpent: 0
    };

    // Ajouter à la liste locale
    this.users.push(newUser);
    
    // Sauvegarder dans localStorage si c'est un client
    if (newUser.role === 'client') {
      if (typeof window !== 'undefined' && window.localStorage) {
        const registeredUsersStr = localStorage.getItem('registeredUsers');
        let registeredUsers = [];
        
        if (registeredUsersStr) {
          try {
            registeredUsers = JSON.parse(registeredUsersStr);
          } catch (e) {
            console.error('❌ Erreur parsing registeredUsers:', e);
          }
        }
        
        // Ajouter le nouvel utilisateur
        registeredUsers.push({
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          password: newUser.password,
          role: newUser.role
        });
        
        // Sauvegarder
        localStorage.setItem('registeredUsers', JSON.stringify(registeredUsers));
        console.log('💾 Nouvel utilisateur sauvegardé dans localStorage');
      }
    }
    
    this.applyFilters();
    this.showMessage('Utilisateur ajouté avec succès', 'success');
    this.cancelAdd();
  }

  cancelAdd() {
    this.showAddForm = false;
    this.addForm = {
      name: '',
      email: '',
      password: '',
      role: 'client' as 'admin' | 'client'
    };
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