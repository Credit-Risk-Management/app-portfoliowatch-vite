import { $borrowerFinancialsView, $borrowerFinancialsForm } from '@src/signals';
import * as consts from './submitFinancialsModal.consts';

/**
 * Close the modal and reset all state.
 * @param {string} pdfUrl - Current PDF URL to revoke
 */
export const handleClose = (pdfUrl) => {
  const { $financialDocsUploader, $modalState } = consts;
  $borrowerFinancialsView.update({
    activeModalKey: null,
    isEditMode: false,
    editingFinancialId: null,
  });
  $borrowerFinancialsForm.reset();
  $financialDocsUploader.update({ financialDocs: [] });

  const { documentsByType } = $modalState.value;
  Object.values(documentsByType || {}).forEach((docs) => {
    (docs || []).forEach((doc) => {
      if (doc.previewUrl) {
        URL.revokeObjectURL(doc.previewUrl);
      }
    });
  });

  if (pdfUrl) {
    URL.revokeObjectURL(pdfUrl);
  }

  $modalState.update({
    ocrApplied: false,
    error: null,
    pdfUrl: null,
    refreshKey: 0,
    previousFinancial: null,
    documentsByType: {
      balanceSheet: [],
      incomeStatement: [],
      debtServiceWorksheet: [],
    },
    currentDocumentIndex: {
      balanceSheet: 0,
      incomeStatement: 0,
      debtServiceWorksheet: 0,
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
