import { $loan } from '@src/consts/consts';
import { $user, $organization } from '@src/signals';
import loansApi from '@src/api/loans.api';
import borrowerFinancialsApi from '@src/api/borrowerFinancials.api';
import documentsApi from '@src/api/documents.api';
import { successAlert, dangerAlert } from '@src/components/global/Alert/_helpers/alert.events';
import { $creditMemoView, $creditMemoForm, $creditMemoDocsUploader, $creditMemoModalState } from './addCreditMemoModal.signals';
import generateMockCreditMemoData from '../_helpers/creditMemo.helpers';
import { storage } from '@src/utils/firebase';
import { fetchLoanDetail } from '../_helpers/loans.resolvers';

/**
 * Opens the credit memo modal for the current loan
 */
export const handleOpenModal = async () => {
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

  // Fetch the most recent credit memo document and financial data for this loan
  try {
    const [documentsResponse, financialResponse] = await Promise.all([
      documentsApi.getAll({
        loanId: currentLoan.id,
        documentType: 'Financial Statement',
      }),
      currentLoan.borrowerId ? borrowerFinancialsApi.getLatestByBorrowerId(currentLoan.borrowerId) : null,
    ]);

    // Load financial values into form if available
    if (financialResponse?.success && financialResponse.data) {
      const financial = financialResponse.data;
      $creditMemoForm.update({
        asOfDate: financial.asOfDate ? new Date(financial.asOfDate).toISOString().split('T')[0] : '',
        debtService: financial.debtService != null ? String(financial.debtService) : '',
        currentRatio: financial.currentRatio != null ? String(financial.currentRatio) : '',
        liquidity: financial.liquidity != null ? String(financial.liquidity) : '',
        liquidityRatio: financial.liquidityRatio != null ? String(financial.liquidityRatio) : '',
        notes: financial.notes || '',
      });
    }

    // Load document if available
    const documents = documentsResponse?.data || documentsResponse || [];
    
    // Get the most recent document (they're already sorted by uploadedAt desc)
    const mostRecentDoc = documents.length > 0 ? documents[0] : null;

    if (mostRecentDoc && mostRecentDoc.storageUrl) {
      // Fetch the download URL for the document
      try {
        const downloadUrlResponse = await documentsApi.getDownloadUrl(mostRecentDoc.id);
        const downloadUrl = downloadUrlResponse?.data?.downloadUrl || mostRecentDoc.storageUrl;

        // Create a document object for display
        const existingDoc = {
          id: mostRecentDoc.id,
          fileName: mostRecentDoc.documentName,
          fileSize: mostRecentDoc.fileSize,
          mimeType: mostRecentDoc.mimeType,
          previewUrl: downloadUrl,
          uploadedAt: mostRecentDoc.uploadedAt,
          isStored: true, // Mark as stored (not a new upload)
        };

        $creditMemoModalState.update({
          pdfUrl: downloadUrl,
          uploadedDocument: existingDoc,
          refreshKey: ($creditMemoModalState.value.refreshKey || 0) + 1,
        });
      } catch (urlError) {
        console.error('Error fetching document download URL:', urlError);
        // Continue without showing the document if URL fetch fails
      }
    }
  } catch (error) {
    console.error('Error fetching credit memo data:', error);
    // Don't show error to user - just continue without pre-loading data
  }
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

      // Upload the document file if one was uploaded
      const { uploadedDocument } = $creditMemoModalState.value;
      if (uploadedDocument && uploadedDocument.file) {
        let documentId = null;
        
        try {
          const userId = currentUser?.email || currentUser?.name || 'Unknown User';

          // Step 1: Initiate upload and get storage path
          const initiateResponse = await documentsApi.initiateUpload({
            loanId,
            fileName: uploadedDocument.fileName,
            contentType: uploadedDocument.mimeType,
            fileSize: uploadedDocument.fileSize,
            uploadedBy: userId,
            documentType: 'Financial Statement',
          });

          if (initiateResponse.success) {
            const { documentId: docId, storagePath } = initiateResponse.data;
            documentId = docId;

            // Step 2: Upload file directly to Firebase Storage using SDK (bypasses CORS!)
            const storageRef = storage.ref(storagePath);
            const uploadTask = await storageRef.put(uploadedDocument.file, {
              contentType: uploadedDocument.mimeType,
            });

            // Get the download URL
            const downloadURL = await uploadTask.ref.getDownloadURL();

            // Step 3: Confirm upload with backend
            const confirmResponse = await documentsApi.confirmUpload(documentId, storagePath);

            if (!confirmResponse.success) {
              console.error('Failed to confirm document upload:', confirmResponse.error);
              dangerAlert('Credit memo data saved, but document upload failed. Please try uploading the document again.', 'toast');
            }
          } else {
            console.error('Failed to initiate document upload:', initiateResponse.error);
            dangerAlert('Credit memo data saved, but document upload failed. Please try uploading the document again.', 'toast');
          }
        } catch (uploadError) {
          console.error('Error uploading credit memo document:', uploadError);
          
          // If we created a document record, mark it as failed
          if (documentId) {
            try {
              await documentsApi.markUploadFailed(documentId, uploadError.message);
            } catch (markFailedError) {
              console.error('Error marking upload as failed:', markFailedError);
            }
          }
          
          dangerAlert('Credit memo data saved, but document upload failed. Please try uploading the document again.', 'toast');
        }
      }

      // Refresh the loan detail to get updated financials, watch score, and documents
      // This will update $loanDetailFinancials which controls the button text
      await fetchLoanDetail(loanId);

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
