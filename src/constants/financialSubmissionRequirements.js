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
  REQUIRED_DOCUMENT_KEYS.INCOME_STATEMENT_YTD,
];

/**
 * Sept 15 of the calendar year after the FY period end (UTC), matching API extension deadline.
 * @param {string|Date} reportingPeriodEndDate
 * @returns {Date}
 */
export const resolveBusinessTaxReturnExtensionDeadline = reportingPeriodEndDate => {
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
 * Instructions only mention the keys on the link.
 * @param {Date} [referenceDate]
 * @param {string[]} [requiredDocumentKeys]
 * @returns {object} createUploadLink options
 */
export const buildQuarterlyTestUploadLinkOptions = (
  referenceDate = new Date(),
  requiredDocumentKeys = [...DEFAULT_QUARTERLY_REQUIRED_KEYS],
) => {
  const reportingPeriodEndDate = new Date(
    Date.UTC(referenceDate.getUTCFullYear(), referenceDate.getUTCMonth(), 0),
  );
  const quarter = Math.floor(reportingPeriodEndDate.getUTCMonth() / 3) + 1;
  const year = reportingPeriodEndDate.getUTCFullYear();
  const periodLabel = `Q${quarter} ${year}`;
  const isoDate = reportingPeriodEndDate.toISOString().slice(0, 10);
  const keySet = new Set(requiredDocumentKeys);
  const parts = [];
  if (keySet.has(REQUIRED_DOCUMENT_KEYS.BALANCE_SHEET)) {
    parts.push(`balance sheet as of ${isoDate}`);
  }
  if (keySet.has(REQUIRED_DOCUMENT_KEYS.INCOME_STATEMENT_YTD)) {
    parts.push(`year-to-date income statement through ${isoDate}`);
  }
  if (keySet.has(REQUIRED_DOCUMENT_KEYS.INCOME_STATEMENT_QUARTERLY)) {
    parts.push(`quarterly P&L for the quarter ending ${isoDate}`);
  }
  if (keySet.has(REQUIRED_DOCUMENT_KEYS.DEBT_SCHEDULE)) {
    parts.push('debt schedule');
  }
  if (keySet.has(REQUIRED_DOCUMENT_KEYS.BUSINESS_TAX_RETURN)) {
    parts.push(`${year - 1} business tax return`);
  }
  if (keySet.has(REQUIRED_DOCUMENT_KEYS.BUSINESS_TAX_RETURN_EXTENSION)) {
    parts.push('filed tax-return extension (Form 7004), if applicable');
  }
  let lenderInstructions = `Quarterly package for ${periodLabel} (calendar). Please upload the requested financial documents.`;
  if (parts.length === 1) {
    lenderInstructions = `Quarterly package for ${periodLabel} (calendar). Please upload your ${parts[0]}.`;
  } else if (parts.length > 1) {
    const last = parts[parts.length - 1];
    const leading = parts.slice(0, -1).join(', ');
    lenderInstructions = `Quarterly package for ${periodLabel} (calendar). Please upload your ${leading}, and ${last}.`;
  }

  return {
    submissionCadence: 'QUARTERLY',
    reportingPeriodEndDate: isoDate,
    fiscalYearEndMonth: 12,
    requiredDocumentKeys: [...requiredDocumentKeys],
    periodLabel,
    lenderInstructions,
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
      `Please upload your ${periodLabel} business tax return. ` +
      'If on extension, upload your filed extension form (Form 7004) below; ' +
      `your return is due by September 15, ${filingYear} (${extensionIso}).`,
  };
};

/** @deprecated Use {@link buildQuarterlyTestUploadLinkOptions} */
export const Q1_TEST_UPLOAD_LINK_OPTIONS = buildQuarterlyTestUploadLinkOptions(
  new Date('2026-04-01T00:00:00.000Z'),
);

/** @deprecated Use {@link buildAnnualBorrowerTestUploadLinkOptions} */
export const ANNUAL_TEST_UPLOAD_LINK_OPTIONS = buildAnnualBorrowerTestUploadLinkOptions();

/**
 * Default calendar tax years for annual public links (prior 3 years).
 * @param {Date} [referenceDate]
 * @returns {number[]}
 */
export const defaultAnnualPublicLinkTaxYears = (referenceDate = new Date()) => {
  const currentYear = referenceDate.getUTCFullYear();
  return [currentYear - 3, currentYear - 2, currentYear - 1];
};

/**
 * Structured requirement row for createUploadLink (matches API JSON).
 * @param {string} type
 * @param {object} [overrides]
 * @returns {object}
 */
export const buildUploadLinkRequirementRow = (type, overrides = {}) => ({
  type,
  status: 'PENDING',
  requiredForSubmit: true,
  visible: true,
  remind: true,
  nextRunDate: null,
  ...overrides,
});

const formatDocumentList = (items) => {
  if (items.length === 0) return '';
  if (items.length === 1) return items[0];
  const last = items[items.length - 1];
  const leading = items.slice(0, -1).join(', ');
  return `${leading}, and ${last}`;
};

/**
 * Build lender instructions from selected document requirements.
 * @param {object} params
 * @param {Array<{ taxYear: number, requiredForSubmit: boolean }>} [params.taxYearItems]
 * @param {{ requiredForSubmit: boolean }|null} [params.debtSchedule]
 * @param {boolean} [params.includeTaxReturnExtension]
 * @returns {string}
 */
export const buildCustomAnnualUploadLinkInstructions = ({
  taxYearItems = [],
  debtSchedule = null,
  includeTaxReturnExtension = false,
}) => {
  const requiredParts = [];
  const optionalParts = [];

  taxYearItems.forEach(({ taxYear, requiredForSubmit }) => {
    const label = `FY ${taxYear} business tax return`;
    if (requiredForSubmit) requiredParts.push(label);
    else optionalParts.push(label);
  });

  if (debtSchedule) {
    if (debtSchedule.requiredForSubmit) requiredParts.push('debt schedule');
    else optionalParts.push('debt schedule');
  }

  if (includeTaxReturnExtension) {
    optionalParts.push('filed tax-return extension (Form 7004), if applicable');
  }

  if (requiredParts.length === 0 && optionalParts.length === 0) {
    return 'Please upload the requested financial documents.';
  }

  const sentences = [];
  if (requiredParts.length > 0) {
    sentences.push(`Please upload your ${formatDocumentList(requiredParts)}.`);
  }
  if (optionalParts.length > 0) {
    sentences.push(`${requiredParts.length > 0 ? 'Also provide' : 'Please upload'} ${formatDocumentList(optionalParts)} if available.`);
  }
  return sentences.join(' ');
};

/**
 * Configurable annual/custom public upload link for lender-created packages.
 * @param {object} params
 * @param {Array<{ taxYear: number, requiredForSubmit: boolean }>} [params.taxYearItems]
 * @param {{ included: boolean, requiredForSubmit: boolean }|null} [params.debtSchedule]
 * @param {boolean} [params.includeTaxReturnExtension]
 * @param {string} [params.lenderInstructions]
 * @param {Date} [params.referenceDate]
 * @returns {object} createUploadLink options
 */
export const buildCustomAnnualUploadLinkOptions = ({
  taxYearItems = defaultAnnualPublicLinkTaxYears().map(taxYear => ({
    taxYear,
    requiredForSubmit: taxYear === Math.max(...defaultAnnualPublicLinkTaxYears()),
  })),
  debtSchedule = { included: true, requiredForSubmit: false },
  includeTaxReturnExtension = false,
  lenderInstructions,
  referenceDate = new Date(),
} = {}) => {
  const sortedTaxYearItems = [...taxYearItems]
    .filter(item => Number.isFinite(item?.taxYear))
    .sort((a, b) => a.taxYear - b.taxYear);
  const sortedYears = sortedTaxYearItems.map(item => item.taxYear);
  const maxYear = sortedYears.length > 0
    ? sortedYears[sortedYears.length - 1]
    : referenceDate.getUTCFullYear() - 1;
  const reportingPeriodEndDate = `${maxYear}-12-31`;
  let periodLabel = 'Custom financial package';
  if (sortedYears.length > 1) {
    periodLabel = `Tax returns ${sortedYears[0]}–${maxYear}`;
  } else if (sortedYears.length === 1) {
    periodLabel = `FY ${sortedYears[0]}`;
  } else if (debtSchedule?.included) {
    periodLabel = 'Debt schedule';
  }

  const requiredDocumentKeys = sortedTaxYearItems.map(({ taxYear, requiredForSubmit }) => (
    buildUploadLinkRequirementRow(
      REQUIRED_DOCUMENT_KEYS.BUSINESS_TAX_RETURN,
      {
        taxYear,
        requiredForSubmit: Boolean(requiredForSubmit),
        remind: Boolean(requiredForSubmit),
      },
    )
  ));

  if (debtSchedule?.included) {
    requiredDocumentKeys.push(buildUploadLinkRequirementRow(
      REQUIRED_DOCUMENT_KEYS.DEBT_SCHEDULE,
      {
        requiredForSubmit: Boolean(debtSchedule.requiredForSubmit),
        remind: Boolean(debtSchedule.requiredForSubmit),
      },
    ));
  }

  const instructionDebtSchedule = debtSchedule?.included
    ? { requiredForSubmit: Boolean(debtSchedule.requiredForSubmit) }
    : null;

  if (includeTaxReturnExtension && sortedYears.length > 0) {
    const latestYear = sortedYears[sortedYears.length - 1];
    const filingYear = latestYear + 1;
    const extensionIso = resolveBusinessTaxReturnExtensionDeadline(`${latestYear}-12-31`)
      .toISOString()
      .slice(0, 10);
    requiredDocumentKeys.push(buildUploadLinkRequirementRow(
      REQUIRED_DOCUMENT_KEYS.BUSINESS_TAX_RETURN_EXTENSION,
      { requiredForSubmit: false, remind: false },
    ));
    if (!lenderInstructions) {
      return {
        submissionCadence: 'CUSTOM',
        reportingPeriodEndDate,
        fiscalYearEndMonth: 12,
        requiredDocumentKeys,
        periodLabel,
        lenderInstructions:
          `${buildCustomAnnualUploadLinkInstructions({
            taxYearItems: sortedTaxYearItems,
            debtSchedule: instructionDebtSchedule,
            includeTaxReturnExtension,
          })} `
          + `If on extension for FY ${latestYear}, upload Form 7004 below; `
          + `your return is due by September 15, ${filingYear} (${extensionIso}).`,
      };
    }
  }

  return {
    submissionCadence: 'CUSTOM',
    reportingPeriodEndDate,
    fiscalYearEndMonth: 12,
    requiredDocumentKeys,
    periodLabel,
    lenderInstructions: lenderInstructions?.trim()
      || buildCustomAnnualUploadLinkInstructions({
        taxYearItems: sortedTaxYearItems,
        debtSchedule: instructionDebtSchedule,
        includeTaxReturnExtension,
      }),
  };
};

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
