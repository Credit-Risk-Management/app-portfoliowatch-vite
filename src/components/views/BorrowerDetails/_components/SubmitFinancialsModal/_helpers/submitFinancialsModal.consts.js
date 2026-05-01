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
    incomeStatementQuarterly: [],
    incomeStatementYtd: [],
    debtScheduleWorksheet: [],
    taxReturn: [],
  },
  currentDocumentIndex: {
    balanceSheet: 0,
    incomeStatementQuarterly: 0,
    incomeStatementYtd: 0,
    debtScheduleWorksheet: 0,
    taxReturn: 0,
  },
  initialStoredDocumentIdsByType: {
    balanceSheet: [],
    incomeStatementQuarterly: [],
    incomeStatementYtd: [],
    debtScheduleWorksheet: [],
    taxReturn: [],
  },
  showWatchScoreResults: false,
  updatedLoans: [],
});

/** Modal `documentsByType` keys (order used for empty checks and multipart staging). */
export const MODAL_FINANCIAL_DOCUMENT_BUCKET_KEYS = [
  'balanceSheet',
  'incomeStatementQuarterly',
  'incomeStatementYtd',
  'debtScheduleWorksheet',
  'taxReturn',
];

/** Quarterly vs YTD income: at most one may have files; staging clears the other. */
export const INCOME_STATEMENT_MODAL_KEYS = ['incomeStatementQuarterly', 'incomeStatementYtd'];
