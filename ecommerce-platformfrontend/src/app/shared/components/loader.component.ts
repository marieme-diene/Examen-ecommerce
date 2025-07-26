import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loader',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="show" class="loader-overlay" [class.fullscreen]="fullscreen">
      <div class="loader-container">
        <div class="spinner"></div>
        <div *ngIf="message" class="loader-message">{{ message }}</div>
      </div>
    </div>
  `,
  styles: [`
    .loader-overlay {
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(255, 255, 255, 0.9);
      z-index: 1000;
      padding: 20px;
    }
    
    .loader-overlay.fullscreen {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
    }
    
    .loader-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
    }
    
    .spinner {
      width: 40px;
      height: 40px;
      border: 4px solid #e5e7eb;
      border-top: 4px solid #2563eb;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }
    
    .loader-message {
      color: #374151;
      font-size: 0.9rem;
      font-weight: 500;
    }
    
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `]
})
export class LoaderComponent {
  @Input() show = false;
  @Input() message = 'Chargement...';
  @Input() fullscreen = false;
} 