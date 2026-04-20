import { Signal } from '@fyclabs/tools-fyc-react/signals';

export const $financialDocsUploader = Signal({
  financialDocs: [],
});

export const $modalState = Signal({
  ocrApplied: false,
  isSubmitting: false,
  error: null,
  refreshKey: 0,
  pdfUrl: null,
  downloadSensibleUrl: false,
  isLoading: false,
  isLoadingInputData: false,
  previousFinancial: null,
  isLoadingPrevious: false,
  documentsByType: {
    balanceSheet: [],
    incomeStatement: [],
    debtScheduleWorksheet: [],
    taxReturn: [],
  },
  currentDocumentIndex: {
    balanceSheet: 0,
    incomeStatement: 0,
    debtScheduleWorksheet: 0,
    taxReturn: 0,
  },
  initialStoredDocumentIdsByType: {
    balanceSheet: [],
    incomeStatement: [],
    debtScheduleWorksheet: [],
    taxReturn: [],
  },
  showWatchScoreResults: false,
  updatedLoans: [],
});
