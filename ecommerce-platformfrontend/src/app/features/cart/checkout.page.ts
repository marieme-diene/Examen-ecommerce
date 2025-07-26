import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { Router } from '@angular/router';
import { OrderService, Order } from '../../features/account/services/order.service';
import { AuthService, User, Address } from '../../features/account/services/auth.service';
import { CartService } from './services/cart.service';

@Component({
  selector: 'app-checkout-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatOptionModule
  ],
  template: `
    <div class="checkout-container">
      <h1>Validation de la commande</h1>
      <form #checkoutForm="ngForm" (ngSubmit)="submit()" *ngIf="!success">
        <mat-form-field appearance="outline" *ngIf="addresses.length > 0">
          <mat-label>Adresse de livraison enregistrée</mat-label>
          <mat-select [(ngModel)]="selectedAddressId" name="selectedAddressId" (selectionChange)="onAddressSelect($event.value)">
            <mat-option [value]="null">Saisir une nouvelle adresse</mat-option>
            <mat-option *ngFor="let addr of addresses" [value]="addr.id">
              {{ addr.name }} - {{ addr.street }}, {{ addr.city }}
            </mat-option>
          </mat-select>
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Nom complet</mat-label>
          <input matInput name="name" [(ngModel)]="name" required>
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Adresse de livraison</mat-label>
          <input matInput name="address" [(ngModel)]="address" required>
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Email</mat-label>
          <input matInput name="email" [(ngModel)]="email" required type="email">
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Paiement</mat-label>
          <mat-select name="payment" [(ngModel)]="payment" required>
            <mat-option value="carte">Carte bancaire</mat-option>
            <mat-option value="mobile">Mobile Money</mat-option>
            <mat-option value="cash">Paiement à la livraison</mat-option>
          </mat-select>
        </mat-form-field>
        <button mat-raised-button color="primary" type="submit" [disabled]="!checkoutForm.form.valid">Valider la commande</button>
      </form>
      <div *ngIf="success" class="success-message">
        <h2>Merci pour votre commande !</h2>
        <p>Vous recevrez un email de confirmation.</p>
        <button mat-stroked-button color="primary" (click)="goToOrders()">Voir mes commandes</button>
      </div>
    </div>
  `,
  styles: [`
    .checkout-container { max-width: 500px; margin: 48px auto; background: #fff; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.04); padding: 32px 24px; }
    form { display: flex; flex-direction: column; gap: 20px; }
    .success-message { text-align: center; margin-top: 32px; }
  `]
})
export class CheckoutPage {
  name = '';
  address = '';
  email = '';
  payment = '';
  success = false;
  addresses: Address[] = [];
  selectedAddressId: number | null = null;

  constructor(
    private router: Router,
    private orderService: OrderService,
    private auth: AuthService,
    private cartService: CartService
  ) {
    const user = this.auth.getUser();
    if (user) {
      this.addresses = this.auth.getAddressesForUser(user.id);
    }
  }

  onAddressSelect(addrId: number) {
    const addr = this.addresses.find(a => a.id === addrId);
    if (addr) {
      this.name = addr.name;
      this.address = `${addr.street}, ${addr.city}, ${addr.postalCode}, ${addr.country}`;
    }
  }

  submit() {
    const user: User | null = this.auth.getUser();
    if (!user) {
      alert('Vous devez être connecté pour valider une commande.');
      return;
    }
    const items = this.cartService.getItems();
    if (items.length === 0) {
      alert('Votre panier est vide.');
      return;
    }
    const total = this.cartService.getTotal();
    const selectedAddress = this.addresses.find(a => a.id === this.selectedAddressId) || null;
    const order: Order = {
      id: Date.now(),
      date: new Date().toISOString().slice(0, 10),
      status: 'En cours',
      total,
      pdfUrl: '',
      items: items.map(i => ({ product: i.product, quantity: i.quantity })),
      address: selectedAddress ? `${selectedAddress.name}, ${selectedAddress.street}, ${selectedAddress.city}, ${selectedAddress.postalCode}, ${selectedAddress.country}, ${selectedAddress.phone}` : this.address,
      payment: this.payment
    };
    this.orderService.addOrder(user.id, order);
    this.cartService.clearCart();
    this.success = true;
  }

  goToOrders() {
    console.log('Clic sur Voir mes commandes');
    this.router.navigate(['/account/orders']);
  }
} 