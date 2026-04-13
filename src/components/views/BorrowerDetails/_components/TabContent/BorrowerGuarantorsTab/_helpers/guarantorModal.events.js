import {
  $borrowerGuarantorModal,
  $borrowerGuarantorModalForm,
} from '../../../../_helpers/borrowerDetail.consts';

export const openAddBorrowerGuarantorModal = () => {
  $borrowerGuarantorModalForm.update({ name: '', email: '', phone: '' });
  $borrowerGuarantorModal.update({ show: true, editingGuarantorId: null });
};

export const openEditBorrowerGuarantorModal = (guarantor) => {
  $borrowerGuarantorModalForm.update({
    name: guarantor.name || '',
    email: guarantor.email || '',
    phone: guarantor.phone || '',
  });
  $borrowerGuarantorModal.update({ show: true, editingGuarantorId: guarantor.id });
};

export const closeBorrowerGuarantorModal = () => {
  $borrowerGuarantorModal.update({ show: false, editingGuarantorId: null, isSubmitting: false });
  $borrowerGuarantorModalForm.update({ name: '', email: '', phone: '' });
};
