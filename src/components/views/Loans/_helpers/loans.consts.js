export const INTEREST_TYPE_OPTIONS = [
  { value: 'fixed', label: 'Fixed' },
  { value: 'variable', label: 'Variable' },
];

export const LOAN_RISK_RATING_OPTIONS = [
  { value: 1, label: '1 - Minimal Risk' },
  { value: 2, label: '2 - Low Risk' },
  { value: 3, label: '3 - Moderate Risk' },
  { value: 4, label: '4 - Elevated Risk' },
  { value: 5, label: '5 - High Risk' },
];

export const TABLE_HEADERS = [
  { key: 'loan_number', value: 'Loan Number', sortKey: 'loan_number' },
  { key: 'watch_score', value: 'WATCH Score', sortKey: 'watch_score' },
  { key: 'company_name', value: 'Company', sortKey: 'company_name' },
  { key: 'primary_contact', value: 'Primary Contact', sortKey: 'primary_contact' },
  { key: 'principal_amount', value: 'Principal', sortKey: 'principal_amount' },
  { key: 'payment_amount', value: 'Payment', sortKey: 'payment_amount' },
  { key: 'next_payment_due_date', value: 'Next Due Date', sortKey: 'next_payment_due_date' },
  { key: 'debt_service', value: 'Debt Service', sortKey: 'debt_service' },
  { key: 'current_ratio', value: 'Current Ratio', sortKey: 'current_ratio' },
  { key: 'liquidity', value: 'Liquidity', sortKey: 'liquidity' },
  { key: 'loan_officer', value: 'Loan Officer' },
  { key: 'manager', value: 'Manager' },
  { key: 'actions', value: 'Actions' },
];

export const RISK_RATING_LABELS = {
  1: '1 - Minimal Risk',
  2: '2 - Low Risk',
  3: '3 - Moderate Risk',
  4: '4 - Elevated Risk',
  5: '5 - High Risk',
};

