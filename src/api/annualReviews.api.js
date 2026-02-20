import { NARRATIVE_CONSTRAINTS_PAYLOAD } from '@src/consts/annualReviewPrompts';
import { wrapApiWithDebounce } from '@src/utils/debouncedApi';
import apiClient from './client';

const annualReviewsApiBase = {
  // Get all annual reviews with optional filters
  getAll: async (filters = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value);
      }
    });

    const queryString = params.toString();
    const url = `/annual-reviews${queryString ? `?${queryString}` : ''}`;
    return apiClient.get(url);
  },

  // Get annual review by ID
  getById: async (id) => apiClient.get(`/annual-reviews/${id}`),

  // Get annual reviews by loan ID
  getByLoanId: async (loanId, filters = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value);
      }
    });

    const queryString = params.toString();
    const url = `/annual-reviews/loan/${loanId}${queryString ? `?${queryString}` : ''}`;
    return apiClient.get(url);
  },

  // Get annual reviews by borrower ID
  getByBorrowerId: async (borrowerId, filters = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value);
      }
    });

    const queryString = params.toString();
    const url = `/annual-reviews/borrower/${borrowerId}${queryString ? `?${queryString}` : ''}`;
    return apiClient.get(url);
  },

  // Create annual review
  create: async (data) => apiClient.post('/annual-reviews', data),

  // Update annual review
  update: async (id, data) => apiClient.put(`/annual-reviews/${id}`, data),

  // Delete annual review
  delete: async (id) => apiClient.delete(`/annual-reviews/${id}`),

  // Generate pre-populated report data from loan
  generateForLoan: async (loanId, options = {}) => {
    const params = new URLSearchParams();
    if (options.generateNarratives !== undefined) {
      params.append('generateNarratives', options.generateNarratives);
    }
    if (options.includeFinancials !== undefined) {
      params.append('includeFinancials', options.includeFinancials);
    }
    // Support both generateWord and generatePdf for backward compatibility
    if (options.generateWord !== undefined) {
      params.append('generateWord', options.generateWord);
    } else if (options.generatePdf !== undefined) {
      params.append('generatePdf', options.generatePdf);
    }

    const queryString = params.toString();
    const url = `/annual-reviews/loan/${loanId}/generate${queryString ? `?${queryString}` : ''}`;
    const body = options.generateNarratives ? { narrativeConstraints: NARRATIVE_CONSTRAINTS_PAYLOAD } : undefined;
    return apiClient.post(url, body);
  },

  // Generate/regenerate AI narratives for an existing review
  generateNarratives: async (id, sections = [], options = {}) => apiClient.post(`/annual-reviews/${id}/generate-narratives`, {
    sections,
    narrativeConstraints: options.narrativeConstraints ?? NARRATIVE_CONSTRAINTS_PAYLOAD,
  }),

  // Export annual review as JSON
  exportToJSON: async (id) => apiClient.get(`/annual-reviews/${id}/export/json`),

  // Export annual review as Word document
  exportToWord: async (id) => {
    const response = await apiClient.get(`/annual-reviews/${id}/export/word`, {
      responseType: 'blob',
    });
    return response;
  },

  // Export annual review as PDF (legacy - now returns Word document)
  exportToPDF: async (id) => {
    const response = await apiClient.get(`/annual-reviews/${id}/export/pdf`, {
      responseType: 'blob',
    });
    return response;
  },

  // Compute financial ratios
  computeRatios: async (financialStatements) => apiClient.post('/annual-reviews/compute-ratios', { financialStatements }),
};

// Wrap with debouncing - only debounce read operations that might be called repeatedly
export const annualReviewsApi = wrapApiWithDebounce(annualReviewsApiBase, {
  getAll: 350,
  getById: 300,
  getByLoanId: 350,
  getByBorrowerId: 350,
});

export default annualReviewsApi;
