import { dangerAlert } from '@src/components/global/Alert/_helpers/alert.events';
import { submitGuarantorFinancialsViaToken, getGuarantorPublicPriorDebtScheduleDownload } from '@src/api/guarantorFinancialUploadLink.api';
import { storage } from '@src/utils/firebase';
import {
  $gPubPersonalTax,
  $gPubPfs,
  $gPubBusinessTax,
  $gPubDebtSchedule,
  $publicGuarantorUploadView,
  DEBT_SCHEDULE_TEMPLATE_PDF_URL,
  PFS_TEMPLATE_PDF_URL,
} from './publicGuarantorFinancialUpload.consts';
import {
  getRequiredPdfSectionsForGuarantorLink,
  getGuarantorUploaderForDocKey,
} from './publicGuarantorFinancialUpload.helpers';

const resetAllGuarantorUploaders = () => {
  $gPubPersonalTax.update({ financialDocs: [] });
  $gPubPfs.update({ financialDocs: [] });
  $gPubBusinessTax.update({ financialDocs: [] });
  $gPubDebtSchedule.update({ financialDocs: [] });
};

const buildFileName = (guarantorName, documentType, date) => {
  const safeName = (guarantorName || 'unknown')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  const dateStr = (date ? new Date(date) : new Date()).toISOString().slice(0, 10);
  return `${safeName}-${documentType}-${dateStr}.pdf`;
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
    const filesToUpload = [];
    const fileBlobs = [];
    requiredPdfSections.forEach(({ apiDocumentKey }) => {
      const uploader = getGuarantorUploaderForDocKey(apiDocumentKey);
      if (!uploader) return;
      const files = uploader.value?.financialDocs ?? [];
      const [file] = files;
      if (!file) return;
      filesToUpload.push({
        fileName: buildFileName(guarantorName, apiDocumentKey, periodDate),
        fileSize: file.size,
        mimeType: file.type,
        contentType: file.type,
        documentType: apiDocumentKey,
      });
      fileBlobs.push(file);
    });

    if (filesToUpload.length === 0) {
      $publicGuarantorUploadView.update({
        error: 'Please upload the required PDFs before submitting.',
        isSubmitting: false,
      });
      return;
    }

    const submitResponse = await submitGuarantorFinancialsViaToken(token, { filesToUpload });
    const uploads = submitResponse?.data?.uploads ?? [];

    await Promise.all(
      uploads.map(async (slot, i) => {
        const file = fileBlobs[i];
        const storageRef = storage.ref(slot.storagePath);
        await storageRef.put(file, { contentType: file.type });
      }),
    );

    $publicGuarantorUploadView.update({ success: true });
    resetAllGuarantorUploaders();
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
  window.open(DEBT_SCHEDULE_TEMPLATE_PDF_URL, '_blank', 'noopener,noreferrer');
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
