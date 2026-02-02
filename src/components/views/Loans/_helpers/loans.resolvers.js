import { $borrowers, $loans, $loansFilter, $loansView, $relationshipManagers, $comments } from '@src/signals';
import { $loan, $watchScoreBreakdown } from '@src/consts/consts';
import borrowersApi from '@src/api/borrowers.api';
import relationshipManagersApi from '@src/api/relationshipManagers.api';
import { dangerAlert } from '@src/components/global/Alert/_helpers/alert.events';
import loansApi from '@src/api/loans.api';
import commentsApi from '@src/api/comments.api';
import documentsApi from '@src/api/documents.api';
import loanCollateralValueApi from '@src/api/loanCollateralValue.api';
import { $loanDetailFinancials, $loanDetailCollateral } from './loans.consts';

export const loadReferenceData = async () => {
  try {
    const [borrowersResponse, managersResponse] = await Promise.all([
      borrowersApi.getAll(),
      relationshipManagersApi.getAll(),
    ]);
    $borrowers.update({ list: borrowersResponse.data || [] });
    $relationshipManagers.update({ list: managersResponse.data || [] });
  } catch (error) {
    dangerAlert(`Failed to load reference data: ${error?.message || 'Unknown error'}`);
  } finally {
    $loansView.update({ isLoading: false });
  }
};

export const fetchAndSetLoans = async ({ isShowLoader = true }) => {
  try {
    if (isShowLoader) {
      $loansView.update({ isTableLoading: true });
    }

    const { searchTerm, interestType, watchScore, relationshipManager, page, sortKey, sortDirection } = $loansFilter.value;

    const filters = {
      searchTerm,
      interestType,
      watchScore,
      relationshipManager,
      page: page || 1,
      limit: 10,
      sortKey,
      sortDirection,
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

export const fetchLoanDetail = async (loanId) => {
  if (!loanId) return;

  try {
    $loan.update({ isLoading: true });
    $watchScoreBreakdown.update({ isLoading: true });

    const [loanResponse, commentsResponse, watchScoreResponse, documentsResponse, collateralResponse] = await Promise.all([
      loansApi.getById(loanId),
      commentsApi.getByLoan(loanId),
      loansApi.getWatchScoreBreakdown(loanId),
      documentsApi.getAll({ loanId, documentType: 'Financial Statement' }),
      loanCollateralValueApi.getHistoryByLoanId(loanId).catch(() => ({ data: [] })), // Fail silently if no collateral
    ]);

    // The API client interceptor returns response.data, so loanResponse is { success: true, data: loan }
    // Extract the loan object from the response (handle both wrapped and unwrapped responses)
    const loanData = loanResponse?.data || loanResponse;

    $loan.update({ loan: loanData, isLoading: false });
    $comments.update({ list: commentsResponse?.data || commentsResponse || [] });
    $watchScoreBreakdown.update({
      breakdown: watchScoreResponse?.data || watchScoreResponse,
      isLoading: false,
    });

    // Update financial documents list
    const financials = documentsResponse?.data || documentsResponse || [];
    $loanDetailFinancials.value = financials.map(doc => ({
      ...doc,
      fileName: doc.documentName,
    }));

    // Update collateral history list
    const collateral = collateralResponse?.data || collateralResponse || [];
    $loanDetailCollateral.value = Array.isArray(collateral) ? collateral : [];
    console.log('collateral', collateral);
  } catch (error) {
    console.error('Failed to fetch loan detail:', error);
    $loan.update({ loan: null, isLoading: false });
    $watchScoreBreakdown.update({ breakdown: null, isLoading: false });
    dangerAlert(`Failed to fetch loan detail: ${error?.message || 'Unknown error'}`);
  }
};
