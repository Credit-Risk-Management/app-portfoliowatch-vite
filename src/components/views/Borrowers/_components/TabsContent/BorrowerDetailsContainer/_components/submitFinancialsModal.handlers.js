import { $borrowerFinancialsView, $borrowerFinancialsForm, $user } from '@src/signals';
import borrowerFinancialsApi from '@src/api/borrowerFinancials.api';
import borrowerFinancialDocumentsApi from '@src/api/borrowerFinancialDocuments.api';
import { dangerAlert, successAlert } from '@src/components/global/Alert/_helpers/alert.events';
import postToSensibleApi, { initiateUploadToSensibleApi } from '@src/api/sensible.api';
import { storage } from '@src/utils/firebase';
import { extractIncomeStatementFromApiResponse, extractBalanceSheetFromApiResponse } from '../../../../_helpers/financials.helpers';
/** Map form documentType to Sensible API documentType / configurationName */
const SENSIBLE_DOCUMENT_TYPES = {
  incomeStatement: 'income_statement',
  balanceSheet: 'balance_sheet',
};

/**
 * Handles closing the submit financials modal and resetting all state
 * @param {Object} $financialDocsUploader - Signal for financial documents
 * @param {Object} $modalState - Signal for modal state
 * @param {string} pdfUrl - Current PDF URL to revoke
 */
export const handleClose = ($financialDocsUploader, $modalState, pdfUrl) => {
  $borrowerFinancialsView.update({
    activeModalKey: null,
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
export const handleFileUpload = async ($financialDocsUploader, $modalState, ocrApplied, pdfUrl) => {
  // Get files from the signal
  $modalState.update({ isLoading: true });
  try {
    const files = $financialDocsUploader.value.financialDocs || [];

    if (!files.length) return;

    const [file] = files;
    const { documentType } = $borrowerFinancialsForm.value;

    // Create a document object with preview URL
    const previewUrl = URL.createObjectURL(file);

    const newDoc = {
      id: `temp-${Date.now()}`,
      file,
      fileName: file.name,
      fileSize: file.size,
      mimeType: file.type,
      previewUrl,
      documentType,
      uploadedAt: new Date(),
    };

    // Add to documents by type
    const { documentsByType } = $modalState.value;
    const updatedDocs = {
      ...documentsByType,
      [documentType]: [...documentsByType[documentType], newDoc],
    };
    const initiateUploadData = {
      fileName: file.name,
      contentType: file.type,
      id: $borrowerFinancialsView.value.currentBorrowerId,
      documentType,
      uploadedBy: $user.value.email || $user.value.name || 'Unknown User',
    };
    const response = await initiateUploadToSensibleApi(initiateUploadData);

    if (pdfUrl) {
      URL.revokeObjectURL(pdfUrl);
    }

    $modalState.update({
      documentsByType: updatedDocs,
      currentDocumentIndex: {
        ...$modalState.value.currentDocumentIndex,
        [documentType]: updatedDocs[documentType].length - 1,
      },
    });
    // Firebase Storage requires a non-root path; build path from storageUrl or fallback
    //
    const storageRef = storage.ref(response.storagePath);
    const uploadTask = await storageRef.put(file, {
      contentType: file.type,
    });

    // Get the download URL
    const downloadURL = await uploadTask.ref.getDownloadURL();
    if (!downloadURL) {
      dangerAlert('Failed to upload file to storage');
    }

    $modalState.update({ downloadSensibleUrl: response.storagePath, pdfUrl: newDoc.previewUrl, isLoading: false });

    // Call Sensible API for income_statement or balance_sheet; extract and populate form for income_statement
    const sensibleType = SENSIBLE_DOCUMENT_TYPES[documentType];
    if (sensibleType && downloadURL) {
      $modalState.update({ isLoadingInputData: true });
      try {
        const sensibleBody = {
          url: downloadURL,
          documentType: sensibleType,
          configurationName: sensibleType,
          environment: 'development',
          documentName: file.name,
        };
        const sensibleResponse = await postToSensibleApi(sensibleBody);
        const parsedDocument = sensibleResponse?.data?.parsed_document ?? sensibleResponse?.parsed_document ?? null;

        if (documentType === 'incomeStatement' && parsedDocument) {
          const extractedData = extractIncomeStatementFromApiResponse(parsedDocument);
          if (extractedData) {
            $borrowerFinancialsForm.update(extractedData);
          }
        }
        if (documentType === 'balanceSheet' && parsedDocument) {
          const extractedData = extractBalanceSheetFromApiResponse(parsedDocument);
          if (extractedData) {
            $borrowerFinancialsForm.update(extractedData);
          }
        }

        $modalState.update({
          isLoadingInputData: false,
          ocrApplied: true,
          refreshKey: $modalState.value.refreshKey + 1,
        });

        // Update the PDF URL to show the newly uploaded document
      } catch (sensibleError) {
        if ($modalState.value.downloadSensibleUrl) {
          const deleteStorageRef = storage.ref($modalState.value.downloadSensibleUrl);
          await deleteStorageRef.delete();
          $modalState.update({ downloadSensibleUrl: null });
        }
        throw new Error(sensibleError?.message ?? 'Sensible extraction failed');
      }
    }
  } catch (error) {
    console.error('Error uploading file:', error);
    $modalState.update({
      isLoading: false,
      error: error?.message ?? 'Failed to upload file',
    });
  } finally {
    $modalState.update({ isLoading: false });
    $financialDocsUploader.update({ financialDocs: [] });
  }
};

/**
 * Removes a document from the current document type
 * @param {Object} $modalState - Signal for modal state
 * @param {string} documentId - The ID of the document to remove
 */
export const handleRemoveDocument = async ($modalState, documentId) => {
  $modalState.update({ isLoading: true });
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
  if ($modalState.value.downloadSensibleUrl) {
    const deleteStorageRef = storage.ref($modalState.value.downloadSensibleUrl);
    await deleteStorageRef.delete();
  }
  $borrowerFinancialsForm.reset();
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
    downloadSensibleUrl: null,
    isLoading: false,
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
    const { asOfDate } = $borrowerFinancialsForm.value;
    const { organizationId } = $user.value;

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

      // Upload documents to backend storage
      if (financialId && $modalState.value.documentsByType) {
        const uploadPromises = [];

        Object.keys($modalState.value.documentsByType).forEach((docType) => {
          const docs = $modalState.value.documentsByType[docType] || [];

          docs.forEach((doc) => {
            // Only upload new documents that have a File object and aren't already stored
            if (doc.file && !doc.isStored) {
              const uploadPromise = borrowerFinancialDocumentsApi.uploadFile({
                borrowerFinancialId: financialId,
                file: doc.file,
                documentType: docType,
                uploadedBy: $user.value.email || $user.value.name || 'Unknown User',
              }).catch((error) => {
                console.error(`Error uploading document ${doc.fileName}:`, error);
                // Don't throw - continue with other uploads
                return null;
              });

              uploadPromises.push(uploadPromise);
            }
          });
        });

        // Wait for all uploads to complete (in background, don't block success message)
        if (uploadPromises.length > 0) {
          Promise.all(uploadPromises).then((results) => {
            const successCount = results.filter((r) => r !== null).length;
            console.info(`Uploaded ${successCount} of ${uploadPromises.length} documents`);
          });
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
      if ($modalState.value.downloadSensibleUrl) {
        const deleteStorageRef = storage.ref($modalState.value.downloadSensibleUrl);
        await deleteStorageRef.delete();
        $modalState.update({ downloadSensibleUrl: null });
      }
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
 * Loads documents from backend for a financial record
 * @param {string} financialId - The financial record ID
 * @returns {Promise<Object>} - Documents organized by type
 */
const loadDocumentsFromBackend = async (financialId) => {
  try {
    const response = await borrowerFinancialDocumentsApi.getByBorrowerFinancial(financialId);
    // The response structure is { success: true, data: [...], count: ... }
    const documents = response?.success && response?.data ? response.data : [];

    if (documents && documents.length > 0) {
      // Organize documents by type
      const documentsByType = {
        balanceSheet: [],
        incomeStatement: [],
        debtServiceWorksheet: [],
      };

      // Use the storageUrl directly from the document record
      // (it's already a permanent Firebase Storage download URL)
      documents.forEach((doc) => {
        const type = doc.documentType;
        if (documentsByType[type]) {
          documentsByType[type].push({
            id: doc.id,
            fileName: doc.fileName,
            fileSize: doc.fileSize,
            mimeType: doc.mimeType,
            documentType: doc.documentType,
            uploadedAt: doc.uploadedAt,
            storagePath: doc.storagePath, // Firebase Storage path (for SDK downloads)
            storageUrl: doc.storageUrl, // Firebase Storage URL
            isStored: true,
            previewUrl: doc.storageUrl, // For PDF rendering
          });
        }
      });

      return documentsByType;
    }
  } catch (error) {
    console.error('Error loading documents from backend:', error);
  }

  // Return empty structure if no documents or error
  return {
    balanceSheet: [],
    incomeStatement: [],
    debtServiceWorksheet: [],
  };
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

  // Load documents from backend
  const documentsByType = await loadDocumentsFromBackend(financial.id);
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
    activeModalKey: 'submitFinancials',
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
