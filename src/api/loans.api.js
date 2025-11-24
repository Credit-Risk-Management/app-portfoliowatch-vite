import { wrapApiWithDebounce } from '@src/utils/debouncedApi';
import apiClient from './client';

const loansApiBase = {
  // Get all loans with optional filters
  getAll: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.searchTerm) params.append('searchTerm', filters.searchTerm);
    if (filters.interestType) params.append('interestType', filters.interestType);
    if (filters.riskRating) params.append('riskRating', filters.riskRating);
    if (filters.loanOfficer) params.append('loanOfficer', filters.loanOfficer);
    if (filters.borrowerId) params.append('borrowerId', filters.borrowerId);

    const queryString = params.toString();
    const url = `/loans${queryString ? `?${queryString}` : ''}`;
    return apiClient.get(url);
  },

  // Get loan metrics aggregated by WATCH score
  getLoanMetrics: async () => apiClient.get('/loans/metrics'),

  // Get recent loans sorted by updated_at
  getRecent: async (limit = 8) => {
    const params = new URLSearchParams();
    params.append('limit', limit.toString());
    return apiClient.get(`/loans/recent?${params.toString()}`);
  },

  // Get loan by ID
  getById: async (id) => apiClient.get(`/loans/${id}`),

  // Get loans by borrower
  getByBorrower: async (borrowerId) => apiClient.get(`/loans/borrower/${borrowerId}`),

  // Get loans by loan officer
  getByOfficer: async (officerId) => apiClient.get(`/loans/officer/${officerId}`),

  // Create loan
  create: async (data) => apiClient.post('/loans', data),

  // Update loan
  update: async (id, data) => apiClient.put(`/loans/${id}`, data),

  // Delete loan
  delete: async (id) => apiClient.delete(`/loans/${id}`),

  // Compute WATCH score for a single loan
  computeWatchScore: async (id) => apiClient.post(`/loans/${id}/compute-watch-score`),

  // Compute WATCH scores for all loans
  computeAllWatchScores: async () => apiClient.post('/loans/batch/compute-watch-scores'),
};

// Wrap with debouncing - only debounce read operations that might be called repeatedly
export const loansApi = wrapApiWithDebounce(loansApiBase, {
  getAll: 350, // Debounce search/filter calls
  getById: 300, // Debounce rapid detail views
  getByBorrower: 350, // Debounce borrower filter
  getByOfficer: 350, // Debounce officer filter
  // Note: create, update, delete, and compute operations are NOT debounced
});

export default loansApi;
