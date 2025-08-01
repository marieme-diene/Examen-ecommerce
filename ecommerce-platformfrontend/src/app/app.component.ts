import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { FavoritesService } from './features/catalog/services/favorites.service';
import { CartService } from './features/cart/services/cart.service';
import { AuthService } from './features/account/services/auth.service';
import { NotificationService } from './shared/services/notification.service';

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
    MatMenuModule,
    MatFormFieldModule,
    MatInputModule,
    MatCheckboxModule
  ]
})
export class AppComponent implements OnInit {
  isHandset$!: Observable<boolean>;
  notification$: Observable<string | null>;
  isAdmin = false;
  headerSearch = '';
  favoritesCount = 0;
  cartCount$: Observable<number>;

  constructor(
    private breakpointObserver: BreakpointObserver, 
    private cartService: CartService,
    private router: Router,
    public authService: AuthService,
    private favoritesService: FavoritesService,
    private notificationService: NotificationService
  ) {
    this.notification$ = new Observable<string | null>();
    this.cartCount$ = this.cartService.count$;
  }

  ngOnInit() {
    this.isHandset$ = this.breakpointObserver.observe(Breakpoints.Handset)
      .pipe(
        map(result => result.matches),
        shareReplay()
      );

    this.isAdmin = this.authService.isAdmin();

    // S'abonner aux changements de favoris
    this.favoritesService.favorites$.subscribe(favorites => {
      this.favoritesCount = favorites.size;
    });
  }

  onNotificationClick() {
    this.router.navigate(['/account/notifications']);
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/']);
  }

  onHeaderSearch(event: Event) {
    event.preventDefault();
    if (this.headerSearch.trim()) {
      this.router.navigate(['/catalog'], { queryParams: { search: this.headerSearch } });
    }
  }

  canAccessAdmin(): boolean {
    return this.authService.isAdmin();
  }
} 