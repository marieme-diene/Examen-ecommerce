import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface Notification {
  type: 'success' | 'error' | 'info' | 'email';
  message: string;
  timestamp: Date;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private messageSubject = new BehaviorSubject<Notification | null>(null);
  message$ = this.messageSubject.asObservable();

  // Simulation d'envoi d'emails de suivi
  sendOrderConfirmationEmail(clientEmail: string, orderId: number, orderDetails: any) {
    console.log(`📧 Email de confirmation envoyé à ${clientEmail} pour la commande #${orderId}`);
    this.showMessage(`Email de confirmation envoyé pour la commande #${orderId}`, 'email');
  }

  sendShippingEmail(clientEmail: string, orderId: number, trackingNumber: string) {
    console.log(`📧 Email de suivi envoyé à ${clientEmail} - Numéro de suivi: ${trackingNumber}`);
    this.showMessage(`Email de suivi envoyé - Suivi: ${trackingNumber}`, 'email');
  }

  sendDeliveryEmail(clientEmail: string, orderId: number) {
    console.log(`📧 Email de livraison envoyé à ${clientEmail} pour la commande #${orderId}`);
    this.showMessage(`Email de livraison envoyé pour la commande #${orderId}`, 'email');
  }

  showMessage(message: string, type: 'success' | 'error' | 'info' | 'email' = 'info') {
    const notification: Notification = {
      type,
      message,
      timestamp: new Date()
    };
    this.messageSubject.next(notification);
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
      this.messageSubject.next(null);
    }, 5000);
  }

  clearMessage() {
    this.messageSubject.next(null);
  }
} 