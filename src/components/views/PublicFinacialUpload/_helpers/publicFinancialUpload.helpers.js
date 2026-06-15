import {
  UPLOADER_BY_SECTION,
  KNOWN_SECTION_IDS,
  SECTION_DEF_BY_ID,
  DEFAULT_SECTION_IDS,
  API_KEY_TO_SECTION_ID,
  DEBT_SCHEDULE_XLSX_DATA_ROW_COUNT,
  DEBT_SCHEDULE_FORM_COLUMN_KEYS,
  debtScheduleFormField,
  $publicFinancialUploadView,
} from './publicFinancialUpload.consts';

/**
 * Sept 15 of the calendar year after the FY period end (UTC), matching API extension deadline.
 * @param {string|Date|null|undefined} reportingPeriodEndDate
 * @returns {Date|null}
 */
export const resolveBusinessTaxReturnExtensionDeadline = (reportingPeriodEndDate) => {
  if (!reportingPeriodEndDate) return null;
  const d = new Date(reportingPeriodEndDate);
  if (Number.isNaN(d.getTime())) return null;
  const filingYear = d.getUTCFullYear() + 1;
  return new Date(Date.UTC(filingYear, 8, 15));
};

/**
 * True when an EXTENDED business tax return no longer satisfies submit (after Sept 15).
 * @param {string|Date|null|undefined} reportingPeriodEndDate
 * @param {Date} [referenceDate]
 */
export const isPastBusinessTaxReturnExtensionDeadline = (
  reportingPeriodEndDate,
  referenceDate = new Date(),
) => {
  const deadline = resolveBusinessTaxReturnExtensionDeadline(reportingPeriodEndDate);
  if (!deadline) return false;
  const ref = new Date(Date.UTC(
    referenceDate.getUTCFullYear(),
    referenceDate.getUTCMonth(),
    referenceDate.getUTCDate(),
  ));
  const end = new Date(Date.UTC(
    deadline.getUTCFullYear(),
    deadline.getUTCMonth(),
    deadline.getUTCDate(),
  ));
  return ref.getTime() > end.getTime();
};

/**
 * Types that must be present on this submit.
 * @param {object|null|undefined} linkData
 * @returns {string[]}
 */
export const getBlockingDocumentKeysForLink = (linkData) => {
  const fromApi = linkData?.requiredForSubmitDocumentKeys;
  if (Array.isArray(fromApi)) return fromApi;
  const reqs = linkData?.documentRequirements;
  if (Array.isArray(reqs)) {
    return reqs
      .filter((r) => {
        if (!r?.requiredForSubmit) return false;
        if (r.status === 'PENDING') return true;
        if (
          r.type === 'businessTaxReturn'
          && r.status === 'EXTENDED'
          && isPastBusinessTaxReturnExtensionDeadline(linkData?.reportingPeriodEndDate)
        ) {
          return true;
        }
        return false;
      })
      .map((r) => r.type);
  }
  return Array.isArray(linkData?.requiredDocumentKeys) ? linkData.requiredDocumentKeys : [];
};

/**
 * Resolve which PDF rows to show for this upload link.
 * Prefers `linkData.documentRequirements`, then `requiredDocumentKeys`. Falls back to legacy fields.
 *
 * @param {object|null|undefined} linkData
 * @param {string[]} [linkData.requiredDocumentKeys]
 * @param {string[]} [linkData.requiredPdfSections]
 */
export const getRequiredPdfSectionsForLink = (linkData) => {
  const reqs = linkData?.documentRequirements;
  if (Array.isArray(reqs) && reqs.length > 0) {
    const seen = new Set();
    const out = [];
    reqs.forEach((r) => {
      if (!r?.visible || r?.status === 'WAIVED') return;
      const sectionId = API_KEY_TO_SECTION_ID[r.type];
      if (!sectionId || !KNOWN_SECTION_IDS.has(sectionId) || seen.has(sectionId)) return;
      seen.add(sectionId);
      const def = SECTION_DEF_BY_ID[sectionId];
      if (!def) return;
      out.push({
        ...def,
        apiDocumentKey: r.type,
        requiredForSubmit: Boolean(r.requiredForSubmit && r.status === 'PENDING'),
        requirementStatus: r.status,
      });
    });
    if (out.length > 0) return appendImpactQuestionnaireSectionIfNeeded(linkData, out);
  }

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
    if (out.length > 0) return appendImpactQuestionnaireSectionIfNeeded(linkData, out);
  }

  const requested = linkData?.requiredPdfSections;
  const ids = Array.isArray(requested) && requested.length > 0
    ? requested.filter((id) => KNOWN_SECTION_IDS.has(id))
    : DEFAULT_SECTION_IDS;

  if (ids.length === 0) {
    return appendImpactQuestionnaireSectionIfNeeded(
      linkData,
      DEFAULT_SECTION_IDS.map((id) => SECTION_DEF_BY_ID[id]),
    );
  }

  return appendImpactQuestionnaireSectionIfNeeded(
    linkData,
    ids.map((id) => SECTION_DEF_BY_ID[id]).filter(Boolean),
  );
};

/** Extract questionnaire token from full or relative `…/impact-questionnaire/:token` URL. */
export const parseImpactQuestionnaireTokenFromUrl = (url) => {
  if (!url || typeof url !== 'string') return null;
  const trimmed = url.trim();
  if (!trimmed) return null;
  try {
    const base = typeof window !== 'undefined' ? window.location.origin : 'http://localhost';
    const u = /^https?:\/\//i.test(trimmed)
      ? new URL(trimmed)
      : new URL(trimmed.startsWith('/') ? trimmed : `/${trimmed}`, base);
    const m = u.pathname.match(/\/impact-questionnaire\/([^/]+)\/?$/);
    return m ? decodeURIComponent(m[1]) : null;
  } catch {
    return null;
  }
};

const appendGuarantorContactSectionIfNeeded = (linkData, sections) => {
  const needing = linkData?.guarantorsNeedingContact;
  if (!Array.isArray(needing) || needing.length === 0) return sections;
  if (sections.some((s) => s.sectionId === 'guarantorContact')) return sections;
  const def = SECTION_DEF_BY_ID.guarantorContact;
  return def
    ? [...sections, {
      ...def,
      requiredForSubmit: true,
      requirementStatus: 'PENDING',
    }]
    : sections;
};

/**
 * When the financial upload link includes an impact questionnaire URL, that step is required
 * on the same page (no API `requiredDocumentKeys` entry).
 * @param {object|null|undefined} linkData
 * @param {Array<{ sectionId: string }>} sections
 */
const appendImpactQuestionnaireSectionIfNeeded = (linkData, sections) => {
  if (!linkData?.impactQuestionnaireUrl) {
    return appendGuarantorContactSectionIfNeeded(linkData, sections);
  }
  if (sections.some((s) => s.sectionId === 'impactQuestionnaire')) {
    return appendGuarantorContactSectionIfNeeded(linkData, sections);
  }
  const def = SECTION_DEF_BY_ID.impactQuestionnaire;
  const withQuestionnaire = def ? [...sections, def] : sections;
  return appendGuarantorContactSectionIfNeeded(linkData, withQuestionnaire);
};

/** Section ids in display/extraction order for the current link. */
export const getRequiredSectionIdsForLink = (linkData) => (
  getRequiredPdfSectionsForLink(linkData).map((d) => d.sectionId)
);

export const getRequirementPolicyLabel = (section) => {
  if (section?.requirementStatus === 'COMPLETED') return 'Received';
  if (section?.requirementStatus === 'WAIVED') return 'Not required';
  if (section?.requirementStatus === 'EXTENDED') return 'Extended';
  if (section?.requiredForSubmit) return 'Required to submit';
  return 'Requested when available';
};

/**
 * @param {object} linkData
 * @param {Array<{ sectionId: string, apiDocumentKey?: string }>} requiredPdfSections
 * @param {Record<string, string>} debtWorksheetForm
 */
export const canSubmitBorrowerLink = (linkData, requiredPdfSections, debtWorksheetForm) => {
  const blockingKeys = getBlockingDocumentKeysForLink(linkData);
  const extensionStaged = hasPdfStagedForSection('businessTaxReturnExtension');
  const blockingOk = blockingKeys.length === 0
    || blockingKeys.every((key) => {
      if (
        key === 'businessTaxReturn'
        && extensionStaged
        && !hasPdfStagedForSection('businessTaxReturn')
      ) {
        const taxReq = linkData?.documentRequirements?.find((r) => r.type === 'businessTaxReturn');
        if (taxReq?.status === 'PENDING') return true;
      }
      if (key === 'debtScheduleWorksheet') {
        return validateDebtScheduleWorksheetForPdf(debtWorksheetForm || {}).valid;
      }
      const section = requiredPdfSections.find(
        (s) => (s.apiDocumentKey ?? s.sectionId) === key || s.sectionId === key,
      );
      if (!section) return true;
      if (
        section.sectionId === 'businessTaxReturn'
        && section.requirementStatus === 'EXTENDED'
        && !isPastBusinessTaxReturnExtensionDeadline(linkData?.reportingPeriodEndDate)
      ) {
        return true;
      }
      return isSectionReadyForSubmit(section.sectionId, debtWorksheetForm);
    });
  const hasAnyStaged = requiredPdfSections.some((s) => (
    isSectionReadyForSubmit(s.sectionId, debtWorksheetForm)
  ));
  const guarantorContactOk = !Array.isArray(linkData?.guarantorsNeedingContact)
    || linkData.guarantorsNeedingContact.length === 0
    || Boolean($publicFinancialUploadView.value.guarantorContactComplete);
  return blockingOk && hasAnyStaged && guarantorContactOk;
};

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
  if (sectionId === 'impactQuestionnaire') {
    return Boolean($publicFinancialUploadView.value.impactQuestionnairePublicComplete);
  }
  if (sectionId === 'guarantorContact') {
    return Boolean($publicFinancialUploadView.value.guarantorContactComplete);
  }
  return hasPdfStagedForSection(sectionId);
};
