import { $notificationsView } from '@src/signals';
import * as resolvers from './notifications.resolvers';

export const handleFilterChange = async (newFilter) => {
  $notificationsView.update({ filter: newFilter });
  await resolvers.fetchNotifications(1, newFilter);
};

export const handlePageChange = async (newPage) => {
  const currentFilter = $notificationsView.value.filter || 'all';
  await resolvers.fetchNotifications(newPage, currentFilter);
};

export const handleMarkAsRead = async (notificationId) => {
  await resolvers.markNotificationAsRead(notificationId);
};

export const handleMarkAllAsRead = async () => {
  await resolvers.markAllNotificationsAsRead();
};

export const handleNotificationClick = async (notification) => {
  if (!notification.isRead) {
    await resolvers.markNotificationAsRead(notification.id);
  }
};
