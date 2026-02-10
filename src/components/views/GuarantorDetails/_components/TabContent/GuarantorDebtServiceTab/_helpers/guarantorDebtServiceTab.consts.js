import { Signal } from '@fyclabs/tools-fyc-react/signals';

// Signal for component view state
export const $debtServiceContainerView = Signal({
  activeModalKey: null, // 'add' | 'edit' | 'delete' | 'details' | null
  isLoading: false,
  selectedRecordForDetails: null,
});

export const $debtServiceContainerDetails = Signal({
  latestDebtService: null,
  latestFinancial: null,
});
