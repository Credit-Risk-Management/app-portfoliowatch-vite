/**
 * Document keys for POST /borrower-financial-upload-links (must match API
 * `financialSubmissionRequirements` / Prisma JSON).
 */
export const REQUIRED_DOCUMENT_KEYS = {
  BALANCE_SHEET: 'balanceSheet',
  INCOME_STATEMENT_YTD: 'incomeStatementYtd',
  INCOME_STATEMENT_QUARTERLY: 'incomeStatementQuarterly',
  BUSINESS_TAX_RETURN: 'businessTaxReturn',
  DEBT_SCHEDULE: 'debtScheduleWorksheet',
};

/**
 * Default quarterly submission (calendar Q1) for testing the public upload flow.
 * Period end 3/31; YTD through 3/31; quarterly P&L Jan 1–Mar 31.
 */
export const Q1_TEST_UPLOAD_LINK_OPTIONS = {
  submissionCadence: 'QUARTERLY',
  reportingPeriodEndDate: '2026-03-31',
  fiscalYearEndMonth: 12,
  requiredDocumentKeys: [
    REQUIRED_DOCUMENT_KEYS.BALANCE_SHEET,
    REQUIRED_DOCUMENT_KEYS.INCOME_STATEMENT_QUARTERLY,
    REQUIRED_DOCUMENT_KEYS.DEBT_SCHEDULE,
  ],
  periodLabel: 'Q1 2026',
  lenderInstructions:
    'Quarterly package for Q1 2026 (calendar).Balance Sheet - dated 3/31/2026 and Income Statement for 1/1/2026 - 3/31/2026 and Debt Schedule as of 3/31/2026',
};

/**
 * Default annual submission for testing the public upload flow (calendar year-end).
 * Matches API DEFAULT_ANNUAL_REQUIRED_KEYS: tax return, debt schedule, balance sheet.
 */
export const ANNUAL_TEST_UPLOAD_LINK_OPTIONS = {
  submissionCadence: 'ANNUAL',
  reportingPeriodEndDate: '2025-12-31',
  fiscalYearEndMonth: 12,
  requiredDocumentKeys: [
    // REQUIRED_DOCUMENT_KEYS.BUSINESS_TAX_RETURN,
    REQUIRED_DOCUMENT_KEYS.DEBT_SCHEDULE,
  ],
  periodLabel: 'FY 2025',
  lenderInstructions:
    'Annual package for FY 2025 (calendar year-end). Business tax return and debt schedule as of 12/31/2025.',
};

/** Keys for public guarantor upload (must match API). */
const GKeys = {
  personalTaxReturn: 'personalTaxReturn',
  personalFinancialStatement: 'personalFinancialStatement',
  // businessTaxReturn: 'businessTaxReturn',
  // debtScheduleWorksheet: 'debtScheduleWorksheet',
};

const priorCalendarYear = () => new Date().getFullYear() - 1;

/**
 * @returns {object} createGuarantorUploadLink options
 */
export const buildGuarantorAnnualUploadLinkOptions = () => {
  const fy = priorCalendarYear();
  return {
    submissionCadence: 'ANNUAL',
    reportingPeriodEndDate: `${fy}-12-31`,
    fiscalYearEndMonth: 12,
    requiredDocumentKeys: [GKeys.personalTaxReturn, GKeys.personalFinancialStatement],
    periodLabel: `FY ${fy}`,
    lenderInstructions: `Annual guarantor package for FY ${fy} (calendar year-end): personal tax return, PFS`,
  };
};
