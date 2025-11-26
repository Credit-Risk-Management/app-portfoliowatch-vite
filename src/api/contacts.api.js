import { wrapApiWithDebounce } from '@src/utils/debouncedApi';
import apiClient from './client';

const contactsApiBase = {
  // Get contacts by borrower ID
  getByBorrowerId: async (borrowerId) => apiClient.get(`/contacts/borrower/${borrowerId}`),

  // Get contact by ID
  getById: async (id) => apiClient.get(`/contacts/${id}`),

  // Create contact
  create: async (data) => apiClient.post('/contacts', data),

  // Update contact
  update: async (id, data) => apiClient.put(`/contacts/${id}`, data),

  // Set contact as primary
  setPrimary: async (id, borrowerId) => apiClient.put(`/contacts/${id}/primary`, { borrowerId }),

  // Delete contact
  delete: async (id) => apiClient.delete(`/contacts/${id}`),
};

// Wrap with debouncing - only debounce read operations that might be called repeatedly
export const contactsApi = wrapApiWithDebounce(contactsApiBase, {
  getByBorrowerId: 300,
  getById: 300,
});

export default contactsApi;
