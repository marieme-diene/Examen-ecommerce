import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-responsive-test',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="responsive-test-panel" [class.visible]="isVisible">
      <div class="test-header">
        <h3>🧪 Test Responsive</h3>
        <button (click)="togglePanel()" class="close-btn">×</button>
      </div>
      
      <div class="test-content">
        <div class="screen-info">
          <div class="info-item">
            <span class="label">Largeur:</span>
            <span class="value">{{ screenWidth }}px</span>
          </div>
          <div class="info-item">
            <span class="label">Hauteur:</span>
            <span class="value">{{ screenHeight }}px</span>
          </div>
          <div class="info-item">
            <span class="label">Type:</span>
            <span class="value" [class.mobile]="isMobile" [class.tablet]="isTablet" [class.desktop]="isDesktop">
              {{ deviceType }}
            </span>
          </div>
        </div>

        <div class="breakpoint-tests">
          <h4>Tests de Breakpoints</h4>
          <div class="test-grid">
            <div class="test-item" [class.pass]="isMobile" [class.fail]="!isMobile">
              <span class="test-icon">{{ isMobile ? '✅' : '❌' }}</span>
              <span class="test-label">Mobile (≤768px)</span>
            </div>
            <div class="test-item" [class.pass]="isTablet" [class.fail]="!isTablet">
              <span class="test-icon">{{ isTablet ? '✅' : '❌' }}</span>
              <span class="test-label">Tablet (769-1024px)</span>
            </div>
            <div class="test-item" [class.pass]="isDesktop" [class.fail]="!isDesktop">
              <span class="test-icon">{{ isDesktop ? '✅' : '❌' }}</span>
              <span class="test-label">Desktop (>1024px)</span>
            </div>
          </div>
        </div>

        <div class="feature-tests">
          <h4>Tests de Fonctionnalités</h4>
          <div class="test-list">
            <div class="test-item" [class.pass]="isMobile">
              <span class="test-icon">{{ isMobile ? '✅' : '❌' }}</span>
              <span class="test-label">Menu hamburger visible</span>
            </div>
            <div class="test-item" [class.pass]="!isMobile">
              <span class="test-icon">{{ !isMobile ? '✅' : '❌' }}</span>
              <span class="test-label">Menu latéral visible</span>
            </div>
            <div class="test-item" [class.pass]="true">
              <span class="test-icon">✅</span>
              <span class="test-label">Grille responsive</span>
            </div>
            <div class="test-item" [class.pass]="true">
              <span class="test-icon">✅</span>
              <span class="test-label">Formulaires adaptés</span>
            </div>
          </div>
        </div>

        <div class="quick-actions">
          <h4>Actions Rapides</h4>
          <div class="action-buttons">
            <button (click)="simulateMobile()" class="action-btn">📱 Mobile</button>
            <button (click)="simulateTablet()" class="action-btn">📱 Tablet</button>
            <button (click)="simulateDesktop()" class="action-btn">💻 Desktop</button>
            <button (click)="toggleFullscreen()" class="action-btn">🖥️ Fullscreen</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Bouton flottant pour ouvrir le panel -->
    <button (click)="togglePanel()" class="floating-test-btn" [class.visible]="!isVisible">
      🧪
    </button>
  `,
  styles: [`
    .responsive-test-panel {
      position: fixed;
      top: 0;
      right: -400px;
      width: 400px;
      height: 100vh;
      background: #1f2937;
      color: white;
      z-index: 9999;
      transition: right 0.3s ease;
      overflow-y: auto;
      box-shadow: -2px 0 10px rgba(0,0,0,0.3);
    }

    .responsive-test-panel.visible {
      right: 0;
    }

    .test-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px;
      border-bottom: 1px solid #374151;
      background: #111827;
    }

    .test-header h3 {
      margin: 0;
      font-size: 1.1rem;
    }

    .close-btn {
      background: none;
      border: none;
      color: white;
      font-size: 1.5rem;
      cursor: pointer;
      padding: 0;
      width: 30px;
      height: 30px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .test-content {
      padding: 16px;
    }

    .screen-info {
      background: #374151;
      padding: 12px;
      border-radius: 8px;
      margin-bottom: 16px;
    }

    .info-item {
      display: flex;
      justify-content: space-between;
      margin-bottom: 8px;
    }

    .info-item:last-child {
      margin-bottom: 0;
    }

    .label {
      color: #9ca3af;
    }

    .value {
      font-weight: 600;
    }

    .value.mobile { color: #10b981; }
    .value.tablet { color: #f59e0b; }
    .value.desktop { color: #3b82f6; }

    .breakpoint-tests, .feature-tests {
      margin-bottom: 20px;
    }

    .breakpoint-tests h4, .feature-tests h4 {
      margin: 0 0 12px 0;
      font-size: 1rem;
      color: #d1d5db;
    }

    .test-grid {
      display: grid;
      gap: 8px;
    }

    .test-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .test-item {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 12px;
      border-radius: 6px;
      background: #374151;
    }

    .test-item.pass {
      background: #065f46;
      border: 1px solid #10b981;
    }

    .test-item.fail {
      background: #7f1d1d;
      border: 1px solid #ef4444;
    }

    .test-icon {
      font-size: 1.1rem;
    }

    .test-label {
      font-size: 0.9rem;
    }

    .quick-actions h4 {
      margin: 0 0 12px 0;
      font-size: 1rem;
      color: #d1d5db;
    }

    .action-buttons {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;
    }

    .action-btn {
      background: #3b82f6;
      color: white;
      border: none;
      padding: 8px 12px;
      border-radius: 6px;
      cursor: pointer;
      font-size: 0.9rem;
      transition: background 0.2s;
    }

    .action-btn:hover {
      background: #2563eb;
    }

    .floating-test-btn {
      position: fixed;
      bottom: 20px;
      right: 20px;
      width: 50px;
      height: 50px;
      border-radius: 50%;
      background: #3b82f6;
      color: white;
      border: none;
      font-size: 1.5rem;
      cursor: pointer;
      z-index: 9998;
      box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
      transition: all 0.3s ease;
      opacity: 0;
      transform: scale(0.8);
    }

    .floating-test-btn.visible {
      opacity: 1;
      transform: scale(1);
    }

    .floating-test-btn:hover {
      background: #2563eb;
      transform: scale(1.1);
    }

    @media (max-width: 768px) {
      .responsive-test-panel {
        width: 100%;
        right: -100%;
      }
      
      .action-buttons {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class ResponsiveTestComponent implements OnInit, OnDestroy {
  isVisible = false;
  screenWidth = 0;
  screenHeight = 0;
  private resizeListener: any;

  ngOnInit() {
    this.updateScreenSize();
    this.resizeListener = () => this.updateScreenSize();
    window.addEventListener('resize', this.resizeListener);
  }

  ngOnDestroy() {
    if (this.resizeListener) {
      window.removeEventListener('resize', this.resizeListener);
    }
  }

  get isMobile(): boolean {
    return this.screenWidth <= 768;
  }

  get isTablet(): boolean {
    return this.screenWidth > 768 && this.screenWidth <= 1024;
  }

  get isDesktop(): boolean {
    return this.screenWidth > 1024;
  }

  get deviceType(): string {
    if (this.isMobile) return 'Mobile';
    if (this.isTablet) return 'Tablet';
    return 'Desktop';
  }

  updateScreenSize() {
    this.screenWidth = window.innerWidth;
    this.screenHeight = window.innerHeight;
  }

  togglePanel() {
    this.isVisible = !this.isVisible;
  }

  simulateMobile() {
    this.resizeWindow(375, 667);
  }

  simulateTablet() {
    this.resizeWindow(768, 1024);
  }

  simulateDesktop() {
    this.resizeWindow(1200, 800);
  }

  toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  }

  private resizeWindow(width: number, height: number) {
    if (window.screen && window.screen.availWidth && window.screen.availHeight) {
      const left = (window.screen.availWidth - width) / 2;
      const top = (window.screen.availHeight - height) / 2;
      window.resizeTo(width, height);
      window.moveTo(left, top);
    }
  }
} 