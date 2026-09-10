import { Signal } from '@fyclabs/tools-fyc-react/signals';
import { defaultAnnualPublicLinkTaxYears } from '@src/constants/financialSubmissionRequirements';

const buildDefaultTaxYearFields = (years = defaultAnnualPublicLinkTaxYears()) => {
  const latestYear = years.length > 0 ? Math.max(...years) : null;
  return years.reduce((acc, year) => {
    acc[`taxYear_${year}`] = true;
    acc[`taxYearRequired_${year}`] = year === latestYear;
    return acc;
  }, {});
};

export const $createPublicUploadLinkForm = Signal({
  includeDebtSchedule: true,
  debtScheduleRequiredForSubmit: false,
  includeTaxReturnExtension: false,
  lenderInstructions: '',
  ...buildDefaultTaxYearFields(),
});

export const $createPublicUploadLinkState = Signal({
  isCreating: false,
  error: null,
  availableTaxYears: defaultAnnualPublicLinkTaxYears(),
});

export const resetCreatePublicUploadLinkForm = () => {
  const years = defaultAnnualPublicLinkTaxYears();
  $createPublicUploadLinkForm.update({
    includeDebtSchedule: true,
    debtScheduleRequiredForSubmit: false,
    includeTaxReturnExtension: false,
    lenderInstructions: '',
    ...buildDefaultTaxYearFields(years),
  });
  $createPublicUploadLinkState.update({
    isCreating: false,
    error: null,
    availableTaxYears: years,
  });
};

export const getSelectedTaxYearsFromForm = (formValue, availableTaxYears) => (
  availableTaxYears.filter((year) => formValue[`taxYear_${year}`])
);

export const buildDocumentItemsFromForm = (formValue, availableTaxYears) => {
  const taxYearItems = getSelectedTaxYearsFromForm(formValue, availableTaxYears).map((taxYear) => ({
    taxYear,
    requiredForSubmit: Boolean(formValue[`taxYearRequired_${taxYear}`]),
  }));

  const debtSchedule = formValue.includeDebtSchedule
    ? { included: true, requiredForSubmit: Boolean(formValue.debtScheduleRequiredForSubmit) }
    : null;

  return { taxYearItems, debtSchedule };
};

export const hasAtLeastOneDocumentSelected = (formValue, availableTaxYears) => {
  const { taxYearItems, debtSchedule } = buildDocumentItemsFromForm(formValue, availableTaxYears);
  return taxYearItems.length > 0 || Boolean(debtSchedule?.included);
};

export const hasAtLeastOneRequiredForSubmit = (formValue, availableTaxYears) => {
  const { taxYearItems, debtSchedule } = buildDocumentItemsFromForm(formValue, availableTaxYears);
  const hasRequiredTaxYear = taxYearItems.some((item) => item.requiredForSubmit);
  const hasRequiredDebt = Boolean(debtSchedule?.requiredForSubmit);
  return hasRequiredTaxYear || hasRequiredDebt;
};
