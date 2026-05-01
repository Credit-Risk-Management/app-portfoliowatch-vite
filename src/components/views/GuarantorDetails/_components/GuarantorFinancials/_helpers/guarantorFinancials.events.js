import { successAlert, dangerAlert } from '@src/components/global/Alert/_helpers/alert.events';
import { createGuarantorUploadLink } from '@src/api/guarantorFinancialUploadLink.api';
import {
  buildGuarantorAnnualUploadLinkOptions,
} from '@src/constants/financialSubmissionRequirements';
import * as consts from './guarantorFinancials.consts';
import * as resolvers from './guarantorFinancials.resolvers';
import getGuarantorUploadLinkUrl from './guarantorFinancials.helpers';

const COPIED_RESET_MS = 2000;

const copyToClipboard = async (url, isAnnual = false) => {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(url);
  } else {
    const tempInput = document.createElement('input');
    tempInput.value = url;
    tempInput.style.cssText = 'position:fixed;opacity:0;left:-999999px';
    document.body.appendChild(tempInput);
    tempInput.select();
    tempInput.setSelectionRange(0, 99999);
    document.execCommand('copy');
    document.body.removeChild(tempInput);
  }
  if (isAnnual) {
    consts.$copiedAnnualLink.update(true);
    setTimeout(() => consts.$copiedAnnualLink.update(false), COPIED_RESET_MS);
  } else {
    consts.$copiedLink.update(true);
    setTimeout(() => consts.$copiedLink.update(false), COPIED_RESET_MS);
  }
};

/**
 * @param {string|undefined} kind — from API `guarantorKind`; defaults to BUSINESS
 */
const normalizeKind = (kind) => (kind === 'INDIVIDUAL' ? 'INDIVIDUAL' : 'BUSINESS');

export const handleCreateGuarantorAnnualLink = async (guarantorId, guarantorKind) => {
  if (!guarantorId) return;
  const kind = normalizeKind(guarantorKind);
  try {
    const options = buildGuarantorAnnualUploadLinkOptions(kind);
    const response = await createGuarantorUploadLink(guarantorId, options);
    const data = response?.data ?? response;
    if (response?.status === 'success' && data?.token) {
      const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
      const url = `${baseUrl}/upload-guarantor-financials/${data.token}`;
      await copyToClipboard(url, true);
      successAlert('Annual link copied to clipboard!', 'toast');
    } else {
      dangerAlert('Could not create annual upload link.');
    }
  } catch (error) {
    dangerAlert(error?.message || 'Failed to create annual upload link.');
  }
};

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
