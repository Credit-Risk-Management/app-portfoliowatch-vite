import axios from 'axios';
import { auth } from '@src/utils/firebase';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1';

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  async (config) => {
    const user = auth.currentUser;
    if (user) {
      const token = await user.getIdToken();
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response) {
      // Server responded with error
      const { status, data } = error.response;

      if (status === 401) {
        // Unauthorized - redirect to login
        console.error('Unauthorized access - redirecting to login');
        // Save current path for redirect after login
        const currentPath = window.location.pathname;
        if (currentPath !== '/login' && currentPath !== '/signup') {
          window.location.href = `/login?redirect=${encodeURIComponent(currentPath)}`;
        }
      } else if (status === 403) {
        // Forbidden
        console.error('Access forbidden');
      } else if (status === 404) {
        // Not found
        console.error('Resource not found');
      } else if (status >= 500) {
        // Server error
        console.error('Server error occurred');
      }

      return Promise.reject(data || error.message);
    } if (error.request) {
      // Request made but no response
      console.error('Network error - no response from server');
      return Promise.reject(new Error('Network error'));
    }
    // Error in request setup
    console.error('Error setting up request:', error.message);
    return Promise.reject(error);
  },
);

export default apiClient;
