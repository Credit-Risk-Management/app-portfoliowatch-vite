import { $borrowerFinancialsView, $borrowerFinancialsForm, $user } from '@src/signals';
import borrowerFinancialsApi from '@src/api/borrowerFinancials.api';
import { successAlert } from '@src/components/global/Alert/_helpers/alert.events';
import generateMockFinancialData from '../_helpers/financials.helpers';

/**
 * Handles closing the submit financials modal and resetting all state
 * @param {Object} $financialDocsUploader - Signal for financial documents
 * @param {Object} $modalState - Signal for modal state
 * @param {string} pdfUrl - Current PDF URL to revoke
 */
export const handleClose = ($financialDocsUploader, $modalState, pdfUrl) => {
  $borrowerFinancialsView.update({
    showSubmitModal: false,
    isEditMode: false,
    editingFinancialId: null,
  });
  $borrowerFinancialsForm.reset();
  $financialDocsUploader.update({ financialDocs: [] });

  // Revoke all document URLs
  const { documentsByType } = $modalState.value;
  Object.values(documentsByType).forEach((docs) => {
    docs.forEach((doc) => {
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
 * Sets the active tab in the form
 * @param {string} tab - The tab to set as active
 */
export const setActiveTab = (tab) => {
  $borrowerFinancialsForm.update({ activeTab: tab });
};

/**
 * Handles file upload and OCR processing
 * @param {Object} $financialDocsUploader - Signal for financial documents
 * @param {Object} $modalState - Signal for modal state
 * @param {boolean} ocrApplied - Whether OCR has already been applied
 * @param {string} pdfUrl - Current PDF URL
 */
export const handleFileUpload = ($financialDocsUploader, $modalState, ocrApplied, pdfUrl) => {
  // Get files from the signal
  const files = $financialDocsUploader.value.financialDocs || [];

  if (!files.length) return;

  const [file] = files;
  const { documentType } = $borrowerFinancialsForm.value;

  // Create a document object with preview URL
  const newDoc = {
    id: `temp-${Date.now()}`,
    file,
    fileName: file.name,
    fileSize: file.size,
    mimeType: file.type,
    previewUrl: URL.createObjectURL(file),
    documentType,
    uploadedAt: new Date(),
  };

  // Add to documents by type
  const { documentsByType } = $modalState.value;
  const updatedDocs = {
    ...documentsByType,
    [documentType]: [...documentsByType[documentType], newDoc],
  };

  // Update the PDF URL to show the newly uploaded document
  if (pdfUrl) {
    URL.revokeObjectURL(pdfUrl);
  }

  $modalState.update({
    pdfUrl: newDoc.previewUrl,
    documentsByType: updatedDocs,
    currentDocumentIndex: {
      ...$modalState.value.currentDocumentIndex,
      [documentType]: updatedDocs[documentType].length - 1,
    },
  });

  // Mock OCR: When files are uploaded, auto-populate the form with mock data
  // Generate data specific to the document type and filename being uploaded
  setTimeout(() => {
    const mockData = generateMockFinancialData(documentType, file.name);

    // Log everything we "extracted" from the PDF for debugging/POC visibility
    // In a real implementation this would be the raw OCR/financial extraction payload
    console.log('Uploaded files for OCR:', files);
    console.log(`Uploaded filename: ${file.name}`);
    console.log(`Mock extracted financial data from ${documentType}:`, mockData);

    $borrowerFinancialsForm.update(mockData);
    $modalState.update({
      ocrApplied: true,
      refreshKey: $modalState.value.refreshKey + 1,
    });
  }, 500);

  // Clear the uploader
  $financialDocsUploader.update({ financialDocs: [] });
};

/**
 * Removes a document from the current document type
 * @param {Object} $modalState - Signal for modal state
 * @param {string} documentId - The ID of the document to remove
 */
export const handleRemoveDocument = ($modalState, documentId) => {
  const { documentType } = $borrowerFinancialsForm.value;
  const { documentsByType, currentDocumentIndex } = $modalState.value;

  const docs = documentsByType[documentType];
  const docIndex = docs.findIndex((doc) => doc.id === documentId);

  if (docIndex === -1) return;

  // Revoke the preview URL
  const doc = docs[docIndex];
  if (doc.previewUrl) {
    URL.revokeObjectURL(doc.previewUrl);
  }

  // Remove the document
  const updatedDocs = docs.filter((_, i) => i !== docIndex);

  // Update current index if needed
  let newIndex = currentDocumentIndex[documentType];
  if (newIndex >= updatedDocs.length) {
    newIndex = Math.max(0, updatedDocs.length - 1);
  }

  // Update PDF URL to show the new current document or null
  const newPdfUrl = updatedDocs[newIndex]?.previewUrl || null;
  if ($modalState.value.pdfUrl && $modalState.value.pdfUrl !== newPdfUrl) {
    // Don't revoke here as it's managed in the documentsByType
  }

  $modalState.update({
    documentsByType: {
      ...documentsByType,
      [documentType]: updatedDocs,
    },
    currentDocumentIndex: {
      ...currentDocumentIndex,
      [documentType]: newIndex,
    },
    pdfUrl: newPdfUrl,
  });
};

/**
 * Switches to a different document in the current type
 * @param {Object} $modalState - Signal for modal state
 * @param {number} index - The index of the document to switch to
 */
export const handleSwitchDocument = ($modalState, index) => {
  const { documentType } = $borrowerFinancialsForm.value;
  const { documentsByType, currentDocumentIndex } = $modalState.value;

  const docs = documentsByType[documentType];
  if (index < 0 || index >= docs.length) return;

  $modalState.update({
    currentDocumentIndex: {
      ...currentDocumentIndex,
      [documentType]: index,
    },
    pdfUrl: docs[index].previewUrl,
  });
};

/**
 * Handles form submission and API call
 * @param {Object} $modalState - Signal for modal state
 * @param {Function} onCloseCallback - Callback to execute after successful submission
 * @returns {Promise<void>}
 */
export const handleSubmit = async ($modalState, onCloseCallback) => {
  try {
    $modalState.update({
      isSubmitting: true,
      error: null,
    });

    const financialData = {
      borrowerId: $borrowerFinancialsView.value.currentBorrowerId,
      asOfDate: $borrowerFinancialsForm.value.asOfDate,
      accountabilityScore: $borrowerFinancialsForm.value.accountabilityScore || null,
      // Income Statement
      grossRevenue: $borrowerFinancialsForm.value.grossRevenue || null,
      netIncome: $borrowerFinancialsForm.value.netIncome || null,
      ebitda: $borrowerFinancialsForm.value.ebitda || null,
      rentalExpenses: $borrowerFinancialsForm.value.rentalExpenses || null,
      profitMargin: $borrowerFinancialsForm.value.profitMargin || null,
      // Balance Sheet
      totalCurrentAssets: $borrowerFinancialsForm.value.totalCurrentAssets || null,
      totalCurrentLiabilities: $borrowerFinancialsForm.value.totalCurrentLiabilities || null,
      cash: $borrowerFinancialsForm.value.cash || null,
      cashEquivalents: $borrowerFinancialsForm.value.cashEquivalents || null,
      equity: $borrowerFinancialsForm.value.equity || null,
      accountsReceivable: $borrowerFinancialsForm.value.accountsReceivable || null,
      accountsPayable: $borrowerFinancialsForm.value.accountsPayable || null,
      inventory: $borrowerFinancialsForm.value.inventory || null,
      // Debt Service (actual value, not covenant)
      debtService: $borrowerFinancialsForm.value.debtService || null,
      // Current Ratio (actual value, not covenant)
      currentRatio: $borrowerFinancialsForm.value.currentRatio || null,
      // Liquidity (actual values, not covenants)
      liquidity: $borrowerFinancialsForm.value.liquidity || null,
      liquidityRatio: $borrowerFinancialsForm.value.liquidityRatio || null,
      retainedEarnings: $borrowerFinancialsForm.value.retainedEarnings || null,
      notes: $borrowerFinancialsForm.value.notes || null,
      submittedBy: $user.value.email || $user.value.name || 'Unknown User',
      organizationId: $user.value.organizationId,
      documentIds: [], // In a real implementation, this would include uploaded document IDs
      // TODO: Add document upload implementation - for now we're tracking in documentsByType
    };

    let response;
    const { isEditMode } = $borrowerFinancialsView.value;
    const editingId = $borrowerFinancialsView.value.editingFinancialId;

    if (isEditMode && editingId) {
      // Update existing record
      response = await borrowerFinancialsApi.update(editingId, financialData);
    } else {
      // Create new record
      response = await borrowerFinancialsApi.create(financialData);
    }

    if (response.success) {
      // Trigger a refresh of the financials list
      $borrowerFinancialsView.update({
        refreshTrigger: $borrowerFinancialsView.value.refreshTrigger + 1,
      });
      
      // Close the submit modal first
      onCloseCallback();
      
      // Show the watch score results modal with the updated loans
      const updatedLoans = response.data?.updatedLoans || [];
      $modalState.update({
        showWatchScoreResults: true,
        updatedLoans,
      });
      
      const message = isEditMode
        ? 'Financial data updated successfully!'
        : 'Submitted new financials!';
      successAlert(message, 'toast');
    } else {
      $modalState.update({ error: response.error || 'Failed to submit financial data' });
    }
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Error submitting financial data:', err);
    $modalState.update({ error: err.message || 'An error occurred while submitting financial data' });
  } finally {
    $modalState.update({ isSubmitting: false });
  }
};

/**
 * Opens the modal in edit mode with existing financial data
 * @param {Object} financial - The financial record to edit
 * @returns {Promise<void>}
 */
export const handleOpenEditMode = async (financial) => {
  // Format the asOfDate to YYYY-MM-DD for the date input
  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  };

  // Populate the form with the existing financial data
  $borrowerFinancialsForm.update({
    activeTab: 'documents',
    documentType: 'balanceSheet',
    asOfDate: formatDateForInput(financial.asOfDate),
    accountabilityScore: financial.accountabilityScore?.toString() || '',
    // Income Statement fields
    grossRevenue: financial.grossRevenue?.toString() || '',
    netIncome: financial.netIncome?.toString() || '',
    ebitda: financial.ebitda?.toString() || '',
    rentalExpenses: financial.rentalExpenses?.toString() || '',
    profitMargin: financial.profitMargin?.toString() || '',
    // Balance Sheet fields
    totalCurrentAssets: financial.totalCurrentAssets?.toString() || '',
    totalCurrentLiabilities: financial.totalCurrentLiabilities?.toString() || '',
    cash: financial.cash?.toString() || '',
    cashEquivalents: financial.cashEquivalents?.toString() || '',
    equity: financial.equity?.toString() || '',
    accountsReceivable: financial.accountsReceivable?.toString() || '',
    accountsPayable: financial.accountsPayable?.toString() || '',
    inventory: financial.inventory?.toString() || '',
    // Debt Service fields (actual value, covenant is on Loan)
    debtService: financial.debtService?.toString() || '',
    // Current Ratio fields (actual value, covenant is on Loan)
    currentRatio: financial.currentRatio?.toString() || '',
    // Liquidity fields (actual values, covenants are on Loan)
    liquidity: financial.liquidity?.toString() || '',
    liquidityRatio: financial.liquidityRatio?.toString() || '',
    retainedEarnings: financial.retainedEarnings?.toString() || '',
    // Trigger fields
    changeInCash: financial.changeInCash?.toString() || '',
    changeInEbitda: financial.changeInEbitda?.toString() || '',
    changeInAccountsReceivable: financial.changeInAccountsReceivable?.toString() || '',
    changeInProfitMargin: financial.changeInProfitMargin?.toString() || '',
    changeInInventory: financial.changeInInventory?.toString() || '',
    changeInAccountsPayable: financial.changeInAccountsPayable?.toString() || '',
    // Other
    notes: financial.notes || '',
    documentIds: financial.documentIds || [],
  });

  // Open the modal in edit mode
  $borrowerFinancialsView.update({
    showSubmitModal: true,
    isEditMode: true,
    editingFinancialId: financial.id,
    currentBorrowerId: financial.borrowerId,
  });
};
