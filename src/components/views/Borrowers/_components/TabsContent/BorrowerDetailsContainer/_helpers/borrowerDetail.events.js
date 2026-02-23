import { $borrower } from '@src/consts/consts';
import borrowersApi from '@src/api/borrowers.api';
import annualReviewsApi from '@src/api/annualReviews.api';
import borrowerFinancialDocumentsApi from '@src/api/borrowerFinancialDocuments.api';
import { dangerAlert, successAlert, infoAlert } from '@src/components/global/Alert/_helpers/alert.events';
import { $borrowersForm, $documentsView } from '@src/signals';
import { fetchBorrowerDetail, fetchBorrowerDocuments } from './borrowerDetail.resolvers';
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

    // Transform snake_case form fields to camelCase for API
    const apiData = {
      relationshipManagerId: formData.relationship_manager_id || null,
      notes: formData.notes || '',
    };

    await borrowersApi.update(formData.id, apiData);

    $borrowerDetailView.update({ showEditBorrowerModal: false });
    $borrowersForm.reset();

    // Refresh the borrower detail to show updated data
    const borrowerId = $borrower.value?.borrower?.id || $borrower.value?.borrower?.borrowerId;
    if (borrowerId) {
      await fetchBorrowerDetail(borrowerId);
    }

    successAlert('Borrower updated successfully');
  } catch (error) {
    dangerAlert(error.message || 'Failed to edit borrower');
  }
};

export const handleDeleteBorrower = () => {
  // This will be implemented when the delete modal is ready
};

export const handleGenerateAnnualReview = async () => {
  const borrower = $borrower.value?.borrower;

  if (!borrower?.id) {
    dangerAlert('Borrower information not available');
    return;
  }

  // Get first loan ID if available
  const firstLoan = borrower.loans?.[0];
  if (!firstLoan?.id) {
    dangerAlert('No loans found for this borrower. Annual reviews require an associated loan.');
    return;
  }

  try {
    infoAlert('Generating annual review with AI narratives and Word document...');

    // Generate report data with AI narratives and Word document
    const response = await annualReviewsApi.generateForLoan(firstLoan.id, {
      generateNarratives: true,
      includeFinancials: true,
      generateWord: true,
    });

    if (!response.success) {
      throw new Error(response.error || 'Failed to generate annual review');
    }

    // Download the Word document if included in response
    // Support both 'word' and 'pdf' keys for backward compatibility
    const wordData = response.word || response.pdf;
    const wordError = response.wordError || response.pdfError;

    if (wordData && wordData.buffer) {
      try {
        const wordBlob = base64ToBlob(wordData.buffer, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
        // Ensure filename has .docx extension
        const filename = wordData.filename?.endsWith('.docx')
          ? wordData.filename
          : wordData.filename?.replace(/\.pdf$/, '.docx') || 'annual-review.docx';
        downloadBlob(wordBlob, filename);
        successAlert('Annual review and Word document generated successfully!');
      } catch (downloadError) {
        console.error('Failed to download Word document:', downloadError);
        successAlert('Annual review generated successfully! (Word document download failed)');
      }
    } else if (wordError) {
      console.error('Word document generation error:', wordError);
      successAlert('Annual review data generated successfully! (Word document generation failed)');
    } else {
      successAlert('Annual review generated successfully!');
    }
  } catch (error) {
    console.error('Error generating annual review:', error);
    dangerAlert(`Failed to generate annual review: ${error.message}`);
  }
};

// Helper function to convert base64 to Blob
function base64ToBlob(base64, type) {
  const binStr = atob(base64);
  const len = binStr.length;
  const arr = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    arr[i] = binStr.charCodeAt(i);
  }
  return new Blob([arr], { type });
}

// Helper function to download Blob as file
function downloadBlob(blob, filename) {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();

  // Cleanup
  setTimeout(() => {
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }, 100);
}

export const handleDeleteBorrowerDocument = async (documentId, borrowerId) => {
  try {
    await borrowerFinancialDocumentsApi.delete(documentId);
    $documentsView.update({ showDeleteModal: false });
    successAlert('Document deleted successfully');

    // Refresh borrower documents after deletion
    if (borrowerId) {
      await fetchBorrowerDocuments(borrowerId);
    }
  } catch (error) {
    dangerAlert(error.message || 'Failed to delete document');
  } finally {
    $documentsView.update({ isTableLoading: false });
  }
};
