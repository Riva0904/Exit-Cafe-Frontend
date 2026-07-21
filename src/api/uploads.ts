import { apiClient, unwrap } from './client';
import type { ApiResponse } from '@/types/api';

export const uploadsApi = {
  uploadImages: (files: File[], subfolder: 'products' | 'categories') => {
    const formData = new FormData();
    files.forEach((file) => formData.append('files', file));
    return unwrap(
      apiClient.post<ApiResponse<string[]>>(`/uploads/images/${subfolder}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      }),
    );
  },
};
