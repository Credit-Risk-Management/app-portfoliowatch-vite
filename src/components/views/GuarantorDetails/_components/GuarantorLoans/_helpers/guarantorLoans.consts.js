import { Signal } from '@fyclabs/tools-fyc-react/signals';

// Signal for accept invitation form data
export const $guarantorsLoansView = Signal({
  breakdowns: {},
  isLoading: true,
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
