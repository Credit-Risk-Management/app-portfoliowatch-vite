import { wrapApiWithDebounce } from '@src/utils/debouncedApi';
import apiClient from './client';

export const guarantorsApiBase = {
  // Get all guarantors with optional filters
  getAll: async (filters = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value);
      }
    });

    const queryString = params.toString();
    const url = `/guarantors${queryString ? `?${queryString}` : ''}`;
    return apiClient.get(url);
  },

  // Get guarantor by ID
  getById: async (id) => apiClient.get(`/guarantors/${id}`),

  // Get guarantor by Loan ID
  getByLoanId: async (loanId) => apiClient.get(`/guarantors/loan/${loanId}`),

  // Get guarantor by Borrower ID
  getByBorrowerId: async (borrowerId) => apiClient.get(`/guarantors/borrower/${borrowerId}`),

  // Create PFS (personal financial statement) for guarantor
  createFinancial: async (guarantorId, data) => apiClient.post(`/guarantors-financials/${guarantorId}/financials`, data),

  // Update PFS for guarantor
  updateFinancial: async (guarantorFinancialId, data) => apiClient.put(`/guarantors-financials/${guarantorFinancialId}`, data),

  // Get single guarantor financial by ID (for edit mode)
  getFinancialById: async (guarantorFinancialId) => apiClient.get(`/guarantors-financials/${guarantorFinancialId}`),

};

export const guarantorsApi = wrapApiWithDebounce(guarantorsApiBase, {
  getAll: 350,
  getById: 300,
  getByManager: 350,
  createFinancial: 300,
  updateFinancial: 300,
  getFinancialById: 300,
});

export default guarantorsApi;
