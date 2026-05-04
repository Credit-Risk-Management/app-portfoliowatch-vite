export const CLIENT_TYPE_OPTIONS = [
  { value: 'Business', label: 'Business' },
  { value: 'SBA CA', label: 'SBA CA' },
  { value: 'C&I', label: 'C&I' },
  { value: 'CRE', label: 'CRE' },
];

/** Borrowers list: quarterly package badge filter (matches API `quarterlyPackageComplete`). */
export const QUARTERLY_PACKAGE_FILTER_OPTIONS = [
  { value: 'true', label: 'On file (current period)' },
  { value: 'false', label: 'Not on file' },
];

/** Borrowers list: impact questionnaire badge filter (matches API `impactQuestionnaireComplete`). */
export const IMPACT_QUESTIONNAIRE_FILTER_OPTIONS = [
  { value: 'true', label: 'Submitted' },
  { value: 'false', label: 'Not submitted' },
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
  { key: 'totalBalance', value: 'Total Balance' },
  { key: 'actions', value: 'Actions' },
];
