import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [CommonModule, FormsModule, MatFormFieldModule, MatInputModule, MatButtonModule],
  template: `
    <div style="max-width:340px;margin:64px auto;padding:32px 24px;background:#fff;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.07);">
      <h2 style="text-align:center;margin-bottom:24px;">Connexion Admin</h2>
      <form (ngSubmit)="login()" style="display:flex;flex-direction:column;gap:18px;">
        <mat-form-field appearance="outline">
          <mat-label>Identifiant</mat-label>
          <input matInput [(ngModel)]="username" name="username" required>
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Mot de passe</mat-label>
          <input matInput type="password" [(ngModel)]="password" name="password" required>
        </mat-form-field>
        <button mat-raised-button color="primary" type="submit">Se connecter</button>
        <div *ngIf="error" style="color:#e11d48;text-align:center;">{{ error }}</div>
      </form>
    </div>
  `
})
export class AdminLogin {
  username = '';
  password = '';
  error = '';

  constructor(private router: Router) {}

  login() {
    // Pour la démo : identifiant admin / mot de passe admin123
    if (this.username === 'admin' && this.password === 'admin123') {
      if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
        localStorage.setItem('isAdmin', 'true');
      }
      this.router.navigate(['/admin']);
    } else {
      this.error = 'Identifiants invalides';
    }
  }
} 