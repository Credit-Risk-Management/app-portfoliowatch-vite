import { wrapApiWithDebounce } from '@src/utils/debouncedApi';
import apiClient from './client';

const loanCollateralValueApiBase = {
  // Get collateral values by loan ID
  getByLoanId: async (loanId, filters = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value);
      }
    });

    const queryString = params.toString();
    const url = `/loan-collateral-values/loan/${loanId}${queryString ? `?${queryString}` : ''}`;
    return apiClient.get(url);
  },

  // Get latest collateral value by loan ID
  getLatestByLoanId: async (loanId) => apiClient.get(`/loan-collateral-values/loan/${loanId}/latest`),

  // Get total collateral value for a loan
  getTotalByLoanId: async (loanId) => apiClient.get(`/loan-collateral-values/loan/${loanId}/total`),

  // Get collateral value history for a loan
  getHistoryByLoanId: async (loanId) => apiClient.get(`/loan-collateral-values/loan/${loanId}/history`),

  // Get collateral value by ID
  getById: async (id) => apiClient.get(`/loan-collateral-values/${id}`),

  // Create collateral value record
  create: async (data) => apiClient.post('/loan-collateral-values', data),

  // Update collateral value record
  update: async (id, data) => apiClient.put(`/loan-collateral-values/${id}`, data),

  // Delete collateral value record
  delete: async (id) => apiClient.delete(`/loan-collateral-values/${id}`),
};

// Wrap with debouncing - only debounce read operations that might be called repeatedly
export const loanCollateralValueApi = wrapApiWithDebounce(loanCollateralValueApiBase, {
  getByLoanId: 350,
  getLatestByLoanId: 300,
  getTotalByLoanId: 300,
  getHistoryByLoanId: 300,
  getById: 300,
});

export default loanCollateralValueApi;
