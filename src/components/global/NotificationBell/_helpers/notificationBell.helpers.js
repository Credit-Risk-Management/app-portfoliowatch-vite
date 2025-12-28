import moment from 'moment';

/**
 * Get the link URL for a notification based on its resource type
 * @param {Object} notification - The notification object
 * @returns {string} The link URL
 */
export const getNotificationLink = (notification) => {
  if (notification.resourceType === 'LOAN' && notification.resourceId) {
    return `/loans/${notification.resourceId}`;
  }
  return '/notifications';
};

/**
 * Format a date string as relative time (e.g., "2 hours ago")
 * @param {string} dateString - The date string to format
 * @returns {string} The formatted relative time
 */
export const formatTimeAgo = (dateString) => {
  try {
    return moment(dateString).fromNow();
  } catch {
    return 'recently';
  }
};

/**
 * Truncate a message to a maximum length
 * @param {string} message - The message to truncate
 * @param {number} maxLength - The maximum length
 * @returns {string} The truncated message
 */
export const truncateMessage = (message, maxLength) => {
  if (!message || message.length <= maxLength) {
    return message;
  }
  return `${message.substring(0, maxLength)}...`;
};

/**
 * Format badge count display (e.g., 100 becomes "99+")
 * @param {number} count - The count to format
 * @param {number} maxCount - The maximum count to display
 * @returns {string|number} The formatted count
 */
export const formatBadgeCount = (count, maxCount = 99) => {
  if (count > maxCount) {
    return `${maxCount}+`;
  }
  return count;
};

