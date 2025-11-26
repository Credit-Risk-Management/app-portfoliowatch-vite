import { $borrower } from '@src/consts/consts';
import borrowersApi from '@src/api/borrowers.api';
import annualReviewsApi from '@src/api/annualReviews.api';
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

export const handleGenerateAnnualReview = async (borrowerId) => {
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
    infoAlert('Generating annual review with AI narratives and PDF...');

    // Generate report data with AI narratives and PDF
    const response = await annualReviewsApi.generateForLoan(firstLoan.id, {
      generateNarratives: true,
      includeFinancials: true,
      generatePdf: true,
    });

    if (!response.success) {
      throw new Error(response.error || 'Failed to generate annual review');
    }

    // Download the PDF if included in response
    if (response.pdf && response.pdf.buffer) {
      try {
        const pdfBlob = base64ToBlob(response.pdf.buffer, 'application/pdf');
        downloadBlob(pdfBlob, response.pdf.filename);
        successAlert('Annual review and PDF generated successfully!');
      } catch (pdfError) {
        console.error('Failed to download PDF:', pdfError);
        successAlert('Annual review generated successfully! (PDF download failed)');
      }
    } else {
      if (response.pdfError) {
        console.error('PDF generation error:', response.pdfError);
        successAlert('Annual review data generated successfully! (PDF generation failed)');
      } else {
        successAlert('Annual review generated successfully!');
      }
    }

    // Log the generated data for debugging
    console.log('Generated annual review data:', response.data);
    
    return response.data;
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
