import apiClient from './client';

export const documentsApi = {
  // Get all documents with optional filters
  getAll: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.loanId) params.append('loanId', filters.loanId);
    if (filters.documentType) params.append('documentType', filters.documentType);

    const queryString = params.toString();
    const url = `/documents${queryString ? `?${queryString}` : ''}`;
    return apiClient.get(url);
  },

  // Get document by ID
  getById: async (id) => apiClient.get(`/documents/${id}`),

  // Get documents by loan
  getByLoan: async (loanId) => apiClient.get(`/documents/loan/${loanId}`),

  // Create document
  create: async (data) => apiClient.post('/documents', data),

  // Update document
  update: async (id, data) => apiClient.put(`/documents/${id}`, data),

  // Delete document
  delete: async (id) => apiClient.delete(`/documents/${id}`),

  // Initiate file upload - Get signed upload URL
  initiateUpload: async (data) => {
    return apiClient.post('/documents/upload/initiate', data);
  },

  // Confirm file upload completion
  confirmUpload: async (documentId, storageUrl) => {
    return apiClient.post('/documents/upload/confirm', {
      documentId,
      storageUrl,
    });
  },

  // Mark upload as failed
  markUploadFailed: async (documentId, error) => {
    return apiClient.post('/documents/upload/failed', {
      documentId,
      error,
    });
  },

  // Get signed download URL for a document
  getDownloadUrl: async (documentId, expiresIn = 3600) => {
    return apiClient.get(`/documents/${documentId}/download?expiresIn=${expiresIn}`);
  },
};

export default documentsApi;

