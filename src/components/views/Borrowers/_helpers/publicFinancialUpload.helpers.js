import {
  $publicIncomeStatementUploader,
  $publicBalanceSheetUploader,
  $publicCashFlowUploader,
  $publicOtherFinancialsUploader,
  $publicDebtScheduleUploader,
} from './publicFinancialUpload.consts';

const UPLOADER_BY_SECTION = {
  incomeStatement: $publicIncomeStatementUploader,
  balanceSheet: $publicBalanceSheetUploader,
  /** API `incomeStatementQuarterly` */
  incomeStatementQuarterly: $publicCashFlowUploader,
  /** API `businessTaxReturn` */
  businessTaxReturn: $publicOtherFinancialsUploader,
  /** API `debtSchedule` */
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

const DEFAULT_SECTION_IDS = ['balanceSheet', 'incomeStatement'];

const KNOWN_SECTION_IDS = new Set(Object.keys(SECTION_DEF_BY_ID));

/**
 * Resolve which PDF rows to show for this upload link.
 * Prefers `linkData.requiredDocumentKeys` (API). Falls back to `linkData.requiredPdfSections`, then balance sheet + YTD income.
 *
 * @param {object|null|undefined} linkData
 * @param {string[]} [linkData.requiredDocumentKeys]
 * @param {string[]} [linkData.requiredPdfSections]
 */
export const getRequiredPdfSectionsForLink = (linkData) => {
  const fromApi = linkData?.requiredDocumentKeys;
  if (Array.isArray(fromApi) && fromApi.length > 0) {
    const seen = new Set();
    const out = [];
    fromApi.forEach((apiKey) => {
      const sectionId = API_KEY_TO_SECTION_ID[apiKey];
      if (!sectionId || !KNOWN_SECTION_IDS.has(sectionId) || seen.has(sectionId)) return;
      seen.add(sectionId);
      out.push(SECTION_DEF_BY_ID[sectionId]);
    });
    if (out.length > 0) return out;
  }

  const requested = linkData?.requiredPdfSections;
  const ids = Array.isArray(requested) && requested.length > 0
    ? requested.filter((id) => KNOWN_SECTION_IDS.has(id))
    : DEFAULT_SECTION_IDS;

  if (ids.length === 0) {
    return DEFAULT_SECTION_IDS.map((id) => SECTION_DEF_BY_ID[id]);
  }

  return ids.map((id) => SECTION_DEF_BY_ID[id]).filter(Boolean);
};

/** Section ids in display/extraction order for the current link. */
export const getRequiredSectionIdsForLink = (linkData) => (
  getRequiredPdfSectionsForLink(linkData).map((d) => d.sectionId)
);

export const hasPdfStagedForSection = (sectionId) => {
  const uploader = UPLOADER_BY_SECTION[sectionId];
  return ((uploader?.value?.financialDocs || []).length > 0);
};

/** FileUploader `signal` prop for a section id. */
export const getPublicUploaderSignalForSection = (sectionId) => (
  UPLOADER_BY_SECTION[sectionId]
);
