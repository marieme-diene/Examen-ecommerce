import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ProductService } from '../../services/product.service';
import { Product } from '../../models/product.model';
import { MatButtonModule } from '@angular/material/button';
import { CartService } from '../../../cart/services/cart.service';
import { ReviewService } from '../../services/review.service';
import { Review, ProductRating } from '../../models/review.model';
import { AuthService } from '../../../account/services/auth.service';
import { StarRating } from '../../components/star-rating/star-rating';
import { ReviewForm } from '../../components/review-form/review-form';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [
    CommonModule, 
    MatButtonModule, 
    RouterLink,
    StarRating,
    ReviewForm
  ],
  templateUrl: './product-detail.html',
  styleUrl: './product-detail.css'
})
export class ProductDetail implements OnInit {
  product: Product | undefined;
  selectedImage: number = 0;
  reviews: Review[] = [];
  productRating: ProductRating | undefined;
  hasUserReviewed: boolean = false;
  showReviewForm: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private productService: ProductService,
    private cartService: CartService,
    private reviewService: ReviewService,
    public authService: AuthService
  ) {}

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.productService.getProductById(id).subscribe(prod => {
      this.product = prod;
      this.loadReviews();
      this.checkUserReview();
    });
    this.selectedImage = 0;
  }

  selectImage(i: number) {
    this.selectedImage = i;
  }

  addToCart() {
    if (this.product) {
      this.cartService.addToCart(this.product);
      alert('Produit ajouté au panier !');
    }
  }

  loadReviews() {
    if (this.product) {
      this.reviewService.getProductReviews(this.product.id).subscribe(reviews => {
        this.reviews = reviews;
      });
      
      this.reviewService.getProductRating(this.product.id).subscribe(rating => {
        this.productRating = rating;
      });
    }
  }

  checkUserReview() {
    if (this.product && this.authService.getUser()) {
      this.hasUserReviewed = this.reviewService.hasUserReviewed(
        this.product.id, 
        this.authService.getUser()!.id
      );
    }
  }

  onReviewSubmitted(reviewData: any) {
    if (this.product && this.authService.getUser()) {
      const user = this.authService.getUser()!;
      const review = {
        productId: this.product.id,
        userId: user.id,
        userName: user.name,
        rating: reviewData.rating,
        comment: reviewData.comment,
        verified: false // Pour l'instant, pas de vérification d'achat
      };

      this.reviewService.addReview(review).subscribe(() => {
        this.loadReviews();
        this.checkUserReview();
        alert('Avis publié avec succès !');
      });
    }
  }

  getRatingPercentage(rating: number): number {
    if (!this.productRating || this.productRating.totalReviews === 0) {
      return 0;
    }
    const count = this.productRating.ratingDistribution[rating as keyof typeof this.productRating.ratingDistribution] || 0;
    return (count / this.productRating.totalReviews) * 100;
  }

  getRatingCount(rating: number): number {
    if (!this.productRating) {
      return 0;
    }
    return this.productRating.ratingDistribution[rating as keyof typeof this.productRating.ratingDistribution] || 0;
  }
} 