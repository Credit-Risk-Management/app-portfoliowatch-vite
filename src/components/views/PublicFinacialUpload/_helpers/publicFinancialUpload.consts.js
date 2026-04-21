import { Signal } from '@fyclabs/tools-fyc-react/signals';

/** Fallback if GET link does not yet return attestationText (must match API `BORROWER_FINANCIAL_ATTESTATION_TEXT`). */
export const DEFAULT_PUBLIC_ATTESTATION_TEXT =
  'Acting in my capacity as an authorized officer of the Borrower, I hereby certify and attest that the information, schedules, and calculations set forth in these financial statements are true, complete, and accurate in all material respects as of the date indicated. This submission is made with the full understanding that the Lender will rely upon the veracity of this data for the purpose of determining credit risk.';

// Signal for public financial upload form data (optional fields; server applies defaults on submit).
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

// Signal for component view state
export const $publicFinancialUploadView = Signal({
  linkData: null,
  token: null,
  isLoading: true,
  isSubmitting: false,
  activeModalKey: null,
  error: null,
  success: false,
});

export const UPLOADER_BY_SECTION = {
  incomeStatement: $publicIncomeStatementUploader,
  balanceSheet: $publicBalanceSheetUploader,
  incomeStatementQuarterly: $publicCashFlowUploader,
  businessTaxReturn: $publicOtherFinancialsUploader,
  debtSchedule: $publicDebtScheduleUploader,
  cashFlow: $publicCashFlowUploader,
  otherFinancials: $publicOtherFinancialsUploader,
};

/** UI row metadata keyed by internal sectionId (matches API document keys via API_KEY_TO_SECTION_ID). */
export const SECTION_DEF_BY_ID = {
  incomeStatement: {
    sectionId: 'incomeStatement',
    title: 'Income statement (YTD)',
    helperText: 'Upload YTD income statement as a PDF (e.g. through 6/30, 9/30, or 12/31 per your reporting period).',
    inputId: 'public-financial-income-statement-ytd',
    replaceButtonVariant: 'primary-100',
  },
  balanceSheet: {
    sectionId: 'balanceSheet',
    title: 'Balance sheet',
    helperText: 'Upload balance sheet as of the period end date as a PDF.',
    inputId: 'public-financial-balance-sheet',
    replaceButtonVariant: 'outline-secondary',
  },
  incomeStatementQuarterly: {
    sectionId: 'incomeStatementQuarterly',
    title: 'Income statement (quarter)',
    helperText: 'Upload quarterly P&L for the period (e.g. 1/1–3/31, 4/1–6/30, …) as a PDF.',
    inputId: 'public-financial-income-statement-quarter',
    replaceButtonVariant: 'outline-secondary',
  },
  businessTaxReturn: {
    sectionId: 'businessTaxReturn',
    title: 'Business tax return',
    helperText: 'Upload the annual business tax return as a PDF.',
    inputId: 'public-financial-tax-return',
    replaceButtonVariant: 'outline-secondary',
  },
  debtSchedule: {
    sectionId: 'debtSchedule',
    title: 'Debt schedule',
    helperText: 'Upload the debt schedule as a PDF. If a prior schedule was provided, you may download and update it.',
    inputId: 'public-financial-debt-schedule',
    replaceButtonVariant: 'outline-secondary',
  },
};

/** Maps API `requiredDocumentKeys` entries (from Express) to internal section ids. */
export const API_KEY_TO_SECTION_ID = {
  incomeStatementYtd: 'incomeStatement',
  balanceSheet: 'balanceSheet',
  incomeStatementQuarterly: 'incomeStatementQuarterly',
  businessTaxReturn: 'businessTaxReturn',
  debtSchedule: 'debtSchedule',
};

/** Stored `document_type` on borrower financial documents (matches server REQUIRED_DOCUMENT_KEYS). */
export const SECTION_ID_TO_DOCUMENT_TYPE = {
  incomeStatement: 'incomeStatementYtd',
  balanceSheet: 'balanceSheet',
  incomeStatementQuarterly: 'incomeStatementQuarterly',
  businessTaxReturn: 'businessTaxReturn',
  debtSchedule: 'debtSchedule',
  cashFlow: 'cashFlow',
  otherFinancials: 'otherFinancials',
};

export const DEFAULT_SECTION_IDS = ['balanceSheet', 'incomeStatement'];

export const KNOWN_SECTION_IDS = new Set(Object.keys(SECTION_DEF_BY_ID));
