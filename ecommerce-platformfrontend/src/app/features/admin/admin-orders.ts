import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OrderService, Order } from '../account/services/order.service';
import { UserService, User } from './user.service';

@Component({
  selector: 'app-admin-orders',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <h2 class="admin-title">Gestion des commandes</h2>
    <div class="admin-table-wrapper">
      <table class="admin-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Date</th>
            <th>Client</th>
            <th>Statut</th>
            <th>Total</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let order of orders">
            <td>{{ order.id }}</td>
            <td>{{ order.date }}</td>
            <td>{{ usersMap[order.userId] ? usersMap[order.userId].name : '-' }}</td>
            <td>
              <span [ngClass]="{
                'status-badge': true,
                'status-en-attente': order.status === 'En attente',
                'status-expediee': order.status === 'Expédiée',
                'status-livree': order.status === 'Livrée',
                'status-annulee': order.status === 'Annulée'
              }">{{ order.status }}</span>
            </td>
            <td>{{ order.total | number:'1.2-2' }} €</td>
            <td>
              <button class="admin-btn admin-btn-edit" (click)="editOrder(order)">Modifier</button>
              <button class="admin-btn admin-btn-delete" (click)="deleteOrder(order)">Supprimer</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <form *ngIf="showForm" (ngSubmit)="saveOrder()" class="admin-form">
      <input type="hidden" [(ngModel)]="form.id" name="id">
      <div class="admin-form-row">
        <label>Statut</label>
        <select [(ngModel)]="form.status" name="status" required>
          <option value="En attente">En attente</option>
          <option value="Expédiée">Expédiée</option>
          <option value="Livrée">Livrée</option>
          <option value="Annulée">Annulée</option>
        </select>
      </div>
      <div class="admin-form-actions">
        <button type="submit" class="admin-btn admin-btn-save">Enregistrer</button>
        <button type="button" class="admin-btn admin-btn-cancel" (click)="cancelForm()">Annuler</button>
      </div>
    </form>
  `,
  styles: [`
    .admin-title { font-size: 2rem; font-weight: bold; margin-bottom: 24px; color: #2563eb; }
    .admin-table-wrapper { overflow-x: auto; }
    .admin-table { width: 100%; border-collapse: collapse; background: #fff; box-shadow: 0 2px 8px rgba(0,0,0,0.04); }
    .admin-table th, .admin-table td { padding: 10px 8px; text-align: left; }
    .admin-table th { background: #f5f7fa; color: #2563eb; font-weight: 600; }
    .admin-table tr:nth-child(even) { background: #f8fafc; }
    .admin-table tr:hover { background: #e0e7ff; }
    .admin-btn { border: none; border-radius: 6px; padding: 7px 16px; font-weight: 500; cursor: pointer; margin-right: 6px; transition: background 0.2s; }
    .admin-btn-edit { background: #2563eb; color: #fff; }
    .admin-btn-edit:hover { background: #1e40af; }
    .admin-btn-delete { background: #e11d48; color: #fff; }
    .admin-btn-delete:hover { background: #b91c1c; }
    .admin-form { display: flex; flex-wrap: wrap; gap: 18px; align-items: flex-end; background: #f5f7fa; padding: 18px 12px; border-radius: 8px; margin-top: 32px; box-shadow: 0 2px 8px rgba(0,0,0,0.04); }
    .admin-form-row { display: flex; flex-direction: column; gap: 6px; min-width: 180px; flex: 1 1 180px; }
    .admin-form-actions { display: flex; gap: 12px; align-items: center; }
    .admin-btn-save { background: #2563eb; color: #fff; }
    .admin-btn-save:hover { background: #1e40af; }
    .admin-btn-cancel { background: #f5f5f5; color: #111; }
    .status-badge { display: inline-block; padding: 3px 12px; border-radius: 12px; font-size: 0.95em; font-weight: 500; }
    .status-en-attente { background: #fbbf24; color: #fff; }
    .status-expediee { background: #2563eb; color: #fff; }
    .status-livree { background: #22c55e; color: #fff; }
    .status-annulee { background: #e11d48; color: #fff; }
    @media (max-width: 900px) {
      .admin-form { flex-direction: column; gap: 10px; }
      .admin-form-row { min-width: 100%; }
    }
  `]
})
export class AdminOrders {
  orders: Array<Order & { userId: number }> = [];
  usersMap: { [id: number]: User } = {};
  showForm = false;
  form: any = {};
  editing = false;
  editingOrder: (Order & { userId: number }) | null = null;

  constructor(private orderService: OrderService, private userService: UserService) {
    this.refresh();
  }

  refresh() {
    this.orders = this.orderService.getAllOrders();
    const users = this.userService.getUsers();
    this.usersMap = {};
    users.forEach(u => this.usersMap[u.id] = u);
  }

  editOrder(order: Order & { userId: number }) {
    this.form = { status: order.status };
    this.editing = true;
    this.editingOrder = order;
    this.showForm = true;
  }

  saveOrder() {
    if (this.editing && this.editingOrder) {
      this.orderService.updateOrderStatus(this.editingOrder.userId, this.editingOrder.id, this.form.status);
    }
    this.refresh();
    this.showForm = false;
    this.form = {};
    this.editing = false;
    this.editingOrder = null;
  }

  deleteOrder(order: Order & { userId: number }) {
    if (confirm('Supprimer cette commande ?')) {
      // Suppression manuelle : on retire la commande de l'utilisateur et on sauvegarde
      const map = (this.orderService as any).getOrdersMap();
      if (map[order.userId]) {
        map[order.userId] = map[order.userId].filter((o: Order) => o.id !== order.id);
        (this.orderService as any).saveOrdersMap(map);
      }
      this.refresh();
    }
  }

  cancelForm() {
    this.showForm = false;
    this.form = {};
    this.editing = false;
    this.editingOrder = null;
  }
} 