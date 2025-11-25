/* eslint-disable import/prefer-default-export */
import { $borrowers, $loans, $loansFilter, $loansView, $relationshipManagers } from '@src/signals';
import { $loan } from '@src/consts/consts';
import borrowersApi from '@src/api/borrowers.api';
import relationshipManagersApi from '@src/api/relationshipManagers.api';
import { dangerAlert } from '@src/components/global/Alert/_helpers/alert.events';
import loansApi from '@src/api/loans.api';
import commentsApi from '@src/api/comments.api';
import { $comments } from '@src/signals';

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
    const [loanResponse, commentsResponse] = await Promise.all([
      loansApi.getById(loanId),
      commentsApi.getByLoan(loanId),
    ]);

    $loan.update({ loan: loanResponse.data, isLoading: false });
    $comments.update({ list: commentsResponse.data || [] });
  } catch (error) {
    console.error('Failed to fetch loan detail:', error);
    $loan.update({ loan: null, isLoading: false });
    dangerAlert(`Failed to fetch loan detail: ${error?.message || 'Unknown error'}`);
  }
};
