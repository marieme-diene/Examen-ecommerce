import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService, User, Address } from '../../services/auth.service';
import { OrderService, Order } from '../../services/order.service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { NotificationService } from '../../services/notification.service';
import { jsPDF } from 'jspdf';
import { MatDialog, MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-account-home',
  standalone: true,
  imports: [CommonModule, FormsModule, MatButtonModule, MatFormFieldModule, MatInputModule, MatDialogModule],
  templateUrl: './account-home.html',
  styleUrl: './account-home.css'
})
export class AccountHome {
  user: User | null = null;
  editMode = false;
  name = '';
  email = '';
  orders: Order[] = [];
  message = '';
  addresses: Address[] = [];
  addressForm: Partial<Address> = {};
  editingAddressId: number | null = null;
  showAddressForm = false;

  constructor(
    private auth: AuthService,
    private orderService: OrderService,
    private router: Router,
    private notification: NotificationService,
    public dialog: MatDialog
  ) {}

  ngOnInit() {
    this.user = this.auth.getUser();
    if (this.user) {
      this.name = this.user.name;
      this.email = this.user.email;
      this.orderService.getOrdersForUser(this.user.id).subscribe(orders => this.orders = orders);
      this.addresses = this.auth.getAddressesForUser(this.user.id);
    }
  }

  enableEdit() {
    this.editMode = true;
    this.message = '';
  }

  saveProfile() {
    if (this.user) {
      this.user.name = this.name;
      this.user.email = this.email;
      if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
        localStorage.setItem('user', JSON.stringify(this.user));
      }
      this.auth['userSubject'].next(this.user); // force update
      this.editMode = false;
      this.message = 'Profil mis à jour !';
      this.notification.show('Profil mis à jour !');
    }
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/account/login']);
  }

  downloadInvoice(order: Order) {
    const doc = new jsPDF();
    let y = 18;
    doc.setFontSize(18);
    doc.text(`Facture #${order.id}`, 10, y); y += 10;
    doc.setFontSize(12);
    doc.text(`Date : ${order.date}`, 10, y); y += 8;
    doc.text(`Statut : ${order.status}`, 10, y); y += 8;
    doc.text(`Client : ${this.user?.name || ''}`, 10, y); y += 8;
    doc.text(`Email : ${this.user?.email || ''}`, 10, y); y += 8;
    if (order.address) {
      doc.text(`Adresse : ${order.address}`, 10, y); y += 8;
    }
    if (order.payment) {
      doc.text(`Paiement : ${order.payment}`, 10, y); y += 8;
    }
    y += 4;
    doc.setFontSize(13);
    doc.text('Produits commandés :', 10, y); y += 8;
    doc.setFontSize(11);
    doc.setFillColor(37,99,235);
    doc.setTextColor(255,255,255);
    doc.rect(10, y-5, 190, 8, 'F');
    doc.text('Produit', 12, y);
    doc.text('Qté', 90, y);
    doc.text('Prix unitaire', 110, y);
    doc.text('Total', 160, y);
    y += 7;
    doc.setTextColor(0,0,0);
    let total = 0;
    if (order.items && Array.isArray(order.items)) {
      for (const item of order.items) {
        doc.text(item.product.name, 12, y);
        doc.text(String(item.quantity), 92, y, { align: 'right' });
        doc.text(`${item.product.price} FCFA`, 120, y, { align: 'right' });
        const lineTotal = item.product.price * item.quantity;
        doc.text(`${lineTotal} FCFA`, 170, y, { align: 'right' });
        total += lineTotal;
        y += 7;
        if (y > 270) { doc.addPage(); y = 20; }
      }
    }
    y += 4;
    doc.setFontSize(13);
    doc.setTextColor(37,99,235);
    doc.text(`Total à payer : ${total} FCFA`, 10, y);
    doc.setTextColor(0,0,0);
    y += 12;
    doc.setFontSize(11);
    doc.text('Merci pour votre commande sur AfriMarket !', 10, y);
    doc.save(`facture-${order.id}.pdf`);
  }

  public openOrderDetail(order: Order) {
    this.dialog.open(OrderDetailDialog, {
      width: '480px',
      data: { order, user: this.user }
    });
  }

  startAddAddress() {
    this.addressForm = {};
    this.editingAddressId = null;
    this.showAddressForm = true;
  }

  startEditAddress(addr: Address) {
    this.addressForm = { ...addr };
    this.editingAddressId = addr.id;
    this.showAddressForm = true;
  }

  saveAddress() {
    if (!this.user) return;
    const addr: Address = {
      id: this.editingAddressId ?? Date.now(),
      name: this.addressForm.name || '',
      street: this.addressForm.street || '',
      city: this.addressForm.city || '',
      postalCode: this.addressForm.postalCode || '',
      country: this.addressForm.country || '',
      phone: this.addressForm.phone || ''
    };
    if (this.editingAddressId) {
      this.auth.updateAddress(this.user.id, addr);
    } else {
      this.auth.addAddress(this.user.id, addr);
    }
    this.addresses = this.auth.getAddressesForUser(this.user.id);
    this.addressForm = {};
    this.editingAddressId = null;
    this.showAddressForm = false;
  }

  cancelAddressForm() {
    this.addressForm = {};
    this.editingAddressId = null;
    this.showAddressForm = false;
  }

  deleteAddress(addrId: number) {
    if (!this.user) return;
    this.auth.deleteAddress(this.user.id, addrId);
    this.addresses = this.auth.getAddressesForUser(this.user.id);
  }
}

@Component({
  selector: 'order-detail-dialog',
  standalone: true,
  imports: [MatButtonModule, CommonModule],
  template: `
    <h2 mat-dialog-title>Détail de la commande #{{ data.order.id }}</h2>
    <div mat-dialog-content style="padding: 8px 0;">
      <div><b>Date :</b> {{ data.order.date }}</div>
      <div><b>Statut :</b> {{ data.order.status }}</div>
      <div><b>Adresse :</b> {{ data.order.address || '-' }}</div>
      <div><b>Paiement :</b> {{ data.order.payment || '-' }}</div>
      <div><b>Total :</b> {{ data.order.total | currency:'FCFA':'symbol':'1.0-0':'fr' }}</div>
      <div style="margin:12px 0 4px 0;"><b>Produits :</b></div>
      <table style="width:100%; border-collapse:collapse;">
        <thead>
          <tr style="background:#f5f5f5;"><th>Produit</th><th>Quantité</th><th>Prix</th></tr>
        </thead>
        <tbody>
          <tr *ngFor="let item of data.order.items">
            <td>{{ item.product.name }}</td>
            <td>{{ item.quantity }}</td>
            <td>{{ item.product.price | currency:'FCFA':'symbol':'1.0-0':'fr' }}</td>
          </tr>
        </tbody>
      </table>
    </div>
    <div mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Fermer</button>
    </div>
  `
})
export class OrderDetailDialog {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<OrderDetailDialog>
  ) {}
}
