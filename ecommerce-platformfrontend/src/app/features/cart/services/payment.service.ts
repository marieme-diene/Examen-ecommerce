import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';

export interface PaymentRequest {
  method: string;
  amount: number;
  currency: string;
  orderId: string;
  customerInfo: {
    name: string;
    email: string;
    phone?: string;
  };
  paymentDetails: {
    cardNumber?: string;
    cardExpiry?: string;
    cardCvv?: string;
    orangeNumber?: string;
    waveNumber?: string;
  };
}

export interface PaymentResponse {
  success: boolean;
  transactionId?: string;
  message: string;
  status: 'pending' | 'completed' | 'failed';
}

@Injectable({
  providedIn: 'root'
})
export class PaymentService {

  constructor() { }

  /**
   * Traite un paiement selon la méthode choisie
   */
  processPayment(request: PaymentRequest): Observable<PaymentResponse> {
    switch (request.method) {
      case 'card':
        return this.processCardPayment(request);
      case 'orange':
        return this.processOrangeMoneyPayment(request);
      case 'wave':
        return this.processWavePayment(request);
      case 'cash':
        return this.processCashPayment(request);
      default:
        return throwError(() => new Error('Méthode de paiement non supportée'));
    }
  }

  /**
   * Traitement du paiement par carte bancaire
   */
  private processCardPayment(request: PaymentRequest): Observable<PaymentResponse> {
    // Simulation de validation de carte
    if (!this.validateCardNumber(request.paymentDetails.cardNumber || '')) {
      return throwError(() => new Error('Numéro de carte invalide'));
    }

    if (!this.validateCardExpiry(request.paymentDetails.cardExpiry || '')) {
      return throwError(() => new Error('Date d\'expiration invalide'));
    }

    // Simulation de traitement bancaire
    return of({
      success: true,
      transactionId: `CARD_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      message: 'Paiement par carte bancaire traité avec succès',
      status: 'completed' as const
    }).pipe(delay(2000)); // Simulation du délai de traitement
  }

  /**
   * Traitement du paiement Orange Money
   */
  private processOrangeMoneyPayment(request: PaymentRequest): Observable<PaymentResponse> {
    if (!this.validatePhoneNumber(request.paymentDetails.orangeNumber || '')) {
      return throwError(() => new Error('Numéro Orange Money invalide'));
    }

    // Simulation d'envoi de SMS avec code de paiement
    const paymentCode = this.generatePaymentCode();
    
    return of({
      success: true,
      transactionId: `ORANGE_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      message: `Code de paiement ${paymentCode} envoyé par SMS. Composez #144#622# sur votre téléphone.`,
      status: 'pending' as const
    }).pipe(delay(1500));
  }

  /**
   * Traitement du paiement Wave
   */
  private processWavePayment(request: PaymentRequest): Observable<PaymentResponse> {
    if (!this.validatePhoneNumber(request.paymentDetails.waveNumber || '')) {
      return throwError(() => new Error('Numéro Wave invalide'));
    }

    // Simulation de notification Wave
    return of({
      success: true,
      transactionId: `WAVE_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      message: 'Notification Wave envoyée. Veuillez confirmer le paiement dans votre application Wave.',
      status: 'pending' as const
    }).pipe(delay(1000));
  }

  /**
   * Traitement du paiement à la livraison
   */
  private processCashPayment(request: PaymentRequest): Observable<PaymentResponse> {
    return of({
      success: true,
      transactionId: `CASH_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      message: 'Commande confirmée. Paiement à effectuer lors de la livraison.',
      status: 'pending' as const
    }).pipe(delay(500));
  }

  /**
   * Vérifie le statut d'un paiement
   */
  checkPaymentStatus(transactionId: string): Observable<PaymentResponse> {
    // Simulation de vérification du statut
    const isCompleted = Math.random() > 0.3; // 70% de chance que le paiement soit complété
    
    return of({
      success: isCompleted,
      transactionId,
      message: isCompleted ? 'Paiement confirmé' : 'Paiement en cours de traitement',
      status: isCompleted ? 'completed' as const : 'pending' as const
    }).pipe(delay(1000));
  }

  /**
   * Validation du numéro de carte (algorithme de Luhn)
   */
  private validateCardNumber(cardNumber: string): boolean {
    const cleanNumber = cardNumber.replace(/\s/g, '');
    if (cleanNumber.length < 13 || cleanNumber.length > 19) {
      return false;
    }

    let sum = 0;
    let isEven = false;

    for (let i = cleanNumber.length - 1; i >= 0; i--) {
      let digit = parseInt(cleanNumber.charAt(i));

      if (isEven) {
        digit *= 2;
        if (digit > 9) {
          digit -= 9;
        }
      }

      sum += digit;
      isEven = !isEven;
    }

    return sum % 10 === 0;
  }

  /**
   * Validation de la date d'expiration
   */
  private validateCardExpiry(expiry: string): boolean {
    const match = expiry.match(/^(\d{2})\/(\d{2})$/);
    if (!match) return false;

    const month = parseInt(match[1]);
    const year = parseInt(match[2]);

    if (month < 1 || month > 12) return false;

    const currentDate = new Date();
    const currentYear = currentDate.getFullYear() % 100;
    const currentMonth = currentDate.getMonth() + 1;

    if (year < currentYear || (year === currentYear && month < currentMonth)) {
      return false;
    }

    return true;
  }

  /**
   * Validation du numéro de téléphone
   */
  private validatePhoneNumber(phone: string): boolean {
    const cleanPhone = phone.replace(/\s/g, '');
    // Format sénégalais: 77, 76, 78, 70, 75, 33, 30, 34, 35, 36, 37, 38, 39
    const phoneRegex = /^(77|76|78|70|75|33|30|34|35|36|37|38|39)\d{7}$/;
    return phoneRegex.test(cleanPhone);
  }

  /**
   * Génère un code de paiement pour Orange Money
   */
  private generatePaymentCode(): string {
    return Math.random().toString().substr(2, 6);
  }

  /**
   * Obtient les méthodes de paiement disponibles
   */
  getAvailablePaymentMethods(): Observable<any[]> {
    return of([
      {
        id: 'card',
        name: 'Carte bancaire',
        icon: 'credit_card',
        description: 'Visa, Mastercard, American Express',
        color: '#2563eb',
        instructions: 'Saisissez les informations de votre carte bancaire',
        fees: 0,
        processingTime: 'Immédiat'
      },
      {
        id: 'orange',
        name: 'Orange Money',
        icon: 'smartphone',
        description: 'Paiement mobile sécurisé',
        color: '#ff6600',
        instructions: 'Composez #144#622# sur votre téléphone pour obtenir un code de paiement',
        fees: 0,
        processingTime: '2-5 minutes'
      },
      {
        id: 'wave',
        name: 'Wave',
        icon: 'account_balance_wallet',
        description: 'Paiement mobile instantané',
        color: '#00d4aa',
        instructions: 'Vous recevrez une notification Wave pour confirmer le paiement',
        fees: 0,
        processingTime: '1-3 minutes'
      },
      {
        id: 'cash',
        name: 'Paiement à la livraison',
        icon: 'local_shipping',
        description: 'Payer en espèces lors de la livraison',
        color: '#6c757d',
        instructions: 'Vous paierez en espèces lors de la livraison de votre commande',
        fees: 500, // Frais de livraison
        processingTime: 'Lors de la livraison'
      }
    ]);
  }
} 