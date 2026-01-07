import { $borrowerFinancialsView, $borrowerFinancialsForm, $user } from '@src/signals';
import borrowerFinancialsApi from '@src/api/borrowerFinancials.api';
import { successAlert, dangerAlert } from '@src/components/global/Alert/_helpers/alert.events';
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

    // Validate required fields
    const borrowerId = $borrowerFinancialsView.value.currentBorrowerId;
    const asOfDate = $borrowerFinancialsForm.value.asOfDate;
    const organizationId = $user.value.organizationId;

    if (!borrowerId) {
      $modalState.update({ 
        error: 'Borrower ID is required. Please select a borrower.',
        isSubmitting: false,
      });
      return;
    }

    if (!asOfDate) {
      $modalState.update({ 
        error: 'As of Date is required. Please select a date.',
        isSubmitting: false,
      });
      return;
    }

    if (!organizationId) {
      $modalState.update({ 
        error: 'Organization ID is required. Please ensure you are logged in.',
        isSubmitting: false,
      });
      return;
    }

    // Helper to convert string values to numbers (or null if empty)
    const toNumberOrNull = (value) => {
      if (!value || value === '' || value === null || value === undefined) return null;
      const num = typeof value === 'string' ? parseFloat(value.replace(/[^0-9.-]/g, '')) : Number(value);
      return Number.isNaN(num) ? null : num;
    };

    const financialData = {
      borrowerId,
      asOfDate,
      accountabilityScore: toNumberOrNull($borrowerFinancialsForm.value.accountabilityScore),
      // Income Statement
      grossRevenue: toNumberOrNull($borrowerFinancialsForm.value.grossRevenue),
      netIncome: toNumberOrNull($borrowerFinancialsForm.value.netIncome),
      ebitda: toNumberOrNull($borrowerFinancialsForm.value.ebitda),
      rentalExpenses: toNumberOrNull($borrowerFinancialsForm.value.rentalExpenses),
      profitMargin: toNumberOrNull($borrowerFinancialsForm.value.profitMargin),
      // Balance Sheet
      totalCurrentAssets: toNumberOrNull($borrowerFinancialsForm.value.totalCurrentAssets),
      totalCurrentLiabilities: toNumberOrNull($borrowerFinancialsForm.value.totalCurrentLiabilities),
      cash: toNumberOrNull($borrowerFinancialsForm.value.cash),
      cashEquivalents: toNumberOrNull($borrowerFinancialsForm.value.cashEquivalents),
      equity: toNumberOrNull($borrowerFinancialsForm.value.equity),
      accountsReceivable: toNumberOrNull($borrowerFinancialsForm.value.accountsReceivable),
      accountsPayable: toNumberOrNull($borrowerFinancialsForm.value.accountsPayable),
      inventory: toNumberOrNull($borrowerFinancialsForm.value.inventory),
      // Debt Service (actual value, not covenant)
      debtService: toNumberOrNull($borrowerFinancialsForm.value.debtService),
      // Current Ratio (actual value, not covenant)
      currentRatio: toNumberOrNull($borrowerFinancialsForm.value.currentRatio),
      // Liquidity (actual values, not covenants)
      liquidity: toNumberOrNull($borrowerFinancialsForm.value.liquidity),
      liquidityRatio: toNumberOrNull($borrowerFinancialsForm.value.liquidityRatio),
      retainedEarnings: toNumberOrNull($borrowerFinancialsForm.value.retainedEarnings),
      notes: $borrowerFinancialsForm.value.notes || null,
      submittedBy: $user.value.email || $user.value.name || 'Unknown User',
      organizationId,
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


    // API returns { success: true, data: ... } or { success: false, error: ... }
    if (response && response.success) {
      // Extract financial ID - response.data might be the financial object directly or wrapped
      const financialId = response.data?.id || response.data?.data?.id || editingId;
      
      
      // Save documents to localStorage for persistence
      if (financialId && $modalState.value.documentsByType) {
        const hasDocuments = Object.values($modalState.value.documentsByType).some(
          (docs) => docs && docs.length > 0
        );
        if (hasDocuments) {
          saveDocumentsToStorage(financialId, $modalState.value.documentsByType);
        }
      }

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
        // API returned { success: false, error: ... }
        const errorMessage = response?.error || response?.message || 'Failed to submit financial data';
        $modalState.update({ error: errorMessage });
      }
  } catch (err) {
    // Handle different error formats
    let errorMessage = 'An error occurred while submitting financial data';
    
    if (err?.error) {
      // API returned { success: false, error: ... } and was rejected
      errorMessage = err.error;
    } else if (err?.response?.data?.error) {
      // Axios error with response data
      errorMessage = err.response.data.error;
    } else if (err?.response?.data?.message) {
      errorMessage = err.response.data.message;
    } else if (err?.message) {
      errorMessage = err.message;
    }
    
    $modalState.update({ error: errorMessage });
  } finally {
    $modalState.update({ isSubmitting: false });
  }
};

/**
 * Loads documents from localStorage for a financial record
 * @param {string} financialId - The financial record ID
 * @returns {Object} - Documents organized by type
 */
const loadDocumentsFromStorage = (financialId) => {
  try {
    const storageKey = `borrowerFinancials_documents_${financialId}`;
    const stored = localStorage.getItem(storageKey);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    // Error loading documents from storage
  }
  return {
    balanceSheet: [],
    incomeStatement: [],
    debtServiceWorksheet: [],
  };
};

/**
 * Saves documents to localStorage for a financial record
 * @param {string} financialId - The financial record ID
 * @param {Object} documentsByType - Documents organized by type
 */
const saveDocumentsToStorage = (financialId, documentsByType) => {
  try {
    const storageKey = `borrowerFinancials_documents_${financialId}`;
    // Only save metadata, not File objects (they can't be serialized)
    const serializableDocs = {};
    Object.keys(documentsByType).forEach((type) => {
      serializableDocs[type] = documentsByType[type].map((doc) => ({
        id: doc.id,
        fileName: doc.fileName,
        fileSize: doc.fileSize,
        mimeType: doc.mimeType,
        documentType: doc.documentType,
        uploadedAt: doc.uploadedAt,
        storageUrl: doc.storageUrl,
        // Don't save File objects or previewUrl (they're temporary)
      }));
    });
    localStorage.setItem(storageKey, JSON.stringify(serializableDocs));
  } catch (error) {
    // Error saving documents to storage
  }
};

/**
 * Opens the modal in edit mode with existing financial data
 * @param {Object} financial - The financial record to edit
 * @param {Object} $modalState - Signal for modal state
 * @returns {Promise<void>}
 */
export const handleOpenEditMode = async (financial, $modalState) => {
  // Format the asOfDate to YYYY-MM-DD for the date input
  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  };

  // Load documents from storage first
  const storedDocuments = loadDocumentsFromStorage(financial.id);
  
  // Convert stored documents back to format
  // Note: File objects can't be restored from localStorage, but we can show document metadata
  const documentsByType = {
    balanceSheet: [],
    incomeStatement: [],
    debtServiceWorksheet: [],
  };
  
  Object.keys(storedDocuments).forEach((type) => {
    if (storedDocuments[type] && Array.isArray(storedDocuments[type])) {
      documentsByType[type] = storedDocuments[type].map((doc) => ({
        ...doc,
        // Mark as stored document (File object won't be available)
        isStored: true,
        // Use storageUrl as previewUrl for stored documents
        previewUrl: doc.storageUrl || null,
      }));
    }
  });
  

  // Set the first document as the current one if available
  const firstDocType = Object.keys(documentsByType).find((type) => documentsByType[type].length > 0);
  const firstDoc = firstDocType ? documentsByType[firstDocType][0] : null;

  // Populate the form with the existing financial data
  $borrowerFinancialsForm.update({
    activeTab: 'documents',
    documentType: firstDocType || 'balanceSheet', // Set to first doc type if available
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

  // Update modal state with loaded documents
  $modalState.update({
    documentsByType,
    pdfUrl: firstDoc?.previewUrl || firstDoc?.storageUrl || null, // Use previewUrl or storageUrl for preview
    currentDocumentIndex: {
      balanceSheet: 0,
      incomeStatement: 0,
      debtServiceWorksheet: 0,
      ...(firstDocType ? { [firstDocType]: 0 } : {}),
    },
  });
};
