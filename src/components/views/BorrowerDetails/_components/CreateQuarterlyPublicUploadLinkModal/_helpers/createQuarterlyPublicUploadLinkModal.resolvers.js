import { successAlert, dangerAlert } from '@src/components/global/Alert/_helpers/alert.events';
import { createUploadLink } from '@src/api/borrowerFinancialUploadLink.api';
import { buildCustomQuarterlyUploadLinkOptions } from '@src/constants/financialSubmissionRequirements';
import { $borrowerFinancialsView } from '@src/signals';
import { $copiedLink } from '@src/components/views/BorrowerDetails/_components/TabContent/BorrowerFinancialsTab/_helpers/borrowerFinancialsTab.consts';
import {
  resetCreateQuarterlyPublicUploadLinkForm,
  $createQuarterlyPublicUploadLinkForm,
  $createQuarterlyPublicUploadLinkState,
  getReportingYearFromForm,
  getReportingQuarterFromForm,
  buildDocumentItemsFromQuarterlyForm,
  hasAtLeastOneQuarterlyDocumentSelected,
  hasAtLeastOneQuarterlyRequiredForSubmit,
  hasExclusiveIncomeConflict,
} from './createQuarterlyPublicUploadLinkModal.consts';

const COPIED_RESET_MS = 2000;

const copyToClipboard = async (url) => {
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
};

export const createAndCopyQuarterlyPublicUploadLink = async (borrowerId) => {
  if (!borrowerId) return;

  const formValue = $createQuarterlyPublicUploadLinkForm.value;

  if (hasExclusiveIncomeConflict(formValue)) {
    $createQuarterlyPublicUploadLinkState.update({
      error: 'Include either a year-to-date or quarterly income statement, not both.',
    });
    return;
  }

  if (!hasAtLeastOneQuarterlyDocumentSelected(formValue)) {
    $createQuarterlyPublicUploadLinkState.update({
      error: 'Select at least one document to include on the public page.',
    });
    return;
  }

  if (!hasAtLeastOneQuarterlyRequiredForSubmit(formValue)) {
    $createQuarterlyPublicUploadLinkState.update({
      error: 'Mark at least one included document as required to submit.',
    });
    return;
  }

  const year = getReportingYearFromForm(formValue);
  const quarter = getReportingQuarterFromForm(formValue);
  if (!Number.isFinite(year) || !Number.isFinite(quarter)) {
    $createQuarterlyPublicUploadLinkState.update({
      error: 'Select a reporting year and quarter.',
    });
    return;
  }

  const documentItems = buildDocumentItemsFromQuarterlyForm(formValue);

  try {
    $createQuarterlyPublicUploadLinkState.update({ isCreating: true, error: null });

    const options = buildCustomQuarterlyUploadLinkOptions({
      year,
      quarter,
      documentItems,
      lenderInstructions: formValue.lenderInstructions,
    });

    const response = await createUploadLink(borrowerId, options);
    const data = response?.data ?? response;
    const token = data?.token;

    if (response?.status === 'success' && token) {
      const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
      const publicUrl = `${baseUrl}/upload-financials/${token}`;
      await copyToClipboard(publicUrl);
      $copiedLink.update(true);
      setTimeout(() => $copiedLink.update(false), COPIED_RESET_MS);
      $createQuarterlyPublicUploadLinkState.update({ isCreating: false, error: null });
      $borrowerFinancialsView.update({ activeModalKey: null });
      resetCreateQuarterlyPublicUploadLinkForm();
      successAlert('Quarterly upload link copied to clipboard!', 'toast');
    } else {
      $createQuarterlyPublicUploadLinkState.update({
        error: 'Could not create quarterly upload link.',
        isCreating: false,
      });
      dangerAlert('Could not create quarterly upload link.');
    }
  } catch (error) {
    $createQuarterlyPublicUploadLinkState.update({
      error: error?.message || 'Failed to create quarterly upload link.',
      isCreating: false,
    });
    dangerAlert(error?.message || 'Failed to create quarterly upload link.');
  } finally {
    if ($createQuarterlyPublicUploadLinkState.value.isCreating) {
      $createQuarterlyPublicUploadLinkState.update({ isCreating: false });
    }
  }
};

export { COPIED_RESET_MS };
