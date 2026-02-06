import { $borrowerFinancialsView } from '@src/signals';
import { successAlert, dangerAlert } from '@src/components/global/Alert/_helpers/alert.events';
import * as consts from './borrowerFinancialsTab.consts';
import { getUploadLinkUrl } from './borrowerFinancialsTab.helpers';
import * as resolvers from './borrowerFinancialsTab.resolvers';

const COPIED_RESET_MS = 2000;

export const openSubmitFinancials = (borrowerId) => {
  $borrowerFinancialsView.update({
    activeModalKey: 'submitFinancials',
    currentBorrowerId: borrowerId,
  });
};

export const onFinancialRowClick = (borrowerId, financial) => {
  $borrowerFinancialsView.update({
    activeModalKey: 'submitFinancials',
    isEditMode: true,
    currentBorrowerId: borrowerId,
    editingFinancialId: financial?.id,
  });
};

export const handleCopyPermanentLink = async () => {
  const url = getUploadLinkUrl();
  if (!url) return;
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(url);
      consts.$copiedLink.update(true);
      setTimeout(() => consts.$copiedLink.update(false), COPIED_RESET_MS);
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
      consts.$copiedLink.update(true);
      successAlert('Copied', 'toast');
      setTimeout(() => consts.$copiedLink.update(false), COPIED_RESET_MS);
    }
  } catch (error) {
    successAlert('Failed to copy link', 'toast');
  }
};

export const handleExportExcel = async (borrowerId) => {
  if (!borrowerId) return;
  try {
    consts.$isExportingExcel.update(true);
    await resolvers.exportFinancialsExcel(borrowerId);
  } catch (error) {
    dangerAlert('Failed to export Excel file');
  } finally {
    consts.$isExportingExcel.update(false);
  }
};
