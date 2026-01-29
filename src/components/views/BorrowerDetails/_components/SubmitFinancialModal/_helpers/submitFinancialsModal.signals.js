import { Signal } from '@fyclabs/tools-fyc-react/signals';

// Local signal for file uploader
export const $financialDocsUploader = Signal({
  financialDocs: [],
});

// Local signal for modal state
export const $modalState = Signal({
  ocrApplied: false,
  isSubmitting: false,
  error: null,
  refreshKey: 0,
  pdfUrl: null,
  previousFinancial: null,
  isLoadingPrevious: false,
  // Document management - track documents by type
  documentsByType: {
    balanceSheet: [],
    incomeStatement: [],
    debtServiceWorksheet: [],
  },
  currentDocumentIndex: {
    balanceSheet: 0,
    incomeStatement: 0,
    debtServiceWorksheet: 0,
  },
  // Watch score results modal
  showWatchScoreResults: false,
  updatedLoans: [],
});
