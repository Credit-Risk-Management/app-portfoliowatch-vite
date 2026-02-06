import { Signal } from '@fyclabs/tools-fyc-react/signals';

// Signal for accept invitation form data
export const $guarantorsView = Signal({
  guarantorId: null,
  guarantor: null,
  isLoading: true,
  error: null,
});

export const $guarantorsList = Signal({
  list: [],
  totalCount: 0,
});

export const TABLE_HEADERS = [
  { key: 'name', value: 'Name', sortKey: 'name' },
  { key: 'numberOfLoans', value: '#Loans', sortKey: 'numberOfLoans' },
  { key: 'email', value: 'Email', sortKey: 'email' },
  { key: 'phone', value: 'Phone', sortKey: 'phone' },
  { key: 'totalAssets', value: 'Total Assets', sortKey: 'totalAssets' },
  { key: 'totalLiabilities', value: 'Total Liabilities', sortKey: 'totalLiabilities' },
  { key: 'netWorth', value: 'Net Worth', sortKey: 'netWorth' },
  { key: 'income', value: 'Income', sortKey: 'income' },
  { key: 'expenses', value: 'Expenses', sortKey: 'expenses' },
];
