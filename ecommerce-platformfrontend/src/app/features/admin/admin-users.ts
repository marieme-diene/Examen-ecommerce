import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService, User } from './user.service';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <h2 class="admin-title">Gestion des utilisateurs</h2>
    
    <!-- Messages de feedback -->
    <div *ngIf="message" class="feedback-message" [class.success]="messageType === 'success'" [class.error]="messageType === 'error'">
      {{ message }}
      <button class="close-btn" (click)="clearMessage()">×</button>
    </div>

    <!-- Loader pour le chargement -->
    <div *ngIf="loading" class="loader-overlay">
      <div class="loader">Chargement...</div>
    </div>

    <div class="admin-table-wrapper">
      <table class="admin-table">
        <thead>
          <tr><th>Nom</th><th>Email</th><th>Date d'inscription</th><th></th></tr>
        </thead>
        <tbody>
          <tr *ngFor="let user of users">
            <td>{{ user.name }}</td>
            <td>{{ user.email }}</td>
            <td>{{ user.registrationDate || 'N/A' }}</td>
            <td>
              <button class="admin-btn admin-btn-edit" (click)="editUser(user)" [disabled]="saving">
                <span *ngIf="!saving">Modifier</span>
                <span *ngIf="saving">...</span>
              </button>
              <button class="admin-btn admin-btn-delete" (click)="deleteUser(user)" [disabled]="saving">
                <span *ngIf="!saving">Supprimer</span>
                <span *ngIf="saving">...</span>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    
    <button class="admin-btn admin-btn-add" (click)="startAddUser()" [disabled]="saving">
      <span *ngIf="!saving">+ Ajouter un utilisateur</span>
      <span *ngIf="saving">Chargement...</span>
    </button>

    <form *ngIf="showForm" (ngSubmit)="saveUser()" class="admin-form" #userForm="ngForm">
      <input type="hidden" [(ngModel)]="form.id" name="id">
      <div class="admin-form-row">
        <label>Nom *</label>
        <input [(ngModel)]="form.name" name="name" required minlength="2" maxlength="50"
               [class.invalid]="userForm.submitted && !form.name"
               placeholder="Nom complet">
        <div *ngIf="userForm.submitted && !form.name" class="error-text">Le nom est requis</div>
        <div *ngIf="userForm.submitted && form.name && form.name.length < 2" class="error-text">Le nom doit contenir au moins 2 caractères</div>
      </div>
      <div class="admin-form-row">
        <label>Email *</label>
        <input [(ngModel)]="form.email" name="email" required type="email"
               [class.invalid]="userForm.submitted && (!form.email || !isValidEmail(form.email))"
               placeholder="email@exemple.com">
        <div *ngIf="userForm.submitted && !form.email" class="error-text">L'email est requis</div>
        <div *ngIf="userForm.submitted && form.email && !isValidEmail(form.email)" class="error-text">Format d'email invalide</div>
        <div *ngIf="userForm.submitted && form.email && isDuplicateEmail(form.email)" class="error-text">Cet email est déjà utilisé</div>
      </div>
      <div class="admin-form-actions">
        <button type="submit" class="admin-btn admin-btn-save" [disabled]="saving">
          <span *ngIf="!saving">{{ editing ? 'Modifier' : 'Ajouter' }}</span>
          <span *ngIf="saving">Enregistrement...</span>
        </button>
        <button type="button" class="admin-btn admin-btn-cancel" (click)="cancelForm()" [disabled]="saving">Annuler</button>
      </div>
    </form>
  `,
  styles: [`
    .admin-title { font-size: 2rem; font-weight: bold; margin-bottom: 24px; color: #2563eb; }
    
    .feedback-message { 
      padding: 12px 16px; margin-bottom: 18px; border-radius: 6px; display: flex; justify-content: space-between; align-items: center;
      animation: slideIn 0.3s ease-out;
    }
    .feedback-message.success { background: #dcfce7; color: #166534; border: 1px solid #bbf7d0; }
    .feedback-message.error { background: #fef2f2; color: #b91c1c; border: 1px solid #fecaca; }
    .close-btn { background: none; border: none; font-size: 1.2rem; cursor: pointer; color: inherit; }
    
    .loader-overlay { 
      position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(255,255,255,0.8); 
      display: flex; align-items: center; justify-content: center; z-index: 1000;
    }
    .loader { 
      background: #2563eb; color: white; padding: 16px 24px; border-radius: 8px; 
      box-shadow: 0 4px 12px rgba(37,99,235,0.3);
    }
    
    .admin-table-wrapper { overflow-x: auto; }
    .admin-table { width: 100%; border-collapse: collapse; background: #fff; box-shadow: 0 2px 8px rgba(0,0,0,0.04); }
    .admin-table th, .admin-table td { padding: 10px 8px; text-align: left; }
    .admin-table th { background: #f5f7fa; color: #2563eb; font-weight: 600; }
    .admin-table tr:nth-child(even) { background: #f8fafc; }
    .admin-table tr:hover { background: #e0e7ff; }
    
    .admin-btn { 
      border: none; border-radius: 6px; padding: 7px 16px; font-weight: 500; cursor: pointer; 
      margin-right: 6px; transition: all 0.2s; 
    }
    .admin-btn:disabled { opacity: 0.6; cursor: not-allowed; }
    .admin-btn-edit { background: #2563eb; color: #fff; }
    .admin-btn-edit:hover:not(:disabled) { background: #1e40af; }
    .admin-btn-delete { background: #e11d48; color: #fff; }
    .admin-btn-delete:hover:not(:disabled) { background: #b91c1c; }
    .admin-btn-add { background: #1a8f3c; color: #fff; margin-top: 18px; }
    .admin-btn-add:hover:not(:disabled) { background: #166534; }
    
    .admin-form { 
      display: flex; flex-wrap: wrap; gap: 18px; align-items: flex-start; 
      background: #f5f7fa; padding: 18px 12px; border-radius: 8px; margin-top: 32px; 
      box-shadow: 0 2px 8px rgba(0,0,0,0.04); 
    }
    .admin-form-row { 
      display: flex; flex-direction: column; gap: 6px; min-width: 180px; flex: 1 1 180px; 
    }
    .admin-form-row label { font-weight: 600; color: #374151; }
    .admin-form-row input { 
      padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 0.9rem;
      transition: border-color 0.2s;
    }
    .admin-form-row input:focus { 
      outline: none; border-color: #2563eb; box-shadow: 0 0 0 3px rgba(37,99,235,0.1);
    }
    .admin-form-row input.invalid { border-color: #e11d48; }
    .error-text { color: #e11d48; font-size: 0.8rem; margin-top: 2px; }
    
    .admin-form-actions { display: flex; gap: 12px; align-items: center; }
    .admin-btn-save { background: #2563eb; color: #fff; }
    .admin-btn-save:hover:not(:disabled) { background: #1e40af; }
    .admin-btn-cancel { background: #f5f5f5; color: #111; }
    .admin-btn-cancel:hover:not(:disabled) { background: #e5e5e5; }
    
    @keyframes slideIn {
      from { transform: translateY(-10px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }
    
    @media (max-width: 900px) {
      .admin-form { flex-direction: column; gap: 10px; }
      .admin-form-row { min-width: 100%; }
    }
  `]
})
export class AdminUsers {
  users: User[] = [];
  showForm = false;
  form: any = {};
  editing = false;
  loading = false;
  saving = false;
  message = '';
  messageType: 'success' | 'error' = 'success';

  constructor(private userService: UserService) {
    this.refresh();
  }

  refresh() {
    this.loading = true;
    setTimeout(() => {
      this.users = this.userService.getUsers();
      this.loading = false;
    }, 300);
  }

  startAddUser() {
    this.form = {};
    this.showForm = true;
    this.editing = false;
    this.clearMessage();
  }

  editUser(user: User) {
    this.form = { ...user };
    this.showForm = true;
    this.editing = true;
    this.clearMessage();
  }

  saveUser() {
    if (!this.validateForm()) {
      return;
    }

    this.saving = true;
    
    try {
      const user: User = {
        id: this.editing && this.form.id ? this.form.id : Date.now(),
        name: this.form.name.trim(),
        email: this.form.email.trim().toLowerCase(),
        registrationDate: this.editing ? this.form.registrationDate : new Date().toISOString().slice(0, 10)
      };

      if (this.editing) {
        this.userService.updateUser(user);
        this.showMessage('Utilisateur modifié avec succès !', 'success');
      } else {
        this.userService.addUser(user);
        this.showMessage('Utilisateur ajouté avec succès !', 'success');
      }

      this.refresh();
      this.showForm = false;
      this.form = {};
      this.editing = false;
    } catch (error) {
      this.showMessage('Erreur lors de l\'enregistrement', 'error');
    } finally {
      this.saving = false;
    }
  }

  deleteUser(user: User) {
    if (confirm(`Êtes-vous sûr de vouloir supprimer "${user.name}" ?`)) {
      this.saving = true;
      try {
        this.userService.deleteUser(user.id);
        this.showMessage('Utilisateur supprimé avec succès !', 'success');
        this.refresh();
      } catch (error) {
        this.showMessage('Erreur lors de la suppression', 'error');
      } finally {
        this.saving = false;
      }
    }
  }

  cancelForm() {
    this.showForm = false;
    this.form = {};
    this.editing = false;
    this.clearMessage();
  }

  validateForm(): boolean {
    if (!this.form.name?.trim()) return false;
    if (this.form.name.trim().length < 2) return false;
    if (!this.form.email?.trim()) return false;
    if (!this.isValidEmail(this.form.email.trim())) return false;
    if (this.isDuplicateEmail(this.form.email.trim())) return false;
    return true;
  }

  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  isDuplicateEmail(email: string): boolean {
    const existingUser = this.users.find(user => 
      user.email.toLowerCase() === email.toLowerCase() && user.id !== this.form.id
    );
    return !!existingUser;
  }

  showMessage(text: string, type: 'success' | 'error') {
    this.message = text;
    this.messageType = type;
    setTimeout(() => this.clearMessage(), 5000);
  }

  clearMessage() {
    this.message = '';
  }
} 