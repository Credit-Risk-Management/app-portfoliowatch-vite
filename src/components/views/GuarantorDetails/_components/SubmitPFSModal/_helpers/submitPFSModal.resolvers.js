import { $user } from '@src/signals';
import guarantorsApi from '@src/api/guarantors.api';
import guarantorFinancialDocumentsApi from '@src/api/guarantorFinancialDocuments.api';
import { dangerAlert, successAlert } from '@src/components/global/Alert/_helpers/alert.events';
import postToSensibleApi, { initiateUploadToSensibleApi } from '@src/api/sensible.api';
import { storage } from '@src/utils/firebase';
import { fetchGuarantorDetail } from '@src/components/views/GuarantorDetails/_helpers/guarantorDetails.resolvers';
import { $submitPFSModalView, $submitPFSModalDetails } from './submitPFSModal.const';
import extractFromPersonalFinancialStatement from './submitPFSModal.helpers';

const SENSIBLE_DOCUMENT_TYPES = {
  personalFinancialStatement: 'personal_financial_statement',
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
          const pfsData = extractFromPersonalFinancialStatement(parsedDocument);
          if (pfsData) {
            $submitPFSModalDetails.update(pfsData);
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
    const newPdfUrl = updatedDocs[newIndex]?.previewUrl || null;
    if ($submitPFSModalDetails.value.downloadSensibleUrl) {
      const deleteStorageRef = storage.ref($submitPFSModalDetails.value.downloadSensibleUrl);
      await deleteStorageRef.delete();
    }
    $submitPFSModalDetails.update({
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

    });
  } catch (error) {
    console.error('Error removing document:', error);
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
  };
};

const formatDateForInput = (dateString) => {
  if (!dateString) return '';
  return new Date(dateString).toISOString().split('T')[0];
};

export const handleOpenEditMode = async (financial) => {
  $submitPFSModalView.update({ isLoading: true });
  try {
    const documentsByType = await loadGuarantorDocumentsFromBackend(financial.id);
    const firstDocType = Object.keys(documentsByType).find((type) => documentsByType[type].length > 0);
    const firstDoc = firstDocType ? documentsByType[firstDocType][0] : null;

    $submitPFSModalDetails.update({
      asOfDate: formatDateForInput(financial.asOfDate),
      totalAssets: financial.totalAssets?.toString() || '',
      totalLiabilities: financial.totalLiabilities?.toString() || '',
      netWorth: financial.netWorth?.toString() || '',
      liquidity: financial.liquidity?.toString() || '',
      notes: financial.notes || '',
      documentsByType,
      pdfUrl: firstDoc?.previewUrl || firstDoc?.storageUrl || null,
      currentDocumentIndex: {
        personalFinancialStatement: 0,
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
      asOfDate, totalAssets, totalLiabilities, netWorth, liquidity, notes,
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

    // Body shape: GuarantorFinancialData (id only on update, from URL)
    const pfsData = {
      guarantorId,
      totalAssets: +totalAssets,
      totalLiabilities: +totalLiabilities,
      netWorth: +netWorth,
      liquidity: +liquidity,
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

      if (financialId) {
        const { documentsByType } = $submitPFSModalDetails.value;
        const uploadPromises = [];
        Object.keys(documentsByType || {}).forEach((docType) => {
          const docs = documentsByType[docType] || [];
          docs.forEach((doc) => {
            if (doc?.file && !doc.isStored) {
              uploadPromises.push(
                guarantorFinancialDocumentsApi
                  .uploadFile({
                    guarantorFinancialId: financialId,
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
      }

      if (downloadSensibleUrl) {
        try {
          const deleteStorageRef = storage.ref(downloadSensibleUrl);
          await deleteStorageRef.delete();
        } finally {
          $submitPFSModalDetails.update({ downloadSensibleUrl: null });
        }
      }

      await fetchGuarantorDetail(guarantorId);
      onCloseCallback();

      const updatedLoans = data?.updatedLoans || [];
      if (updatedLoans?.length) {
        $submitPFSModalView.update({ showWatchScoreResults: true, updatedLoans });
      }
      successAlert($submitPFSModalView.value.isEditMode ? 'PFS updated successfully!' : 'PFS submitted successfully!', 'toast');
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
