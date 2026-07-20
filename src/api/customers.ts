import { apiClient, unwrap } from './client';
import type { ApiResponse, PagedResult } from '@/types/api';
import type { CreateAddressRequest, Customer, CustomerAddress } from '@/types/customer';

interface PaginationParams {
  pageNumber?: number;
  pageSize?: number;
  sortBy?: string;
  sortDescending?: boolean;
  searchTerm?: string;
}

export const customersApi = {
  getAll: (params: PaginationParams) =>
    unwrap(apiClient.get<ApiResponse<PagedResult<Customer>>>('/customers', { params })),
  getById: (id: string) => unwrap(apiClient.get<ApiResponse<Customer>>(`/customers/${id}`)),
  getAddresses: (id: string) =>
    unwrap(apiClient.get<ApiResponse<CustomerAddress[]>>(`/customers/${id}/addresses`)),
  addAddress: (id: string, payload: CreateAddressRequest) =>
    unwrap(apiClient.post<ApiResponse<CustomerAddress>>(`/customers/${id}/addresses`, payload)),
  removeAddress: (id: string, addressId: string) =>
    apiClient.delete(`/customers/${id}/addresses/${addressId}`),
};
