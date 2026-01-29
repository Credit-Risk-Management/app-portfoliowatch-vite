import { Signal } from '@fyclabs/tools-fyc-react/signals';

export const $borrowerDetailsManagementContainerView = Signal({
  activeKey: 'details',
  isLoading: false,
});

export const $borrowerDetailsManagementContainerDetails = Signal({
  borrower: null,
  isLoading: false,
});
