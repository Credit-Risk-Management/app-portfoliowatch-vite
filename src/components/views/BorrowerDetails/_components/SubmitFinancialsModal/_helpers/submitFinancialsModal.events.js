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

const emptyModalStateFields = () => ({
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
    incomeStatementQuarterly: [],
    incomeStatementYtd: [],
    debtScheduleWorksheet: [],
    taxReturn: [],
  },
  currentDocumentIndex: {
    balanceSheet: 0,
    incomeStatementQuarterly: 0,
    incomeStatementYtd: 0,
    debtScheduleWorksheet: 0,
    taxReturn: 0,
  },
  initialStoredDocumentIdsByType: {
    balanceSheet: [],
    incomeStatementQuarterly: [],
    incomeStatementYtd: [],
    debtScheduleWorksheet: [],
    taxReturn: [],
  },
});

/** Hide the modal immediately (sync). Safe to call multiple times. */
export const hideSubmitFinancialsModal = () => {
  $borrowerFinancialsView.update({
    activeModalKey: null,
    isEditMode: false,
    editingFinancialId: null,
  });
};

/**
 * Synchronous close + UI reset (matches Cancel/X). Updates every signal the modal reads
 * so React re-renders and Bootstrap `show` becomes false.
 */
export const resetSubmitFinancialsModalSync = (pdfUrlOrEvent) => {
  const { $financialDocsUploader, $modalState } = consts;
  const { documentsByType, downloadSensibleUrl, pdfUrl: statePdfUrl } = $modalState.value;
  const pdfUrlToRevoke = typeof pdfUrlOrEvent === 'string' ? pdfUrlOrEvent : statePdfUrl;

  hideSubmitFinancialsModal();

  Object.values(documentsByType || {}).forEach((docs) => {
    (docs || []).forEach((doc) => {
      if (doc.previewUrl) {
        URL.revokeObjectURL(doc.previewUrl);
      }
    });
  });

  if (pdfUrlToRevoke) {
    URL.revokeObjectURL(pdfUrlToRevoke);
  }

  $borrowerFinancialsForm.reset();
  $financialDocsUploader.update({ financialDocs: [] });
  $modalState.update(emptyModalStateFields());

  return { documentsByType, downloadSensibleUrl };
};

/** Firebase cleanup for staged temp paths — run in background after sync reset. */
export const cleanupSubmitFinancialsModalStorage = async ({ documentsByType, downloadSensibleUrl } = {}) => {
  const tempPaths = Object.values(documentsByType || {}).flatMap(
    (docs) => (docs || [])
      .filter((doc) => doc?.storagePath && !doc.isStored)
      .map((doc) => doc.storagePath),
  );
  await Promise.all(tempPaths.map((path) => deleteStoragePath(path)));

  if (downloadSensibleUrl) {
    await deleteStoragePath(downloadSensibleUrl);
  }
};

export const handleClose = async (pdfUrlOrEvent) => {
  const cleanupContext = resetSubmitFinancialsModalSync(pdfUrlOrEvent);
  await cleanupSubmitFinancialsModalStorage(cleanupContext);
};

/**
 * Set the active tab in the form.
 * @param {string} tab - The tab to set as active
 */
export const setActiveTab = (tab) => {
  $borrowerFinancialsForm.update({ activeTab: tab });
};
