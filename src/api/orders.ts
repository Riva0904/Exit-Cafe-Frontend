import { apiClient, unwrap } from './client';
import type { ApiResponse, PagedResult } from '@/types/api';
import type { CreateOrderRequest, Order, OrderStatusValue } from '@/types/order';

interface PaginationParams {
  pageNumber?: number;
  pageSize?: number;
  sortBy?: string;
  sortDescending?: boolean;
  searchTerm?: string;
}

export const ordersApi = {
  getAll: (params: PaginationParams & { status?: OrderStatusValue }) =>
    unwrap(apiClient.get<ApiResponse<PagedResult<Order>>>('/orders', { params })),
  getById: (id: string) => unwrap(apiClient.get<ApiResponse<Order>>(`/orders/${id}`)),
  getByCustomer: (customerId: string) =>
    unwrap(apiClient.get<ApiResponse<Order[]>>(`/orders/customer/${customerId}`)),
  getMyOrders: () => unwrap(apiClient.get<ApiResponse<Order[]>>('/orders/my')),
  create: (payload: CreateOrderRequest) => unwrap(apiClient.post<ApiResponse<Order>>('/orders', payload)),
  updateStatus: (id: string, status: OrderStatusValue) =>
    unwrap(apiClient.patch<ApiResponse<Order>>(`/orders/${id}/status`, { status })),
  cancel: (id: string) => apiClient.post(`/orders/${id}/cancel`),
};
