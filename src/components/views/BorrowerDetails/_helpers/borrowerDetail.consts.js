import { Signal } from '@fyclabs/tools-fyc-react/signals';

// Signals for borrower detail component state
export const $borrowerDetailView = Signal({
  showEditBorrowerModal: false,
  activeKey: 'details',
});

// Signals for borrower loans table
export const $borrowerLoansFilter = Signal({
  page: 1,
  sortKey: undefined,
  sortDirection: undefined,
});

export const $borrowerLoansView = Signal({
  isTableLoading: false,
});

// Signals for borrower financials table
export const $borrowerFinancialsFilter = Signal({
  page: 1,
  sortKey: 'asOfDate',
  sortDirection: 'desc',
});

export const $borrowerFinancialsTableView = Signal({
  isTableLoading: false,
});

// Signals for borrower documents table
export const $borrowerDocumentsFilter = Signal({
  page: 1,
  sortKey: undefined,
  sortDirection: undefined,
});

export const $borrowerDocumentsView = Signal({
  isTableLoading: false,
});

export const $borrowerGuarantorModal = Signal({
  show: false,
  editingGuarantorId: null,
  isSubmitting: false,
  /** Borrower id for async loan search (`GET /loans/borrower/:id`) */
  loanPickerBorrowerId: null,
  /** True when this borrower has loans and at least one must be selected */
  requireLoanSelection: false,
  /** Linked loan ids when editing; used to diff add/remove */
  initialLoanIds: [],
});

export const $borrowerGuarantorModalForm = Signal({
  name: '',
  email: '',
  phone: '',
  /** Selected loan ids (strings) */
  loanIds: [],
});
