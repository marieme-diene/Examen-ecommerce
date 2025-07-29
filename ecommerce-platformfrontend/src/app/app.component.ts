import { Component } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Observable, map, shareReplay } from 'rxjs';
import { CartService } from './features/cart/services/cart.service';
import { Router } from '@angular/router';
import { AuthService } from './features/account/services/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    MatSidenavModule,
    MatToolbarModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule
  ]
})
export class AppComponent {
  isHandset$: Observable<boolean>;
  isAdmin = false;
  cartCount$: Observable<number>;
  headerSearch = '';
  notification$: Observable<string | null>;

  constructor(
    private breakpointObserver: BreakpointObserver, 
    private cartService: CartService,
    private router: Router,
    public authService: AuthService
  ) {
    this.isHandset$ = this.breakpointObserver.observe(Breakpoints.Handset)
      .pipe(
        map(result => result.matches),
        shareReplay()
      );
    this.cartCount$ = this.cartService.count$;
    this.notification$ = new Observable<string | null>();
    this.isAdmin = this.authService.isAdmin();
  }

  canAccessAdmin(): boolean {
    return this.authService.isAdmin();
  }

  navigateToLogin() {
    this.router.navigate(['/account/login']);
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/']);
  }

  onHeaderSearch(event: Event) {
    event.preventDefault();
    // Logique de recherche à implémenter
  }
} 