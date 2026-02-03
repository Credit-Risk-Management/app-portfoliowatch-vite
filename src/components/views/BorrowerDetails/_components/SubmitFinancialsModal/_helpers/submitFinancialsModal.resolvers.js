import { $borrowerFinancialsView, $borrowerFinancialsForm, $user } from '@src/signals';
import borrowerFinancialsApi from '@src/api/borrowerFinancials.api';
import borrowerFinancialDocumentsApi from '@src/api/borrowerFinancialDocuments.api';
import { dangerAlert, successAlert } from '@src/components/global/Alert/_helpers/alert.events';
import postToSensibleApi, { initiateUploadToSensibleApi } from '@src/api/sensible.api';
import { storage } from '@src/utils/firebase';
import { extractIncomeStatementFromApiResponse, extractBalanceSheetFromApiResponse } from '@src/components/views/Borrowers/_helpers/financials.helpers';
import * as consts from './submitFinancialsModal.consts';

const SENSIBLE_DOCUMENT_TYPES = {
  incomeStatement: 'income_statement',
  balanceSheet: 'balance_sheet',
};

export const handleFileUpload = async (ocrApplied, pdfUrl) => {
  const { $financialDocsUploader, $modalState } = consts;
  $modalState.update({ isLoading: true });
  try {
    const files = $financialDocsUploader.value.financialDocs || [];
    if (!files.length) return;

    const [file] = files;
    const { documentType } = $borrowerFinancialsForm.value;
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

    const { documentsByType } = $modalState.value;
    const updatedDocs = {
      ...documentsByType,
      [documentType]: [...(documentsByType[documentType] || []), newDoc],
    };
    const initiateUploadData = {
      fileName: file.name,
      contentType: file.type,
      borrowerId: $borrowerFinancialsView.value.currentBorrowerId,
      documentType,
      uploadedBy: $user.value?.email || $user.value?.name || 'Unknown User',
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

    const storageRef = storage.ref(response.storagePath);
    const uploadTask = await storageRef.put(file, { contentType: file.type });
    const downloadURL = await uploadTask.ref.getDownloadURL();
    if (!downloadURL) {
      dangerAlert('Failed to upload file to storage');
    }

    $modalState.update({ downloadSensibleUrl: response.storagePath, pdfUrl: newDoc.previewUrl, isLoading: false });

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
    consts.$modalState.update({
      isLoading: false,
      error: error?.message ?? 'Failed to upload file',
    });
  } finally {
    consts.$modalState.update({ isLoading: false });
    consts.$financialDocsUploader.update({ financialDocs: [] });
  }
};

export const handleRemoveDocument = async (documentId) => {
  const { $modalState } = consts;
  $modalState.update({ isLoading: true });
  const { documentType } = $borrowerFinancialsForm.value;
  const { documentsByType, currentDocumentIndex } = $modalState.value;
  const docs = documentsByType[documentType] || [];
  const docIndex = docs.findIndex((doc) => doc.id === documentId);
  if (docIndex === -1) return;

  const doc = docs[docIndex];
  if (doc.previewUrl) {
    URL.revokeObjectURL(doc.previewUrl);
  }
  const updatedDocs = docs.filter((_, i) => i !== docIndex);
  let newIndex = currentDocumentIndex[documentType];
  if (newIndex >= updatedDocs.length) {
    newIndex = Math.max(0, updatedDocs.length - 1);
  }
  const newPdfUrl = updatedDocs[newIndex]?.previewUrl || null;
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

export const handleSwitchDocument = (index) => {
  const { $modalState } = consts;
  const { documentType } = $borrowerFinancialsForm.value;
  const { documentsByType, currentDocumentIndex } = $modalState.value;
  const docs = documentsByType[documentType] || [];
  if (index < 0 || index >= docs.length) return;
  $modalState.update({
    currentDocumentIndex: {
      ...currentDocumentIndex,
      [documentType]: index,
    },
    pdfUrl: docs[index].previewUrl,
  });
};

const loadDocumentsFromBackend = async (financialId) => {
  try {
    const response = await borrowerFinancialDocumentsApi.getByBorrowerFinancial(financialId);
    const documents = response?.success && response?.data ? response.data : [];
    if (documents?.length > 0) {
      const documentsByType = {
        balanceSheet: [],
        incomeStatement: [],
        debtServiceWorksheet: [],
      };
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
            storagePath: doc.storagePath,
            storageUrl: doc.storageUrl,
            isStored: true,
            previewUrl: doc.storageUrl,
          });
        }
      });
      return documentsByType;
    }
  } catch (error) {
    // no-op
  }
  return {
    balanceSheet: [],
    incomeStatement: [],
    debtServiceWorksheet: [],
  };
};

export const handleOpenEditMode = async (financial) => {
  const { $modalState } = consts;
  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toISOString().split('T')[0];
  };

  const documentsByType = await loadDocumentsFromBackend(financial.id);
  const firstDocType = Object.keys(documentsByType).find((type) => documentsByType[type].length > 0);
  const firstDoc = firstDocType ? documentsByType[firstDocType][0] : null;

  $borrowerFinancialsForm.update({
    activeTab: 'documents',
    documentType: firstDocType || 'balanceSheet',
    asOfDate: formatDateForInput(financial.asOfDate),
    accountabilityScore: financial.accountabilityScore?.toString() || '',
    grossRevenue: financial.grossRevenue?.toString() || '',
    netIncome: financial.netIncome?.toString() || '',
    ebitda: financial.ebitda?.toString() || '',
    profitMargin: financial.profitMargin?.toString() || '',
    totalCurrentAssets: financial.totalCurrentAssets?.toString() || '',
    totalCurrentLiabilities: financial.totalCurrentLiabilities?.toString() || '',
    cash: financial.cash?.toString() || '',
    cashEquivalents: financial.cashEquivalents?.toString() || '',
    equity: financial.equity?.toString() || '',
    accountsReceivable: financial.accountsReceivable?.toString() || '',
    accountsPayable: financial.accountsPayable?.toString() || '',
    inventory: financial.inventory?.toString() || '',
    debtService: financial.debtService?.toString() || '',
    currentRatio: financial.currentRatio?.toString() || '',
    liquidity: financial.liquidity?.toString() || '',
    liquidityRatio: financial.liquidityRatio?.toString() || '',
    retainedEarnings: financial.retainedEarnings?.toString() || '',
    changeInCash: financial.changeInCash?.toString() || '',
    changeInEbitda: financial.changeInEbitda?.toString() || '',
    changeInAccountsReceivable: financial.changeInAccountsReceivable?.toString() || '',
    changeInProfitMargin: financial.changeInProfitMargin?.toString() || '',
    changeInInventory: financial.changeInInventory?.toString() || '',
    changeInAccountsPayable: financial.changeInAccountsPayable?.toString() || '',
    notes: financial.notes || '',
    documentIds: financial.documentIds || [],
  });

  $borrowerFinancialsView.update({
    activeModalKey: 'submitFinancials',
    isEditMode: true,
    editingFinancialId: financial.id,
    currentBorrowerId: financial.borrowerId,
  });

  $modalState.update({
    documentsByType,
    pdfUrl: firstDoc?.previewUrl || firstDoc?.storageUrl || null,
    currentDocumentIndex: {
      balanceSheet: 0,
      incomeStatement: 0,
      debtServiceWorksheet: 0,
      ...(firstDocType ? { [firstDocType]: 0 } : {}),
    },
  });
};

const toNumberOrNull = (value) => {
  if (value == null || value === '') return null;
  const num = typeof value === 'string' ? parseFloat(value.replace(/[^0-9.-]/g, '')) : Number(value);
  return Number.isNaN(num) ? null : num;
};

export const handleSubmit = async (onCloseCallback) => {
  const { $modalState } = consts;
  try {
    $modalState.update({ isSubmitting: true, error: null });

    const borrowerId = $borrowerFinancialsView.value.currentBorrowerId;
    const { asOfDate } = $borrowerFinancialsForm.value;
    const { organizationId } = $user.value || {};

    if (!borrowerId) {
      $modalState.update({ error: 'Borrower ID is required. Please select a borrower.', isSubmitting: false });
      return;
    }
    if (!asOfDate) {
      $modalState.update({ error: 'As of Date is required. Please select a date.', isSubmitting: false });
      return;
    }
    if (!organizationId) {
      $modalState.update({ error: 'Organization ID is required. Please ensure you are logged in.', isSubmitting: false });
      return;
    }

    const financialData = {
      borrowerId,
      asOfDate,
      accountabilityScore: toNumberOrNull($borrowerFinancialsForm.value.accountabilityScore),
      grossRevenue: toNumberOrNull($borrowerFinancialsForm.value.grossRevenue),
      netIncome: toNumberOrNull($borrowerFinancialsForm.value.netIncome),
      ebitda: toNumberOrNull($borrowerFinancialsForm.value.ebitda),
      profitMargin: toNumberOrNull($borrowerFinancialsForm.value.profitMargin),
      totalCurrentAssets: toNumberOrNull($borrowerFinancialsForm.value.totalCurrentAssets),
      totalCurrentLiabilities: toNumberOrNull($borrowerFinancialsForm.value.totalCurrentLiabilities),
      cash: toNumberOrNull($borrowerFinancialsForm.value.cash),
      cashEquivalents: toNumberOrNull($borrowerFinancialsForm.value.cashEquivalents),
      equity: toNumberOrNull($borrowerFinancialsForm.value.equity),
      accountsReceivable: toNumberOrNull($borrowerFinancialsForm.value.accountsReceivable),
      accountsPayable: toNumberOrNull($borrowerFinancialsForm.value.accountsPayable),
      inventory: toNumberOrNull($borrowerFinancialsForm.value.inventory),
      debtService: toNumberOrNull($borrowerFinancialsForm.value.debtService),
      currentRatio: toNumberOrNull($borrowerFinancialsForm.value.currentRatio),
      liquidity: toNumberOrNull($borrowerFinancialsForm.value.liquidity),
      liquidityRatio: toNumberOrNull($borrowerFinancialsForm.value.liquidityRatio),
      retainedEarnings: toNumberOrNull($borrowerFinancialsForm.value.retainedEarnings),
      notes: $borrowerFinancialsForm.value.notes || null,
      submittedBy: $user.value?.email || $user.value?.name || 'Unknown User',
      organizationId,
      documentIds: [],
    };

    const { isEditMode } = $borrowerFinancialsView.value;
    const editingId = $borrowerFinancialsView.value.editingFinancialId;
    let response;
    if (isEditMode && editingId) {
      response = await borrowerFinancialsApi.update(editingId, financialData);
    } else {
      response = await borrowerFinancialsApi.create(financialData);
    }

    if (response?.success) {
      const financialId = response.data?.id || response.data?.data?.id || editingId;
      if (financialId && $modalState.value.documentsByType) {
        const uploadPromises = [];
        Object.keys($modalState.value.documentsByType).forEach((docType) => {
          const docs = $modalState.value.documentsByType[docType] || [];
          docs.forEach((doc) => {
            if (doc.file && !doc.isStored) {
              uploadPromises.push(
                borrowerFinancialDocumentsApi.uploadFile({
                  borrowerFinancialId: financialId,
                  file: doc.file,
                  documentType: docType,
                  uploadedBy: $user.value?.email || $user.value?.name || 'Unknown User',
                }).catch(() => null),
              );
            }
          });
        });
        if (uploadPromises.length > 0) {
          Promise.all(uploadPromises).then((results) => {
            const successCount = results.filter((r) => r !== null).length;
            if (successCount > 0) {
              // optional log
            }
          });
        }
      }

      $borrowerFinancialsView.update({
        refreshTrigger: $borrowerFinancialsView.value.refreshTrigger + 1,
      });
      onCloseCallback();

      const updatedLoans = response.data?.updatedLoans || [];
      $modalState.update({ showWatchScoreResults: true, updatedLoans });
      if ($modalState.value.downloadSensibleUrl) {
        const deleteStorageRef = storage.ref($modalState.value.downloadSensibleUrl);
        await deleteStorageRef.delete();
        $modalState.update({ downloadSensibleUrl: null });
      }
      successAlert(isEditMode ? 'Financial data updated successfully!' : 'Submitted new financials!', 'toast');
    } else {
      $modalState.update({ error: response?.error || response?.message || 'Failed to submit financial data' });
    }
  } catch (err) {
    let errorMessage = 'An error occurred while submitting financial data';
    if (err?.error) errorMessage = err.error;
    else if (err?.response?.data?.error) errorMessage = err.response.data.error;
    else if (err?.response?.data?.message) errorMessage = err.response.data.message;
    else if (err?.message) errorMessage = err.message;
    $modalState.update({ error: errorMessage });
  } finally {
    consts.$modalState.update({ isSubmitting: false });
  }
};
