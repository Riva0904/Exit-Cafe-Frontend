import { apiClient, unwrap } from './client';
import type { ApiResponse } from '@/types/api';
import type { CreateReviewRequest, Review } from '@/types/review';

export const reviewsApi = {
  create: (payload: CreateReviewRequest) => unwrap(apiClient.post<ApiResponse<Review>>('/reviews', payload)),
  getOrderReviews: (orderId: string) => unwrap(apiClient.get<ApiResponse<string[]>>(`/reviews/order/${orderId}`)),
};
