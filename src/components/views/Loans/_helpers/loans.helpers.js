import { $borrowers } from '@src/signals';

/**
 * Finds and returns a client/borrower by ID
 */
export const getClientById = (clientId) => ($borrowers.value?.list || []).find((client) => client.id === clientId) || null;

/**
 * Formats a numeric ratio value to 2 decimal places
 */
export const formatRatio = (value) => {
  if (value === null || value === undefined) return '-';
  return Number(value).toFixed(2);
};

/**
 * Formats a date string to US locale format (MM/DD/YYYY)
 */
export const formatDate = (dateString) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' });
};

/**
 * Returns relationship manager options for dropdown
 */
export const getRelationshipManagerOptions = (managers) => managers.map((m) => ({
  value: m.id,
  label: m.name,
}));

/**
 * Returns borrower options for dropdown
 */
export const getBorrowerOptions = (borrowers) => [
  { value: null, label: 'Enter Manually' },
  ...borrowers.map((c) => ({
    value: c.id,
    label: c.name,
  })),
];

/**
 * Handles borrower change in form
 */
export const handleBorrowerChange = (option, borrowers, updateForm) => {
  if (option?.value) {
    const client = borrowers.find((c) => c.id === option.value);
    updateForm({
      borrowerId: option.value,
      borrowerName: client?.name || '',
    });
  } else {
    updateForm({ borrowerId: null });
  }
};

/**
 * Formats a percentage value
 */
export const formatPercentage = (value) => {
  if (value === null || value === undefined) return '-';
  return `${Number(value).toFixed(2)}%`;
};

/**
 * Returns the label for a risk rating
 */
export const getRiskRatingLabel = (rating, labels) => labels[rating] || rating;

/**
 * Formats a percentage value (alias for formatPercentage, but handles empty strings)
 */
export const formatPercent = (value) => {
  if (value === null || value === undefined || value === '') return '-';
  const num = Number(value);
  if (Number.isNaN(num)) return '-';
  return `${num.toFixed(2)}%`;
};

/**
 * Calculate covenant status and return variant for color coding
 * All covenants: higher actual is better (actual should be >= covenant)
 */
export const getCovenantStatus = (actual, covenant) => {
  if (!actual || !covenant) return { variant: 'secondary', status: 'N/A', percentage: null };

  const percentage = (actual / covenant) * 100;

  if (actual >= covenant) {
    return { variant: 'success', status: 'Meeting', percentage };
  } if (percentage >= 90) {
    return { variant: 'warning', status: 'Warning', percentage };
  }
  return { variant: 'danger', status: 'Below', percentage };
};

/**
 * Get health score color class based on score value
 */
export const getHealthScoreColor = (score) => {
  if (score >= 80) return 'text-success';
  if (score >= 60) return 'text-warning';
  return 'text-danger';
};

/**
 * Convert markdown links to HTML anchor tags
 */
export const renderMarkdownLinks = (text) => {
  if (!text) return '';
  // Replace [text](url) with <a> tags
  return text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
};
