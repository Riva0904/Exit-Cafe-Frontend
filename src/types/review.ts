export interface Review {
  id: string;
  productId: string;
  orderId: string;
  rating: number;
  comment?: string;
  createdAt: string;
}

export interface CreateReviewRequest {
  productId: string;
  orderId: string;
  rating: number;
  comment?: string;
}
