export const TABLE_HEADERS = [
  { key: 'name', value: 'Name', sortKey: 'name' },
  { key: 'position_title', value: 'Position', sortKey: 'position_title' },
  { key: 'email', value: 'Email', sortKey: 'email' },
  { key: 'phone', value: 'Phone', sortKey: 'phone' },
  { key: 'office_location', value: 'Office', sortKey: 'office_location' },
  { key: 'manager', value: 'Reports To' },
  { key: 'reports_count', value: '# Reports' },
  { key: 'loans_count', value: '# Loans' },
  { key: 'status', value: 'Status', sortKey: 'is_active' },
  { key: 'actions', value: 'Actions' },
];

export const STATUS_FILTER_OPTIONS = [
  { value: 'all', label: 'All Statuses' },
  { value: 'active', label: 'Active Only' },
  { value: 'inactive', label: 'Inactive Only' },
];

export const STATUS_OPTIONS = [
  { value: true, label: 'Active' },
  { value: false, label: 'Inactive' },
];

