import { $loan } from '@src/consts/consts';
import { $user, $organization } from '@src/signals';
import loansApi from '@src/api/loans.api';
import borrowerFinancialsApi from '@src/api/borrowerFinancials.api';
import { successAlert, dangerAlert } from '@src/components/global/Alert/_helpers/alert.events';
import { $creditMemoView, $creditMemoForm, $creditMemoDocsUploader, $creditMemoModalState } from './addCreditMemoModal.signals';
import generateMockCreditMemoData from '../_helpers/creditMemo.helpers';

/**
 * Opens the credit memo modal for the current loan
 */
export const handleOpenModal = () => {
  const currentLoan = $loan.value?.loan;

  if (!currentLoan) {
    dangerAlert('No loan selected');
    return;
  }

  // Reset form and modal state
  $creditMemoForm.reset();
  $creditMemoModalState.update({
    ocrApplied: false,
    isSubmitting: false,
    error: null,
    pdfUrl: null,
    uploadedDocument: null,
  });
  $creditMemoDocsUploader.update({ creditMemoDocs: [] });

  // Open modal
  $creditMemoView.update({
    showModal: true,
    currentLoanId: currentLoan.id,
  });
};

/**
 * Closes the modal and cleans up state
 */
export const handleClose = () => {
  // Revoke object URL if it exists
  if ($creditMemoModalState.value.pdfUrl) {
    URL.revokeObjectURL($creditMemoModalState.value.pdfUrl);
  }

  // Reset all state
  $creditMemoView.update({
    showModal: false,
    currentLoanId: null,
  });
  $creditMemoForm.reset();
  $creditMemoModalState.update({
    ocrApplied: false,
    isSubmitting: false,
    error: null,
    pdfUrl: null,
    uploadedDocument: null,
  });
  $creditMemoDocsUploader.update({ creditMemoDocs: [] });
};

/**
 * Handles file upload and OCR processing (mock)
 */
export const handleFileUpload = () => {
  // Use setTimeout to ensure signal has been updated
  setTimeout(() => {
    const files = $creditMemoDocsUploader.value.creditMemoDocs || [];

    if (!files.length) {
      return;
    }

    const [file] = files;

    // Create a document object with preview URL
    const newDoc = {
      id: `temp-${Date.now()}`,
      file,
      fileName: file.name,
      fileSize: file.size,
      mimeType: file.type,
      previewUrl: URL.createObjectURL(file),
      uploadedAt: new Date(),
    };

    // Update modal state with the PDF URL
    const previousPdfUrl = $creditMemoModalState.value.pdfUrl;
    if (previousPdfUrl) {
      URL.revokeObjectURL(previousPdfUrl);
    }

    $creditMemoModalState.update({
      pdfUrl: newDoc.previewUrl,
      uploadedDocument: newDoc,
      refreshKey: ($creditMemoModalState.value.refreshKey || 0) + 1,
    });

    // Mock OCR: Auto-populate form with mock data based on filename
    setTimeout(() => {
      const mockData = generateMockCreditMemoData(file.name);

      if (mockData) {
        $creditMemoForm.update(mockData);
        $creditMemoModalState.update({
          ocrApplied: true,
        });
      } else {
        $creditMemoModalState.update({
          ocrApplied: false,
        });
      }
    }, 500);

    // Clear the uploader
    $creditMemoDocsUploader.update({ creditMemoDocs: [] });
  }, 0);
};

/**
 * Removes the uploaded document
 */
export const handleRemoveDocument = () => {
  if ($creditMemoModalState.value.pdfUrl) {
    URL.revokeObjectURL($creditMemoModalState.value.pdfUrl);
  }

  $creditMemoModalState.update({
    pdfUrl: null,
    uploadedDocument: null,
    ocrApplied: false,
  });

  // Clear form if OCR was applied
  if ($creditMemoModalState.value.ocrApplied) {
    $creditMemoForm.reset();
  }
};

/**
 * Downloads the uploaded document
 */
export const handleDownloadDocument = () => {
  const { uploadedDocument } = $creditMemoModalState.value;

  if (!uploadedDocument) return;

  const link = document.createElement('a');
  link.href = uploadedDocument.previewUrl;
  link.download = uploadedDocument.fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Handles form submission
 */
export const handleSubmit = async () => {
  try {
    $creditMemoModalState.update({
      isSubmitting: true,
      error: null,
    });

    const formData = $creditMemoForm.value;
    const loanId = $creditMemoView.value.currentLoanId;
    const currentLoan = $loan.value?.loan;
    const currentUser = $user.value;
    const currentOrg = $organization.value;

    // Validation
    if (!formData.asOfDate) {
      $creditMemoModalState.update({
        error: 'Please enter an as of date',
        isSubmitting: false,
      });
      return;
    }

    if (!currentLoan?.borrowerId) {
      $creditMemoModalState.update({
        error: 'Loan borrower information not available',
        isSubmitting: false,
      });
      return;
    }

    // Prepare borrower financial data
    // Financial metrics (debtService, currentRatio, liquidity, liquidityRatio) belong to BorrowerFinancial, not Loan
    const financialData = {
      borrowerId: currentLoan.borrowerId,
      organizationId: currentOrg?.id || currentUser?.organizationId,
      asOfDate: formData.asOfDate,
      debtService: formData.debtService ? parseFloat(formData.debtService) : null,
      currentRatio: formData.currentRatio ? parseFloat(formData.currentRatio) : null,
      liquidity: formData.liquidity ? parseFloat(formData.liquidity) : null,
      liquidityRatio: formData.liquidityRatio ? parseFloat(formData.liquidityRatio) : null,
      submittedBy: currentUser?.name || currentUser?.email || 'Unknown User',
      notes: formData.notes || 'Credit Memo Submission',
    };

    // Create a new borrower financial record
    const response = await borrowerFinancialsApi.create(financialData);

    if (response.success) {
      successAlert('Credit memo data applied successfully!', 'toast');

      // Refresh the loan data to get updated financials and watch score
      if ($loan.value?.loan) {
        const refreshResponse = await loansApi.getById(loanId);
        if (refreshResponse.success) {
          $loan.update({
            loan: refreshResponse.data,
            isLoading: false,
          });
        }
      }

      // Close the modal
      handleClose();
    } else {
      $creditMemoModalState.update({
        error: response.error || 'Failed to submit credit memo data',
        isSubmitting: false,
      });
    }
  } catch (err) {
    console.error('Error submitting credit memo:', err);
    $creditMemoModalState.update({
      error: err.message || 'An error occurred while submitting credit memo data',
      isSubmitting: false,
    });
  }
};
