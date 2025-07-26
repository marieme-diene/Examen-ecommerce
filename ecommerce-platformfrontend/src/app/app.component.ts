import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Observable, map, shareReplay } from 'rxjs';
import { CartService } from './features/cart/services/cart.service';

export class AppComponent {
  isHandset$: Observable<boolean>;
  isAdmin = false; // À remplacer par la vraie logique d'auth plus tard
  cartCount$: Observable<number>;

  constructor(private breakpointObserver: BreakpointObserver, private cartService: CartService) {
    this.isHandset$ = this.breakpointObserver.observe(Breakpoints.Handset)
      .pipe(
        map(result => result.matches),
        shareReplay()
      );
    this.cartCount$ = this.cartService.count$;
  }
} 