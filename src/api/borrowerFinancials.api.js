import { wrapApiWithDebounce } from '@src/utils/debouncedApi';
import apiClient from './client';

const borrowerFinancialsApiBase = {
  // Get financial history by borrower ID
  getByBorrowerId: async (borrowerId, filters = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value);
      }
    });

    const queryString = params.toString();
    const url = `/borrower-financials/borrower/${borrowerId}${queryString ? `?${queryString}` : ''}`;
    return apiClient.get(url);
  },

  // Get latest financial by borrower ID
  getLatestByBorrowerId: async (borrowerId) => apiClient.get(`/borrower-financials/borrower/${borrowerId}/latest`),

  // Get financial by ID
  getById: async (id) => apiClient.get(`/borrower-financials/${id}`),

  // Create financial record (JSON) or multipart (`financial`, `documentMeta`, repeated `documents`)
  create: async (data) => apiClient.post('/borrower-financials', data),

  createMultipart: async (formData) => apiClient.post('/borrower-financials', formData),

  // Update financial record (JSON envelope supported)
  update: async (id, data) => apiClient.put(`/borrower-financials/${id}`, data),

  updateMultipart: async (id, formData) => apiClient.put(`/borrower-financials/${id}`, formData),

  // Delete financial record
  delete: async (id) => apiClient.delete(`/borrower-financials/${id}`),
};

// Wrap with debouncing - only debounce read operations that might be called repeatedly
export const borrowerFinancialsApi = wrapApiWithDebounce(borrowerFinancialsApiBase, {
  getByBorrowerId: 350,
  getLatestByBorrowerId: 300,
  getById: 300,
});

export default borrowerFinancialsApi;
