import apiClient from './client';

export const reportsApi = {
  // Get all reports with optional filters
  getAll: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.reportType) params.append('reportType', filters.reportType);
    if (filters.generatedBy) params.append('generatedBy', filters.generatedBy);

    const queryString = params.toString();
    const url = `/reports${queryString ? `?${queryString}` : ''}`;
    return apiClient.get(url);
  },

  // Get report by ID
  getById: async (id) => apiClient.get(`/reports/${id}`),

  // Create report
  create: async (data) => apiClient.post('/reports', data),

  // Update report
  update: async (id, data) => apiClient.put(`/reports/${id}`, data),

  // Delete report
  delete: async (id) => apiClient.delete(`/reports/${id}`),
};

export default reportsApi;

