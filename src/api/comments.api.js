import apiClient from './client';

export const commentsApi = {
  // Get all comments with optional filters
  getAll: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.loanId) params.append('loanId', filters.loanId);
    if (filters.userId) params.append('userId', filters.userId);

    const queryString = params.toString();
    const url = `/comments${queryString ? `?${queryString}` : ''}`;
    return apiClient.get(url);
  },

  // Get comment by ID
  getById: async (id) => apiClient.get(`/comments/${id}`),

  // Get comments by loan
  getByLoan: async (loanId) => apiClient.get(`/comments/loan/${loanId}`),

  // Create comment
  create: async (data) => apiClient.post('/comments', data),

  // Update comment
  update: async (id, data) => apiClient.put(`/comments/${id}`, data),

  // Delete comment
  delete: async (id) => apiClient.delete(`/comments/${id}`),
};

export default commentsApi;

