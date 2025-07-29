import { Component } from '@angular/core';
import { RouterLink, RouterOutlet, Router } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CartService } from './features/cart/services/cart.service';
import { Observable } from 'rxjs';
import { NotificationService } from './features/account/services/notification.service';
import { AuthService } from './features/account/services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterOutlet,
    RouterLink,
    MatSidenavModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatListModule,
    MatMenuModule,
    MatFormFieldModule,
    MatInputModule,
    MatCheckboxModule
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.css'
})
export class App {
  isAdmin = false;
  isHandset$ = null;
  cartCount$: Observable<number>;
  notification$;
  headerSearch = '';
  
  constructor(
    private cartService: CartService, 
    private notification: NotificationService, 
    private router: Router,
    public authService: AuthService
  ) {
    this.cartCount$ = this.cartService.count$;
    this.notification$ = this.notification.message$;
    this.isAdmin = this.authService.isAdmin();
  }
  
  onHeaderSearch(event: Event) {
    event.preventDefault();
    this.router.navigate(['/catalog'], { queryParams: { search: this.headerSearch } });
  }

  navigateToLogin() {
    this.router.navigate(['/account/login']);
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/']);
  }

  canAccessAdmin(): boolean {
    return this.authService.isAdmin();
  }
}
