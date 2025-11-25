export const CLIENT_TYPE_OPTIONS = [
  { value: 'Individual', label: 'Individual' },
  { value: 'Business', label: 'Business' },
];

export const KYC_STATUS_OPTIONS = [
  { value: 'Pending', label: 'Pending' },
  { value: 'In Progress', label: 'In Progress' },
  { value: 'Completed', label: 'Completed' },
  { value: 'Failed', label: 'Failed' },
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
  { key: 'borrowerId', value: 'Borrower ID', sortKey: 'borrower_id' },
  { key: 'name', value: 'Name', sortKey: 'name' },
  { key: 'borrowerType', value: 'Type', sortKey: 'client_type' },
  { key: 'relationshipManager', value: 'Manager' },
  { key: 'actions', value: 'Actions' },
];
