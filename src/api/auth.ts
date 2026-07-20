import { apiClient, unwrap } from './client';
import type { ApiResponse } from '@/types/api';
import type { AuthResponse, LoginRequest, RegisterRequest } from '@/types/auth';

export const authApi = {
  login: (payload: LoginRequest) => unwrap(apiClient.post<ApiResponse<AuthResponse>>('/auth/login', payload)),
  register: (payload: RegisterRequest) =>
    unwrap(apiClient.post<ApiResponse<AuthResponse>>('/auth/register', payload)),
  refreshToken: (refreshToken: string) =>
    unwrap(apiClient.post<ApiResponse<AuthResponse>>('/auth/refresh-token', { refreshToken })),
  revokeToken: (refreshToken: string) => apiClient.post('/auth/revoke-token', { refreshToken }),
};
