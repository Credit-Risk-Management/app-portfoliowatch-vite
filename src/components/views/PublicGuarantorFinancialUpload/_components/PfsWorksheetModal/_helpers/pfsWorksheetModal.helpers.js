import { formatDebtWorksheetCurrencyTyping } from '@src/components/views/PublicFinacialUpload/_components/DebtScheduleWorksheetModal/_helpers/debtScheduleWorksheetModal.helpers';
import {
  PFS_HEADER_FIELDS,
  PFS_SCHEDULE_DEFINITIONS,
  PFS_SUMMARY_FIELDS,
  PFS_WORKSHEET_MAX_ROW_COUNT,
  PFS_WORKSHEET_ROW_COUNT,
  createDefaultPfsScheduleRowCounts,
  createDefaultPfsWorksheetForm,
  pfsWorksheetField,
} from './pfsWorksheetModal.consts';

/** Percentage columns — not comma-formatted currency. */
export const PFS_RATE_COLUMN_KEYS = new Set(['rate', 'interestRate']);

export const pfsWorksheetColumnIsCurrency = (col) => (
  col.inputMode === 'decimal' && !PFS_RATE_COLUMN_KEYS.has(col.key)
);

/** Live typing: commas, optional cents (max 2), no $. */
export const formatPfsWorksheetCurrencyTyping = formatDebtWorksheetCurrencyTyping;

/** Blur / hydrate: always show two decimal places with grouping, no $. */
export const formatPfsWorksheetCurrencyDisplay = (raw) => {
  const s = String(raw ?? '').replace(/[$,\s]/g, '').trim();
  if (!s) return '';
  const n = parseFloat(s);
  if (!Number.isFinite(n)) return '';
  return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

export const formatPfsWorksheetCurrencyFields = (form) => {
  const next = { ...(form || {}) };
  PFS_SCHEDULE_DEFINITIONS.forEach((sch) => {
    const maxIdx = getPfsWorksheetMaxRowIndexInPayload(next, sch.id);
    for (let r = 0; r <= maxIdx; r += 1) {
      sch.columns.forEach((col) => {
        if (!pfsWorksheetColumnIsCurrency(col)) return;
        const key = pfsWorksheetField(sch.id, r, col.key);
        const raw = next[key];
        if (String(raw ?? '').trim()) {
          next[key] = formatPfsWorksheetCurrencyDisplay(raw);
        }
      });
    }
  });
  PFS_SUMMARY_FIELDS.forEach(({ key }) => {
    const raw = next[key];
    if (String(raw ?? '').trim()) {
      next[key] = formatPfsWorksheetCurrencyDisplay(raw);
    }
  });
  return next;
};

/** Highest row index present in flat worksheet keys for a schedule, or -1. */
export const getPfsWorksheetMaxRowIndexInPayload = (payload, scheduleId) => {
  const prefix = `sch${scheduleId}_r`;
  let maxIdx = -1;
  Object.keys(payload || {}).forEach((key) => {
    if (!key.startsWith(prefix)) return;
    const m = key.slice(prefix.length).match(/^(\d+)_/);
    if (m) maxIdx = Math.max(maxIdx, Number(m[1]));
  });
  return maxIdx;
};

/** Visible row count for a schedule table (at least default, capped at max). */
export const inferPfsScheduleRowCountsFromForm = (form) => {
  const counts = createDefaultPfsScheduleRowCounts();
  PFS_SCHEDULE_DEFINITIONS.forEach((sch) => {
    const maxIdx = getPfsWorksheetMaxRowIndexInPayload(form, sch.id);
    counts[sch.id] = Math.min(
      PFS_WORKSHEET_MAX_ROW_COUNT,
      Math.max(PFS_WORKSHEET_ROW_COUNT, maxIdx + 1),
    );
  });
  return counts;
};

export const getPfsScheduleDisplayRowCount = (scheduleId, rowCounts) => (
  Math.min(
    PFS_WORKSHEET_MAX_ROW_COUNT,
    Math.max(PFS_WORKSHEET_ROW_COUNT, rowCounts?.[scheduleId] ?? PFS_WORKSHEET_ROW_COUNT),
  )
);

export const parsePfsNumeric = (raw) => {
  const s = String(raw ?? '').replace(/[$,\s]/g, '').trim();
  if (!s) return NaN;
  const n = parseFloat(s);
  return Number.isFinite(n) ? n : NaN;
};

/** Prefer extracted PDF summary when schedules do not fully reconcile (missing rows, etc.). */
export const resolvePfsSummaryTotal = (extractedRaw, computed) => {
  const extracted = parsePfsNumeric(extractedRaw);
  if (!Number.isFinite(extracted) || extracted <= 0) return computed;
  if (!Number.isFinite(computed) || computed <= 0) return extracted;
  if (Math.abs(extracted - computed) >= 1) return extracted;
  return computed;
};

export const validatePfsWorksheetForSubmit = (form) => {
  const errors = {};
  PFS_HEADER_FIELDS.forEach(({ key, label, required }) => {
    if (required && !String(form?.[key] ?? '').trim()) {
      errors[key] = `${label} is required.`;
    }
  });

  let hasScheduleData = false;
  PFS_SCHEDULE_DEFINITIONS.forEach((sch) => {
    const maxIdx = getPfsWorksheetMaxRowIndexInPayload(form, sch.id);
    for (let r = 0; r <= maxIdx; r += 1) {
      const any = sch.columns.some((col) => String(form[pfsWorksheetField(sch.id, r, col.key)] ?? '').trim());
      if (any) {
        hasScheduleData = true;
      }
    }
  });

  const hasSummary = ['summary_totalAssets', 'summary_totalLiabilities', 'summary_netWorth', 'summary_annualPayments']
    .some((k) => parsePfsNumeric(form?.[k]) > 0);

  if (!hasScheduleData && !hasSummary) {
    errors._form = 'Enter summary totals or at least one schedule row.';
  }

  return { valid: Object.keys(errors).length === 0, errors };
};

export const mergePriorPfsWorksheetIntoForm = (prior, linkData, existingForm) => {
  const base = { ...createDefaultPfsWorksheetForm() };
  Object.entries(prior || {}).forEach(([key, val]) => {
    if (val != null && String(val).trim() !== '') {
      base[key] = val;
    }
  });
  Object.entries(existingForm || {}).forEach(([key, val]) => {
    if (String(val ?? '').trim() !== '') {
      base[key] = val;
    }
  });
  if (linkData?.guarantor?.name && !String(base.name ?? '').trim()) {
    base.name = linkData.guarantor.name;
  }
  if (linkData?.guarantor?.email && !String(base.email ?? '').trim()) {
    base.email = linkData.guarantor.email;
  }
  if (linkData?.reportingPeriodEndDate && !String(base.asOfDate ?? '').trim()) {
    const d = new Date(linkData.reportingPeriodEndDate);
    if (!Number.isNaN(d.getTime())) {
      base.asOfDate = d.toISOString().slice(0, 10);
    }
  }
  return formatPfsWorksheetCurrencyFields(base);
};

/** True when prior payload has values the current form is still missing. */
export const pfsWorksheetFormMissingPriorData = (form, prior) => {
  if (!prior || typeof prior !== 'object') return false;
  const f = form || {};
  return Object.entries(prior).some(([key, val]) => {
    if (!String(val ?? '').trim()) return false;
    return !String(f[key] ?? '').trim();
  });
};

export const schedulesForStep = (stepId) => {
  if (stepId === 'assets') {
    return PFS_SCHEDULE_DEFINITIONS.filter((s) => ['A', 'B', 'C', 'D'].includes(s.id));
  }
  if (stepId === 'liabilities') {
    return PFS_SCHEDULE_DEFINITIONS.filter((s) => ['G', 'H', 'I'].includes(s.id));
  }
  return [];
};
