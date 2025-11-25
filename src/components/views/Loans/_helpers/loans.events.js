import { $loans, $loansView, $loansFilter, $loansForm, $reports, $comments } from '@src/signals';
import loansApi from '@src/api/loans.api';
import reportsApi from '@src/api/reports.api';
import commentsApi from '@src/api/comments.api';
import { $loan } from '@src/consts/consts';
import { dangerAlert, successAlert, infoAlert } from '@src/components/global/Alert/_helpers/alert.events';
import { fetchAndSetLoans } from '@src/components/views/Loans/_helpers/loans.resolvers';
import {
  $financialsUploader,
  $loanDetailNewComment,
  $loanDetailFinancials,
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

  const newCommentData = {
    loanId: $loan.value?.loan?.id,
    text,
  };

  await commentsApi.create(newCommentData);
  const updatedCommentsResponse = await commentsApi.getByLoan(loanId);
  $comments.update({ list: updatedCommentsResponse.data || [] });
  $loanDetailNewComment.value = '';
};

export const handleUploadFinancials = () => {
  const files = $financialsUploader.value?.financialFiles || [];
  if (!files.length) return;

  const newFinancials = files.map((file) => ({
    id: `${Date.now()}_${Math.random()}`,
    loanId: $loan.value?.loan?.id,
    fileName: file.name,
    fileSize: file.size,
    fileType: file.type,
    uploadedAt: new Date().toISOString(),
    uploadedBy: 'Current User',
  }));

  $loanDetailFinancials.value = [...$loanDetailFinancials.value, ...newFinancials];
  $financialsUploader.update({ financialFiles: [] });
};

export const handleDeleteFinancial = (financialId) => {
  $loanDetailFinancials.value = $loanDetailFinancials.value.filter((f) => f.id !== financialId);
};

export const handleDownloadFinancial = (financial) => {
  // In a real implementation, this would download the file from storage
  // Download logic for financial.fileName
};
