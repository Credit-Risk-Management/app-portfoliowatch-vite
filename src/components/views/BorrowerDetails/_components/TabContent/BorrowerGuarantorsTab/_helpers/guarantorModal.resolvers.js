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

const loanIdsFromFormField = (loanIdsField) => {
  if (!loanIdsField || !Array.isArray(loanIdsField)) return [];
  return loanIdsField
    .map((x) => (x && typeof x === 'object' && x.value !== undefined ? x.value : x))
    .filter(Boolean);
};

export const submitBorrowerGuarantorModal = async () => {
  const borrower = $borrower.value?.borrower;
  const borrowerId = borrower?.id;
  const { editingGuarantorId, requireLoanSelection, initialLoanIds } = $borrowerGuarantorModal.value;
  const { name, email, phone, loanIds: loanIdsField } = $borrowerGuarantorModalForm.value;
  const selectedLoanIds = loanIdsFromFormField(loanIdsField);
  const needsLoanPick = requireLoanSelection;

  if (!editingGuarantorId && !borrowerId) {
    dangerAlert('Borrower not loaded.');
    return;
  }
  if (!name?.trim()) {
    dangerAlert('Guarantor name is required.');
    return;
  }
  if (needsLoanPick && selectedLoanIds.length === 0) {
    dangerAlert('Select at least one loan for this guarantor.');
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
      const prev = initialLoanIds || [];
      const toAdd = selectedLoanIds.filter((id) => !prev.includes(id));
      const toRemove = prev.filter((id) => !selectedLoanIds.includes(id));
      await Promise.all([
        ...toAdd.map((loanId) => guarantorsApi.linkToLoan(editingGuarantorId, loanId)),
        ...toRemove.map((loanId) => guarantorsApi.unlinkFromLoan(editingGuarantorId, loanId)),
      ]);
      successAlert('Guarantor updated.', 'toast');
    } else {
      const createResponse = await guarantorsApi.create({
        borrowerId,
        name: name.trim(),
        email: email?.trim() || null,
        phone: phone?.trim() || null,
      });
      const created = createResponse?.data || createResponse;
      const newId = created?.id;
      if (newId && selectedLoanIds.length > 0) {
        await Promise.all(
          selectedLoanIds.map((loanId) => guarantorsApi.linkToLoan(newId, loanId)),
        );
      }
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
