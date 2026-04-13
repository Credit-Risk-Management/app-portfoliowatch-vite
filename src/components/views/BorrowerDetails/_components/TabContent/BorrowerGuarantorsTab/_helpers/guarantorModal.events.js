import { $borrower } from '@src/consts/consts';
import {
  $borrowerGuarantorModal,
  $borrowerGuarantorModalForm,
} from '../../../../_helpers/borrowerDetail.consts';
import {
  seedGuarantorModalLoanLabels,
  clearGuarantorModalLoanOptionCache,
} from './guarantorModal.loanPicker';

export const openAddBorrowerGuarantorModal = () => {
  const b = $borrower.value?.borrower;
  const options = b?.loans || [];
  const defaultLoanIds = options.length === 1 ? [options[0].id] : [];

  seedGuarantorModalLoanLabels(options);

  $borrowerGuarantorModalForm.update({
    name: '',
    email: '',
    phone: '',
    loanIds: defaultLoanIds,
  });
  $borrowerGuarantorModal.update({
    show: true,
    editingGuarantorId: null,
    loanPickerBorrowerId: b?.id || null,
    requireLoanSelection: options.length > 0,
    initialLoanIds: [],
  });
};

/**
 * @param {object} guarantor — includes `loans` (linked). Optional `borrowerLoans` (all borrower loans for picker).
 */
export const openEditBorrowerGuarantorModal = (guarantor) => {
  const linked = (guarantor.loans || []).filter(Boolean);
  const fromBorrower = $borrower.value?.borrower?.loans;
  let picker = linked;
  if (guarantor.borrowerLoans && guarantor.borrowerLoans.length > 0) {
    picker = guarantor.borrowerLoans;
  } else if (fromBorrower && fromBorrower.length > 0) {
    picker = fromBorrower;
  }

  seedGuarantorModalLoanLabels(picker);

  const borrowerIdForPicker = guarantor.borrowerId
    || $borrower.value?.borrower?.id
    || null;

  $borrowerGuarantorModalForm.update({
    name: guarantor.name || '',
    email: guarantor.email || '',
    phone: guarantor.phone || '',
    loanIds: linked.map((l) => l.id),
  });
  $borrowerGuarantorModal.update({
    show: true,
    editingGuarantorId: guarantor.id,
    loanPickerBorrowerId: borrowerIdForPicker,
    requireLoanSelection: picker.length > 0,
    initialLoanIds: linked.map((l) => l.id),
  });
};

export const closeBorrowerGuarantorModal = () => {
  clearGuarantorModalLoanOptionCache();
  $borrowerGuarantorModal.update({
    show: false,
    editingGuarantorId: null,
    isSubmitting: false,
    loanPickerBorrowerId: null,
    requireLoanSelection: false,
    initialLoanIds: [],
  });
  $borrowerGuarantorModalForm.update({
    name: '',
    email: '',
    phone: '',
    loanIds: [],
  });
};
