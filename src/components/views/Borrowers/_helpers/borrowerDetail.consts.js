import { Signal } from '@fyclabs/tools-fyc-react/signals';

// Signals for borrower detail component state
export const $borrowerDetailView = Signal({
  showEditBorrowerModal: false,
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
  sortKey: 'submittedAt',
  sortDirection: 'desc',
});

export const $borrowerFinancialsTableView = Signal({
  isTableLoading: false,
});
