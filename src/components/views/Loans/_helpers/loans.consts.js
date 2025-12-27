import { Signal } from '@fyclabs/tools-fyc-react/signals';
import { signal } from '@preact/signals-react';
import { WATCH_SCORE_OPTIONS } from '@src/consts/consts';

export const INTEREST_TYPE_OPTIONS = [
  { value: 'fixed', label: 'Fixed' },
  { value: 'variable', label: 'Variable' },
];

export const LOAN_RISK_RATING_OPTIONS = [
  { value: 1, label: WATCH_SCORE_OPTIONS[1].label },
  { value: 2, label: WATCH_SCORE_OPTIONS[2].label },
  { value: 3, label: WATCH_SCORE_OPTIONS[3].label },
  { value: 4, label: WATCH_SCORE_OPTIONS[4].label },
  { value: 5, label: WATCH_SCORE_OPTIONS[5].label },
];

export const TABLE_HEADERS = [
  { key: 'loanId', value: 'Loan ID', sortKey: 'loanId' },
  { key: 'watchScore', value: 'WATCH Score', sortKey: 'watchScore' },
  { key: 'borrowerName', value: 'Borrower', sortKey: 'borrowerName' },
  { key: 'principalAmount', value: 'Principal', sortKey: 'principalAmount' },
  { key: 'paymentAmount', value: 'Payment', sortKey: 'paymentAmount' },
  { key: 'nextPaymentDueDate', value: 'Next Due Date', sortKey: 'nextPaymentDueDate' },
  { key: 'liquidity', value: 'Liquidity', sortKey: 'liquidity' },
  { key: 'relationshipManager', value: 'Relationship Manager' },
  { key: 'actions', value: 'Actions' },
];

export const RISK_RATING_LABELS = {
  1: WATCH_SCORE_OPTIONS[1].label,
  2: WATCH_SCORE_OPTIONS[2].label,
  3: WATCH_SCORE_OPTIONS[3].label,
  4: WATCH_SCORE_OPTIONS[4].label,
  5: WATCH_SCORE_OPTIONS[5].label,
};

// Signals for loan detail component state
export const $financialsUploader = Signal({ financialFiles: [] });
export const $borrowers = signal([]);
export const $managers = signal([]);
export const $loanDetailNewComment = signal('');
export const $loanDetailShowSecondaryContacts = signal(false);
export const $loanDetailFinancials = signal([]);
export const $loanDetailCollateral = signal([]);
export const $industryReportGenerating = signal(false);

export const $loanDetailView = Signal({
  showEditLoanModal: false,
});
