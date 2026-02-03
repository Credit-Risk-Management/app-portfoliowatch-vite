import { Signal } from '@fyclabs/tools-fyc-react/signals';
import { WATCH_SCORE_OPTIONS } from '@src/consts/consts';
import { formatDate } from './loans.helpers';

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

export const $loanDetailCollateral = Signal([]);
export const $loanDetailGuarantors = Signal([]);
export const loanCollateralDateOptions = $loanDetailCollateral.value.map((e) => ({ value: e.asOfDate ?? '', label: formatDate(e.asOfDate) }));

// Signals for loan detail component state
export const $financialsUploader = Signal({ financialFiles: [] });
export const $borrowers = Signal([]);
export const $managers = Signal([]);
export const $loanDetailNewComment = Signal('');
export const $loanDetailNewCommentLoading = Signal(false);
export const $loanDetailShowSecondaryContacts = Signal(false);
export const $loanDetailFinancials = Signal([]);
export const $loanDetailCollateralDateFilter = Signal(null);
export const $loanDetailCollateralAccordionExpanded = Signal(undefined);
export const $industryReportGenerating = Signal(false);

export const $loanDetailView = Signal({
  showEditLoanModal: false,
});
