import { successAlert, dangerAlert } from '@src/components/global/Alert/_helpers/alert.events';
import * as consts from './guarantorFinancials.consts';
import * as resolvers from './guarantorFinancials.resolvers';
import getGuarantorUploadLinkUrl from './guarantorFinancials.helpers';

const COPIED_RESET_MS = 2000;

export const handleCopyPermanentLink = async () => {
  const url = getGuarantorUploadLinkUrl();
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

export const handleExportExcel = async (guarantorId) => {
  if (!guarantorId) return;
  try {
    consts.$isExportingExcel.update(true);
    await resolvers.exportFinancialsExcel(guarantorId);
  } catch (error) {
    dangerAlert('Failed to export Excel file');
  } finally {
    consts.$isExportingExcel.update(false);
  }
};
