import { Signal } from '@fyclabs/tools-fyc-react/signals';

// Signal for accept invitation form data
export const $guarantorDetailView = Signal({
  guarantorId: null,
  activeKey: 'detail',
  guarantor: null,
  isLoading: false,
  error: null,
});

export const $guarantorDetailsData = Signal({
  name: null,
  email: null,
  phone: null,
  borrowerId: null,
  financials: [],
  loans: [],
  /** All loans for the borrower (for guarantor modal loan picker on guarantor detail) */
  borrowerLoans: [],
});

export const TABLE_HEADERS = [
  { key: 'loanId', value: 'Loan ID', sortKey: 'loanId' },
  { key: 'watchScore', value: 'WATCH Score', sortKey: 'watchScore' },
  { key: 'borrowerName', value: 'Borrower', sortKey: 'borrowerName' },
  { key: 'principalAmount', value: 'Principal', sortKey: 'principalAmount' },
  { key: 'paymentAmount', value: 'Payment', sortKey: 'paymentAmount' },
  { key: 'nextPaymentDueDate', value: 'Next Due Date', sortKey: 'nextPaymentDueDate' },
  { key: 'liquidity', value: 'Liquidity', sortKey: 'liquidity' },
  { key: 'relationshipManager', value: 'Relationship Manager' },
];
