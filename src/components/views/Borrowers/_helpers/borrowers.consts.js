/** Debounce search typing before list refetch (avoids overlapping API calls). */
export const BORROWERS_SEARCH_DEBOUNCE_MS = 350;

export const CLIENT_TYPE_OPTIONS = [
  { value: 'Business', label: 'Business' },
  { value: 'SBA CA', label: 'SBA CA' },
  { value: 'C&I', label: 'C&I' },
  { value: 'CRE', label: 'CRE' },
];

/**
 * Borrowers list compliance checklist (maps to API boolean query params).
 * One active option per group; multiple groups combine with OR.
 */
export const COMPLIANCE_FILTER_GROUPS = [
  {
    key: 'quarterlyPackageComplete',
    label: 'Quarterly (Q)',
    shortLabel: 'Quarterly',
    options: [
      { value: 'true', label: 'On file' },
      { value: 'false', label: 'Not on file' },
    ],
  },
  {
    key: 'impactQuestionnaireComplete',
    label: 'Impact questionnaire (I-Q)',
    shortLabel: 'Impact',
    options: [
      { value: 'true', label: 'Submitted' },
      { value: 'false', label: 'Not submitted' },
    ],
  },
  {
    key: 'taxReturn2025Complete',
    label: '2025 tax return',
    shortLabel: '2025 tax return',
    options: [
      { value: 'true', label: 'On file' },
      { value: 'false', label: 'Not on file' },
    ],
  },
];

export const INDUSTRY_TYPE_OPTIONS = [
  { value: 'Technology', label: 'Technology' },
  { value: 'Healthcare', label: 'Healthcare' },
  { value: 'Finance', label: 'Finance' },
  { value: 'Manufacturing', label: 'Manufacturing' },
  { value: 'Retail', label: 'Retail' },
  { value: 'Real Estate', label: 'Real Estate' },
  { value: 'Other', label: 'Other' },
];

export const TABLE_HEADERS = [
  { key: 'name', value: 'Name', sortKey: 'name' },
  { key: 'borrowerType', value: 'Type' },
  { key: 'relationshipManager', value: 'Manager' },
  { key: 'loanCount', value: 'Loans' },
  { key: 'totalBalance', value: 'Total Balance', sortKey: 'totalBalance' },
  { key: 'actions', value: 'Actions' },
];
