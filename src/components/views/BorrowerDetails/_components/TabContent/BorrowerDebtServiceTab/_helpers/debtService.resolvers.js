import { $borrower } from '@src/consts/consts';
import { $debtServiceHistory } from '@src/signals';
import borrowerFinancialsApi from '@src/api/borrowerFinancials.api';
import debtServiceHistoryApi from '@src/api/debtServiceHistory.api';
import { dangerAlert } from '@src/components/global/Alert/_helpers/alert.events';
import { $debtServiceContainerView, $debtServiceContainerDetails } from './debtService.consts';

export const fetchDebtServiceHistory = async () => {
  if (!$borrower.value?.borrower?.id) return;

  try {
    $debtServiceContainerView.update({ isLoading: true });
    const response = await debtServiceHistoryApi.getByBorrowerId($borrower.value.borrower.id);

    if (response.success) {
      $debtServiceHistory.update({
        list: response.data || [],
        totalCount: response.count || 0,
        isLoading: false,
      });
    }
  } catch (error) {
    console.error('Error fetching debt service history:', error);
    dangerAlert('Failed to load debt service history', 'toast');
  } finally {
    $debtServiceContainerView.update({ isLoading: false });
  }
};

export const fetchLatestDebtService = async () => {
  if (!$borrower.value?.borrower?.id) return;

  try {
    const response = await debtServiceHistoryApi.getLatestByBorrowerId($borrower.value.borrower.id);
    if (response.success) {
      $debtServiceContainerDetails.update({ latestDebtService: response.data });
    }
  } catch (error) {
    console.error('Error fetching latest debt service:', error);
    // Fail silently - not critical
  }
};

export const fetchFinancialHistory = async () => {
  if (!$borrower.value?.borrower?.id) return;

  const borrowerId = $borrower.value.borrower.id;

  try {
    // Always use server 'latest for DSCR': newest submitted row with non-null EBITDA
    // (see borrowerFinancials.getLatestByBorrowerId — not the same as newest asOfDate only).
    const latestResp = await borrowerFinancialsApi.getLatestByBorrowerId(borrowerId);
    if (latestResp.success && latestResp.data) {
      $debtServiceContainerDetails.update({ latestFinancial: latestResp.data });
      return;
    }

    // No row with EBITDA yet: fall back to most recent statement by as-of date
    const pageResp = await borrowerFinancialsApi.getByBorrowerId(borrowerId, {
      sortKey: 'asOfDate',
      sortDirection: 'desc',
      limit: 1,
    });

    if (pageResp.success && pageResp.data?.length > 0) {
      $debtServiceContainerDetails.update({ latestFinancial: pageResp.data[0] });
    } else {
      $debtServiceContainerDetails.update({ latestFinancial: null });
    }
  } catch (error) {
    console.error('Error fetching financial history:', error);
    // Fail silently - not critical
  }
};
