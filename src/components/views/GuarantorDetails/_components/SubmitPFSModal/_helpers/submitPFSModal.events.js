import { storage } from '@src/utils/firebase';
import { $submitPFSModalView, $submitPFSModalDetails } from './submitPFSModal.const';
/**
 * Close the modal and reset all state.
 * @param {string} [pdfUrlOrEvent] - Blob URL to revoke; React-Bootstrap may pass a synthetic event from onHide — ignored for revoke in that case.
 */
export const handleClose = async (pdfUrlOrEvent) => {
  const { documentsByType, downloadSensibleUrl, pdfUrl: detailsPdfUrl } = $submitPFSModalDetails.value;
  const pdfUrlToRevoke = typeof pdfUrlOrEvent === 'string' ? pdfUrlOrEvent : detailsPdfUrl;

  // Hide immediately so the modal does not wait on Firebase/async cleanup (matches Submit Financials pattern).
  $submitPFSModalView.update({
    activeModalKey: null,
    editingFinancialId: null,
    isEditMode: false,
    isSubmitting: false,
    isLoading: false,
    isLoadingInputData: false,
    error: null,
  });

  Object.values(documentsByType || {}).forEach((docs) => {
    (docs || []).forEach((doc) => {
      if (doc.previewUrl) {
        URL.revokeObjectURL(doc.previewUrl);
      }
    });
  });

  /** Staging path from initiate-upload / Sensible prep — never delete persisted DB-backed `storagePath` values. */
  const persistedStoragePaths = new Set(
    Object.values(documentsByType || {}).flatMap((docs) => (docs || [])
      .filter((d) => d?.isStored && d?.storagePath)
      .map((d) => d.storagePath)),
  );
  if (
    downloadSensibleUrl
    && typeof downloadSensibleUrl === 'string'
    && !persistedStoragePaths.has(downloadSensibleUrl)
  ) {
    const deleteStorageRef = storage.ref(downloadSensibleUrl);
    await deleteStorageRef.delete().catch(() => { });
  }

  if (pdfUrlToRevoke) {
    URL.revokeObjectURL(pdfUrlToRevoke);
  }

  $submitPFSModalDetails.reset();
};

/**
 * Set the active tab in the form.
 * @param {string} tab - The tab to set as active
 */
export const setActiveTab = (tab) => {
  $submitPFSModalView.update({ documentType: tab });
};
