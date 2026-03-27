import { $borrowers, $loans, $loansFilter, $loansView, $relationshipManagers, $comments } from '@src/signals';
import { $loan, $watchScoreBreakdown } from '@src/consts/consts';
import borrowersApi, { borrowersSearchGetAll } from '@src/api/borrowers.api';
import relationshipManagersApi from '@src/api/relationshipManagers.api';
import { dangerAlert } from '@src/components/global/Alert/_helpers/alert.events';
import loansApi from '@src/api/loans.api';
import commentsApi from '@src/api/comments.api';
import documentsApi from '@src/api/documents.api';
import loanCollateralValueApi from '@src/api/loanCollateralValue.api';
import guarantorsApi from '@src/api/guarantors.api';
import { mapBorrowersToPickerOptions } from './loans.helpers';
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
} from './loans.consts';
import {
  $loanCollateralView,
  $loanCollateralForm,
  $collateralDocUploader,
  $collateralModalState,
} from '../_components/submitCollateralModal.signals';

const listFromApiResponse = (response) => {
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response)) return response;
  return [];
};

/**
 * Server-backed borrower list for loan modals (not $borrowers — that list is often paginated to 10 from the Borrowers view).
 */
export const fetchBorrowersForPicker = async (searchTerm) => {
  try {
    const response = await borrowersSearchGetAll({
      searchTerm: searchTerm?.trim() || undefined,
      page: 1,
      limit: 75,
      sortKey: 'name',
      sortDirection: 'asc',
    });
    return listFromApiResponse(response);
  } catch {
    return [];
  }
};

export const loadBorrowerPickerOptions = async (inputValue) => {
  const rows = await fetchBorrowersForPicker(inputValue);
  return mapBorrowersToPickerOptions(rows);
};

export const loadReferenceData = async () => {
  try {
    const [borrowersResponse, managersResponse] = await Promise.all([
      borrowersApi.getAll({
        page: 1,
        limit: 500,
        sortKey: 'name',
        sortDirection: 'asc',
      }),
      relationshipManagersApi.getAll(),
    ]);
    const borrowerList = listFromApiResponse(borrowersResponse);
    const managerList = listFromApiResponse(managersResponse);
    $borrowers.update({ list: borrowerList });
    $relationshipManagers.update({ list: managerList });
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

    const loanResponse = await loansApi.getById(loanId);
    const loanData = loanResponse?.data || loanResponse;

    const [commentsResponse, watchScoreResponse, documentsResponse, collateralResponse] =
      await Promise.all([
        commentsApi.getByLoan(loanId),
        loansApi.getWatchScoreBreakdown(loanId),
        documentsApi.getAll({ loanId, documentType: 'Financial Statement' }),
        loanCollateralValueApi.getHistoryByLoanId(loanId).catch(() => ({ data: [] })), // Fail silently if no collateral
      ]);

    const guarantorsResponse = await guarantorsApi.getByLoanId(loanId);

    $loan.update({ loan: loanData });
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

    // Update guarantors list
    const guarantors = guarantorsResponse?.data || guarantorsResponse || [];
    $loanDetailGuarantors.value = Array.isArray(guarantors) ? guarantors : [];
  } catch (error) {
    console.error('Failed to fetch loan detail:', error);
    $loan.update({ loan: null, isLoading: false });
    $watchScoreBreakdown.update({ breakdown: null, isLoading: false });
    dangerAlert(`Failed to fetch loan detail: ${error?.message || 'Unknown error'}`);
  } finally {
    $loan.update({ isLoading: false });
    $watchScoreBreakdown.update({ isLoading: false });
  }
};

/**
 * Clears loan detail–scoped signals when leaving `/loans/:loanId` or switching loans.
 */
export const resetLoanRouteState = () => {
  $loan.reset();
  $loan.update({ isLoading: true });
  $watchScoreBreakdown.reset();
  $watchScoreBreakdown.update({ isLoading: true });
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
  $financialsUploader.update({ financialFiles: [] });
  $loanCollateralView.reset();
  $loanCollateralForm.reset();
  $collateralDocUploader.reset();
  $collateralModalState.reset();
};
