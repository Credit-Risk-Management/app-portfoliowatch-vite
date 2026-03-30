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

/** Which accordion row is expanded (matches item `id` in PublicFinancialUpload). */
export const $publicFinancialAccordionExpanded = Signal('incomeStatement');

/** Initial / reset shape for per-section OCR completion (accordion checkmarks). */
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

/** Staged PDF preview (blob URL) for the expanded accordion row — mirrors PFSDocumentsContainer behavior. */
export const $publicFinancialPdfPreview = Signal({
  pdfBlobUrl: null,
  pdfNumPages: null,
  pdfPageNumber: 1,
  pdfLoadError: false,
  pdfZoomScale: 1,
  previewFileName: null,
});
