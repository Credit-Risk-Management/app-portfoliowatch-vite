import { $user } from '@src/signals';
import guarantorsApi from '@src/api/guarantors.api';
import guarantorFinancialDocumentsApi from '@src/api/guarantorFinancialDocuments.api';
import { dangerAlert, successAlert } from '@src/components/global/Alert/_helpers/alert.events';
import postToSensibleApi, { initiateUploadToSensibleApi } from '@src/api/sensible.api';
import { storage } from '@src/utils/firebase';
import { fetchGuarantorDetail } from '@src/components/views/GuarantorDetails/_helpers/guarantorDetails.resolvers';
import { parseSingleDocResponse } from '@src/utils/sensibleParseApi';
import { normalizeRatioDecimalToPercent } from '@src/utils/ratioPercent';
import { $submitPFSModalView, $submitPFSModalDetails } from './submitPFSModal.const';

const SENSIBLE_DOCUMENT_TYPES = {
  personalFinancialStatement: 'personal_financial_statement',
  personalTaxReturn: 'tax_return',
};

const toNumberOrNull = (value) => {
  if (value == null || value === '') return null;
  const parsed = typeof value === 'string'
    ? Number(value.replace(/[^0-9.-]/g, ''))
    : Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const roundTo4 = (value) => parseFloat(value.toFixed(4));

/**
 * DTI = monthly debt service ÷ monthly income.
 * Form captures annual figures: derive monthly, then divide (same as annual ÷ annual).
 */
const computeDebtToIncomeRatio = (annualDebtService, adjustedGrossIncome) => {
  if (annualDebtService == null || adjustedGrossIncome == null) return null;
  if (adjustedGrossIncome <= 0) return null;
  const monthlyDebt = annualDebtService / 12;
  const monthlyIncome = adjustedGrossIncome / 12;
  if (monthlyIncome <= 0) return null;
  return roundTo4(monthlyDebt / monthlyIncome);
};

export const handleFileUpload = async ($financialDocsUploader, $modalState, ocrApplied, pdfUrl) => {
  $modalState.update({ isLoading: true });
  try {
    const files = $financialDocsUploader.value.guarantorFinancialDocs || [];

    if (!files.length) return;

    const [file] = files;
    const { documentType } = $modalState.value;

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

    const { documentsByType } = $submitPFSModalDetails.value;
    const updatedDocs = {
      ...documentsByType,
      [documentType]: [...(documentsByType[documentType] || []), newDoc],
    };
    const initiateUploadData = {
      fileName: file.name,
      contentType: file.type,
      id: $submitPFSModalView.value.guarantorId,
      documentType,
      uploadedBy: $user.value?.email || $user.value?.name || 'Unknown User',
    };
    const response = await initiateUploadToSensibleApi(initiateUploadData);

    if (pdfUrl) {
      URL.revokeObjectURL(pdfUrl);
    }

    $submitPFSModalDetails.update({
      documentsByType: updatedDocs,
      currentDocumentIndex: {
        ...$submitPFSModalDetails.value.currentDocumentIndex,
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

    $submitPFSModalDetails.update({
      downloadSensibleUrl: response.storagePath,
      pdfUrl: newDoc.previewUrl,
    });
    $modalState.update({ isLoading: false });

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

        if (documentType === 'personalFinancialStatement' && parsedDocument) {
          const pfsData = parseSingleDocResponse(parsedDocument, 'personalFinancialStatement');
          if (pfsData) {
            $submitPFSModalDetails.update({
              asOfDate: pfsData.asOfDate,
              totalAssets: pfsData.totalAssets,
              totalLiabilities: pfsData.totalLiabilities,
              netWorth: pfsData.netWorth,
              liquidity: pfsData.liquidity,
              cash: pfsData.cash,
              annualDebtService: pfsData.annualDebtService,
            });
          }
        }
        if (documentType === 'personalTaxReturn' && parsedDocument) {
          const extractedData = parseSingleDocResponse(parsedDocument, 'personalTaxReturn');
          if (extractedData) {
            $submitPFSModalDetails.update({
              asOfDate: extractedData.asOfDate,
              adjustedGrossIncome: extractedData.adjustedGrossIncome,
            });
          }
        }

        $modalState.update({
          isLoadingInputData: false,
          ocrApplied: true,
          refreshKey: $modalState.value.refreshKey + 1,
        });
      } catch (sensibleError) {
        if ($submitPFSModalDetails.value.downloadSensibleUrl) {
          const deleteStorageRef = storage.ref($submitPFSModalDetails.value.downloadSensibleUrl);
          await deleteStorageRef.delete();
          $submitPFSModalDetails.update({ downloadSensibleUrl: null });
        }
        throw new Error(sensibleError?.message ?? 'Sensible extraction failed');
      }
    }
  } catch (error) {
    $modalState.update({
      isLoading: false,
      error: error?.message ?? 'Failed to upload file',
    });
  } finally {
    $modalState.update({ isLoading: false });
    $financialDocsUploader.update({ guarantorFinancialDocs: [] });
  }
};

export const handleRemoveDocument = async (documentId) => {
  $submitPFSModalView.update({ isLoading: true });
  try {
    const { documentType } = $submitPFSModalView.value;
    const { documentsByType, currentDocumentIndex } = $submitPFSModalDetails.value;
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
    const newPdfUrl = updatedDocs[newIndex]?.previewUrl || updatedDocs[newIndex]?.storageUrl || null;
    /** `downloadSensibleUrl` is only for ephemeral Sensible staging uploads — not for persisted (`isStored`) rows. */
    if ($submitPFSModalDetails.value.downloadSensibleUrl && !doc.isStored) {
      const deleteStorageRef = storage.ref($submitPFSModalDetails.value.downloadSensibleUrl);
      await deleteStorageRef.delete().catch(() => { });
    }

    const updatedDocumentsByType = {
      ...documentsByType,
      [documentType]: updatedDocs,
    };
    const pfsEmpty = !(updatedDocumentsByType.personalFinancialStatement || []).length;
    const taxEmpty = !(updatedDocumentsByType.personalTaxReturn || []).length;

    const clearedFields = {};
    if (documentType === 'personalFinancialStatement' && updatedDocs.length === 0) {
      clearedFields.totalAssets = '';
      clearedFields.totalLiabilities = '';
      clearedFields.netWorth = '';
      clearedFields.liquidity = '';
      clearedFields.annualDebtService = '';
    }
    if (documentType === 'personalTaxReturn' && updatedDocs.length === 0) {
      clearedFields.adjustedGrossIncome = '';
    }
    if (pfsEmpty && taxEmpty) {
      clearedFields.asOfDate = null;
    }

    $submitPFSModalDetails.update({
      ...$submitPFSModalDetails.value,
      documentsByType: updatedDocumentsByType,
      currentDocumentIndex: {
        ...currentDocumentIndex,
        [documentType]: newIndex,
      },
      pdfUrl: newPdfUrl,
      downloadSensibleUrl: null,
      ...clearedFields,
    });

    if (pfsEmpty && taxEmpty) {
      $submitPFSModalView.update({ ocrApplied: false });
    }
  } catch (error) {
    $submitPFSModalView.update({ error: error?.message ?? 'Failed to remove document', isLoading: false });
  } finally {
    $submitPFSModalView.update({ isLoading: false });
  }
};

export const handleSwitchDocument = (index) => {
  const { documentType } = $submitPFSModalView.value;
  const { documentsByType, currentDocumentIndex } = $submitPFSModalDetails.value;
  const docs = documentsByType[documentType] || [];
  if (index < 0 || index >= docs.length) return;
  $submitPFSModalDetails.update({
    currentDocumentIndex: {
      ...currentDocumentIndex,
      [documentType]: index,
    },
    pdfUrl: docs[index].previewUrl,
  });
};

const loadGuarantorDocumentsFromBackend = async (guarantorFinancialId) => {
  try {
    const response = await guarantorFinancialDocumentsApi.getByGuarantorFinancial(guarantorFinancialId);
    const rawData = response?.success && response?.data ? response.data : response?.data;
    const documentsArray = Array.isArray(rawData) ? rawData : [];
    if (documentsArray.length > 0) {
      const documentsByType = {
        personalFinancialStatement: [],
        personalTaxReturn: [],
      };
      documentsArray.forEach((doc) => {
        const type = doc.documentType || 'personalFinancialStatement';
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
        } else {
          documentsByType.personalFinancialStatement.push({
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
    personalFinancialStatement: [],
    personalTaxReturn: [],
  };
};

const formatDateForInput = (dateString) => {
  if (!dateString) return '';
  return new Date(dateString).toISOString().split('T')[0];
};
const collectStoredIdsByType = (documentsByType) => ({
  personalFinancialStatement: (documentsByType.personalFinancialStatement || [])
    .filter((d) => d.isStored && d.id)
    .map((d) => d.id),
  personalTaxReturn: (documentsByType.personalTaxReturn || [])
    .filter((d) => d.isStored && d.id)
    .map((d) => d.id),
});

export const handleOpenEditMode = async (financial) => {
  const expectedFinancialId = financial.id;
  $submitPFSModalView.update({ isLoading: true });
  try {
    const documentsByType = await loadGuarantorDocumentsFromBackend(financial.id);
    // User may have closed the modal or submitted while documents were loading; do not reopen.
    if ($submitPFSModalView.value.editingFinancialId !== expectedFinancialId) {
      return;
    }
    const firstDocType = Object.keys(documentsByType).find((type) => documentsByType[type].length > 0);
    const firstDoc = firstDocType ? documentsByType[firstDocType][0] : null;

    $submitPFSModalDetails.update({
      downloadSensibleUrl: false,
      asOfDate: formatDateForInput(financial.asOfDate),
      totalAssets: financial.totalAssets?.toString() || '',
      totalLiabilities: financial.totalLiabilities?.toString() || '',
      netWorth: financial.netWorth?.toString() || '',
      liquidity: financial.liquidity?.toString() || '',
      annualDebtService: financial.annualDebtService?.toString() || '',
      adjustedGrossIncome: financial.adjustedGrossIncome?.toString() || '',
      debtToIncomeRatio: financial.debtToIncomeRatio != null || financial.debtToincomeRatio != null
        ? (() => {
          const raw = financial.debtToIncomeRatio ?? financial.debtToincomeRatio;
          const n = normalizeRatioDecimalToPercent(raw);
          return n != null ? n.toFixed(2) : null;
        })()
        : null,
      notes: financial.notes || '',
      documentsByType,
      initialStoredDocumentIdsByType: collectStoredIdsByType(documentsByType),
      pdfUrl: firstDoc?.previewUrl || firstDoc?.storageUrl || null,
      currentDocumentIndex: {
        personalFinancialStatement: 0,
        personalTaxReturn: 0,
      },
    });

    $submitPFSModalView.update({
      activeModalKey: 'submitPFS',
      guarantorId: financial.guarantorId ?? $submitPFSModalView.value.guarantorId,
      isEditMode: true,
      editingFinancialId: financial.id,
      documentType: firstDocType || 'personalFinancialStatement',
      isLoading: false,
    });
  } catch (error) {
    if ($submitPFSModalView.value.editingFinancialId !== expectedFinancialId) {
      return;
    }
    $submitPFSModalView.update({
      error: error?.message ?? 'Failed to load financial data for editing',
      isLoading: false,
    });
  }
};

export const handleSubmit = async (onCloseCallback) => {
  $submitPFSModalView.update({ isSubmitting: true });
  try {
    const { guarantorId } = $submitPFSModalView.value;
    const {
      asOfDate,
      totalAssets,
      totalLiabilities,
      netWorth,
      liquidity,
      annualDebtService,
      adjustedGrossIncome,
      debtToIncomeRatio,
      notes,
      downloadSensibleUrl,
    } = $submitPFSModalDetails.value;
    const { organizationId } = $user.value || {};

    if (!guarantorId) {
      $submitPFSModalView.update({ error: 'Guarantor is required. Please open this modal from a guarantor page.', isSubmitting: false });
      return;
    }
    if (!asOfDate) {
      $submitPFSModalView.update({ error: 'As of Date is required. Please select a date.', isSubmitting: false });
      return;
    }
    if (!organizationId) {
      $submitPFSModalView.update({ error: 'Organization ID is required. Please ensure you are logged in.', isSubmitting: false });
      return;
    }

    const totalAssetsNumber = toNumberOrNull(totalAssets);
    const totalLiabilitiesNumber = toNumberOrNull(totalLiabilities);
    const computedNetWorth = totalAssetsNumber != null && totalLiabilitiesNumber != null
      ? totalAssetsNumber - totalLiabilitiesNumber
      : toNumberOrNull(netWorth);

    const annualDebtServiceNum = toNumberOrNull(annualDebtService);
    const adjustedGrossIncomeNum = toNumberOrNull(adjustedGrossIncome);
    const computedDtiRaw = computeDebtToIncomeRatio(annualDebtServiceNum, adjustedGrossIncomeNum);
    const computedDebtToIncomeRatio = computedDtiRaw != null
      ? normalizeRatioDecimalToPercent(computedDtiRaw)
      : null;

    // Body shape: GuarantorFinancialData (id only on update, from URL)
    const pfsData = {
      guarantorId,
      totalAssets: totalAssetsNumber,
      totalLiabilities: totalLiabilitiesNumber,
      netWorth: computedNetWorth,
      liquidity: toNumberOrNull(liquidity),
      annualDebtService: annualDebtServiceNum,
      adjustedGrossIncome: adjustedGrossIncomeNum,
      debtToIncomeRatio: computedDebtToIncomeRatio ?? toNumberOrNull(debtToIncomeRatio),
      asOfDate,
      submittedBy: $user.value?.email || $user.value?.name || 'Unknown User',
      notes: notes || '',
      organizationId,
    };

    let response;
    if ($submitPFSModalView.value.editingFinancialId) {
      response = await guarantorsApi.updateFinancial($submitPFSModalView.value.editingFinancialId, pfsData);
    } else {
      response = await guarantorsApi.createFinancial(guarantorId, pfsData);
    }

    if (response?.success || response?.data) {
      const data = response?.data ?? response;
      const financialId = data?.id ?? data?.data?.id ?? $submitPFSModalView.value.editingFinancialId;
      const uploadGuarantorFinancialId =
        $submitPFSModalView.value.editingFinancialId ?? financialId;

      if (uploadGuarantorFinancialId) {
        const { documentsByType } = $submitPFSModalDetails.value;
        const uploadPromises = [];
        Object.keys(documentsByType || {}).forEach((docType) => {
          const docs = documentsByType[docType] || [];
          docs.forEach((doc) => {
            if (doc?.file && !doc.isStored) {
              uploadPromises.push(
                guarantorFinancialDocumentsApi
                  .uploadFile({
                    guarantorFinancialId: uploadGuarantorFinancialId,
                    file: doc.file,
                    documentType: docType,
                    uploadedBy: $user.value?.email || $user.value?.name || 'Unknown User',
                  })
                  .catch(() => null),
              );
            }
          });
        });
        if (uploadPromises.length > 0) {
          await Promise.all(uploadPromises);
        }

        if ($submitPFSModalView.value.editingFinancialId) {
          const { initialStoredDocumentIdsByType } = $submitPFSModalDetails.value;
          const deletePromises = [];
          Object.keys(initialStoredDocumentIdsByType || {}).forEach((docType) => {
            const docs = documentsByType[docType] || [];
            const currentStoredIds = new Set(
              docs.filter((d) => d.isStored && d.id).map((d) => d.id),
            );
            (initialStoredDocumentIdsByType[docType] || []).forEach((id) => {
              if (!currentStoredIds.has(id)) {
                deletePromises.push(
                  guarantorFinancialDocumentsApi.delete(id).catch(() => null),
                );
              }
            });
          });
          if (deletePromises.length > 0) {
            await Promise.all(deletePromises);
          }
        }
      }

      if (downloadSensibleUrl && typeof downloadSensibleUrl === 'string') {
        const persistedPaths = new Set(
          Object.values($submitPFSModalDetails.value.documentsByType || {}).flatMap((docs) => (docs || [])
            .filter((d) => d?.isStored && d?.storagePath)
            .map((d) => d.storagePath)),
        );
        if (!persistedPaths.has(downloadSensibleUrl)) {
          try {
            const deleteStorageRef = storage.ref(downloadSensibleUrl);
            await deleteStorageRef.delete();
          } finally {
            $submitPFSModalDetails.update({ downloadSensibleUrl: false });
          }
        } else {
          $submitPFSModalDetails.update({ downloadSensibleUrl: false });
        }
      }

      const wasEditMode = $submitPFSModalView.value.isEditMode;
      await onCloseCallback();
      await fetchGuarantorDetail(guarantorId);

      successAlert(wasEditMode ? 'PFS updated successfully!' : 'PFS submitted successfully!', 'toast');
    } else {
      $submitPFSModalView.update({ error: response?.error || response?.message || 'Failed to submit PFS' });
    }
  } catch (err) {
    let errorMessage = 'An error occurred while submitting PFS';
    if (err?.error) errorMessage = err.error;
    else if (err?.response?.data?.error) errorMessage = err.response.data.error;
    else if (err?.response?.data?.message) errorMessage = err.response.data.message;
    else if (err?.message) errorMessage = err.message;
    $submitPFSModalView.update({ error: errorMessage });
  } finally {
    $submitPFSModalView.update({ isSubmitting: false });
  }
};
