import { $borrowers, $loans, $loansFilter, $loansView, $relationshipManagers, $comments } from '@src/signals';
import { $loan, $watchScoreBreakdown } from '@src/consts/consts';
import borrowersApi from '@src/api/borrowers.api';
import relationshipManagersApi from '@src/api/relationshipManagers.api';
import { dangerAlert } from '@src/components/global/Alert/_helpers/alert.events';
import loansApi from '@src/api/loans.api';
import commentsApi from '@src/api/comments.api';
import documentsApi from '@src/api/documents.api';
import loanCollateralValueApi from '@src/api/loanCollateralValue.api';
import guarantorsApi from '@src/api/guarantors.api';
import {
  $loanDetailFinancials,
  $loanDetailCollateral,
  $loanDetailGuarantors,
  $loanDetailNewComment,
  $loanDetailNewCommentLoading,
  $loanDetailShowSecondaryContacts,
  $loanDetailCollateralDateFilter,
  $loanDetailCollateralAccordionExpanded,
  $industryReportGenerating,
  $loanDetailView,
  $financialsUploader,
  $loanDetailMissingFinancials,
} from './loans.consts';
import {
  $loanCollateralView,
  $loanCollateralForm,
  $collateralDocUploader,
  $collateralModalState,
} from '../_components/submitCollateralModal.signals';

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
    $loanDetailMissingFinancials.value = false;

    const loanResponse = await loansApi.getById(loanId);
    const loanData = loanResponse?.data || loanResponse;

    const [commentsResponse, watchScoreResponse, documentsResponse, collateralResponse, missingFinancials] =
      await Promise.all([
        commentsApi.getByLoan(loanId),
        loansApi.getWatchScoreBreakdown(loanId),
        documentsApi.getAll({ loanId, documentType: 'Financial Statement' }),
        loanCollateralValueApi.getHistoryByLoanId(loanId).catch(() => ({ data: [] })), // Fail silently if no collateral
      ]);

    const guarantorsResponse = await guarantorsApi.getByLoanId(loanId);

    $loan.update({ loan: loanData, isLoading: false });
    $comments.update({ list: commentsResponse?.data || commentsResponse || [] });
    $watchScoreBreakdown.update({
      breakdown: watchScoreResponse?.data || watchScoreResponse,
      isLoading: false,
    });
    $loanDetailMissingFinancials.value = missingFinancials;

    // Update financial documents list
    const financials = documentsResponse?.data || documentsResponse || [];
    $loanDetailFinancials.value = financials.map(doc => ({
      ...doc,
      fileName: doc.documentName,
    }));

    // Update collateral history list
    const collateral = collateralResponse?.data || collateralResponse || [];
    $loanDetailCollateral.value = Array.isArray(collateral) ? collateral : [];

    // Update guarantors list
    const guarantors = guarantorsResponse?.data || guarantorsResponse || [];
    $loanDetailGuarantors.value = Array.isArray(guarantors) ? guarantors : [];
  } catch (error) {
    console.error('Failed to fetch loan detail:', error);
    $loan.update({ loan: null, isLoading: false });
    $watchScoreBreakdown.update({ breakdown: null, isLoading: false });
    $loanDetailMissingFinancials.value = false;
    dangerAlert(`Failed to fetch loan detail: ${error?.message || 'Unknown error'}`);
  }
};

/**
 * Clears loan detail–scoped signals when leaving `/loans/:loanId` or switching loans.
 */
export const resetLoanRouteState = () => {
  $loan.reset();
  $watchScoreBreakdown.reset();
  $comments.update({ list: [], isLoading: false });
  $loanDetailFinancials.value = [];
  $loanDetailCollateral.value = [];
  $loanDetailGuarantors.value = [];
  $loanDetailNewComment.value = '';
  $loanDetailNewCommentLoading.value = false;
  $loanDetailShowSecondaryContacts.value = false;
  $loanDetailCollateralDateFilter.value = null;
  $loanDetailCollateralAccordionExpanded.value = undefined;
  $industryReportGenerating.value = false;
  $loanDetailView.reset();
  $loanDetailMissingFinancials.value = false;
  $financialsUploader.update({ financialFiles: [] });
  $loanCollateralView.reset();
  $loanCollateralForm.reset();
  $collateralDocUploader.reset();
  $collateralModalState.reset();
};
