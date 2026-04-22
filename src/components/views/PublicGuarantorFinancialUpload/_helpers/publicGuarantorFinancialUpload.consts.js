import { Signal } from '@fyclabs/tools-fyc-react/signals';

/** Fallback if API omits attestationText */
export const DEFAULT_GUARANTOR_PUBLIC_ATTESTATION_TEXT =
  'Acting in my capacity as an authorized officer of the Borrower, I hereby certify and attest that the information, schedules, and calculations set forth in these financial statements are true, complete, and accurate in all material respects as of the date indicated. This submission is made with the full understanding that the Lender will rely upon the veracity of this data for the purpose of determining credit risk.';

const resolvePfsTemplatePdfUrl = () => {
  const envUrl = import.meta.env.VITE_PFS_TEMPLATE_URL;
  if (typeof envUrl === 'string' && envUrl.trim()) {
    return envUrl.trim();
  }
  return '/pfs-template.pdf';
};

export const PFS_TEMPLATE_PDF_URL = resolvePfsTemplatePdfUrl();

export const $publicGuarantorUploadView = Signal({
  linkData: null,
  token: null,
  isLoading: true,
  isSubmitting: false,
  activeModalKey: null,
  error: null,
  success: false,
  priorDebtOpening: false,
});

export const $gPubPersonalTax = Signal({ financialDocs: [] });
export const $gPubPfs = Signal({ financialDocs: [] });
export const $gPubBusinessTax = Signal({ financialDocs: [] });
export const $gPubDebtSchedule = Signal({ financialDocs: [] });

export const UPLOADER_BY_DOC_KEY = {
  personalTaxReturn: $gPubPersonalTax,
  personalFinancialStatement: $gPubPfs,
  businessTaxReturn: $gPubBusinessTax,
  debtScheduleWorksheet: $gPubDebtSchedule,
};

/** UI metadata keyed by API documentType */
export const GUARANTOR_DOC_SECTION = {
  personalTaxReturn: {
    sectionId: 'personalTaxReturn',
    title: 'Personal tax return',
    helperText: 'Upload your personal tax return as a PDF.',
    inputId: 'public-guarantor-personal-tax',
  },
  personalFinancialStatement: {
    sectionId: 'personalFinancialStatement',
    title: 'Personal financial statement (PFS)',
    helperText: 'Upload your completed PFS as a PDF.',
    inputId: 'public-guarantor-pfs',
  },

};
