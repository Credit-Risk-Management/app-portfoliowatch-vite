import {
  PFS_HEADER_FIELDS,
  PFS_SCHEDULE_DEFINITIONS,
  PFS_WORKSHEET_ROW_COUNT,
  pfsWorksheetField,
} from './pfsWorksheetModal.consts';

export const parsePfsNumeric = (raw) => {
  const s = String(raw ?? '').replace(/[$,\s]/g, '').trim();
  if (!s) return NaN;
  const n = parseFloat(s);
  return Number.isFinite(n) ? n : NaN;
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
    for (let r = 0; r < PFS_WORKSHEET_ROW_COUNT; r += 1) {
      const any = sch.columns.some((col) => String(form[pfsWorksheetField(sch.id, r, col.key)] ?? '').trim());
      if (any) hasScheduleData = true;
    }
  });

  const hasSummary = ['summary_totalAssets', 'summary_totalLiabilities', 'summary_netWorth', 'summary_annualPayments']
    .some((k) => parsePfsNumeric(form?.[k]) > 0);

  if (!hasScheduleData && !hasSummary) {
    errors._form = 'Enter summary totals or at least one schedule row.';
  }

  return { valid: Object.keys(errors).length === 0, errors };
};

export const mergePriorPfsWorksheetIntoForm = (prior, linkData) => {
  const base = { ...(prior || {}) };
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
  return base;
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
