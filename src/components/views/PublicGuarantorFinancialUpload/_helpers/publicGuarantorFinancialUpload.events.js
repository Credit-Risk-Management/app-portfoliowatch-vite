import { dangerAlert, successAlert } from '@src/components/global/Alert/_helpers/alert.events';
import {
  submitGuarantorFinancialsViaToken,
  getGuarantorPublicPriorDebtScheduleDownload,
  notifyGuarantorExtractReadyViaToken,
} from '@src/api/guarantorFinancialUploadLink.api';
import { storage } from '@src/utils/firebase';
import { buildStandardFinancialUploadFileName } from '@src/utils/documents.utils';
import {
  $gPubPersonalTax,
  $gPubPfs,
  $gPubBusinessTax,
  $gPubDebtSchedule,
  $publicGuarantorUploadView,
  PFS_TEMPLATE_PDF_URL,
} from './publicGuarantorFinancialUpload.consts';
import { $pfsWorksheetForm } from '../_components/PfsWorksheetModal/_helpers/pfsWorksheetModal.consts';
import { validatePfsWorksheetForSubmit } from '../_components/PfsWorksheetModal/_helpers/pfsWorksheetModal.helpers';
import { applyPfsWorksheetRollup } from '../_components/PfsWorksheetModal/_helpers/pfsWorksheetRollup.helpers';
import {
  getBlockingDocumentKeysForGuarantorLink,
  getRequiredPdfSectionsForGuarantorLink,
  getGuarantorUploaderForDocKey,
  isGuarantorSectionReadyForSubmit,
} from './publicGuarantorFinancialUpload.helpers';
import { fetchGuarantorUploadLinkData } from './publicGuarantorFinancialUpload.resolvers';

const resetAllGuarantorUploaders = () => {
  $gPubPersonalTax.update({ financialDocs: [] });
  $gPubPfs.update({ financialDocs: [] });
  $gPubBusinessTax.update({ financialDocs: [] });
  $gPubDebtSchedule.update({ financialDocs: [] });
};

export const clearGuarantorSectionFiles = (apiDocumentKey) => {
  const uploader = getGuarantorUploaderForDocKey(apiDocumentKey);
  if (uploader) uploader.update({ financialDocs: [] });
};

export const handleGuarantorFileUpload = async () => {
  $publicGuarantorUploadView.update({ isLoading: true, isSubmitting: true, error: null });
  try {
    const { token } = $publicGuarantorUploadView.value;
    if (!token) {
      $publicGuarantorUploadView.update({
        error: 'Upload link not ready. Please refresh the page.',
        isSubmitting: false,
      });
      return;
    }
    const { linkData } = $publicGuarantorUploadView.value;
    const guarantorName = linkData?.guarantor?.name;
    const periodDate = linkData?.reportingPeriodEndDate;
    const requiredPdfSections = getRequiredPdfSectionsForGuarantorLink(linkData);
    const blockingKeys = new Set(getBlockingDocumentKeysForGuarantorLink(linkData));
    const filesToUpload = [];
    const fileBlobs = [];
    const rolledPfsForm = applyPfsWorksheetRollup($pfsWorksheetForm.value || {});
    const pfsWorksheet = validatePfsWorksheetForSubmit(rolledPfsForm).valid
      ? { ...rolledPfsForm }
      : undefined;

    requiredPdfSections.forEach(({ apiDocumentKey }) => {
      if (apiDocumentKey === 'personalFinancialStatement' && pfsWorksheet) {
        return;
      }
      const uploader = getGuarantorUploaderForDocKey(apiDocumentKey);
      if (!uploader) return;
      const files = uploader.value?.financialDocs ?? [];
      const [file] = files;
      if (!file) return;
      filesToUpload.push({
        fileName: buildStandardFinancialUploadFileName({
          entityName: guarantorName,
          documentType: apiDocumentKey,
          date: periodDate,
          file,
        }),
        fileSize: file.size,
        mimeType: file.type,
        contentType: file.type,
        documentType: apiDocumentKey,
      });
      fileBlobs.push(file);
    });

    const missingBlocking = [...blockingKeys].filter(
      (key) => !isGuarantorSectionReadyForSubmit(key),
    );
    if (missingBlocking.length > 0) {
      $publicGuarantorUploadView.update({
        error: 'Please upload all required PDFs before submitting.',
        isSubmitting: false,
      });
      return;
    }

    if (filesToUpload.length === 0 && !pfsWorksheet) {
      $publicGuarantorUploadView.update({
        error: 'Please upload at least one document or complete the PFS worksheet before submitting.',
        isSubmitting: false,
      });
      return;
    }

    const submitResponse = await submitGuarantorFinancialsViaToken(token, {
      filesToUpload,
      ...(pfsWorksheet ? { pfsWorksheet } : {}),
    });
    const uploads = submitResponse?.data?.uploads ?? [];
    const extractTaskId = submitResponse?.data?.extractTask?.id;

    await Promise.all(
      uploads.map(async (slot, i) => {
        const file = fileBlobs[i];
        const storageRef = storage.ref(slot.storagePath);
        await storageRef.put(file, { contentType: file.type });
      }),
    );

    if (extractTaskId) {
      await notifyGuarantorExtractReadyViaToken(token, extractTaskId);
    }

    await fetchGuarantorUploadLinkData(token);
    const packageComplete = $publicGuarantorUploadView.value.linkData?.packageComplete;
    if (packageComplete) {
      $publicGuarantorUploadView.update({ success: true, partialSuccess: false });
    } else {
      $publicGuarantorUploadView.update({ partialSuccess: true, success: false });
      successAlert(
        'Documents received. You can return to this link later to upload any remaining items.',
        'toast',
      );
    }
    resetAllGuarantorUploaders();
    $pfsWorksheetForm.reset();
  } catch (error) {
    const message = error?.message || (typeof error === 'string' ? error : 'Request failed');
    dangerAlert(message);
    $publicGuarantorUploadView.update({ error: message });
  } finally {
    $publicGuarantorUploadView.update({ isSubmitting: false, isLoading: false });
  }
};

export const handleOpenGuarantorPriorDebtSchedulePdf = async () => {
  const { token } = $publicGuarantorUploadView.value;
  if (!token) return;
  $publicGuarantorUploadView.update({ priorDebtOpening: true });
  try {
    const res = await getGuarantorPublicPriorDebtScheduleDownload(token);
    const url = res?.data?.downloadUrl;
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    } else {
      dangerAlert('Could not open prior debt schedule.');
    }
  } catch (error) {
    dangerAlert(error?.message || 'Could not open prior debt schedule.');
  } finally {
    $publicGuarantorUploadView.update({ priorDebtOpening: false });
  }
};

export const handleOpenDebtTemplatePdf = () => {
  window.open(PFS_TEMPLATE_PDF_URL, '_blank', 'noopener,noreferrer');
};

export const handleOpenPfsTemplatePdf = () => {
  window.open(PFS_TEMPLATE_PDF_URL, '_blank', 'noopener,noreferrer');
};

export const openGuarantorAttestationModal = () => {
  $publicGuarantorUploadView.update({ activeModalKey: 'attestation' });
};

export const closeGuarantorAttestationModal = () => {
  $publicGuarantorUploadView.update({ activeModalKey: null });
};

export const clearGuarantorError = () => {
  $publicGuarantorUploadView.update({ error: null });
};
