import { $loan } from '@src/consts/consts';
import loansApi from '@src/api/loans.api';
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
  const files = $creditMemoDocsUploader.value.creditMemoDocs || [];

  if (!files.length) return;

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
  });

  // Mock OCR: Auto-populate form with mock data based on filename
  setTimeout(() => {
    const mockData = generateMockCreditMemoData(file.name);
    console.log('Mock data:', mockData);

    if (mockData) {
      console.log('Uploaded file for OCR:', file.name);
      console.log('Mock extracted credit memo data:', mockData);

      $creditMemoForm.update(mockData);
      $creditMemoModalState.update({
        ocrApplied: true,
      });
    } else {
      console.log('No mock data found for filename:', file.name);
      $creditMemoModalState.update({
        ocrApplied: false,
      });
    }
  }, 500);

  // Clear the uploader
  $creditMemoDocsUploader.update({ creditMemoDocs: [] });
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

    // Validation
    if (!formData.asOfDate) {
      $creditMemoModalState.update({
        error: 'Please enter an as of date',
        isSubmitting: false,
      });
      return;
    }

    // Prepare update data - only update covenant actual values
    const updateData = {
      debtService: formData.debtService ? parseFloat(formData.debtService) : null,
      currentRatio: formData.currentRatio ? parseFloat(formData.currentRatio) : null,
      liquidity: formData.liquidity ? parseFloat(formData.liquidity) : null,
      liquidityRatio: formData.liquidityRatio ? parseFloat(formData.liquidityRatio) : null,
    };

    // Update the loan
    const response = await loansApi.update(loanId, updateData);

    if (response.success) {
      successAlert('Credit memo data applied successfully!', 'toast');

      // Refresh the loan data
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
        error: response.error || 'Failed to update loan with credit memo data',
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
