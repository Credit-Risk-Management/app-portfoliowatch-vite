import { $borrower } from '@src/consts/consts';
import borrowersApi from '@src/api/borrowers.api';
import { dangerAlert, successAlert, infoAlert } from '@src/components/global/Alert/_helpers/alert.events';
import { $borrowersForm } from '@src/signals';
import { fetchBorrowerDetail } from './borrowerDetail.resolvers';
import { $borrowerDetailView } from './borrowerDetail.consts';

export const handleGenerateIndustryReport = async (borrowerId) => {
  const borrower = $borrower.value?.borrower;

  if (!borrower?.id) {
    dangerAlert('Borrower information not available');
    return;
  }

  // Get first loan ID if available
  const firstLoan = borrower.loans?.[0];
  if (!firstLoan?.id) {
    dangerAlert('No loans found for this borrower');
    return;
  }

  try {
    infoAlert('Generating industry health report...');

    const response = await borrowersApi.generateIndustryReport(borrower.id, firstLoan.id);

    if (!response.success) {
      throw new Error(response.error || 'Failed to generate report');
    }

    successAlert('Industry health report generated successfully!');

    // Refresh the borrower detail to show updated data
    await fetchBorrowerDetail(borrowerId);
  } catch (error) {
    console.error('Error generating industry report:', error);
    dangerAlert(`Failed to generate industry report: ${error.message}`);
  }
};

export const handleEditBorrowerDetail = async () => {
  try {
    const formData = $borrowersForm.value;

    if (!formData.id) {
      dangerAlert('Borrower ID is required');
      return;
    }

    await borrowersApi.update(formData.id, formData);

    $borrowerDetailView.update({ showEditBorrowerModal: false });
    $borrowersForm.reset();

    // Refresh the borrower detail to show updated data
    const borrowerId = $borrower.value?.borrower?.id || $borrower.value?.borrower?.borrowerId;
    if (borrowerId) {
      await fetchBorrowerDetail(borrowerId);
    }
  } catch (error) {
    dangerAlert(error.message || 'Failed to edit borrower');
  }
};

export const handleDeleteBorrower = () => {
  // This will be implemented when the delete modal is ready
  console.log('Delete borrower - to be implemented');
};
