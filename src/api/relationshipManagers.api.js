import apiClient from './client';

export const relationshipManagersApi = {
  // Get all relationship managers with optional filters
  getAll: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.isActive !== undefined) params.append('isActive', filters.isActive);
    if (filters.officeLocation) params.append('officeLocation', filters.officeLocation);

    const queryString = params.toString();
    const url = `/relationship-managers${queryString ? `?${queryString}` : ''}`;
    return apiClient.get(url);
  },

  // Get relationship manager by ID
  getById: async (id) => apiClient.get(`/relationship-managers/${id}`),

  // Get direct reports
  getDirectReports: async (managerId) => apiClient.get(`/relationship-managers/${managerId}/direct-reports`),

  // Get manager chain (upward hierarchy)
  getManagerChain: async (managerId) => apiClient.get(`/relationship-managers/${managerId}/manager-chain`),

  // Get all reports recursively (entire team)
  getAllReports: async (managerId) => apiClient.get(`/relationship-managers/${managerId}/all-reports`),

  // Create relationship manager
  create: async (data) => apiClient.post('/relationship-managers', data),

  // Update relationship manager
  update: async (id, data) => apiClient.put(`/relationship-managers/${id}`, data),

  // Delete relationship manager
  delete: async (id) => apiClient.delete(`/relationship-managers/${id}`),
};

export default relationshipManagersApi;

