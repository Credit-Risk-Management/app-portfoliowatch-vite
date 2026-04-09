import { $borrowerFinancialsView, $borrowerFinancialsForm, $user } from '@src/signals';
import borrowerFinancialsApi from '@src/api/borrowerFinancials.api';
import borrowerFinancialDocumentsApi from '@src/api/borrowerFinancialDocuments.api';
import debtServiceHistoryApi from '@src/api/debtServiceHistory.api';
import { dangerAlert, successAlert } from '@src/components/global/Alert/_helpers/alert.events';
import postToSensibleApi, { initiateUploadToSensibleApi } from '@src/api/sensible.api';
import { storage } from '@src/utils/firebase';
import { parseSingleDocResponse } from '@src/utils/sensibleParseApi';
import * as consts from './submitFinancialsModal.consts';

const SENSIBLE_DOCUMENT_TYPES = {
  incomeStatement: 'income_statement',
  balanceSheet: 'balance_sheet',
  taxReturn: 'tax_return',
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
      id: $borrowerFinancialsView.value.currentBorrowerId,
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
          const extractedData = parseSingleDocResponse(parsedDocument, 'incomeStatement');
          if (extractedData) {
            $borrowerFinancialsForm.update({
              asOfDate: extractedData.asOfDate,
              grossRevenue: extractedData.grossRevenue,
              netIncome: extractedData.netIncome,
              profitMargin: extractedData.profitMargin,
              ebitda: extractedData.ebitda,
              rentalExpenses: extractedData.rentalExpenses,
              debtService: extractedData.debtService,
            });
          }
        }
        if (documentType === 'balanceSheet' && parsedDocument) {
          const extractedData = parseSingleDocResponse(parsedDocument, 'balanceSheet');
          if (extractedData && !Array.isArray(extractedData)) {
            $borrowerFinancialsForm.update({
              asOfDate: extractedData.asOfDate,
              totalAssets: extractedData.totalAssets,
              totalLiabilities: extractedData.totalLiabilities,
              totalCurrentAssets: extractedData.totalCurrentAssets,
              totalCurrentLiabilities: extractedData.totalCurrentLiabilities,
              cash: extractedData.cash,
              cashEquivalents: extractedData.cashEquivalents,
              equity: extractedData.equity,
              accountsReceivable: extractedData.accountsReceivable,
              accountsPayable: extractedData.accountsPayable,
              inventory: extractedData.inventory,
              liquidity: extractedData.liquidity,
              currentRatio: extractedData.currentRatio,
            });
          }
        }
        if (documentType === 'taxReturn' && parsedDocument) {
          const extractedData = parseSingleDocResponse(parsedDocument, 'taxReturn');
          if (extractedData) {
            $borrowerFinancialsForm.update({
              asOfDate: extractedData.asOfDate,
              grossRevenue: extractedData.grossRevenue,
              netIncome: extractedData.netIncome,
              profitMargin: extractedData.profitMargin,
              ebitda: extractedData.ebitda,
              rentalExpenses: extractedData.rentalExpenses,
            });
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
  try {
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

    const updatedDocumentsByType = {
      ...documentsByType,
      [documentType]: updatedDocs,
    };
    const allEmpty = ['balanceSheet', 'incomeStatement', 'debtServiceWorksheet', 'taxReturn'].every(
      (k) => !(updatedDocumentsByType[k] || []).length,
    );

    const clearedFields = {};
    const taxStillHasDocs = (updatedDocumentsByType.taxReturn || []).length > 0;
    const incomeStillHasDocs = (updatedDocumentsByType.incomeStatement || []).length > 0;
    if (documentType === 'incomeStatement' && updatedDocs.length === 0) {
      clearedFields.debtService = '';
      if (!taxStillHasDocs) {
        clearedFields.grossRevenue = '';
        clearedFields.netIncome = '';
        clearedFields.profitMargin = '';
        clearedFields.ebitda = '';
        clearedFields.rentalExpenses = '';
      }
    }
    if (documentType === 'balanceSheet' && updatedDocs.length === 0) {
      clearedFields.totalCurrentAssets = '';
      clearedFields.totalCurrentLiabilities = '';
      clearedFields.totalAssets = '';
      clearedFields.totalLiabilities = '';
      clearedFields.cash = '';
      clearedFields.cashEquivalents = '';
      clearedFields.equity = '';
      clearedFields.accountsReceivable = '';
      clearedFields.accountsPayable = '';
      clearedFields.inventory = '';
      clearedFields.currentRatio = '';
      clearedFields.liquidity = '';
      clearedFields.liquidityRatio = '';
      clearedFields.retainedEarnings = '';
    }
    if (documentType === 'taxReturn' && updatedDocs.length === 0 && !incomeStillHasDocs) {
      clearedFields.grossRevenue = '';
      clearedFields.netIncome = '';
      clearedFields.profitMargin = '';
      clearedFields.ebitda = '';
      clearedFields.rentalExpenses = '';
    }
    if (allEmpty) {
      clearedFields.asOfDate = '';
    }

    if (Object.keys(clearedFields).length > 0) {
      $borrowerFinancialsForm.update(clearedFields);
    }

    $modalState.update({
      ...$modalState.value,
      documentsByType: updatedDocumentsByType,
      currentDocumentIndex: {
        ...currentDocumentIndex,
        [documentType]: newIndex,
      },
      pdfUrl: newPdfUrl,
      downloadSensibleUrl: null,
    });

    if (allEmpty) {
      $modalState.update({ ocrApplied: false });
    }
  } catch (error) {
    $modalState.update({ error: error?.message ?? 'Failed to remove document', isLoading: false });
  } finally {
    $modalState.update({ isLoading: false });
  }
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
        taxReturn: [],
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
    taxReturn: [],
  };
};

const collectStoredIdsByType = (documentsByType) => ({
  balanceSheet: (documentsByType.balanceSheet || [])
    .filter((d) => d.isStored && d.id)
    .map((d) => d.id),
  incomeStatement: (documentsByType.incomeStatement || [])
    .filter((d) => d.isStored && d.id)
    .map((d) => d.id),
  debtServiceWorksheet: (documentsByType.debtServiceWorksheet || [])
    .filter((d) => d.isStored && d.id)
    .map((d) => d.id),
  taxReturn: (documentsByType.taxReturn || [])
    .filter((d) => d.isStored && d.id)
    .map((d) => d.id),
});

export const handleOpenEditMode = async (financial) => {
  const { $modalState } = consts;
  const expectedFinancialId = financial.id;
  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toISOString().split('T')[0];
  };

  const documentsByType = await loadDocumentsFromBackend(financial.id);
  // User may have closed the modal or submitted while documents were loading; do not reopen.
  if ($borrowerFinancialsView.value.editingFinancialId !== expectedFinancialId) {
    return;
  }
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
    totalAssets: financial.totalAssets?.toString() || '',
    totalLiabilities: financial.totalLiabilities?.toString() || '',
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
    initialStoredDocumentIdsByType: collectStoredIdsByType(documentsByType),
    pdfUrl: firstDoc?.previewUrl || firstDoc?.storageUrl || null,
    currentDocumentIndex: {
      balanceSheet: 0,
      incomeStatement: 0,
      debtServiceWorksheet: 0,
      taxReturn: 0,
      ...(firstDocType ? { [firstDocType]: 0 } : {}),
    },
  });
};

const toNumberOrNull = (value) => {
  if (value == null || value === '') return null;
  const num = typeof value === 'string' ? parseFloat(value.replace(/[^0-9.-]/g, '')) : Number(value);
  return Number.isNaN(num) ? null : num;
};

const roundTo4 = (value) => parseFloat(value.toFixed(4));

const computeDebtServiceRatio = (ebitda, totalMonthlyPayment) => {
  if (ebitda == null || totalMonthlyPayment == null) return null;
  if (totalMonthlyPayment <= 0) return null;
  const annualDebtService = totalMonthlyPayment * 12;
  if (annualDebtService <= 0) return null;
  return roundTo4(ebitda / annualDebtService);
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

    const formEbitda = toNumberOrNull($borrowerFinancialsForm.value.ebitda);
    let computedDebtServiceRatio = null;
    try {
      const debtServiceResponse = await debtServiceHistoryApi.getLatestByBorrowerId(borrowerId);
      const latestDebtService = debtServiceResponse?.data ?? null;
      const totalMonthlyPayment = toNumberOrNull(latestDebtService?.totalMonthlyPayment);
      computedDebtServiceRatio = computeDebtServiceRatio(formEbitda, totalMonthlyPayment);
    } catch (error) {
      // Non-blocking fallback: if debt service history is unavailable, keep current/form value.
      computedDebtServiceRatio = null;
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
      totalAssets: toNumberOrNull($borrowerFinancialsForm.value.totalAssets),
      totalLiabilities: toNumberOrNull($borrowerFinancialsForm.value.totalLiabilities),
      cash: toNumberOrNull($borrowerFinancialsForm.value.cash),
      cashEquivalents: toNumberOrNull($borrowerFinancialsForm.value.cashEquivalents),
      equity: toNumberOrNull($borrowerFinancialsForm.value.equity),
      accountsReceivable: toNumberOrNull($borrowerFinancialsForm.value.accountsReceivable),
      accountsPayable: toNumberOrNull($borrowerFinancialsForm.value.accountsPayable),
      inventory: toNumberOrNull($borrowerFinancialsForm.value.inventory),
      // Always compute DSCR on submit when we have EBITDA + latest debt schedule.
      // Fallback to existing/form value only if compute inputs are unavailable.
      debtService: computedDebtServiceRatio ?? toNumberOrNull($borrowerFinancialsForm.value.debtService),
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
      const wasEditMode = $borrowerFinancialsView.value.isEditMode;
      const financialId = response.data?.id || response.data?.data?.id || editingId;
      const uploadBorrowerFinancialId = editingId ?? financialId;

      if (uploadBorrowerFinancialId && $modalState.value.documentsByType) {
        const { documentsByType } = $modalState.value;
        const uploadPromises = [];
        Object.keys(documentsByType || {}).forEach((docType) => {
          const docs = documentsByType[docType] || [];
          docs.forEach((doc) => {
            if (doc?.file && !doc.isStored) {
              uploadPromises.push(
                borrowerFinancialDocumentsApi.uploadFile({
                  borrowerFinancialId: uploadBorrowerFinancialId,
                  file: doc.file,
                  documentType: docType,
                  uploadedBy: $user.value?.email || $user.value?.name || 'Unknown User',
                }).catch(() => null),
              );
            }
          });
        });
        if (uploadPromises.length > 0) {
          await Promise.all(uploadPromises);
        }

        if (editingId) {
          const { initialStoredDocumentIdsByType } = $modalState.value;
          const deletePromises = [];
          Object.keys(initialStoredDocumentIdsByType || {}).forEach((docType) => {
            const docs = documentsByType[docType] || [];
            const currentStoredIds = new Set(
              docs.filter((d) => d.isStored && d.id).map((d) => d.id),
            );
            (initialStoredDocumentIdsByType[docType] || []).forEach((id) => {
              if (!currentStoredIds.has(id)) {
                deletePromises.push(
                  borrowerFinancialDocumentsApi.delete(id).catch(() => null),
                );
              }
            });
          });
          if (deletePromises.length > 0) {
            await Promise.all(deletePromises);
          }
        }
      }

      $borrowerFinancialsView.update({
        refreshTrigger: $borrowerFinancialsView.value.refreshTrigger + 1,
      });

      const updatedLoans = response.data?.updatedLoans || [];
      await onCloseCallback();
      $modalState.update({ showWatchScoreResults: true, updatedLoans });
      successAlert(wasEditMode ? 'Financial data updated successfully!' : 'Submitted new financials!', 'toast');
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
