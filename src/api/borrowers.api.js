import { wrapApiWithDebounce } from '@src/utils/debouncedApi';
import apiClient from './client';

const borrowersApiBase = {
  // Get all borrowers with optional filters
  getAll: async (filters = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value);
      }
    });

    const queryString = params.toString();
    const url = `/borrowers${queryString ? `?${queryString}` : ''}`;
    return apiClient.get(url);
  },

  // Get borrower by ID
  getById: async (id) => apiClient.get(`/borrowers/${id}`),

  // Get borrowers by relationship manager
  getByManager: async (managerId) => apiClient.get(`/borrowers/manager/${managerId}`),

  // Create borrower
  create: async (data) => apiClient.post('/borrowers', data),

  // Update borrower
  update: async (id, data) => apiClient.put(`/borrowers/${id}`, data),

  // Delete borrower
  delete: async (id) => apiClient.delete(`/borrowers/${id}`),
};

// Wrap with debouncing - only debounce read operations that might be called repeatedly
export const borrowersApi = wrapApiWithDebounce(borrowersApiBase, {
  getAll: 350,
  getById: 300,
  getByManager: 350,
});

export default borrowersApi;
