import { Signal } from '@fyclabs/tools-fyc-react/signals';
import { $borrower } from '@src/consts/consts';
import { borrowerFinancialsApi } from '@src/api/borrowerFinancials.api';
import { $borrowerFinancials } from '@src/signals';
import {
  $borrowerFinancialsFilter,
  $borrowerFinancialsTableView,
} from '@src/components/views/BorrowerDetails/_components/TabsContent/BorrowerDetailsContainer/_helpers/borrowerDetail.consts';

export const $borrowerDetailsManagementContainerView = Signal({
  activeTab: 'details',
  isLoading: false,
});

export const $borrowerDetailsManagementContainerDetails = Signal({
  borrower: null,
  isLoading: false,
});

export const fetchFinancialHistory = async () => {
  if (!$borrower.value?.borrower?.id) return;
  try {
    $borrowerFinancialsTableView.update({ isTableLoading: true });
    const filter = $borrowerFinancialsFilter.value;
    const response = await borrowerFinancialsApi.getByBorrowerId(
      $borrower.value.borrower.id,
      {
        sortKey: filter.sortKey,
        sortDirection: filter.sortDirection,
        page: filter.page,
      },
    );

    if (response.success) {
      $borrowerFinancials.update({
        list: response.data || [],
        totalCount: response.count || 0,
        isLoading: false,
      });
    }
  } catch (error) {
    console.error('Error fetching financial history:', error);
    $borrowerFinancials.update({
      list: [],
      totalCount: 0,
      isLoading: false,
    });
  } finally {
    $borrowerFinancialsTableView.update({ isTableLoading: false });
  }
};

// useEffectAsync(async () => {
//   if (borrower?.id) {
//     const response = await getPermanentUploadLink(borrower.id);
//     if (response.status === 'success') {
//       setPermanentUploadLink(response.data);
//     }
//   }
// }, [borrower?.id]);

// const getUploadLinkUrl = useMemo(() => {
//   if (!permanentUploadLink?.token) return null;
//   const baseUrl = window.location.origin;
//   return `${baseUrl}/upload-financials/${permanentUploadLink.token}`;
// }, [permanentUploadLink?.token]);

// const handleCopyPermanentLink = async () => {
//   if (!getUploadLinkUrl) return;
//   try {
//     // Use modern clipboard API
//     if (navigator.clipboard && navigator.clipboard.writeText) {
//       await navigator.clipboard.writeText(getUploadLinkUrl);
//       setCopiedLink(true);
//       setTimeout(() => setCopiedLink(false), 2000);
//     } else {
//       // Fallback for older browsers - create a temporary input element
//       const tempInput = document.createElement('input');
//       tempInput.value = getUploadLinkUrl;
//       tempInput.style.position = 'fixed';
//       tempInput.style.opacity = '0';
//       tempInput.style.left = '-999999px';
//       document.body.appendChild(tempInput);
//       tempInput.select();
//       tempInput.setSelectionRange(0, 99999);
//       document.execCommand('copy');
//       document.body.removeChild(tempInput);
//       setCopiedLink(true);
//       successAlert('Copied', 'toast');
//       setTimeout(() => setCopiedLink(false), 2000);
//     }
//   } catch (error) {
//     console.error('Error copying link:', error);
//     successAlert('Failed to copy link', 'toast');
//   }
// };

// const handleExportExcel = async () => {
//   if (!borrowerId) return;

//   try {
//     setIsExportingExcel(true);

//     const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3333';

//     const user = auth.currentUser;
//     let token = '';
//     if (user) {
//       token = await user.getIdToken();
//     }

//     const response = await axios.get(`${API_BASE_URL}/borrowers/${borrowerId}/financials/spreadsheet/excel`, {
//       responseType: 'blob',
//       headers: {
//         Authorization: `Bearer ${token}`,
//       },
//     });

//     if (response && response.data) {
//       const blob = new Blob([response.data], {
//         type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
//       });
//       const url = window.URL.createObjectURL(blob);
//       const a = document.createElement('a');
//       a.href = url;
//       a.download = `financial-spreadsheet-${borrowerId}-${new Date().toISOString().split('T')[0]}.xlsx`;
//       document.body.appendChild(a);
//       a.click();
//       window.URL.revokeObjectURL(url);
//       document.body.removeChild(a);

//       successAlert('Excel file exported successfully!');
//     } else {
//       throw new Error('Invalid response from server');
//     }
//   } catch (error) {
//     console.error('Error exporting Excel:', error);
//     dangerAlert('Failed to export Excel file');
//   } finally {
//     setIsExportingExcel(false);
//   }
// };
