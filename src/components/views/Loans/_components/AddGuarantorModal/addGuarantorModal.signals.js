import { Signal } from '@fyclabs/tools-fyc-react/signals';

export const $addGuarantorView = Signal({
  showModal: false,
  currentLoanId: null,
});

export const $addGuarantorForm = Signal({
  name: '',
  email: '',
  phone: '',
});

export const $addGuarantorModalState = Signal({
  isSubmitting: false,
  error: null,
});
