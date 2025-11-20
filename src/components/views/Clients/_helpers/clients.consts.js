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
  { key: 'client_id', value: 'Borrower ID', sortKey: 'client_id' },
  { key: 'name', value: 'Name', sortKey: 'name' },
  { key: 'client_type', value: 'Type', sortKey: 'client_type' },
  { key: 'email', value: 'Email', sortKey: 'email' },
  { key: 'phone_number', value: 'Phone', sortKey: 'phone_number' },
  { key: 'kyc_status', value: 'KYC Status', sortKey: 'kyc_status' },
  { key: 'client_risk_rating', value: 'Risk Rating', sortKey: 'client_risk_rating' },
  { key: 'relationship_manager', value: 'Manager' },
  { key: 'actions', value: 'Actions' },
];

