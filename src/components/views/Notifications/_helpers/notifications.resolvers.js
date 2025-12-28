import { $notifications } from '@src/signals';
import notificationsApi from '@src/api/notifications.api';
import { dangerAlert } from '@src/components/global/Alert/_helpers/alert.events';
import { PAGINATION_LIMIT } from './notifications.consts';

export const fetchNotifications = async (page = 1, filter = 'all') => {
  $notifications.update({ isLoading: true });

  try {
    const isRead = filter === 'all' ? undefined : filter === 'read';
    const response = await notificationsApi.getAll({
      page,
      limit: PAGINATION_LIMIT,
      isRead,
    });

    $notifications.update({
      list: response.data || [],
      totalCount: response.pagination?.total || 0,
      isLoading: false,
    });
  } catch (error) {
    dangerAlert(error.message || 'Failed to fetch notifications');
    $notifications.update({ isLoading: false });
  }
};

export const markNotificationAsRead = async (notificationId) => {
  try {
    await notificationsApi.markAsRead(notificationId);

    // Update local state
    $notifications.update({
      list: $notifications.value.list.map((n) => (n.id === notificationId ? { ...n, isRead: true } : n)),
      unreadCount: Math.max(0, $notifications.value.unreadCount - 1),
    });
  } catch (error) {
    dangerAlert(error.message || 'Failed to mark notification as read');
  }
};

export const markAllNotificationsAsRead = async () => {
  try {
    await notificationsApi.markAllAsRead();

    // Update local state
    $notifications.update({
      list: $notifications.value.list.map((n) => ({ ...n, isRead: true })),
      unreadCount: 0,
    });
  } catch (error) {
    dangerAlert(error.message || 'Failed to mark all as read');
  }
};
