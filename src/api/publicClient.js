import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3333';

// Create axios instance for public endpoints (no auth token)
const publicClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor for error handling
publicClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response) {
      // Server responded with error
      const { data } = error.response;
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

export default publicClient;
