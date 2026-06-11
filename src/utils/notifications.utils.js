/**
 * @param {Object} notification
 * @param {string} [fallback='#'] Route when resource type is unknown
 */
export const getNotificationLink = (notification, fallback = '#') => {
  if (notification.resourceType === 'LOAN' && notification.resourceId) {
    return `/loans/${notification.resourceId}`;
  }
  if (notification.resourceType === 'BORROWER' && notification.resourceId) {
    return `/borrowers/${notification.resourceId}?tab=financials`;
  }
  return fallback;
};
