import { Signal } from '@fyclabs/tools-fyc-react/signals';

export const $loanCollateralView = Signal({
  showSubmitModal: false,
  currentLoanId: null,
  isEditMode: false,
  editingCollateralId: null,
  refreshTrigger: 0,
});

export const $loanCollateralForm = Signal({
  asOfDate: '',
  collateralItems: [{ description: '', value: '' }], // Start with one empty item
  notes: '',
  hasDocument: false,
});

export const $collateralDocUploader = Signal({
  collateralDoc: null,
});

export const $collateralModalState = Signal({
  isSubmitting: false,
  error: null,
  documentPreviewUrl: null,
  uploadedDocument: null,
});
