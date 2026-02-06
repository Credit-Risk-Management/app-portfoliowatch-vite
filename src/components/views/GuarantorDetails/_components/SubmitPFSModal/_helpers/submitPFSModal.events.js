import { storage } from '@src/utils/firebase';
import { $submitPFSModalView, $submitPFSModalDetails } from './submitPFSModal.const';
/**
 * Close the modal and reset all state.
 * @param {string} pdfUrl - Current PDF URL to revoke
 */
export const handleClose = async (pdfUrl) => {
  const { documentsByType } = $submitPFSModalDetails.value;
  Object.values(documentsByType || {}).forEach((docs) => {
    (docs || []).forEach((doc) => {
      if (doc.previewUrl) {
        URL.revokeObjectURL(doc.previewUrl);
      }
    });
  });

  if ($submitPFSModalDetails.value.downloadSensibleUrl) {
    const deleteStorageRef = storage.ref($submitPFSModalDetails.value.downloadSensibleUrl);
    await deleteStorageRef.delete().catch((error) => {
      console.error('Error deleting storage ref:', error);
    });
  }

  if (pdfUrl) {
    URL.revokeObjectURL(pdfUrl);
  }

  $submitPFSModalView.reset();
  $submitPFSModalDetails.reset();
};

/**
 * Set the active tab in the form.
 * @param {string} tab - The tab to set as active
 */
export const setActiveTab = (tab) => {
  $submitPFSModalView.update({ documentType: tab });
};
