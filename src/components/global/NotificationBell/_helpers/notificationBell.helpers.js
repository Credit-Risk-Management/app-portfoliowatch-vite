export { formatTimeAgo } from '@src/utils/formatRelativeTime';
export { getNotificationLink } from '@src/utils/notifications.utils';

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
