import { Signal } from '@fyclabs/tools-fyc-react/signals';

/** `UniversalModal` state for deleting a guarantor (detail page or borrower Guarantors tab). */
export const $deleteGuarantorConfirmModal = Signal({
  show: false,
  /** @type {'guarantorDetail' | 'borrowerTab'} */
  context: 'borrowerTab',
  guarantorId: null,
  borrowerId: null,
  name: '',
});

/** Navigate after delete from `/guarantors/:id` (not used from borrower tab). */
export const deleteGuarantorDetailNavigateRef = { current: null };
