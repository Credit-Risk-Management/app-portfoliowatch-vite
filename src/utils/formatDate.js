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

/** US numeric date (MM/DD/YYYY) for tables and loan detail fields. */
export const formatDateNumeric = (dateString) => {
  if (!dateString) return '-';
  const date = toLocalDate(dateString);
  return date.toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' });
};

/** HTML date input value (YYYY-MM-DD). */
export const formatDateForInput = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return '';
  return date.toISOString().slice(0, 10);
};

export default formatDate;
