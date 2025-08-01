import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-star-rating',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  template: `
    <div class="star-rating" [class.readonly]="readonly">
      <mat-icon 
        *ngFor="let star of stars; let i = index"
        [class.filled]="i < rating"
        [class.half-filled]="!readonly && i === Math.floor(rating) && rating % 1 !== 0"
        (click)="!readonly && onStarClick(i + 1)"
        (mouseenter)="!readonly && onStarHover(i + 1)"
        (mouseleave)="!readonly && onStarLeave()"
        class="star-icon">
        {{ getStarIcon(i) }}
      </mat-icon>
      <span *ngIf="showRating" class="rating-text">{{ rating }}/5</span>
    </div>
  `,
  styles: [`
    .star-rating {
      display: flex;
      align-items: center;
      gap: 2px;
    }

    .star-icon {
      cursor: pointer;
      color: #ddd;
      font-size: 20px;
      transition: color 0.2s ease;
    }

    .star-icon.filled {
      color: #ffc107;
    }

    .star-icon.half-filled {
      color: #ffc107;
    }

    .star-rating:not(.readonly) .star-icon:hover {
      color: #ffc107;
    }

    .star-rating.readonly .star-icon {
      cursor: default;
    }

    .rating-text {
      margin-left: 8px;
      font-size: 14px;
      color: #666;
    }
  `]
})
export class StarRating implements OnInit {
  @Input() rating: number = 0;
  @Input() readonly: boolean = false;
  @Input() showRating: boolean = true;
  @Output() ratingChange = new EventEmitter<number>();

  stars: number[] = [];
  hoverRating: number = 0;
  Math = Math; // Exposer Math pour le template

  ngOnInit() {
    this.stars = Array(5).fill(0).map((_, i) => i);
  }

  onStarClick(starIndex: number) {
    this.rating = starIndex;
    this.ratingChange.emit(this.rating);
  }

  onStarHover(starIndex: number) {
    this.hoverRating = starIndex;
  }

  onStarLeave() {
    this.hoverRating = 0;
  }

  getStarIcon(index: number): string {
    const currentRating = this.hoverRating || this.rating;
    
    if (index < Math.floor(currentRating)) {
      return 'star';
    } else if (index === Math.floor(currentRating) && currentRating % 1 !== 0) {
      return 'star_half';
    } else {
      return 'star_border';
    }
  }
} 