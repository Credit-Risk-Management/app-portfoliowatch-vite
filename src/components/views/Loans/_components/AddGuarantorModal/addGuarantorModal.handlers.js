import { $loan } from '@src/consts/consts';
import { $user } from '@src/signals';
import guarantorsApi from '@src/api/guarantors.api';
import { successAlert, dangerAlert } from '@src/components/global/Alert/_helpers/alert.events';
import { fetchLoanDetail } from '@src/components/views/Loans/_helpers/loans.resolvers';
import { $addGuarantorView, $addGuarantorForm, $addGuarantorModalState } from './addGuarantorModal.signals';

/**
 * Opens the Add Guarantor modal for the current loan
 */
export const handleOpenModal = () => {
  const currentLoan = $loan.value?.loan;

  if (!currentLoan) {
    dangerAlert('No loan selected');
    return;
  }

  if (!currentLoan.borrowerId && !currentLoan.borrower?.id) {
    dangerAlert('Loan must have an associated borrower to add a guarantor');
    return;
  }

  $addGuarantorForm.reset();
  $addGuarantorModalState.update({ isSubmitting: false, error: null });

  $addGuarantorView.update({
    showModal: true,
    currentLoanId: currentLoan.id,
  });
};

/**
 * Closes the Add Guarantor modal
 */
export const handleClose = () => {
  $addGuarantorView.update({ showModal: false, currentLoanId: null });
  $addGuarantorForm.reset();
  $addGuarantorModalState.update({ isSubmitting: false, error: null });
};

/**
 * Handles form submission - creates guarantor and links to loan
 */
export const handleSubmit = async () => {
  try {
    $addGuarantorModalState.update({ isSubmitting: true, error: null });

    const { name, email, phone } = $addGuarantorForm.value;
    const { currentLoanId } = $addGuarantorView.value;
    const currentLoan = $loan.value?.loan;
    const organizationId = $user.value?.organizationId;

    if (!name?.trim()) {
      $addGuarantorModalState.update({
        error: 'Name is required',
        isSubmitting: false,
      });
      return;
    }

    if (!currentLoanId || !currentLoan) {
      $addGuarantorModalState.update({
        error: 'No loan selected',
        isSubmitting: false,
      });
      return;
    }

    const borrowerId = currentLoan.borrowerId || currentLoan.borrower?.id;
    if (!borrowerId) {
      $addGuarantorModalState.update({
        error: 'Loan must have an associated borrower',
        isSubmitting: false,
      });
      return;
    }

    if (!organizationId) {
      $addGuarantorModalState.update({
        error: 'Organization ID is required',
        isSubmitting: false,
      });
      return;
    }

    const guarantorData = {
      name: name.trim(),
      email: email?.trim() || null,
      phone: phone?.trim() || null,
      borrowerId,
      organizationId,
    };

    const createResponse = await guarantorsApi.create(guarantorData);
    const guarantor = createResponse?.data || createResponse;

    if (!guarantor?.id) {
      throw new Error(createResponse?.error || 'Failed to create guarantor');
    }

    await guarantorsApi.linkToLoan(guarantor.id, currentLoanId);

    successAlert('Guarantor added successfully');

    handleClose();

    await fetchLoanDetail(currentLoanId);
  } catch (error) {
    $addGuarantorModalState.update({
      error: error?.message || 'Failed to add guarantor',
      isSubmitting: false,
    });
  }
};
