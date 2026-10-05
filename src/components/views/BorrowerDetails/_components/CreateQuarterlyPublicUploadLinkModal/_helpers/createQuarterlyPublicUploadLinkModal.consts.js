import { Signal } from '@fyclabs/tools-fyc-react/signals';
import {
  REQUIRED_DOCUMENT_KEYS,
  defaultQuarterlyPublicLinkPeriod,
  defaultQuarterlyPublicLinkYears,
} from '@src/constants/financialSubmissionRequirements';

export const QUARTERLY_DOC_CONFIG = [
  {
    includeKey: 'includeBalanceSheet',
    requiredKey: 'balanceSheetRequiredForSubmit',
    type: REQUIRED_DOCUMENT_KEYS.BALANCE_SHEET,
    label: 'Balance sheet',
  },
  {
    includeKey: 'includeIncomeStatementYtd',
    requiredKey: 'incomeStatementYtdRequiredForSubmit',
    type: REQUIRED_DOCUMENT_KEYS.INCOME_STATEMENT_YTD,
    label: 'Year-to-date income statement',
    exclusiveIncomeKey: 'includeIncomeStatementQuarterly',
  },
  {
    includeKey: 'includeIncomeStatementQuarterly',
    requiredKey: 'incomeStatementQuarterlyRequiredForSubmit',
    type: REQUIRED_DOCUMENT_KEYS.INCOME_STATEMENT_QUARTERLY,
    label: 'Quarterly income statement (P&L)',
    exclusiveIncomeKey: 'includeIncomeStatementYtd',
  },
  {
    includeKey: 'includeDebtSchedule',
    requiredKey: 'debtScheduleRequiredForSubmit',
    type: REQUIRED_DOCUMENT_KEYS.DEBT_SCHEDULE,
    label: 'Debt schedule',
  },
];

export const QUARTER_SELECT_OPTIONS = [
  { value: 1, label: 'Q1 (Jan–Mar)' },
  { value: 2, label: 'Q2 (Apr–Jun)' },
  { value: 3, label: 'Q3 (Jul–Sep)' },
  { value: 4, label: 'Q4 (Oct–Dec)' },
];

const buildYearSelectOptions = (years) => years.map((year) => ({
  value: year,
  label: String(year),
}));

const buildDefaultForm = (years) => {
  const { year, quarter } = defaultQuarterlyPublicLinkPeriod();
  const yearOption = buildYearSelectOptions(years).find((o) => o.value === year)
    ?? buildYearSelectOptions(years)[years.length - 1];
  const quarterOption = QUARTER_SELECT_OPTIONS.find((o) => o.value === quarter)
    ?? QUARTER_SELECT_OPTIONS[0];

  return {
    reportingYear: yearOption,
    reportingQuarter: quarterOption,
    includeBalanceSheet: true,
    balanceSheetRequiredForSubmit: true,
    includeIncomeStatementYtd: true,
    incomeStatementYtdRequiredForSubmit: true,
    includeIncomeStatementQuarterly: false,
    incomeStatementQuarterlyRequiredForSubmit: false,
    includeDebtSchedule: false,
    debtScheduleRequiredForSubmit: false,
    lenderInstructions: '',
  };
};

export const $createQuarterlyPublicUploadLinkForm = Signal(buildDefaultForm(defaultQuarterlyPublicLinkYears()));

export const $createQuarterlyPublicUploadLinkState = Signal({
  isCreating: false,
  error: null,
  availableYears: defaultQuarterlyPublicLinkYears(),
});

export const resetCreateQuarterlyPublicUploadLinkForm = () => {
  const years = defaultQuarterlyPublicLinkYears();
  $createQuarterlyPublicUploadLinkForm.update(buildDefaultForm(years));
  $createQuarterlyPublicUploadLinkState.update({
    isCreating: false,
    error: null,
    availableYears: years,
  });
};

export const getReportingYearFromForm = (formValue) => {
  const raw = formValue?.reportingYear;
  if (raw == null) return null;
  if (typeof raw === 'object' && raw.value != null) return Number(raw.value);
  return Number(raw);
};

export const getReportingQuarterFromForm = (formValue) => {
  const raw = formValue?.reportingQuarter;
  if (raw == null) return null;
  if (typeof raw === 'object' && raw.value != null) return Number(raw.value);
  return Number(raw);
};

export const buildDocumentItemsFromQuarterlyForm = (formValue) => (
  QUARTERLY_DOC_CONFIG
    .filter((doc) => Boolean(formValue[doc.includeKey]))
    .map((doc) => ({
      type: doc.type,
      requiredForSubmit: Boolean(formValue[doc.requiredKey]),
    }))
);

export const hasAtLeastOneQuarterlyDocumentSelected = (formValue) => (
  QUARTERLY_DOC_CONFIG.some((doc) => Boolean(formValue[doc.includeKey]))
);

export const hasAtLeastOneQuarterlyRequiredForSubmit = (formValue) => (
  QUARTERLY_DOC_CONFIG.some(
    (doc) => Boolean(formValue[doc.includeKey]) && Boolean(formValue[doc.requiredKey]),
  )
);

export const hasExclusiveIncomeConflict = (formValue) => (
  Boolean(formValue.includeIncomeStatementYtd)
  && Boolean(formValue.includeIncomeStatementQuarterly)
);

export const buildYearSelectOptionsForState = (years) => buildYearSelectOptions(years);
