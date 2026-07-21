import { apiClient, unwrap } from './client';
import type { ApiResponse, PagedResult } from '@/types/api';
import type { Notification } from '@/types/notification';

interface PaginationParams {
  pageNumber?: number;
  pageSize?: number;
}

export const notificationsApi = {
  getAll: (params: PaginationParams) =>
    unwrap(apiClient.get<ApiResponse<PagedResult<Notification>>>('/notifications', { params })),
  getUnreadCount: () => unwrap(apiClient.get<ApiResponse<number>>('/notifications/unread-count')),
  markAsRead: (id: string) => apiClient.patch(`/notifications/${id}/read`),
  markAllAsRead: () => apiClient.patch('/notifications/read-all'),
};

export const myNotificationsApi = {
  getAll: () => unwrap(apiClient.get<ApiResponse<Notification[]>>('/notifications/my')),
  getUnreadCount: () => unwrap(apiClient.get<ApiResponse<number>>('/notifications/my/unread-count')),
  markAsRead: (id: string) => apiClient.patch(`/notifications/my/${id}/read`),
};
