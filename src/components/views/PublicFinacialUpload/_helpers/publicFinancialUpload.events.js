import { dangerAlert, successAlert } from '@src/components/global/Alert/_helpers/alert.events';
import { loadImpactQuestionnairePublic, submitImpactQuestionnairePublicForm } from '@src/components/views/PublicImpactQuestionnaire/_helpers/publicImpactQuestionnaire.resolvers';
import {
  $publicImpactQuestionnaireForm,
  $publicImpactQuestionnaireView,
} from '@src/components/views/PublicImpactQuestionnaire/_helpers/publicImpactQuestionnaire.consts';
import {
  submitFinancialsViaToken,
  notifyExtractReadyViaToken,
} from '@src/api/borrowerFinancialUploadLink.api';
import { storage } from '@src/utils/firebase';
import { buildStandardFinancialUploadFileName } from '@src/utils/documents.utils';
import {
  getRequiredPdfSectionsForLink,
  hasPdfStagedForSection,
  mergePriorWorksheetRowsIntoForm,
  validateDebtScheduleWorksheetForPdf,
  parseImpactQuestionnaireTokenFromUrl,
} from './publicFinancialUpload.helpers';
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
import { $debtScheduleWorksheetWrapCellEdit } from '../_components/DebtScheduleWorksheetModal/_helpers/debtScheduleWorksheetModal.consts';

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

    const nonDebtRequired = requiredPdfSections.filter(
      (s) => s.sectionId !== 'debtScheduleWorksheet' && s.sectionId !== 'impactQuestionnaire',
    );
    const missingNonDebtUpload = nonDebtRequired.some((s) => !hasPdfStagedForSection(s.sectionId));
    if (missingNonDebtUpload) {
      $publicFinancialUploadView.update({
        error: 'Please upload all required PDFs before submitting.',
        isSubmitting: false,
      });
      return;
    }

    const needsImpactQuestionnaire = Boolean(linkData?.impactQuestionnaireUrl);
    if (needsImpactQuestionnaire && !$publicFinancialUploadView.value.impactQuestionnairePublicComplete) {
      $publicFinancialUploadView.update({
        error: 'Complete the impact questionnaire before submitting.',
        isSubmitting: false,
      });
      dangerAlert('Please complete the impact questionnaire before submitting.');
      return;
    }

    requiredPdfSections.forEach((section) => {
      if (section.sectionId === 'debtScheduleWorksheet' || section.sectionId === 'impactQuestionnaire') {
        return;
      }
      const uploader = UPLOADER_BY_SECTION[section.sectionId];
      const documentType = SECTION_ID_TO_DOCUMENT_TYPE[section.sectionId] ?? section.sectionId;
      if (!uploader) return;
      const files = uploader.value?.financialDocs ?? [];
      const [file] = files;
      if (!file) return;
      filesToUpload.push({
        fileName: buildStandardFinancialUploadFileName({
          entityName: borrowerName,
          documentType,
          date: periodDate,
          file,
        }),
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
  $debtScheduleWorksheetWrapCellEdit.update({ name: null });
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

/** Opens in-page questionnaire modal (same token as standalone `/impact-questionnaire/:token`). */
export const openImpactQuestionnaireFromPublicUpload = async () => {
  const url = $publicFinancialUploadView.value.linkData?.impactQuestionnaireUrl;
  const token = parseImpactQuestionnaireTokenFromUrl(url);
  if (!token) return;
  $publicFinancialUploadView.update({
    impactQuestionnaireToken: token,
    activeModalKey: 'impactQuestionnaire',
  });
  await loadImpactQuestionnairePublic(token, { suppressDangerAlert: true });
  if ($publicImpactQuestionnaireView.value.payload?.alreadySubmitted) {
    $publicFinancialUploadView.update({ impactQuestionnairePublicComplete: true });
  }
};

export const closeImpactQuestionnaireFromPublicUpload = () => {
  const already = $publicImpactQuestionnaireView.value.payload?.alreadySubmitted === true;
  $publicFinancialUploadView.update({
    activeModalKey: null,
    impactQuestionnaireToken: null,
    ...(already ? { impactQuestionnairePublicComplete: true } : {}),
  });
  $publicImpactQuestionnaireForm.update({
    currentEmployees: '',
    averageMonthlyFte: '',
    averageEmployeeWage: '',
  });
  $publicImpactQuestionnaireView.update({
    isLoading: false,
    error: null,
    payload: null,
    isSubmitting: false,
    submitSuccess: false,
  });
};

export const clearPublicImpactQuestionnaireModalError = () => {
  $publicImpactQuestionnaireView.update({ error: null });
};

export const handleSubmitImpactQuestionnaireFromPublicUpload = async () => {
  const { impactQuestionnaireToken: token } = $publicFinancialUploadView.value;
  if (!token) return;
  await submitImpactQuestionnairePublicForm(token, { suppressDangerAlert: true });
  if ($publicImpactQuestionnaireView.value.submitSuccess) {
    successAlert('Impact questionnaire saved.', 'toast');
    $publicImpactQuestionnaireForm.update({
      currentEmployees: '',
      averageMonthlyFte: '',
      averageEmployeeWage: '',
    });
    $publicImpactQuestionnaireView.update({
      isLoading: false,
      error: null,
      payload: null,
      isSubmitting: false,
      submitSuccess: false,
    });
    $publicFinancialUploadView.update({
      activeModalKey: null,
      impactQuestionnaireToken: null,
      impactQuestionnairePublicComplete: true,
    });
  }
};
