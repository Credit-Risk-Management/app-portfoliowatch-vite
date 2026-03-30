import {
  $publicIncomeStatementUploader,
  $publicBalanceSheetUploader,
  $publicCashFlowUploader,
  $publicOtherFinancialsUploader,
} from './publicFinancialUpload.consts';

const UPLOADER_BY_SECTION = {
  incomeStatement: $publicIncomeStatementUploader,
  balanceSheet: $publicBalanceSheetUploader,
  cashFlow: $publicCashFlowUploader,
  otherFinancials: $publicOtherFinancialsUploader,
};

/**
 * UI + ids for each public PDF slot (display order).
 * Add rows here when new document types are supported.
 */
export const PUBLIC_PDF_SECTION_DEFINITIONS = [
  {
    sectionId: 'incomeStatement',
    title: 'Income statement (P&L)',
    helperText: 'Upload your profit and loss statement as a PDF.',
    inputId: 'public-financial-income-statement',
  },
  {
    sectionId: 'balanceSheet',
    title: 'Balance sheet',
    helperText: 'Upload your balance sheet as a PDF.',
    inputId: 'public-financial-balance-sheet',
  },
];

const DEFAULT_SECTION_IDS = ['incomeStatement', 'balanceSheet'];

const KNOWN_SECTION_IDS = new Set(
  PUBLIC_PDF_SECTION_DEFINITIONS.map((d) => d.sectionId),
);

/**
 * Resolve which PDF rows to show for this upload link.
 * When `linkData.requiredPdfSections` is a non-empty array, only known ids are shown (subset/order follows definitions).
 * Otherwise defaults to income statement + balance sheet.
 *
 * @param {object|null|undefined} linkData
 * @param {string[]} [linkData.requiredPdfSections]
 */
export const getRequiredPdfSectionsForLink = (linkData) => {
  const requested = linkData?.requiredPdfSections;
  const ids = Array.isArray(requested) && requested.length > 0
    ? requested.filter((id) => KNOWN_SECTION_IDS.has(id))
    : DEFAULT_SECTION_IDS;

  if (ids.length === 0) {
    return PUBLIC_PDF_SECTION_DEFINITIONS.filter((d) => DEFAULT_SECTION_IDS.includes(d.sectionId));
  }

  return PUBLIC_PDF_SECTION_DEFINITIONS.filter((d) => ids.includes(d.sectionId));
};

/** Section ids in display/extraction order for the current link. */
export const getRequiredSectionIdsForLink = (linkData) => getRequiredPdfSectionsForLink(linkData).map((d) => d.sectionId);

export const hasPdfStagedForSection = (sectionId) => {
  const uploader = UPLOADER_BY_SECTION[sectionId];
  return ((uploader?.value?.financialDocs || []).length > 0);
};

/** FileUploader `signal` prop for a section id. */
export const getPublicUploaderSignalForSection = (sectionId) => UPLOADER_BY_SECTION[sectionId];
