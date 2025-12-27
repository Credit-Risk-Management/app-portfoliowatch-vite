import apiClient from './client';

/**
 * Verify token and return user info
 */
export const verifyToken = async (token) => {
  try {
    const response = await apiClient.post('/auth/verify', {}, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response;
  } catch (error) {
    console.error('Verify token API error:', error);
    throw error;
  }
};

/**
 * Get current user with organization
 * Uses the token from apiClient interceptor
 */
export const getCurrentUser = async (token) => {
  try {
    const config = token ? {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    } : {};

    const response = await apiClient.get('/auth/me', config);
    return response;
  } catch (error) {
    console.error('Get current user API error:', error);
    throw error;
  }
};
