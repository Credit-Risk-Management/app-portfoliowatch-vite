import { Signal } from '@fyclabs/tools-fyc-react/signals';

/** Fallback if GET link does not yet return attestationText (must match API `BORROWER_FINANCIAL_ATTESTATION_TEXT`). */
export const DEFAULT_PUBLIC_ATTESTATION_TEXT =
  'Acting in my capacity as an authorized officer of the Borrower, I hereby certify and attest that the information, schedules, and calculations set forth in these financial statements are true, complete, and accurate in all material respects as of the date indicated. This submission is made with the full understanding that the Lender will rely upon the veracity of this data for the purpose of determining credit risk.';

/**
 * Public debt schedule template: `public/debt-schedule-template.pdf` (AcroForm fillable PDF)
 * unless `VITE_DEBT_SCHEDULE_TEMPLATE_URL` is set (e.g. CDN or public bucket URL).
 * Totals row (below row 8): only `totals_Current_Balance` and `totals_Monthly_Payment`.
 * See `scripts/patch-debt-schedule-totals-row.mjs` (or `pnpm run patch:debt-schedule-pdf`) for layout maintenance.
 */
const resolveDebtScheduleTemplatePdfUrl = () => {
  const envUrl = import.meta.env.VITE_DEBT_SCHEDULE_TEMPLATE_URL;
  if (typeof envUrl === 'string' && envUrl.trim()) {
    return envUrl.trim();
  }
  return '/debt-schedule-template.pdf';
};

export const DEBT_SCHEDULE_TEMPLATE_PDF_URL = resolveDebtScheduleTemplatePdfUrl();

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

/** Matches `Template - Debt Schedule.xlsx`: 6 data rows (R6–R11), 10 columns; footer signature line. */
export const DEBT_SCHEDULE_XLSX_DATA_ROW_COUNT = 6;

/** Field keys for one debt row (column order as in the XLSX header row). */
export const DEBT_SCHEDULE_FORM_COLUMN_KEYS = [
  'nameOfCreditor',
  'originalAmountFinanced',
  'lineOfCreditLimit',
  'originalDateYear',
  'currentBalance',
  'interestRate',
  'maturityDate',
  'monthlyPayment',
  'collateral',
  'currentOrDelinquent',
];

export const debtScheduleFormField = (rowIdx, columnKey) => `r${rowIdx}_${columnKey}`;

export const createDefaultDebtScheduleWorksheetForm = () => {
  const base = {
    businessName: '',
    asOfDate: '',
    signatoryName: '',
    signatoryTitle: '',
    signDate: '',
  };
  for (let r = 0; r < DEBT_SCHEDULE_XLSX_DATA_ROW_COUNT; r += 1) {
    DEBT_SCHEDULE_FORM_COLUMN_KEYS.forEach((k) => {
      base[debtScheduleFormField(r, k)] = '';
    });
  }
  return base;
};

export const $debtScheduleWorksheetForm = Signal(createDefaultDebtScheduleWorksheetForm());

// Signal for component view state
export const $publicFinancialUploadView = Signal({
  linkData: null,
  token: null,
  isLoading: true,
  isSubmitting: false,
  activeModalKey: null,
  error: null,
  success: false,
  priorDebtOpening: false,
  /** Worksheet modal validation (UI only; not submitted to API). */
  debtScheduleWorksheetErrors: null,
  /** True while building the worksheet PDF for upload. */
  debtScheduleWorksheetSubmitting: false,
  /**
   * After one merge from `linkData.priorDebtScheduleWorksheet`, further opens keep the in-memory
   * worksheet so the user can edit after save without being reset to the prior snapshot.
   */
  debtScheduleWorksheetHydratedFromPrior: false,
});

export const UPLOADER_BY_SECTION = {
  incomeStatement: $publicIncomeStatementUploader,
  balanceSheet: $publicBalanceSheetUploader,
  incomeStatementQuarterly: $publicCashFlowUploader,
  businessTaxReturn: $publicOtherFinancialsUploader,
  debtScheduleWorksheet: $publicDebtScheduleUploader,
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
  debtScheduleWorksheet: {
    sectionId: 'debtScheduleWorksheet',
    title: 'Debt schedule',
    helperText:
      'Open the worksheet, enter your debts and sign. Your lender receives one official PDF generated when you submit — you do not upload a separate debt schedule file.',
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
  debtScheduleWorksheet: 'debtScheduleWorksheet',
};

/** Stored `document_type` on borrower financial documents (matches server REQUIRED_DOCUMENT_KEYS). */
export const SECTION_ID_TO_DOCUMENT_TYPE = {
  incomeStatement: 'incomeStatementYtd',
  balanceSheet: 'balanceSheet',
  incomeStatementQuarterly: 'incomeStatementQuarterly',
  businessTaxReturn: 'businessTaxReturn',
  debtScheduleWorksheet: 'debtScheduleWorksheet',
  cashFlow: 'cashFlow',
  otherFinancials: 'otherFinancials',
};

export const DEFAULT_SECTION_IDS = ['balanceSheet', 'incomeStatement'];

export const KNOWN_SECTION_IDS = new Set(Object.keys(SECTION_DEF_BY_ID));
