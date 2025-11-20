import apiClient from './client';

export const loansApi = {
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

export default loansApi;
