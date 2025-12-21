import { wrapApiWithDebounce } from '@src/utils/debouncedApi';
import apiClient from './client';

const debtServiceHistoryApiBase = {
  // Get debt service history by borrower ID
  getByBorrowerId: async (borrowerId, filters = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value);
      }
    });

    const queryString = params.toString();
    const url = `/debt-service-history/borrower/${borrowerId}${queryString ? `?${queryString}` : ''}`;
    return apiClient.get(url);
  },

  // Get latest debt service history by borrower ID
  getLatestByBorrowerId: async (borrowerId) => apiClient.get(`/debt-service-history/borrower/${borrowerId}/latest`),

  // Get debt service history by ID
  getById: async (id) => apiClient.get(`/debt-service-history/${id}`),

  // Create debt service history record
  create: async (data) => apiClient.post('/debt-service-history', data),

  // Update debt service history record
  update: async (id, data) => apiClient.put(`/debt-service-history/${id}`, data),

  // Delete debt service history record
  delete: async (id) => apiClient.delete(`/debt-service-history/${id}`),
};

// Wrap with debouncing - only debounce read operations that might be called repeatedly
export const debtServiceHistoryApi = wrapApiWithDebounce(debtServiceHistoryApiBase, {
  getByBorrowerId: 350,
  getLatestByBorrowerId: 300,
  getById: 300,
});

export default debtServiceHistoryApi;
