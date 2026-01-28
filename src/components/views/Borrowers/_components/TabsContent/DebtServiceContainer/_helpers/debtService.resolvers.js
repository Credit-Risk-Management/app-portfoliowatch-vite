import { $borrower } from '@src/consts/consts';
import { $debtServiceHistory, $borrowerFinancials } from '@src/signals';
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

  try {
    // Check if financials are already loaded in the signal
    const existingFinancials = $borrowerFinancials.value?.list || [];
    if (existingFinancials.length > 0) {
      // Use existing financials - sort and get latest
      const sorted = [...existingFinancials].sort((a, b) => {
        const dateA = new Date(a.asOfDate);
        const dateB = new Date(b.asOfDate);
        return dateB - dateA;
      });
      $debtServiceContainerDetails.update({ latestFinancial: sorted[0] || null });
      return;
    }

    // If not loaded, fetch just the latest one without updating the shared signal
    const response = await borrowerFinancialsApi.getByBorrowerId(
      $borrower.value.borrower.id,
      {
        sortKey: 'asOfDate',
        sortDirection: 'desc',
        limit: 1,
      },
    );

    if (response.success && response.data && response.data.length > 0) {
      $debtServiceContainerDetails.update({ latestFinancial: response.data[0] });
    }
  } catch (error) {
    console.error('Error fetching financial history:', error);
    // Fail silently - not critical
  }
};
