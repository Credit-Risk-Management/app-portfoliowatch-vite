import { Signal } from '@fyclabs/tools-fyc-react/signals';

export const $submitPFSModalView = Signal({
  activeModalKey: null,
  documentType: 'personalFinancialStatement',
  error: null,
  guarantorId: null,
  isEditMode: false,
  editingFinancialId: null,
  isLoading: false,
  isLoadingInputData: false,
  isSubmitting: false,
  ocrApplied: false,
  refreshKey: 0,
});

export const $submitPFSModalDetails = Signal({
  asOfDate: null,
  currentDocumentIndex: {
    personalFinancialStatement: 0,
    taxReturn: 0,
  },
  documentsByType: {
    personalFinancialStatement: [],
    taxReturn: [],
  },
  downloadSensibleUrl: false,
  pdfUrl: null,
  updatedGuarantors: [],
  // PFS form fields (totalAssets, totalLiabilities, netWorth, liquidity, notes)
  totalAssets: '',
  totalLiabilities: '',
  netWorth: '',
  liquidity: '',
  personalIncomeLine: '',
  adjustedGrossIncomeLine: '',
  annualDebtServiceForRatio: 0,
  netToIncomeRatio: 0,
  notes: '',
});

export const $financialDocsUploader = Signal({
  guarantorFinancialDocs: [],
});
