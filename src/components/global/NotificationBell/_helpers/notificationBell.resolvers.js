import { $notifications } from '@src/signals';
import notificationsApi from '@src/api/notifications.api';
import { RECENT_NOTIFICATIONS_LIMIT } from './notificationBell.consts';

/**
 * Refresh unread count + recent preview for the bell (does not touch paginated `list` on /notifications).
 */
export const refreshBellState = async () => {
  try {
    const [countRes, listRes] = await Promise.all([
      notificationsApi.getUnreadCount(),
      notificationsApi.getAll({ limit: RECENT_NOTIFICATIONS_LIMIT }),
    ]);
    $notifications.update({
      unreadCount: countRes.data?.count ?? 0,
      bellPreview: listRes.data || [],
    });
  } catch (error) {
    console.error('Failed to refresh notification bell:', error);
  }
};

/**
 * Fetch the unread notification count from the API (count only; prefer refreshBellState for polling).
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
      bellPreview: response.data || [],
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

    const patchRead = (items) => (items || []).map((n) => (n.id === notificationId ? { ...n, isRead: true } : n));

    $notifications.update({
      list: patchRead($notifications.value.list),
      bellPreview: patchRead($notifications.value.bellPreview),
      unreadCount: Math.max(0, $notifications.value.unreadCount - 1),
    });
  } catch (error) {
    console.error('Failed to mark notification as read:', error);
  }
};
