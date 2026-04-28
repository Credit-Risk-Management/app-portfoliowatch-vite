import { dangerAlert, successAlert } from '@src/components/global/Alert/_helpers/alert.events';
import {
  submitFinancialsViaToken,
  notifyExtractReadyViaToken,
  getPublicPriorDebtScheduleDownload,
} from '@src/api/borrowerFinancialUploadLink.api';
import { storage } from '@src/utils/firebase';
import {
  getRequiredPdfSectionsForLink,
  hasPdfStagedForSection,
  mergePriorWorksheetRowsIntoForm,
  validateDebtScheduleWorksheetForPdf,
} from './publicFinancialUpload.helpers';
import { openDebtScheduleTemplateWithSummedTotals } from './publicFinancialUpload.resolvers';
import {
  $publicFinancialForm,
  $debtScheduleWorksheetForm,
  createDefaultDebtScheduleWorksheetForm,
  $publicIncomeStatementUploader,
  $publicBalanceSheetUploader,
  $publicCashFlowUploader,
  $publicOtherFinancialsUploader,
  $publicDebtScheduleUploader,
  $publicFinancialUploadView,
  UPLOADER_BY_SECTION,
  SECTION_ID_TO_DOCUMENT_TYPE,
} from './publicFinancialUpload.consts';

/**
 * Build a locked, system-standard file name: `borrowerName-documentType-YYYY-MM-DD.pdf`
 * e.g. "acme-corp-balanceSheet-2026-04-08.pdf"
 */
const buildFileName = (borrowerName, documentType, date) => {
  const safeName = (borrowerName || 'unknown')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  const dateStr = (date ? new Date(date) : new Date()).toISOString().slice(0, 10);
  return `${safeName}-${documentType}-${dateStr}.pdf`;
};

export const resetAllPublicFinancialUploaders = () => {
  $publicIncomeStatementUploader.update({ financialDocs: [] });
  $publicBalanceSheetUploader.update({ financialDocs: [] });
  $publicCashFlowUploader.update({ financialDocs: [] });
  $publicOtherFinancialsUploader.update({ financialDocs: [] });
  $publicDebtScheduleUploader.update({ financialDocs: [] });
};

/** Clear staged files for one public-upload section (show dropzone again). */
export const clearPublicFinancialSectionFiles = (sectionId) => {
  const uploader = UPLOADER_BY_SECTION[sectionId];
  if (uploader) uploader.update({ financialDocs: [] });
};

/**
 * Submit: create borrower financial + signed upload slots, PUT files to Storage, then notify API to run extraction.
 */
export const handleFileUpload = async () => {
  $publicFinancialUploadView.update({
    isLoading: true,
    isSubmitting: true,
    error: null,
  });

  try {
    const { token } = $publicFinancialUploadView.value;
    if (!token) {
      $publicFinancialUploadView.update({
        error: 'Upload link not ready. Please refresh the page.',
        isSubmitting: false,
      });
      return;
    }
    const filesToUpload = [];
    const fileBlobs = []; // same order as filesToUpload — used for storage PUT
    const { linkData } = $publicFinancialUploadView.value;
    const borrowerName = linkData?.borrower?.name;
    const periodDate = linkData?.reportingPeriodEndDate;
    const requiredPdfSections = getRequiredPdfSectionsForLink(linkData);
    const includeDebtWorksheetJson = requiredPdfSections.some((s) => s.sectionId === 'debtScheduleWorksheet');
    const debtScheduleWorksheet = includeDebtWorksheetJson
      ? { ...$debtScheduleWorksheetForm.value }
      : undefined;

    const nonDebtRequired = requiredPdfSections.filter((s) => s.sectionId !== 'debtScheduleWorksheet');
    const missingNonDebtUpload = nonDebtRequired.some((s) => !hasPdfStagedForSection(s.sectionId));
    if (missingNonDebtUpload) {
      $publicFinancialUploadView.update({
        error: 'Please upload all required PDFs before submitting.',
        isSubmitting: false,
      });
      return;
    }

    requiredPdfSections.forEach((section) => {
      if (section.sectionId === 'debtScheduleWorksheet') {
        return;
      }
      const uploader = UPLOADER_BY_SECTION[section.sectionId];
      const documentType = SECTION_ID_TO_DOCUMENT_TYPE[section.sectionId] ?? section.sectionId;
      if (!uploader) return;
      const files = uploader.value?.financialDocs ?? [];
      const [file] = files;
      if (!file) return;
      filesToUpload.push({
        fileName: buildFileName(borrowerName, documentType, periodDate),
        fileSize: file.size,
        mimeType: file.type,
        contentType: file.type,
        documentType,
      });
      fileBlobs.push(file);
    });

    if (includeDebtWorksheetJson) {
      const { valid, errors } = validateDebtScheduleWorksheetForPdf(debtScheduleWorksheet || {});
      if (!valid) {
        $publicFinancialUploadView.update({
          error: 'Complete the debt schedule worksheet (printed name, title, and at least one debt with balance and payment).',
          isSubmitting: false,
          debtScheduleWorksheetErrors: errors,
        });
        dangerAlert('Please complete the debt schedule worksheet before submitting.');
        return;
      }
    }

    if (filesToUpload.length === 0 && !includeDebtWorksheetJson) {
      $publicFinancialUploadView.update({
        error: 'Nothing to submit. Add the required documents or complete the debt schedule worksheet.',
        isSubmitting: false,
      });
      return;
    }

    const submitResponse = await submitFinancialsViaToken(token, {
      filesToUpload,
      ...(debtScheduleWorksheet ? { debtScheduleWorksheet } : {}),
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
      await notifyExtractReadyViaToken(token, extractTaskId);
    }

    $publicFinancialUploadView.update({ success: true });
    $publicFinancialForm.reset();
    $debtScheduleWorksheetForm.reset();
    resetAllPublicFinancialUploaders();
  } catch (error) {
    const message = error?.message || (typeof error === 'string' ? error : 'Request failed');
    dangerAlert(message);
    $publicFinancialUploadView.update({ error: message });
  } finally {
    $publicFinancialUploadView.update({ isSubmitting: false, isLoading: false });
  }
};

/**
 * Open the borrower's prior debt schedule PDF (new tab) so they can update and re-upload.
 */
export const handleOpenPriorDebtSchedulePdf = async () => {
  const { token } = $publicFinancialUploadView.value;
  if (!token) return;
  $publicFinancialUploadView.update({ priorDebtOpening: true });
  try {
    const res = await getPublicPriorDebtScheduleDownload(token);
    if (res?.status === 'success' && res?.data?.downloadUrl) {
      window.open(res.data.downloadUrl, '_blank', 'noopener,noreferrer');
    } else {
      dangerAlert('Could not open prior debt schedule.');
    }
  } catch (error) {
    dangerAlert(
      error?.message || error?.error || 'Could not open prior debt schedule.',
    );
  } finally {
    $publicFinancialUploadView.update({ priorDebtOpening: false });
  }
};

/** Open debt schedule template: validates worksheet, then sums rows 1–8 into the totals line and opens a fillable tab. */
export const handleOpenDebtScheduleTemplatePdf = () => {
  const form = $debtScheduleWorksheetForm.value;
  const { valid, errors } = validateDebtScheduleWorksheetForPdf(form);
  if (!valid) {
    $publicFinancialUploadView.update({ debtScheduleWorksheetErrors: errors });
    dangerAlert(
      'Enter your printed name and title, and add at least one debt with both current balance and monthly payment.',
    );
    return;
  }
  $publicFinancialUploadView.update({ debtScheduleWorksheetErrors: null });
  openDebtScheduleTemplateWithSummedTotals().catch(() => {});
};

export const setPublicFinancialAttestationAccepted = (accepted) => {
  $publicFinancialUploadView.update({ attestationAccepted: Boolean(accepted) });
};

export const openAttestationModal = () => {
  $publicFinancialUploadView.update({ activeModalKey: 'attestation' });
};

export const closeAttestationModal = () => {
  $publicFinancialUploadView.update({ activeModalKey: null });
};

/**
 * Worksheet form aligned to `Template - Debt Schedule.xlsx`. Prior-period rows come from
 * `linkData.priorDebtScheduleWorksheet` (loaded with GET link); otherwise prefill borrower/period when empty.
 */
export const openDebtScheduleWorksheetModal = () => {
  const { linkData, debtScheduleWorksheetHydratedFromPrior } = $publicFinancialUploadView.value;
  const name = (linkData?.borrower?.name || '').trim();
  const end = linkData?.reportingPeriodEndDate;
  const asOf = end
    ? new Date(end).toISOString().slice(0, 10)
    : '';

  if (linkData?.priorDebtSchedule && !debtScheduleWorksheetHydratedFromPrior) {
    const ws = linkData.priorDebtScheduleWorksheet;
    const rows = Array.isArray(ws?.worksheetRows) ? ws.worksheetRows : [];
    const merged = mergePriorWorksheetRowsIntoForm(
      createDefaultDebtScheduleWorksheetForm(),
      rows,
      { businessName: name, asOfDate: asOf },
    );
    $debtScheduleWorksheetForm.update(merged);
    $publicFinancialUploadView.update({
      activeModalKey: 'debtSchedule',
      debtScheduleWorksheetErrors: null,
      debtScheduleWorksheetHydratedFromPrior: true,
    });
    return;
  }

  const cur = $debtScheduleWorksheetForm.value;
  $debtScheduleWorksheetForm.update({
    ...cur,
    businessName: (cur.businessName && cur.businessName.trim()) ? cur.businessName : name,
    asOfDate: cur.asOfDate || asOf,
  });
  $publicFinancialUploadView.update({ activeModalKey: 'debtSchedule', debtScheduleWorksheetErrors: null });
};

export const closeDebtScheduleWorksheetModal = () => {
  $publicFinancialUploadView.update({
    activeModalKey: null,
    debtScheduleWorksheetErrors: null,
    debtScheduleWorksheetSubmitting: false,
  });
};

/**
 * Validates the worksheet and saves it for submit. The official PDF is generated on the server when you submit financials.
 */
export const handleSubmitDebtScheduleWorksheet = async () => {
  const form = $debtScheduleWorksheetForm.value;
  const { valid, errors } = validateDebtScheduleWorksheetForPdf(form);
  if (!valid) {
    $publicFinancialUploadView.update({ debtScheduleWorksheetErrors: errors });
    dangerAlert(
      'Enter your printed name and title, and add at least one debt with both current balance and monthly payment.',
    );
    return;
  }

  $publicFinancialUploadView.update({
    debtScheduleWorksheetErrors: null,
    debtScheduleWorksheetSubmitting: true,
  });

  try {
    successAlert('Debt schedule saved. Submit financials when your other PDFs are ready.', 'toast');
    closeDebtScheduleWorksheetModal();
  } finally {
    $publicFinancialUploadView.update({ debtScheduleWorksheetSubmitting: false });
  }
};

/** Updates worksheet form fields and clears validation highlights when the user edits. */
export const patchDebtScheduleWorksheetForm = (patch) => {
  if ($publicFinancialUploadView.value.debtScheduleWorksheetErrors) {
    $publicFinancialUploadView.update({ debtScheduleWorksheetErrors: null });
  }
  $debtScheduleWorksheetForm.update({
    ...$debtScheduleWorksheetForm.value,
    ...patch,
  });
};

export const clearError = () => {
  $publicFinancialUploadView.update({ error: null });
};
