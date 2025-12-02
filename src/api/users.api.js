import { wrapApiWithDebounce } from '@src/utils/debouncedApi';
import apiClient from './client';

const usersApiBase = {
  // Get current user profile
  getCurrentUser: async () => {
    try {
      const response = await apiClient.get('/users/me');
      return response;
    } catch (error) {
      console.error('Get current user API error:', error);
      throw error;
    }
  },

  // Get user by ID (accepts id directly or params object)
  getById: async (id) => apiClient.get(`/users/${id}`),

  // Get user (accepts params object for compatibility with fetchAndSetSignal)
  get: async (params) => {
    const id = params?.id || params;
    return apiClient.get(`/users/${id}`);
  },

  // Update current user profile
  updateCurrentUser: async (data) => {
    try {
      const response = await apiClient.put('/users/me', data);
      return response;
    } catch (error) {
      console.error('Update user API error:', error);
      throw error;
    }
  },
};

// Wrap with debouncing - only debounce read operations that might be called repeatedly
export const usersApi = wrapApiWithDebounce(usersApiBase, {
  getCurrentUser: 300,
  getById: 300,
  get: 300,
});

export default usersApi;
