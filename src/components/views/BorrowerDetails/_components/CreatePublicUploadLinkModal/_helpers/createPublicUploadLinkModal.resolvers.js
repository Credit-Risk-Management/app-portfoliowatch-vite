import { successAlert, dangerAlert } from '@src/components/global/Alert/_helpers/alert.events';
import { createUploadLink } from '@src/api/borrowerFinancialUploadLink.api';
import { buildCustomAnnualUploadLinkOptions } from '@src/constants/financialSubmissionRequirements';
import * as consts from './createPublicUploadLinkModal.consts';
import * as events from './createPublicUploadLinkModal.events';

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

export const createAndCopyPublicUploadLink = async (borrowerId) => {
  if (!borrowerId) return;

  const formValue = consts.$createPublicUploadLinkForm.value;
  const { availableTaxYears } = consts.$createPublicUploadLinkState.value;
  const { taxYearItems, debtSchedule } = consts.buildDocumentItemsFromForm(
    formValue,
    availableTaxYears,
  );

  if (!consts.hasAtLeastOneDocumentSelected(formValue, availableTaxYears)) {
    consts.$createPublicUploadLinkState.update({
      error: 'Select at least one tax year or debt schedule.',
    });
    return;
  }

  if (!consts.hasAtLeastOneRequiredForSubmit(formValue, availableTaxYears)) {
    consts.$createPublicUploadLinkState.update({
      error: 'Mark at least one included document as required to submit.',
    });
    return;
  }

  const latestYearSelected = taxYearItems.length > 0
    ? Math.max(...taxYearItems.map((item) => item.taxYear))
    : null;
  const mostRecentAvailableYear = availableTaxYears.length > 0
    ? Math.max(...availableTaxYears)
    : null;
  const includeTaxReturnExtension = Boolean(
    formValue.includeTaxReturnExtension
    && latestYearSelected != null
    && latestYearSelected === mostRecentAvailableYear,
  );

  try {
    consts.$createPublicUploadLinkState.update({ isCreating: true, error: null });

    const options = buildCustomAnnualUploadLinkOptions({
      taxYearItems,
      debtSchedule,
      includeTaxReturnExtension,
      lenderInstructions: formValue.lenderInstructions,
    });

    const response = await createUploadLink(borrowerId, options);
    const data = response?.data ?? response;
    const token = data?.token;

    if (response?.status === 'success' && token) {
      const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
      const publicUrl = `${baseUrl}/upload-financials/${token}`;
      await copyToClipboard(publicUrl);
      consts.$createPublicUploadLinkState.update({ isCreating: false, error: null });
      events.closeCreatePublicUploadLinkModal();
      successAlert('Public upload link copied to clipboard!', 'toast');
    } else {
      consts.$createPublicUploadLinkState.update({
        error: 'Could not create public upload link.',
        isCreating: false,
      });
      dangerAlert('Could not create public upload link.');
    }
  } catch (error) {
    consts.$createPublicUploadLinkState.update({
      error: error?.message || 'Failed to create public upload link.',
      isCreating: false,
    });
    dangerAlert(error?.message || 'Failed to create public upload link.');
  } finally {
    if (consts.$createPublicUploadLinkState.value.isCreating) {
      consts.$createPublicUploadLinkState.update({ isCreating: false });
    }
  }
};

export { COPIED_RESET_MS };
