import axios from 'axios';
import { $borrower } from '@src/consts/consts';
import { $borrowerFinancials, $borrowerFinancialsView } from '@src/signals';
import { getPermanentUploadLink } from '@src/api/borrowerFinancialUploadLink.api';
import borrowerFinancialsApi from '@src/api/borrowerFinancials.api';
import { auth } from '@src/utils/firebase';
import { successAlert, dangerAlert } from '@src/components/global/Alert/_helpers/alert.events';
import { $borrowerFinancialsFilter, $borrowerFinancialsTableView } from '@src/components/views/BorrowerDetails/_helpers/borrowerDetail.consts';
import { fetchBorrowerDocuments } from '@src/components/views/BorrowerDetails/_helpers/borrowerDetail.resolvers';
import * as consts from './borrowerFinancialsTab.consts';

export const fetchFinancialHistory = async () => {
  $borrowerFinancials.update({ isLoading: true });
  const borrowerId = $borrower.value?.borrower?.id;
  if (!borrowerId) return;

  try {
    $borrowerFinancialsTableView.update({ isTableLoading: true });
    const filter = $borrowerFinancialsFilter.value;
    const sortKey = filter.sortKey || 'asOfDate';
    const sortDirection = filter.sortDirection || 'desc';
    const page = filter.page || 1;

    if (filter.sortKey !== sortKey || filter.sortDirection !== sortDirection || filter.page !== page) {
      $borrowerFinancialsFilter.update({
        page,
        sortKey,
        sortDirection,
      });
    }

    const response = await borrowerFinancialsApi.getByBorrowerId(borrowerId, {
      sortKey,
      sortDirection,
      page,
    });

    const list = response?.data ?? (Array.isArray(response) ? response : []);
    const totalCount = response?.count ?? list?.length ?? 0;
    $borrowerFinancials.update({
      list: list ?? [],
      totalCount: totalCount ?? 0,
      isLoading: false,
    });
    $borrowerFinancialsView.update({ refreshTrigger: 0 });
  } catch (error) {
    $borrowerFinancials.update({
      list: [],
      totalCount: 0,
      isLoading: false,
    });
    $borrowerFinancialsView.update({ refreshTrigger: 0 });
  } finally {
    $borrowerFinancialsTableView.update({ isTableLoading: false });
    $borrowerFinancials.update({ isLoading: false });
    $borrowerFinancialsView.update({ refreshTrigger: 0 });
  }
};

export const confirmDeleteBorrowerFinancial = async (borrowerId) => {
  const pending = $borrowerFinancialsView.value.pendingDeleteFinancial;
  if (!borrowerId || !pending?.id) return;
  if ($borrowerFinancialsView.value.isDeletingBorrowerFinancial) return;
  $borrowerFinancialsView.update({ isDeletingBorrowerFinancial: true });
  try {
    await borrowerFinancialsApi.delete(pending.id);
    $borrowerFinancialsView.update({
      activeModalKey: null,
      pendingDeleteFinancial: null,
    });
    successAlert('Financial record and stored files were deleted.');
    await fetchFinancialHistory();
    await fetchBorrowerDocuments(borrowerId);
  } catch (error) {
    dangerAlert(error?.message || 'Failed to delete financial record.');
  } finally {
    $borrowerFinancialsView.update({ isDeletingBorrowerFinancial: false });
  }
};

export const fetchPermanentUploadLink = async (borrowerId) => {
  if (!borrowerId) return;
  try {
    const response = await getPermanentUploadLink(borrowerId);
    const token = response?.status === 'success' ? (response?.data?.token ?? response?.data) : null;
    consts.$permanentUploadLink.update({ token: token ?? null });
  } catch (error) {
    consts.$permanentUploadLink.update({ token: null });
  }
};

export const exportFinancialsExcel = async (borrowerId) => {
  if (!borrowerId) return;
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3333';
  const user = auth.currentUser;
  let token = '';
  if (user) {
    token = await user.getIdToken();
  }
  const response = await axios.get(
    `${API_BASE_URL}/borrowers/${borrowerId}/financials/spreadsheet/excel`,
    {
      responseType: 'blob',
      headers: { Authorization: `Bearer ${token}` },
    },
  );
  if (response?.data) {
    const blob = new Blob([response.data], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `financial-spreadsheet-${borrowerId}-${new Date().toISOString().split('T')[0]}.xlsx`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
    successAlert('Excel file exported successfully!');
  } else {
    throw new Error('Invalid response from server');
  }
};
