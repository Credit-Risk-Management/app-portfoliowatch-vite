import apiClient from './client';

export const usersApi = {
  // Get current user profile
  getMe: async () => apiClient.get('/users/me'),

  // Update current user profile
  updateMe: async (data) => apiClient.put('/users/me', data),

  // Get mentionable users (for @mentions)
  getMentionable: async () => apiClient.get('/users/mentionable'),
};

export default usersApi;
