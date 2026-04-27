import {
  UPLOADER_BY_SECTION,
  KNOWN_SECTION_IDS,
  SECTION_DEF_BY_ID,
  DEFAULT_SECTION_IDS,
  API_KEY_TO_SECTION_ID,
  DEBT_SCHEDULE_XLSX_DATA_ROW_COUNT,
  debtScheduleFormField,
} from './publicFinancialUpload.consts';

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

/** @param {string|undefined} raw */
export const parseDebtScheduleNumeric = (raw) => {
  if (raw == null || typeof raw !== 'string') return 0;
  const t = raw.trim();
  if (!t) return 0;
  const n = parseFloat(t.replace(/[$,\s]/g, ''));
  return Number.isFinite(n) ? n : 0;
};

/** @param {number} n */
export const formatDebtScheduleCurrency = (n) => {
  if (!Number.isFinite(n) || n === 0) return '';
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);
};

/**
 * Sums R6–R11 "Current Balance" and "Monthly Payment" like the XLSX TOTALS row (cols E and H).
 * @param {Record<string, string>} form — `$debtScheduleWorksheetForm` value
 */
export const computeDebtWorksheetTotals = (form) => {
  let totalBalance = 0;
  let totalMonthly = 0;
  for (let r = 0; r < DEBT_SCHEDULE_XLSX_DATA_ROW_COUNT; r += 1) {
    totalBalance += parseDebtScheduleNumeric(
      form[debtScheduleFormField(r, 'currentBalance')],
    );
    totalMonthly += parseDebtScheduleNumeric(
      form[debtScheduleFormField(r, 'monthlyPayment')],
    );
  }
  return { totalBalance, totalMonthly };
};
