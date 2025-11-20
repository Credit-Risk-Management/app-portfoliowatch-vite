import { $borrowers, $relationshipManagers } from '@src/signals';

/**
 * Finds and returns a client/borrower by ID
 */
export const getClientById = (clientId) => 
  ($borrowers.value?.list || []).find((client) => client.id === clientId) || null;

/**
 * Returns the name of a loan officer by their ID
 */
export const getLoanOfficerName = (officerId) => {
  const officer = ($relationshipManagers.value?.list || []).find((m) => m.id === officerId);
  return officer ? officer.name : '-';
};

/**
 * Returns the name of a manager for a given loan officer
 */
export const getManagerName = (officerId) => {
  const officer = ($relationshipManagers.value?.list || []).find((m) => m.id === officerId);
  if (!officer || !officer.managerId) return '-';
  const manager = ($relationshipManagers.value?.list || []).find((m) => m.id === officer.managerId);
  return manager ? manager.name : '-';
};

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
 * Returns loan officer options for dropdown
 */
export const getLoanOfficerOptions = (managers) => 
  managers.map((m) => ({
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
      borrower_id: option.value,
      borrower_name: client?.name || '',
    });
  } else {
    updateForm({ borrower_id: null });
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
export const getRiskRatingLabel = (rating, labels) => 
  labels[rating] || rating;
