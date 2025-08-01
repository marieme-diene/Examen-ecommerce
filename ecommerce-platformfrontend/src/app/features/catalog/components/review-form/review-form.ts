import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { StarRating } from '../star-rating/star-rating';

@Component({
  selector: 'app-review-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatCardModule,
    StarRating
  ],
  template: `
    <mat-card class="review-form-card">
      <mat-card-header>
        <mat-card-title>Laisser un avis</mat-card-title>
      </mat-card-header>
      <mat-card-content>
        <form (ngSubmit)="submitReview()" class="review-form">
          <div class="rating-section">
            <label>Votre note :</label>
            <app-star-rating 
              [(rating)]="rating" 
              [readonly]="false"
              [showRating]="true">
            </app-star-rating>
          </div>
          
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Votre commentaire</mat-label>
            <textarea 
              matInput 
              [(ngModel)]="comment" 
              name="comment"
              rows="4"
              placeholder="Partagez votre expérience avec ce produit..."
              required>
            </textarea>
          </mat-form-field>
          
          <div class="form-actions">
            <button 
              mat-raised-button 
              color="primary" 
              type="submit"
              [disabled]="!rating || !comment.trim() || isSubmitting">
              {{ isSubmitting ? 'Envoi...' : 'Publier l\'avis' }}
            </button>
            <button 
              mat-button 
              type="button" 
              (click)="cancel()">
              Annuler
            </button>
          </div>
        </form>
      </mat-card-content>
    </mat-card>
  `,
  styles: [`
    .review-form-card {
      margin-bottom: 24px;
    }
    
    .review-form {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    
    .rating-section {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    
    .rating-section label {
      font-weight: 500;
      color: #333;
    }
    
    .full-width {
      width: 100%;
    }
    
    .form-actions {
      display: flex;
      gap: 12px;
      justify-content: flex-end;
    }
    
    @media (max-width: 768px) {
      .form-actions {
        flex-direction: column;
      }
    }
  `]
})
export class ReviewForm {
  @Input() productId!: number;
  @Input() productName!: string;
  @Output() reviewSubmitted = new EventEmitter<any>();
  @Output() cancelled = new EventEmitter<void>();

  rating: number = 0;
  comment: string = '';
  isSubmitting: boolean = false;

  submitReview() {
    if (!this.rating || !this.comment.trim()) {
      return;
    }

    this.isSubmitting = true;
    
    const review = {
      productId: this.productId,
      rating: this.rating,
      comment: this.comment.trim()
    };

    this.reviewSubmitted.emit(review);
    
    // Reset form
    setTimeout(() => {
      this.rating = 0;
      this.comment = '';
      this.isSubmitting = false;
    }, 1000);
  }

  cancel() {
    this.cancelled.emit();
  }
} 