import { Signal } from '@fyclabs/tools-fyc-react/signals';

// Signal for public financial upload form data
export const $publicFinancialForm = Signal({
  asOfDate: '',
  grossRevenue: '',
  netIncome: '',
  ebitda: '',
  debtService: '',
  debtServiceCovenant: '',
  currentRatio: '',
  currentRatioCovenant: '',
  liquidity: '',
  liquidityCovenant: '',
  liquidityRatio: '',
  liquidityRatioCovenant: '',
  retainedEarnings: '',
  notes: '',
});

/** One uploader signal per required document type (name key stays `financialDocs` for FileUploader). */
export const $publicIncomeStatementUploader = Signal({ financialDocs: [] });
export const $publicBalanceSheetUploader = Signal({ financialDocs: [] });
export const $publicCashFlowUploader = Signal({ financialDocs: [] });
export const $publicOtherFinancialsUploader = Signal({ financialDocs: [] });

/** Initial / reset shape for per-section OCR completion. */
export const initialPublicFinancialSectionsExtracted = {
  incomeStatement: false,
  balanceSheet: false,
  cashFlow: false,
  otherFinancials: false,
};

// Signal for component view state
export const $publicFinancialUploadView = Signal({
  linkData: null,
  token: null,
  isLoading: true,
  /** True while Sensible batch extraction runs (do not use `isLoading` for this — it drives the full-page spinner). */
  isExtracting: false,
  isSubmitting: false,
  error: null,
  success: false,
  ocrApplied: false,
  /** `'upload'` = add PDFs then run Sensible; `'review'` = edit extracted form and submit */
  flowStep: 'upload',
  sectionsExtracted: { ...initialPublicFinancialSectionsExtracted },
  refreshKey: 0,
});
