import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private messageSubject = new BehaviorSubject<string | null>(null);
  message$ = this.messageSubject.asObservable();

  show(message: string) {
    this.messageSubject.next(message);
    setTimeout(() => this.clear(), 3500);
  }

  clear() {
    this.messageSubject.next(null);
  }
} 