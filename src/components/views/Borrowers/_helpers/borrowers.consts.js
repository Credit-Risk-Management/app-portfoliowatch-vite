export const CLIENT_TYPE_OPTIONS = [
  { value: 'Business', label: 'Business' },
  { value: 'SBA CA', label: 'SBA CA' },
];

export const RISK_RATING_OPTIONS = [
  { value: 'Low', label: 'Low' },
  { value: 'Medium', label: 'Medium' },
  { value: 'High', label: 'High' },
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
  { key: 'borrowerType', value: 'Type', sortKey: 'borrowerType' },
  { key: 'relationshipManager', value: 'Manager' },
  { key: 'loanCount', value: 'Loans' },
  { key: 'totalBalance', value: 'Total Balance' },
  { key: 'actions', value: 'Actions' },
];
