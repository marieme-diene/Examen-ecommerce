import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-feedback-message',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="show" class="feedback-message" [class.success]="type === 'success'" [class.error]="type === 'error'" [class.warning]="type === 'warning'" [class.info]="type === 'info'">
      <div class="message-content">
        <span class="message-icon">
          <span *ngIf="type === 'success'">✓</span>
          <span *ngIf="type === 'error'">✕</span>
          <span *ngIf="type === 'warning'">⚠</span>
          <span *ngIf="type === 'info'">ℹ</span>
        </span>
        <span class="message-text">{{ message }}</span>
      </div>
      <button class="close-btn" (click)="onClose()" *ngIf="dismissible">×</button>
    </div>
  `,
  styles: [`
    .feedback-message {
      padding: 12px 16px;
      margin-bottom: 18px;
      border-radius: 8px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      animation: slideIn 0.3s ease-out;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }
    
    .message-content {
      display: flex;
      align-items: center;
      gap: 8px;
      flex: 1;
    }
    
    .message-icon {
      font-size: 1.1rem;
      font-weight: bold;
    }
    
    .message-text {
      font-size: 0.9rem;
      font-weight: 500;
    }
    
    .close-btn {
      background: none;
      border: none;
      font-size: 1.2rem;
      cursor: pointer;
      color: inherit;
      opacity: 0.7;
      transition: opacity 0.2s;
      margin-left: 12px;
    }
    
    .close-btn:hover {
      opacity: 1;
    }
    
    .feedback-message.success {
      background: #dcfce7;
      color: #166534;
      border: 1px solid #bbf7d0;
    }
    
    .feedback-message.error {
      background: #fef2f2;
      color: #b91c1c;
      border: 1px solid #fecaca;
    }
    
    .feedback-message.warning {
      background: #fef3c7;
      color: #d97706;
      border: 1px solid #fed7aa;
    }
    
    .feedback-message.info {
      background: #dbeafe;
      color: #1e40af;
      border: 1px solid #bfdbfe;
    }
    
    @keyframes slideIn {
      from {
        transform: translateY(-10px);
        opacity: 0;
      }
      to {
        transform: translateY(0);
        opacity: 1;
      }
    }
  `]
})
export class FeedbackMessageComponent {
  @Input() show = false;
  @Input() message = '';
  @Input() type: 'success' | 'error' | 'warning' | 'info' = 'info';
  @Input() dismissible = true;
  @Input() autoHide = true;
  @Input() autoHideDelay = 5000;
  
  @Output() close = new EventEmitter<void>();

  ngOnInit() {
    if (this.autoHide && this.show) {
      setTimeout(() => {
        this.onClose();
      }, this.autoHideDelay);
    }
  }

  onClose() {
    this.close.emit();
  }
} 