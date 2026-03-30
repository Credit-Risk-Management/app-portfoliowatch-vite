/**
 * Document keys for POST /borrower-financial-upload-links (must match API
 * `financialSubmissionRequirements` / Prisma JSON).
 */
export const REQUIRED_DOCUMENT_KEYS = {
  BALANCE_SHEET: 'balanceSheet',
  INCOME_STATEMENT_YTD: 'incomeStatementYtd',
  INCOME_STATEMENT_QUARTERLY: 'incomeStatementQuarterly',
  BUSINESS_TAX_RETURN: 'businessTaxReturn',
  DEBT_SCHEDULE: 'debtSchedule',
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
    REQUIRED_DOCUMENT_KEYS.INCOME_STATEMENT_YTD,
    REQUIRED_DOCUMENT_KEYS.INCOME_STATEMENT_QUARTERLY,
  ],
  periodLabel: 'Q1 2026',
  lenderInstructions:
    'Quarterly package for Q1 2026 (calendar). Balance sheet as of 3/31/2026, YTD income through 3/31/2026, and quarterly P&L for 1/1/2026–3/31/2026.',
};
