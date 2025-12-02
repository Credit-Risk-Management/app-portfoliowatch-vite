/**
 * Formats a date string to US locale format (MM/DD/YYYY)
 */
export const formatDate = (dateString) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' });
};

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


