import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { Review, ProductRating } from '../models/review.model';

@Injectable({
  providedIn: 'root'
})
export class ReviewService {
  private readonly REVIEWS_KEY = 'afrimarket_reviews';
  private reviewsSubject = new BehaviorSubject<Review[]>([]);
  public reviews$ = this.reviewsSubject.asObservable();

  constructor() {
    this.loadReviews();
  }

  // Charger les avis depuis localStorage
  private loadReviews(): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      const savedReviews = localStorage.getItem(this.REVIEWS_KEY);
      if (savedReviews) {
        const reviews = JSON.parse(savedReviews).map((review: any) => ({
          ...review,
          date: new Date(review.date)
        }));
        this.reviewsSubject.next(reviews);
      }
    }
  }

  // Sauvegarder les avis dans localStorage
  private saveReviews(reviews: Review[]): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(this.REVIEWS_KEY, JSON.stringify(reviews));
    }
  }

  // Obtenir tous les avis
  getReviews(): Observable<Review[]> {
    return this.reviewsSubject.asObservable();
  }

  // Obtenir les avis d'un produit
  getProductReviews(productId: number): Observable<Review[]> {
    const reviews = this.reviewsSubject.value.filter(review => review.productId === productId);
    return of(reviews.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
  }

  // Ajouter un avis
  addReview(review: Omit<Review, 'id' | 'date'>): Observable<Review> {
    const newReview: Review = {
      ...review,
      id: Date.now(),
      date: new Date()
    };

    const currentReviews = this.reviewsSubject.value;
    const updatedReviews = [...currentReviews, newReview];
    
    this.reviewsSubject.next(updatedReviews);
    this.saveReviews(updatedReviews);

    return of(newReview);
  }

  // Obtenir la notation d'un produit
  getProductRating(productId: number): Observable<ProductRating> {
    const reviews = this.reviewsSubject.value.filter(review => review.productId === productId);
    
    if (reviews.length === 0) {
      return of({
        productId,
        averageRating: 0,
        totalReviews: 0,
        ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
      });
    }

    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = totalRating / reviews.length;

    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    reviews.forEach(review => {
      distribution[review.rating as keyof typeof distribution]++;
    });

    return of({
      productId,
      averageRating: Math.round(averageRating * 10) / 10, // Arrondir à 1 décimale
      totalReviews: reviews.length,
      ratingDistribution: distribution
    });
  }

  // Vérifier si l'utilisateur a déjà noté ce produit
  hasUserReviewed(productId: number, userId: number): boolean {
    return this.reviewsSubject.value.some(review => 
      review.productId === productId && review.userId === userId
    );
  }

  // Supprimer un avis (admin seulement)
  deleteReview(reviewId: number): Observable<boolean> {
    const currentReviews = this.reviewsSubject.value;
    const updatedReviews = currentReviews.filter(review => review.id !== reviewId);
    
    this.reviewsSubject.next(updatedReviews);
    this.saveReviews(updatedReviews);

    return of(true);
  }

  // Obtenir les avis récents
  getRecentReviews(limit: number = 5): Observable<Review[]> {
    const reviews = this.reviewsSubject.value
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, limit);
    
    return of(reviews);
  }
} 