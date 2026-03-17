/**
 * Parse date-only strings (YYYY-MM-DD) as local date to avoid UTC-midnight shift.
 * Without this, "2025-03-31" becomes midnight UTC → displays as March 30 in US timezones.
 */
const toLocalDate = (dateString) => {
  const str = String(dateString).trim();
  const match = str.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (match) {
    const [, y, m, d] = match.map(Number);
    return new Date(y, m - 1, d);
  }
  return new Date(dateString);
};

export const formatDate = (dateString) => {
  if (!dateString) return '-';
  const date = toLocalDate(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export default formatDate;
