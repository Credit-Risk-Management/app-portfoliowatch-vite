/* eslint-disable import/prefer-default-export */
import guarantorsApi from '@src/api/guarantors.api';
import { $borrower } from '@src/consts/consts';
import { dangerAlert, successAlert } from '@src/components/global/Alert/_helpers/alert.events';
import { fetchGuarantorDetail } from '@src/components/views/GuarantorDetails/_helpers/guarantorDetails.resolvers';
import { fetchBorrowerDetail } from '../../../../_helpers/borrowerDetail.resolvers';
import {
  $borrowerGuarantorModal,
  $borrowerGuarantorModalForm,
} from '../../../../_helpers/borrowerDetail.consts';
import * as guarantorModalEvents from './guarantorModal.events';

const formatApiError = (err) => {
  if (typeof err === 'string') return err;
  if (err?.error) return err.error;
  if (err?.message) return err.message;
  return 'Failed to save guarantor';
};

export const submitBorrowerGuarantorModal = async () => {
  const borrower = $borrower.value?.borrower;
  const borrowerId = borrower?.id;
  const { editingGuarantorId } = $borrowerGuarantorModal.value;
  const { name, email, phone } = $borrowerGuarantorModalForm.value;

  if (!editingGuarantorId && !borrowerId) {
    dangerAlert('Borrower not loaded.');
    return;
  }
  if (!name?.trim()) {
    dangerAlert('Guarantor name is required.');
    return;
  }

  $borrowerGuarantorModal.update({ isSubmitting: true });
  try {
    if (editingGuarantorId) {
      await guarantorsApi.update(editingGuarantorId, {
        name: name.trim(),
        email: email?.trim() || null,
        phone: phone?.trim() || null,
      });
      successAlert('Guarantor updated.', 'toast');
    } else {
      await guarantorsApi.create({
        borrowerId,
        name: name.trim(),
        email: email?.trim() || null,
        phone: phone?.trim() || null,
      });
      successAlert('Guarantor added.', 'toast');
    }
    guarantorModalEvents.closeBorrowerGuarantorModal();
    if (editingGuarantorId) {
      await fetchGuarantorDetail(editingGuarantorId);
    }
    if (borrowerId) {
      await fetchBorrowerDetail(borrowerId);
    }
  } catch (err) {
    dangerAlert(formatApiError(err));
  } finally {
    $borrowerGuarantorModal.update({ isSubmitting: false });
  }
};
