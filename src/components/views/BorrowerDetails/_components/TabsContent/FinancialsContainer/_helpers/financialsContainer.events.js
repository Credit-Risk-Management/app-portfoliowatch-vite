import axios from 'axios';
import { auth } from '@src/utils/firebase';
import { successAlert, dangerAlert } from '@src/components/global/Alert/_helpers/alert.events';
import { $borrowerFinancialsView } from '@src/signals';
import { $financialsContainerView } from './financialsContainer.consts';

const COPIED_RESET_MS = 2000;

export const handleOpenSubmitFinancials = (borrowerId) => {
  $borrowerFinancialsView.update({
    activeModalKey: 'submitFinancials',
    currentBorrowerId: borrowerId,
  });
};

export const handleOpenEditFinancial = (borrowerId, financialId) => {
  $borrowerFinancialsView.update({
    activeModalKey: 'submitFinancials',
    isEditMode: true,
    currentBorrowerId: borrowerId,
    editingFinancialId: financialId,
  });
};

export const getUploadLinkUrl = () => {
  const { permanentUploadLink } = $financialsContainerView.value;
  if (!permanentUploadLink?.token) return null;
  return `${window.location.origin}/upload-financials/${permanentUploadLink.token}`;
};

export const handleCopyPermanentLink = async () => {
  const url = getUploadLinkUrl();
  if (!url) return;
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(url);
      $financialsContainerView.update({ copiedLink: true });
      setTimeout(() => $financialsContainerView.update({ copiedLink: false }), COPIED_RESET_MS);
    } else {
      const tempInput = document.createElement('input');
      tempInput.value = url;
      tempInput.style.position = 'fixed';
      tempInput.style.opacity = '0';
      tempInput.style.left = '-999999px';
      document.body.appendChild(tempInput);
      tempInput.select();
      tempInput.setSelectionRange(0, 99999);
      document.execCommand('copy');
      document.body.removeChild(tempInput);
      successAlert('Copied', 'toast');
      $financialsContainerView.update({ copiedLink: true });
      setTimeout(() => $financialsContainerView.update({ copiedLink: false }), COPIED_RESET_MS);
    }
  } catch (error) {
    console.error('Error copying link:', error);
    dangerAlert('Failed to copy link', 'toast');
  }
};

export const handleExportExcel = async (borrowerId) => {
  if (!borrowerId) return;
  try {
    $financialsContainerView.update({ isExportingExcel: true });
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
  } catch (error) {
    console.error('Error exporting Excel:', error);
    dangerAlert('Failed to export Excel file');
  } finally {
    $financialsContainerView.update({ isExportingExcel: false });
  }
};
