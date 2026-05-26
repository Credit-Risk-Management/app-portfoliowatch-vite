export { formatDateNumeric as formatDate } from '@src/utils/formatDate';
export { getManagerName, getManagerOptions } from '@src/utils/relationshipManagers.utils';

/**
 * Formats a phone number
 */
export const formatPhoneNumber = (phone) => {
  if (!phone) return '-';
  return phone;
};

/**
 * Formats an email address
 */
export const formatEmail = (email) => {
  if (!email) return '-';
  return email;
};

/**
 * Formats a full address from components
 */
export const formatAddress = (borrower) => {
  if (!borrower) return 'N/A';

  const { streetAddress, city, state, zipCode } = borrower;

  if (!streetAddress && !city && !state && !zipCode) {
    return 'N/A';
  }

  const parts = [];
  if (streetAddress) parts.push(streetAddress);
  if (city) parts.push(city);
  if (state && zipCode) {
    parts.push(`${state} ${zipCode}`);
  } else if (state) {
    parts.push(state);
  } else if (zipCode) {
    parts.push(zipCode);
  }

  return parts.join(', ') || 'N/A';
};

/**
 * Get contact name
 */
export const getContactName = (contact) => {
  if (!contact) return 'Unknown';
  return `${contact.firstName || ''} ${contact.lastName || ''}`.trim() || 'Unknown';
};

/**
 * Get health score color class based on score value
 */
export const getHealthScoreColor = (score) => {
  if (!score) return 'text-secondary';
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

/** True when borrower has stored impact questionnaire workforce fields (internal or public submit). */
export const hasImpactQuestionnaireWorkforceData = (borrower) => {
  if (!borrower) return false;
  return (
    borrower.currentEmployees != null
    && borrower.currentEmployees !== ''
    && borrower.averageMonthlyFte != null
    && borrower.averageMonthlyFte !== ''
    && borrower.averageEmployeeWage != null
    && borrower.averageEmployeeWage !== ''
  );
};

export const formatImpactQuestionnaireEmployees = (value) => {
  if (value == null || value === '') return '—';
  const n = typeof value === 'string' ? parseInt(value, 10) : Number(value);
  if (!Number.isFinite(n)) return '—';
  return n.toLocaleString('en-US', { maximumFractionDigits: 0 });
};

export const formatImpactQuestionnaireFte = (value) => {
  if (value == null || value === '') return '—';
  const n = typeof value === 'string' ? parseFloat(value) : Number(value);
  if (!Number.isFinite(n)) return '—';
  return n.toLocaleString('en-US', { maximumFractionDigits: 2, minimumFractionDigits: 0 });
};

export const formatImpactQuestionnaireWagePerHour = (value) => {
  if (value == null || value === '') return '—';
  const n = typeof value === 'string' ? parseFloat(value) : Number(value);
  if (!Number.isFinite(n)) return '—';
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);
};
