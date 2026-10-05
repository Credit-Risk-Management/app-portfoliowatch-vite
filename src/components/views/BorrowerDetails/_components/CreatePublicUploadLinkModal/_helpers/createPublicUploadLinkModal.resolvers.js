import { successAlert, dangerAlert } from '@src/components/global/Alert/_helpers/alert.events';
import { createUploadLink } from '@src/api/borrowerFinancialUploadLink.api';
import { buildCustomAnnualUploadLinkOptions } from '@src/constants/financialSubmissionRequirements';
import { $borrowerFinancialsView } from '@src/signals';
import { $copiedAnnualLink } from '@src/components/views/BorrowerDetails/_components/TabContent/BorrowerFinancialsTab/_helpers/borrowerFinancialsTab.consts';
import {
  resetCreatePublicUploadLinkForm,
  $createPublicUploadLinkForm,
  $createPublicUploadLinkState,
  buildDocumentItemsFromForm,
  hasAtLeastOneDocumentSelected,
  hasAtLeastOneRequiredForSubmit,
} from './createPublicUploadLinkModal.consts';

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

  const formValue = $createPublicUploadLinkForm.value;
  const { availableTaxYears } = $createPublicUploadLinkState.value;
  const { taxYearItems, debtSchedule } = buildDocumentItemsFromForm(
    formValue,
    availableTaxYears,
  );

  if (!hasAtLeastOneDocumentSelected(formValue, availableTaxYears)) {
    $createPublicUploadLinkState.update({
      error: 'Select at least one tax year or debt schedule.',
    });
    return;
  }

  if (!hasAtLeastOneRequiredForSubmit(formValue, availableTaxYears)) {
    $createPublicUploadLinkState.update({
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
    $createPublicUploadLinkState.update({ isCreating: true, error: null });

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
      $copiedAnnualLink.update(true);
      setTimeout(() => $copiedAnnualLink.update(false), COPIED_RESET_MS);
      $createPublicUploadLinkState.update({ isCreating: false, error: null });
      $borrowerFinancialsView.update({ activeModalKey: null });
      resetCreatePublicUploadLinkForm();
      successAlert('Public upload link copied to clipboard!', 'toast');
    } else {
      $createPublicUploadLinkState.update({
        error: 'Could not create public upload link.',
        isCreating: false,
      });
      dangerAlert('Could not create public upload link.');
    }
  } catch (error) {
    $createPublicUploadLinkState.update({
      error: error?.message || 'Failed to create public upload link.',
      isCreating: false,
    });
    dangerAlert(error?.message || 'Failed to create public upload link.');
  } finally {
    if ($createPublicUploadLinkState.value.isCreating) {
      $createPublicUploadLinkState.update({ isCreating: false });
    }
  }
};

export { COPIED_RESET_MS };
