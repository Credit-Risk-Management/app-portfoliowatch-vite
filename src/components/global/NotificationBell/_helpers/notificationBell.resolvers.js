import { $notifications } from '@src/signals';
import notificationsApi from '@src/api/notifications.api';
import { RECENT_NOTIFICATIONS_LIMIT } from './notificationBell.consts';

/**
 * Fetch the unread notification count from the API
 */
export const fetchUnreadCount = async () => {
  try {
    const response = await notificationsApi.getUnreadCount();
    $notifications.update({
      unreadCount: response.data?.count || 0,
    });
  } catch (error) {
    console.error('Failed to fetch unread count:', error);
  }
};

/**
 * Fetch recent notifications for the dropdown
 */
export const fetchRecentNotifications = async () => {
  try {
    const response = await notificationsApi.getAll({ limit: RECENT_NOTIFICATIONS_LIMIT });
    $notifications.update({
      list: response.data || [],
    });
  } catch (error) {
    console.error('Failed to fetch notifications:', error);
  }
};

/**
 * Mark a notification as read
 * @param {string} notificationId - The ID of the notification to mark as read
 */
export const markNotificationAsRead = async (notificationId) => {
  try {
    await notificationsApi.markAsRead(notificationId);

    // Update local state
    $notifications.update({
      list: $notifications.value.list.map((n) => (n.id === notificationId ? { ...n, isRead: true } : n)),
      unreadCount: Math.max(0, $notifications.value.unreadCount - 1),
    });
  } catch (error) {
    console.error('Failed to mark notification as read:', error);
  }
};
