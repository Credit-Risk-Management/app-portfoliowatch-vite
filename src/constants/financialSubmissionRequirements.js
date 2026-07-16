/**
 * Document keys for POST /borrower-financial-upload-links (must match API
 * `financialSubmissionRequirements` / Prisma JSON).
 */
export const REQUIRED_DOCUMENT_KEYS = {
  BALANCE_SHEET: 'balanceSheet',
  INCOME_STATEMENT_YTD: 'incomeStatementYtd',
  INCOME_STATEMENT_QUARTERLY: 'incomeStatementQuarterly',
  BUSINESS_TAX_RETURN: 'businessTaxReturn',
  BUSINESS_TAX_RETURN_EXTENSION: 'businessTaxReturnExtension',
  DEBT_SCHEDULE: 'debtScheduleWorksheet',
};

/** Default quarterly package when `requiredDocumentKeys` is omitted (matches API cron). */
export const DEFAULT_QUARTERLY_REQUIRED_KEYS = [
  REQUIRED_DOCUMENT_KEYS.BALANCE_SHEET,
  REQUIRED_DOCUMENT_KEYS.INCOME_STATEMENT_QUARTERLY,
  REQUIRED_DOCUMENT_KEYS.DEBT_SCHEDULE,
];

/**
 * Sept 15 of the calendar year after the FY period end (UTC), matching API extension deadline.
 * @param {string|Date} reportingPeriodEndDate
 * @returns {Date}
 */
export const resolveBusinessTaxReturnExtensionDeadline = (reportingPeriodEndDate) => {
  const d = new Date(reportingPeriodEndDate);
  const filingYear = d.getUTCFullYear() + 1;
  return new Date(Date.UTC(filingYear, 8, 15));
};

/**
 * Structured annual borrower tax-return requirements (matches API
 * `buildDefaultAnnualBorrowerTaxReturnDocumentRequirements`).
 * @returns {Array<{ type: string, status: string, requiredForSubmit: boolean, visible: boolean, remind: boolean, nextRunDate: null }>}
 */
export const buildDefaultAnnualBorrowerTaxReturnDocumentRequirements = () => [
  {
    type: REQUIRED_DOCUMENT_KEYS.BUSINESS_TAX_RETURN,
    status: 'PENDING',
    requiredForSubmit: true,
    visible: true,
    remind: true,
    nextRunDate: null,
  },
  {
    type: REQUIRED_DOCUMENT_KEYS.BUSINESS_TAX_RETURN_EXTENSION,
    status: 'PENDING',
    requiredForSubmit: false,
    visible: true,
    remind: false,
    nextRunDate: null,
  },
];

/**
 * Quarterly test upload link — mirrors `financialSubmissionInviteCron` period math and
 * `DEFAULT_QUARTERLY_REQUIRED_KEYS` (balance sheet, quarterly P&L, debt schedule).
 * @param {Date} [referenceDate]
 * @returns {object} createUploadLink options
 */
export const buildQuarterlyTestUploadLinkOptions = (referenceDate = new Date()) => {
  const reportingPeriodEndDate = new Date(Date.UTC(
    referenceDate.getUTCFullYear(),
    referenceDate.getUTCMonth(),
    0,
  ));
  const quarter = Math.floor(reportingPeriodEndDate.getUTCMonth() / 3) + 1;
  const year = reportingPeriodEndDate.getUTCFullYear();
  const periodLabel = `Q${quarter} ${year}`;
  const isoDate = reportingPeriodEndDate.toISOString().slice(0, 10);

  return {
    submissionCadence: 'QUARTERLY',
    reportingPeriodEndDate: isoDate,
    fiscalYearEndMonth: 12,
    requiredDocumentKeys: [...DEFAULT_QUARTERLY_REQUIRED_KEYS],
    periodLabel,
    lenderInstructions:
      `Quarterly package for ${periodLabel} (calendar). Balance sheet as of ${isoDate}, `
      + `YTD income through ${isoDate}, and quarterly P&L for the quarter ending ${isoDate}. `
      + `A debt schedule is also required. Your ${year - 1} business tax return is also required.`,
  };
};

/**
 * Annual test upload link — mirrors `buildAnnualBorrowerTaxReturnInviteOptions` used by the
 * business tax return invite cron / SEND_UPLOAD_REMINDER tasks.
 * @param {Date} [referenceDate]
 * @returns {object} createUploadLink options
 */
export const buildAnnualBorrowerTestUploadLinkOptions = (referenceDate = new Date()) => {
  const fyYear = referenceDate.getUTCFullYear() - 1;
  const reportingPeriodEndDate = `${fyYear}-12-31`;
  const periodLabel = `FY ${fyYear}`;
  const filingYear = fyYear + 1;
  const extensionIso = resolveBusinessTaxReturnExtensionDeadline(reportingPeriodEndDate)
    .toISOString()
    .slice(0, 10);

  return {
    submissionCadence: 'ANNUAL',
    reportingPeriodEndDate,
    fiscalYearEndMonth: 12,
    requiredDocumentKeys: buildDefaultAnnualBorrowerTaxReturnDocumentRequirements(),
    periodLabel,
    lenderInstructions:
      `Please upload your ${periodLabel} business tax return. `
      + `If on extension, upload your filed extension form (Form 7004) below; `
      + `your return is due by September 15, ${filingYear} (${extensionIso}).`,
  };
};

/** @deprecated Use {@link buildQuarterlyTestUploadLinkOptions} */
export const Q1_TEST_UPLOAD_LINK_OPTIONS = buildQuarterlyTestUploadLinkOptions(
  new Date('2026-04-01T00:00:00.000Z'),
);

/** @deprecated Use {@link buildAnnualBorrowerTestUploadLinkOptions} */
export const ANNUAL_TEST_UPLOAD_LINK_OPTIONS = buildAnnualBorrowerTestUploadLinkOptions();

/** Keys for public guarantor upload (must match API). */
const GKeys = {
  personalTaxReturn: 'personalTaxReturn',
  personalFinancialStatement: 'personalFinancialStatement',
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
