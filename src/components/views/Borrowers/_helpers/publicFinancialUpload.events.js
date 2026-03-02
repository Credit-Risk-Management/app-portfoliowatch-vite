import { submitFinancialsViaToken } from '@src/api/borrowerFinancialUploadLink.api';
import postToSensibleApi, { initiateUploadToSensibleApi } from '@src/api/sensible.api';
import { storage } from '@src/utils/firebase';
import { dangerAlert } from '@src/components/global/Alert/_helpers/alert.events';
import { extractIncomeStatementFromApiResponse, extractBalanceSheetFromApiResponse } from './financials.helpers';
import {
  $publicFinancialForm,
  $financialDocsUploader,
  $publicFinancialUploadView,
} from './publicFinancialUpload.consts';

const SENSIBLE_DOCUMENT_TYPES = {
  incomeStatement: 'income_statement',
  balanceSheet: 'balance_sheet',
};

const inferDocumentTypeFromFilename = (fileName) => {
  if (!fileName) return 'incomeStatement';
  const lower = fileName.toLowerCase();
  if (lower.includes('balance') || lower.includes('balance_sheet') || lower.includes('balancesheet')) {
    return 'balanceSheet';
  }
  return 'incomeStatement';
};

/**
 * Handle file upload and trigger Sensible OCR extraction
 */
export const handleFileUpload = async () => {
  const files = $financialDocsUploader.value.financialDocs || [];
  const { ocrApplied, token } = $publicFinancialUploadView.value;
  if (!files.length || ocrApplied) return;
  if (!token) {
    $publicFinancialUploadView.update({ error: 'Upload link not ready. Please refresh the page.' });
    return;
  }

  $publicFinancialUploadView.update({ isLoading: true, error: null });

  try {
    const [file] = files;
    const documentType = inferDocumentTypeFromFilename(file.name);
    const sensibleType = SENSIBLE_DOCUMENT_TYPES[documentType];

    const initiateUploadData = {
      fileName: file.name,
      contentType: file.type,
      id: token,
      documentType,
      uploadedBy: 'Public Upload',
    };

    const response = await initiateUploadToSensibleApi(initiateUploadData);
    $publicFinancialUploadView.update({ downloadSensibleUrl: response.storagePath });

    const storageRef = storage.ref(response.storagePath);
    const uploadTask = await storageRef.put(file, { contentType: file.type });
    const downloadURL = await uploadTask.ref.getDownloadURL();

    if (!downloadURL) {
      dangerAlert('Failed to upload file to storage');
      $publicFinancialUploadView.update({ isLoading: false, downloadSensibleUrl: null });
      return;
    }

    $publicFinancialUploadView.update({ isLoading: false });

    const sensibleBody = {
      url: downloadURL,
      documentType: sensibleType,
      configurationName: sensibleType,
      environment: 'development',
      documentName: file.name,
    };

    const sensibleResponse = await postToSensibleApi(sensibleBody);
    const parsedDocument = sensibleResponse?.data?.parsed_document ?? sensibleResponse?.parsed_document ?? null;

    if (parsedDocument) {
      let extractedData = null;
      if (documentType === 'incomeStatement') {
        extractedData = extractIncomeStatementFromApiResponse(parsedDocument);
      } else {
        extractedData = extractBalanceSheetFromApiResponse(parsedDocument);
      }

      if (extractedData) {
        const formUpdate = { ...extractedData };

        if (documentType === 'balanceSheet') {
          if (extractedData.cash) formUpdate.liquidity = extractedData.cash;
          if (extractedData.totalCurrentAssets && extractedData.totalCurrentLiabilities) {
            const assets = parseFloat(extractedData.totalCurrentAssets);
            const liabilities = parseFloat(extractedData.totalCurrentLiabilities);
            if (liabilities > 0 && !Number.isNaN(assets) && !Number.isNaN(liabilities)) {
              formUpdate.currentRatio = (assets / liabilities).toFixed(2);
            }
          }
        }

        $publicFinancialForm.update(formUpdate);
      }
    }

    $publicFinancialUploadView.update({
      ocrApplied: true,
      refreshKey: $publicFinancialUploadView.value.refreshKey + 1,
      isLoading: false,
      downloadSensibleUrl: null,
    });
  } catch (error) {
    const pathToClean = $publicFinancialUploadView.value.downloadSensibleUrl;
    if (pathToClean) {
      try {
        const deleteStorageRef = storage.ref(pathToClean);
        await deleteStorageRef.delete();
      } catch {
        // ignore cleanup errors
      }
      $publicFinancialUploadView.update({ downloadSensibleUrl: null });
    }
    $publicFinancialUploadView.update({
      isLoading: false,
      error: error?.message ?? 'Failed to extract financial data from document',
    });
  } finally {
    $publicFinancialUploadView.update({ isLoading: false });
    $financialDocsUploader.update({ financialDocs: [] });
  }
};

/**
 * Handle form submission
 * @param {string} token - The upload link token
 */
export const handleSubmit = async (token) => {
  try {
    $publicFinancialUploadView.update({
      isSubmitting: true,
      error: null,
    });

    const formData = $publicFinancialForm.value;

    const financialData = {
      asOfDate: formData.asOfDate,
      grossRevenue: formData.grossRevenue || null,
      netIncome: formData.netIncome || null,
      ebitda: formData.ebitda || null,
      debtService: formData.debtService || null,
      debtServiceCovenant: formData.debtServiceCovenant || null,
      currentRatio: formData.currentRatio || null,
      currentRatioCovenant: formData.currentRatioCovenant || null,
      liquidity: formData.liquidity || null,
      liquidityCovenant: formData.liquidityCovenant || null,
      liquidityRatio: formData.liquidityRatio || null,
      liquidityRatioCovenant: formData.liquidityRatioCovenant || null,
      retainedEarnings: formData.retainedEarnings || null,
      notes: formData.notes || null,
      documentIds: [], // In a real implementation, this would include uploaded document IDs
    };

    const response = await submitFinancialsViaToken(token, financialData);

    if (response.status === 'success') {
      $publicFinancialUploadView.update({
        success: true,
        isSubmitting: false,
      });
      $publicFinancialForm.reset();
      $financialDocsUploader.update({ financialDocs: [] });
    } else {
      $publicFinancialUploadView.update({
        error: response.message || 'Failed to submit financial data',
        isSubmitting: false,
      });
    }
  } catch (err) {
    console.error('Error submitting financial data:', err);
    $publicFinancialUploadView.update({
      error: err.message || 'An error occurred while submitting financial data',
      isSubmitting: false,
    });
  }
};

/**
 * Reset form and allow another submission
 */
export const handleSubmitAnother = () => {
  $publicFinancialUploadView.update({
    success: false,
    ocrApplied: false,
    downloadSensibleUrl: null,
  });
  $publicFinancialForm.reset();
  $financialDocsUploader.update({ financialDocs: [] });
};

/**
 * Clear error message
 */
export const clearError = () => {
  $publicFinancialUploadView.update({ error: null });
};
