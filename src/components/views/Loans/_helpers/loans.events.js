import { $loans, $loansView, $loansFilter, $loansForm, $comments, $reports } from '@src/signals';
import loansApi from '@src/api/loans.api';
import reportsApi from '@src/api/reports.api';
import commentsApi from '@src/api/comments.api';
import documentsApi from '@src/api/documents.api';
import borrowersApi from '@src/api/borrowers.api';
import { $loan } from '@src/consts/consts';
import { dangerAlert, successAlert, infoAlert } from '@src/components/global/Alert/_helpers/alert.events';
import { fetchAndSetLoans, fetchLoanDetail } from '@src/components/views/Loans/_helpers/loans.resolvers';
import { auth } from '@src/utils/firebase';
import { uploadMultipleFiles } from './loans.upload';
import {
  $financialsUploader,
  $loanDetailNewComment,
  $loanDetailNewCommentLoading,
  $loanDetailFinancials,
  $industryReportGenerating,
} from './loans.consts';

export const handleAddLoan = async () => {
  try {
    const formData = $loansForm.value;

    // Track who made the override if financial metrics were entered
    const hasFinancialMetrics = formData.grossRevenue || formData.netIncome || formData.ebitda;
    const overrideData = hasFinancialMetrics ? {
      financialMetricsOverrideBy: 'Current User', // TODO: Get from auth context
      financialMetricsOverrideDate: new Date().toISOString(),
    } : {};

    const loanData = {
      ...formData,
      ...overrideData,
    };

    await loansApi.create(loanData);

    $loansView.update({ showAddModal: false });
    $loansForm.reset();

    await fetchAndSetLoans({ isShowLoader: true });
  } catch (error) {
    dangerAlert(error);
    throw error;
  } finally {
    $loansView.update({ showAddModal: false });
  }
};

export const handleEditLoan = async () => {
  try {
    const formData = $loansForm.value;
    const originalLoan = $loans.value.selectedLoan;

    // Check if financial metrics were changed
    const financialMetricsChanged = (
      formData.grossRevenue !== originalLoan.grossRevenue
      || formData.netIncome !== originalLoan.netIncome
      || formData.ebitda !== originalLoan.ebitda
      || formData.debtService !== originalLoan.debtService
      || formData.currentRatio !== originalLoan.currentRatio
      || formData.liquidity !== originalLoan.liquidity
      || formData.retainedEarnings !== originalLoan.retainedEarnings
    );

    const overrideData = financialMetricsChanged ? {
      financialMetricsOverrideBy: 'Current User', // TODO: Get from auth context
      financialMetricsOverrideDate: new Date().toISOString(),
    } : {};

    const loanData = {
      ...formData,
      ...overrideData,
    };

    await loansApi.update(formData.id, loanData);

    $loansView.update({ showEditModal: false });
    $loansForm.reset();

    await fetchAndSetLoans({ isShowLoader: true });
  } catch (error) {
    dangerAlert(error);
    throw error;
  } finally {
    $loansView.update({ showEditModal: false });
  }
};

export const handleDeleteLoan = async (loanId) => {
  try {
    await loansApi.delete(loanId);

    $loansView.update({ showDeleteModal: false });

    await fetchAndSetLoans({ isShowLoader: true });
  } catch (error) {
    dangerAlert(error);
    throw error;
  } finally {
    $loansView.update({ showDeleteModal: false });
  }
};

export const handleSaveToReports = () => {
  $loansView.update({ showSaveReportModal: true });
};

export const handleSaveReport = async () => {
  const reportName = $loansView.value.reportName || `Loan Report ${new Date().toLocaleDateString()}`;
  const parameters = {
    searchTerm: $loansFilter.value.searchTerm,
    interestType: $loansFilter.value.interestType,
    watchScore: $loansFilter.value.watchScore,
    relationshipManager: $loansFilter.value.relationshipManager,
  };

  await reportsApi.create({
    reportName,
    parameters,
  });
  const updatedReportsResponse = await reportsApi.getAll();
  $reports.update({ list: updatedReportsResponse.data || [] });
  $loansView.update({ showSaveReportModal: false, reportName: '' });
};

export const handleComputeWatchScores = async () => {
  try {
    $loansView.update({ isComputingWatchScores: true });
    infoAlert('Computing WATCH Scores...');

    const result = await loansApi.computeAllWatchScores();
    const { total, computed, failed } = result.data || {};

    // Build message based on results
    let message = `Computed ${computed || 0} out of ${total || 0} scores`;
    if (failed > 0) {
      message += ` (${failed} failed)`;
    }

    if (failed === total) {
      // All failed - show warning
      dangerAlert(message);
    } else if (failed > 0) {
      // Partial success - show warning
      dangerAlert(message);
    } else {
      // All succeeded - show success
      successAlert(message);
    }

    // Refresh loans to show updated scores
    await fetchAndSetLoans({ isShowLoader: true });
  } catch (error) {
    dangerAlert(`Failed to compute WATCH scores: ${error.message}`);
  } finally {
    $loansView.update({ isComputingWatchScores: false });
  }
};

export const handleAddComment = async (loanId) => {
  const text = $loanDetailNewComment.value?.trim();
  if (!text) return;

  // Get user info from Firebase auth
  const { currentUser } = auth;

  // Determine userId and userName - use mock values for development if not authenticated
  let userId;
  let userName;

  if (currentUser) {
    userId = currentUser.uid;
    userName = currentUser.displayName || currentUser.email || 'Unknown User';
  } else {
    // Development fallback - use mock user
    userId = `dev-user-${Date.now()}`;
    userName = 'Development User';
  }

  const newCommentData = {
    loanId: $loan.value?.loan?.id,
    userId,
    userName,
    text,
  };

  try {
    $loanDetailNewCommentLoading.value = true;
    await commentsApi.create(newCommentData);
    const updatedCommentsResponse = await commentsApi.getByLoan(loanId);
    $comments.update({ list: updatedCommentsResponse.data || [] });
    $loanDetailNewComment.value = '';
    successAlert('Comment added successfully');
  } catch (error) {
    dangerAlert(`Failed to add comment: ${error.message}`);
    throw error;
  } finally {
    $loanDetailNewCommentLoading.value = false;
  }
};

export const handleUploadFinancials = async () => {
  const files = $financialsUploader.value?.financialFiles || [];
  if (!files.length) return;

  const loanId = $loan.value?.loan?.id;
  if (!loanId) {
    dangerAlert('No loan selected');
    return;
  }

  // Get user info from Firebase auth
  const { currentUser } = auth;

  // Determine userId - use mock values for development if not authenticated
  let userId;

  if (currentUser) {
    userId = currentUser.uid;
  } else {
    // Development fallback - use mock user
    userId = `dev-user-${Date.now()}`;
  }

  try {
    infoAlert(`Uploading ${files.length} file(s)...`);

    // Upload files using the signed URL workflow
    const results = await uploadMultipleFiles(loanId, files, userId);

    // Update the financials list with successfully uploaded documents
    if (results.successful.length > 0) {
      // Refresh the financials list
      const response = await documentsApi.getAll({
        loanId,
        documentType: 'FINANCIAL',
      });

      if (response.success) {
        $loanDetailFinancials.value = response.data.map(doc => ({
          ...doc,
          fileName: doc.documentName,
        }));
      }
    }

    // Clear the uploader
    $financialsUploader.update({ financialFiles: [] });
  } catch (error) {
    console.error('Error uploading financials:', error);
    dangerAlert(`Error uploading files: ${error.message}`);
  }
};

export const handleDeleteFinancial = async (financialId) => {
  if (!financialId) {
    dangerAlert('Invalid document ID');
    return;
  }

  try {
    // Delete from backend (will also delete from Firebase Storage)
    const response = await documentsApi.delete(financialId);

    if (response.success) {
      // Remove from local state
      $loanDetailFinancials.value = $loanDetailFinancials.value.filter((f) => f.id !== financialId);
      successAlert('Document deleted successfully');
    } else {
      throw new Error(response.error || 'Failed to delete document');
    }
  } catch (error) {
    console.error('Error deleting financial:', error);
    dangerAlert(`Failed to delete document: ${error.message}`);
  }
};

export const handleDownloadFinancial = async (financial) => {
  if (!financial || !financial.id) {
    dangerAlert('Invalid document');
    return;
  }

  try {
    // Get signed download URL from backend
    const response = await documentsApi.getDownloadUrl(financial.id);

    if (!response.success) {
      throw new Error(response.error || 'Failed to get download URL');
    }

    const { downloadUrl, fileName } = response.data;

    // Trigger browser download
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = fileName || financial.fileName;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    successAlert(`Downloading ${fileName || financial.fileName}`);
  } catch (error) {
    console.error('Error downloading financial:', error);
    dangerAlert(`Failed to download document: ${error.message}`);
  }
};

export const handleGenerateIndustryReport = async () => {
  const loan = $loan.value?.loan;

  if (!loan?.borrower?.id || !loan?.id) {
    dangerAlert('Loan or borrower information not available');
    return;
  }

  try {
    $industryReportGenerating.value = true;
    infoAlert('Generating industry health report...');

    const response = await borrowersApi.generateIndustryReport(loan.borrower.id, loan.id);

    if (!response.success) {
      throw new Error(response.error || 'Failed to generate report');
    }

    successAlert('Industry health report generated successfully!');

    // Refresh the loan detail to show updated borrower data
    await fetchLoanDetail(loan.loanId);
  } catch (error) {
    console.error('Error generating industry report:', error);
    dangerAlert(`Failed to generate industry report: ${error.message}`);
  } finally {
    $industryReportGenerating.value = false;
  }
};
