import apiClient from './client';

export const transactionsApi = {
  // Get all transactions with optional filters
  getAll: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.loanId) params.append('loanId', filters.loanId);
    if (filters.transactionType) params.append('transactionType', filters.transactionType);
    if (filters.status) params.append('status', filters.status);
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);

    const queryString = params.toString();
    const url = `/transactions${queryString ? `?${queryString}` : ''}`;
    return apiClient.get(url);
  },

  // Get transaction by ID
  getById: async (id) => apiClient.get(`/transactions/${id}`),

  // Get transactions by loan
  getByLoan: async (loanId) => apiClient.get(`/transactions/loan/${loanId}`),

  // Get loan balance
  getLoanBalance: async (loanId) => apiClient.get(`/transactions/loan/${loanId}/balance`),

  // Create transaction
  create: async (data) => apiClient.post('/transactions', data),

  // Update transaction
  update: async (id, data) => apiClient.put(`/transactions/${id}`, data),

  // Delete transaction
  delete: async (id) => apiClient.delete(`/transactions/${id}`),
};

export default transactionsApi;

