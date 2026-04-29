import { storage } from '@src/utils/firebase';
import { $borrowerFinancialsView, $borrowerFinancialsForm } from '@src/signals';
import * as consts from './submitFinancialsModal.consts';

/**
 * Close the modal and reset all state.
 * @param {string} [pdfUrlOrEvent] - Blob URL to revoke; React-Bootstrap may pass a synthetic event from onHide — ignored for revoke in that case.
 */
const deleteStoragePath = async (path) => {
  if (!path) return;
  const deleteRef = storage.ref(path);
  await deleteRef.delete().catch(() => { });
};

export const handleClose = async (pdfUrlOrEvent) => {
  const { $financialDocsUploader, $modalState } = consts;
  const { documentsByType, downloadSensibleUrl, pdfUrl: statePdfUrl } = $modalState.value;
  const pdfUrlToRevoke = typeof pdfUrlOrEvent === 'string' ? pdfUrlOrEvent : statePdfUrl;

  // Hide immediately so the modal does not wait on Firebase/async cleanup.
  $borrowerFinancialsView.update({
    activeModalKey: null,
    isEditMode: false,
    editingFinancialId: null,
  });

  Object.values(documentsByType || {}).forEach((docs) => {
    (docs || []).forEach((doc) => {
      if (doc.previewUrl) {
        URL.revokeObjectURL(doc.previewUrl);
      }
    });
  });

  /** Only delete GCS objects for ephemeral staging — never `isStored` rows (edit mode loads real paths from the API). */
  const tempPaths = Object.values(documentsByType || {}).flatMap(
    (docs) => (docs || [])
      .filter((doc) => doc?.storagePath && !doc.isStored)
      .map((doc) => doc.storagePath),
  );
  await Promise.all(tempPaths.map((path) => deleteStoragePath(path)));

  if (downloadSensibleUrl) {
    await deleteStoragePath(downloadSensibleUrl);
  }

  if (pdfUrlToRevoke) {
    URL.revokeObjectURL(pdfUrlToRevoke);
  }

  $borrowerFinancialsForm.reset();
  $financialDocsUploader.update({ financialDocs: [] });

  $modalState.update({
    ocrApplied: false,
    isSubmitting: false,
    isLoading: false,
    isLoadingInputData: false,
    error: null,
    pdfUrl: null,
    downloadSensibleUrl: null,
    refreshKey: 0,
    previousFinancial: null,
    isLoadingPrevious: false,
    showWatchScoreResults: false,
    updatedLoans: [],
    documentsByType: {
      balanceSheet: [],
      incomeStatement: [],
      debtScheduleWorksheet: [],
      taxReturn: [],
    },
    currentDocumentIndex: {
      balanceSheet: 0,
      incomeStatement: 0,
      debtScheduleWorksheet: 0,
      taxReturn: 0,
    },
    initialStoredDocumentIdsByType: {
      balanceSheet: [],
      incomeStatement: [],
      debtScheduleWorksheet: [],
      taxReturn: [],
    },
  });
};

/**
 * Set the active tab in the form.
 * @param {string} tab - The tab to set as active
 */
export const setActiveTab = (tab) => {
  $borrowerFinancialsForm.update({ activeTab: tab });
};
