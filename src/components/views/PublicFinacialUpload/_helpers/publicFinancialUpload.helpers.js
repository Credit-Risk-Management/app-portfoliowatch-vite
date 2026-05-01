import {
  UPLOADER_BY_SECTION,
  KNOWN_SECTION_IDS,
  SECTION_DEF_BY_ID,
  DEFAULT_SECTION_IDS,
  API_KEY_TO_SECTION_ID,
  DEBT_SCHEDULE_XLSX_DATA_ROW_COUNT,
  DEBT_SCHEDULE_FORM_COLUMN_KEYS,
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

/**
 * API / DB often sends ISO dates (e.g. 2031-03-15). Worksheet mask + placeholder use MM/DD/YYYY.
 * @param {unknown} raw
 * @returns {string}
 */
export const normalizeIncomingDebtWorksheetMaturityDate = (raw) => {
  if (raw == null) return '';
  let s = String(raw).trim();
  if (!s) return '';
  if (s.includes('T')) {
    [s] = s.split('T');
    s = s.trim();
  }
  const iso = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
  if (iso) {
    const [, y, mo, d] = iso;
    return `${mo}/${d}/${y}`;
  }
  return String(raw).trim();
};

/**
 * Merge API `worksheetRows` into a fresh default form plus header fields.
 * @param {Record<string, string>} baseForm — from `createDefaultDebtScheduleWorksheetForm()`
 * @param {Array<Record<string, string>>} worksheetRows
 * @param {{ businessName: string, asOfDate: string }} header
 */
export const mergePriorWorksheetRowsIntoForm = (baseForm, worksheetRows, header) => {
  const next = { ...baseForm, ...header };
  const n = Math.min(worksheetRows.length, DEBT_SCHEDULE_XLSX_DATA_ROW_COUNT);
  for (let r = 0; r < n; r += 1) {
    const row = worksheetRows[r] || {};
    DEBT_SCHEDULE_FORM_COLUMN_KEYS.forEach((k) => {
      const v = row[k];
      if (v != null && String(v).trim() !== '') {
        const str = String(v);
        next[debtScheduleFormField(r, k)] = k === 'maturityDate'
          ? normalizeIncomingDebtWorksheetMaturityDate(str)
          : str;
      }
    });
  }
  return next;
};

/**
 * @param {Record<string, string>} form — `$debtScheduleWorksheetForm` value
 * @returns {{ valid: boolean, errors: { signatoryName?: string, signatoryTitle?: string, debtRows?: string } }}
 */
export const validateDebtScheduleWorksheetForPdf = (form) => {
  const errors = {};
  if (!String(form?.signatoryName ?? '').trim()) {
    errors.signatoryName = 'Printed name is required.';
  }
  if (!String(form?.signatoryTitle ?? '').trim()) {
    errors.signatoryTitle = 'Title is required.';
  }
  let hasCompleteRow = false;
  for (let r = 0; r < DEBT_SCHEDULE_XLSX_DATA_ROW_COUNT; r += 1) {
    const balRaw = String(form[debtScheduleFormField(r, 'currentBalance')] ?? '').trim();
    const payRaw = String(form[debtScheduleFormField(r, 'monthlyPayment')] ?? '').trim();
    // eslint-disable-next-line no-continue
    if (!balRaw || !payRaw) continue;
    const bal = parseDebtScheduleNumeric(balRaw);
    const pay = parseDebtScheduleNumeric(payRaw);
    if (Number.isFinite(bal) && Number.isFinite(pay)) {
      hasCompleteRow = true;
      break;
    }
  }
  if (!hasCompleteRow) {
    errors.debtRows = 'Enter a current balance and monthly payment for at least one debt row.';
  }
  return { valid: Object.keys(errors).length === 0, errors };
};

/**
 * Debt schedule row is satisfied by validated worksheet data (no PDF upload — server generates official PDF).
 * @param {Record<string, string>} debtWorksheetForm — `$debtScheduleWorksheetForm.value`
 */
export const isDebtScheduleSectionReadyForSubmit = (debtWorksheetForm) => (
  validateDebtScheduleWorksheetForPdf(debtWorksheetForm || {}).valid
);

/**
 * @param {string} sectionId
 * @param {Record<string, string>} debtWorksheetForm
 */
export const isSectionReadyForSubmit = (sectionId, debtWorksheetForm) => {
  if (sectionId === 'debtScheduleWorksheet') {
    return isDebtScheduleSectionReadyForSubmit(debtWorksheetForm);
  }
  return hasPdfStagedForSection(sectionId);
};
