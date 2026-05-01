import moment from 'moment';

export const formatTimeAgo = (dateString) => {
  try {
    return moment(dateString).fromNow();
  } catch {
    return 'recently';
  }
};

export const getNotificationLink = (notification) => {
  if (notification.resourceType === 'LOAN' && notification.resourceId) {
    return `/loans/${notification.resourceId}`;
  }
  if (notification.resourceType === 'BORROWER' && notification.resourceId) {
    return `/borrowers/${notification.resourceId}?tab=financials`;
  }
  return '#';
};

export const getLoanNumber = (loanId, loans) => {
  const loan = loans.find((l) => l.id === loanId);
  return loan?.loan_number || 'N/A';
};
