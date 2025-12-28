import * as resolvers from './notificationBell.resolvers';

/**
 * Handle marking a notification as read
 * @param {string} notificationId - The ID of the notification to mark as read
 * @param {Event} e - The event object
 */
export const handleMarkAsRead = async (notificationId, e) => {
  e.preventDefault();
  e.stopPropagation();
  await resolvers.markNotificationAsRead(notificationId);
};

/**
 * Handle notification click
 * @param {Object} notification - The notification object
 * @param {Function} setShow - Function to set the dropdown visibility
 */
export const handleNotificationClick = async (notification, setShow) => {
  // Mark as read when clicked
  if (!notification.isRead) {
    await resolvers.markNotificationAsRead(notification.id);
  }
  setShow(false);
};

/**
 * Handle dropdown toggle
 * @param {boolean} isShown - Whether the dropdown is shown
 */
export const handleDropdownToggle = async (isShown) => {
  // Fetch recent notifications when dropdown opens
  if (isShown) {
    await resolvers.fetchRecentNotifications();
  }
};

