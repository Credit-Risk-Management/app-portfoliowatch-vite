import { $borrowerFinancialsView } from '@src/signals';
import { successAlert, dangerAlert } from '@src/components/global/Alert/_helpers/alert.events';
import { createUploadLink } from '@src/api/borrowerFinancialUploadLink.api';
import {
  Q1_TEST_UPLOAD_LINK_OPTIONS,
  ANNUAL_TEST_UPLOAD_LINK_OPTIONS,
} from '@src/constants/financialSubmissionRequirements';
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

export const handleCopyPermanentLink = async (isAnnualLink = false) => {
  const url = getUploadLinkUrl();
  if (!url) return;
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(url);
      if (isAnnualLink) {
        consts.$copiedAnnualLink.update(true);
        setTimeout(() => consts.$copiedAnnualLink.update(false), COPIED_RESET_MS);
      } else {
        consts.$copiedLink.update(true);
        setTimeout(() => consts.$copiedLink.update(false), COPIED_RESET_MS);
      }
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

// const copyToClipboard = async (url, isAnnualLink = false) => {
//   if (navigator.clipboard?.writeText) {
//     await navigator.clipboard.writeText(url);
//   } else {
//     const tempInput = document.createElement('input');
//     tempInput.value = url;
//     tempInput.style.cssText = 'position:fixed;opacity:0;left:-999999px';
//     document.body.appendChild(tempInput);
//     tempInput.select();
//     tempInput.setSelectionRange(0, 99999);
//     document.execCommand('copy');
//     document.body.removeChild(tempInput);
//   }
//   if (isAnnualLink) {
//     consts.$copiedAnnualLink.update(true);
//     setTimeout(() => consts.$copiedAnnualLink.update(false), COPIED_RESET_MS);
//   } else {
//     consts.$copiedLink.update(true);
//     setTimeout(() => consts.$copiedLink.update(false), COPIED_RESET_MS);
//   }
// };

export const handleCreateQ1TestUploadLink = async (borrowerId) => {
  if (!borrowerId) return;
  try {
    const response = await createUploadLink(borrowerId, Q1_TEST_UPLOAD_LINK_OPTIONS);
    const data = response?.data ?? response;
    const url = data?.uploadLinkUrl ?? data?.upload_link_url;
    if (response?.status === 'success' && url) {
      handleCopyPermanentLink(false);
      successAlert('Quarterly link copied to clipboard!', 'toast');
    } else {
      dangerAlert('Could not create quarterly upload link.');
    }
  } catch (error) {
    dangerAlert(error?.message || 'Failed to create quarterly upload link.');
  }
};

export const handleCreateAnnualTestUploadLink = async (borrowerId) => {
  if (!borrowerId) return;
  try {
    const response = await createUploadLink(borrowerId, ANNUAL_TEST_UPLOAD_LINK_OPTIONS);
    const data = response?.data ?? response;
    const url = data?.uploadLinkUrl ?? data?.upload_link_url;
    if (response?.status === 'success' && url) {
      handleCopyPermanentLink(true);
      successAlert('Annual link copied to clipboard!', 'toast');
    } else {
      dangerAlert('Could not create annual upload link.');
    }
  } catch (error) {
    dangerAlert(error?.message || 'Failed to create annual upload link.');
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
