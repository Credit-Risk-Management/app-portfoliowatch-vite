import { Signal } from '@fyclabs/tools-fyc-react/signals';

// Signal for accept invitation form data
export const $guarantorDetailView = Signal({
  guarantorId: null,
  activeKey: 'detail',
  guarantor: null,
  isLoading: false,
  error: null,
});

export const $guarantorDetailsData = Signal({
  name: null,
  email: null,
  phone: null,
  financials: [],
  loans: [],
});
