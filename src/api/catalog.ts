import { apiClient, unwrap } from './client';
import type { ApiResponse, PagedResult } from '@/types/api';
import type { Category, Product, ProductListItem, ProductQueryParams } from '@/types/catalog';

export const categoriesApi = {
  getAll: (includeInactive = false) =>
    unwrap(apiClient.get<ApiResponse<Category[]>>('/categories', { params: { includeInactive } })),
  getById: (id: string) => unwrap(apiClient.get<ApiResponse<Category>>(`/categories/${id}`)),
  getBySlug: (slug: string) => unwrap(apiClient.get<ApiResponse<Category>>(`/categories/slug/${slug}`)),
  create: (payload: Partial<Category>) => unwrap(apiClient.post<ApiResponse<Category>>('/categories', payload)),
  update: (id: string, payload: Partial<Category>) =>
    unwrap(apiClient.put<ApiResponse<Category>>(`/categories/${id}`, payload)),
  remove: (id: string) => apiClient.delete(`/categories/${id}`),
};

export const productsApi = {
  getAll: (params: ProductQueryParams) =>
    unwrap(apiClient.get<ApiResponse<PagedResult<ProductListItem>>>('/products', { params })),
  getById: (id: string) => unwrap(apiClient.get<ApiResponse<Product>>(`/products/${id}`)),
  getBySlug: (slug: string) => unwrap(apiClient.get<ApiResponse<Product>>(`/products/slug/${slug}`)),
  getFeatured: () => unwrap(apiClient.get<ApiResponse<ProductListItem[]>>('/products/featured')),
  getBestSellers: () => unwrap(apiClient.get<ApiResponse<ProductListItem[]>>('/products/best-sellers')),
  getNewArrivals: () => unwrap(apiClient.get<ApiResponse<ProductListItem[]>>('/products/new-arrivals')),
  getTodaysSpecial: () => unwrap(apiClient.get<ApiResponse<ProductListItem[]>>('/products/todays-special')),
  create: (payload: Record<string, unknown>) =>
    unwrap(apiClient.post<ApiResponse<Product>>('/products', payload)),
  update: (id: string, payload: Record<string, unknown>) =>
    unwrap(apiClient.put<ApiResponse<Product>>(`/products/${id}`, payload)),
  updateImages: (id: string, imageUrls: string[]) =>
    unwrap(apiClient.put<ApiResponse<Product>>(`/products/${id}/images`, { imageUrls })),
  remove: (id: string) => apiClient.delete(`/products/${id}`),
};
