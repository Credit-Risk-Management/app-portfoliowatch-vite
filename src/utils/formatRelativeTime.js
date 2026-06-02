import moment from 'moment';

/** Moment-based relative time (e.g. "2 hours ago"). */
export const formatTimeAgo = (dateString) => {
  try {
    return moment(dateString).fromNow();
  } catch {
    return 'recently';
  }
};

/** Compact relative labels for dashboard activity (Just now, 5m ago, Mar 3, 2026). */
export const formatDashboardRelativeTime = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInHours / 24);

  if (diffInHours < 24) {
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
      return diffInMinutes <= 1 ? 'Just now' : `${diffInMinutes}m ago`;
    }
    return `${diffInHours}h ago`;
  }
  if (diffInDays < 7) {
    return `${diffInDays}d ago`;
  }
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};
