import apiClient from './client';

export const notificationsApi = {
  // Get all notifications for the current user
  getAll: async (params = {}) => {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);
    if (params.isRead !== undefined) queryParams.append('isRead', params.isRead);
    if (params.type) queryParams.append('type', params.type);

    const queryString = queryParams.toString();
    const url = `/notifications${queryString ? `?${queryString}` : ''}`;
    return apiClient.get(url);
  },

  // Get unread notification count
  getUnreadCount: async () => apiClient.get('/notifications/unread-count'),

  // Mark notification as read
  markAsRead: async (id) => apiClient.put(`/notifications/${id}/read`),

  // Mark all notifications as read
  markAllAsRead: async () => apiClient.put('/notifications/read-all'),

  // Delete notification
  delete: async (id) => apiClient.delete(`/notifications/${id}`),
};

export default notificationsApi;
