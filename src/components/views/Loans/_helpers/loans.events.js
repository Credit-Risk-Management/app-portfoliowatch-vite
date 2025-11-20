import { $loans, $loansView, $loansFilter, $loansForm, $reports } from '@src/signals';
import loansApi from '@src/api/loans.api';
import reportsApi from '@src/api/reports.api';
import { dangerAlert, successAlert, infoAlert } from '@src/components/global/Alert/_helpers/alert.events';

export const fetchLoans = async () => {
  try {
    $loansView.update({ isTableLoading: true });

    const { searchTerm, interestType, riskRating, loanOfficer } = $loansFilter.value;

    const filters = {
      searchTerm,
      interestType,
      riskRating,
      loanOfficer,
    };

    const response = await loansApi.getAll(filters);

    $loans.update({
      list: response?.data || [],
      totalCount: response?.count || 0,
    });
  } catch (error) {
    $loans.update({ list: [], totalCount: 0 });
    dangerAlert(`Failed to fetch loans: ${error?.message || 'Unknown error'}`);
  } finally {
    $loansView.update({ isTableLoading: false });
  }
};

export const handleAddLoan = async () => {
  try {
    const formData = $loansForm.value;

    // Track who made the override if financial metrics were entered
    const hasFinancialMetrics = formData.gross_revenue || formData.net_income || formData.ebitda;
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

    await fetchLoans();
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

    await fetchLoans();
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

    await fetchLoans();
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
    riskRating: $loansFilter.value.riskRating,
    loanOfficer: $loansFilter.value.loanOfficer,
  };

  await reportsApi.create({
    report_name: reportName,
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

    successAlert(`Successfully computed ${result.computed} out of ${result.total} scores`);

    // Refresh loans to show updated scores
    await fetchLoans();
  } catch (error) {
    dangerAlert(`Failed to compute WATCH scores: ${error.message}`);
  } finally {
    $loansView.update({ isComputingWatchScores: false });
  }
};
