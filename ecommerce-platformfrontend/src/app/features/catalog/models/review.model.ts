export interface Review {
  id: number;
  productId: number;
  userId: number;
  userName: string;
  rating: number; // 1-5 étoiles
  comment: string;
  date: Date;
  verified: boolean; // Achat vérifié
}

export interface ProductRating {
  productId: number;
  averageRating: number;
  totalReviews: number;
  ratingDistribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
} 