import { Signal } from '@fyclabs/tools-fyc-react/signals';

/** Fallback if GET link does not yet return attestationText (must match API `BORROWER_FINANCIAL_ATTESTATION_TEXT`). */
export const DEFAULT_PUBLIC_ATTESTATION_TEXT =
  'Acting in my capacity as an authorized officer of the Borrower, I hereby certify and attest that the information, schedules, and calculations set forth in these financial statements are true, complete, and accurate in all material respects as of the date indicated. This submission is made with the full understanding that the Lender will rely upon the veracity of this data for the purpose of determining credit risk.';

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
/** Quarterly P&L slot (API key `incomeStatementQuarterly`); reuses cash-flow uploader signal. */
export const $publicDebtScheduleUploader = Signal({ financialDocs: [] });

/** Initial / reset shape for per-section OCR completion. */
export const initialPublicFinancialSectionsExtracted = {
  incomeStatement: false,
  balanceSheet: false,
  cashFlow: false,
  otherFinancials: false,
  incomeStatementQuarterly: false,
  businessTaxReturn: false,
  debtSchedule: false,
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
  /** Borrower must check before submit (API requires attestationAccepted). */
  attestationAccepted: false,
  /** While opening prior debt schedule PDF in a new tab */
  priorDebtOpening: false,
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
