import { apiClient, unwrap } from './client';
import type { ApiResponse, PagedResult } from '@/types/api';
import type { ContactMessage, CreateContactMessageRequest } from '@/types/contact';

interface PaginationParams {
  pageNumber?: number;
  pageSize?: number;
}

export const contactApi = {
  create: (payload: CreateContactMessageRequest) =>
    unwrap(apiClient.post<ApiResponse<ContactMessage>>('/contact', payload)),
  getAll: (params: PaginationParams) =>
    unwrap(apiClient.get<ApiResponse<PagedResult<ContactMessage>>>('/contact', { params })),
  markAsRead: (id: string) => unwrap(apiClient.patch<ApiResponse<ContactMessage>>(`/contact/${id}/read`)),
};
