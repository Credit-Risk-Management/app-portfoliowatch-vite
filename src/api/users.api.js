import apiClient from './client';

/**
 * Get current user profile
 */
export const getCurrentUser = async () => {
  try {
    const response = await apiClient.get('/users/me');
    return response;
  } catch (error) {
    console.error('Get current user API error:', error);
    throw error;
  }
};

/**
 * Update current user profile
 */
export const updateCurrentUser = async (data) => {
  try {
    const response = await apiClient.put('/users/me', data);
    return response;
  } catch (error) {
    console.error('Update user API error:', error);
    throw error;
  }
};
