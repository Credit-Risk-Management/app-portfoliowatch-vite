import { submitFinancialsViaToken } from '@src/api/borrowerFinancialUploadLink.api';
import postToSensibleApi, { initiateUploadToSensibleApi } from '@src/api/sensible.api';
import { storage } from '@src/utils/firebase';
import { dangerAlert } from '@src/components/global/Alert/_helpers/alert.events';
import {
  extractIncomeStatementFromApiResponse,
  extractBalanceSheetFromApiResponse,
} from './financials.helpers';
import {
  $publicFinancialForm,
  $publicIncomeStatementUploader,
  $publicBalanceSheetUploader,
  $publicCashFlowUploader,
  $publicOtherFinancialsUploader,
  $publicFinancialUploadView,
  initialPublicFinancialSectionsExtracted,
} from './publicFinancialUpload.consts';
import { resetPublicFinancialPdfPreview } from './publicFinancialUpload.pdfPreview.resolvers';

const SENSIBLE_DOCUMENT_TYPES = {
  incomeStatement: 'income_statement',
  balanceSheet: 'balance_sheet',
};

const SECTION_TO_API_DOCUMENT_TYPE = {
  incomeStatement: 'incomeStatement',
  balanceSheet: 'balanceSheet',
  cashFlow: 'incomeStatement',
  otherFinancials: 'incomeStatement',
};

const UPLOADER_BY_SECTION = {
  incomeStatement: $publicIncomeStatementUploader,
  balanceSheet: $publicBalanceSheetUploader,
  cashFlow: $publicCashFlowUploader,
  otherFinancials: $publicOtherFinancialsUploader,
};

/** Order for batch extraction (income before balance so balance can complement form). */
const EXTRACTION_ORDER = ['incomeStatement', 'balanceSheet'];

export const resetAllPublicFinancialUploaders = () => {
  $publicIncomeStatementUploader.update({ financialDocs: [] });
  $publicBalanceSheetUploader.update({ financialDocs: [] });
  $publicCashFlowUploader.update({ financialDocs: [] });
  $publicOtherFinancialsUploader.update({ financialDocs: [] });
  resetPublicFinancialPdfPreview();
};

const cleanupStoragePath = async (path) => {
  if (!path) return;
  try {
    await storage.ref(path).delete();
  } catch {
    // ignore
  }
};

/**
 * Run Sensible OCR for one staged file and merge into the public financial form.
 * @param {string} sectionKey
 * @param {File} file
 * @param {string} token
 */
const extractOnePublicFinancialFile = async (sectionKey, file, token) => {
  const documentType = SECTION_TO_API_DOCUMENT_TYPE[sectionKey] || 'incomeStatement';
  const sensibleType = SENSIBLE_DOCUMENT_TYPES[documentType];

  const initiateUploadData = {
    fileName: file.name,
    contentType: file.type,
    id: token,
    documentType,
    uploadedBy: 'Public Upload',
  };

  const { storagePath } = await initiateUploadToSensibleApi(initiateUploadData);
  $publicFinancialUploadView.update({ downloadSensibleUrl: storagePath });

  const storageRef = storage.ref(storagePath);
  const uploadTask = await storageRef.put(file, { contentType: file.type });
  const downloadURL = await uploadTask.ref.getDownloadURL();

  if (!downloadURL) {
    await cleanupStoragePath(storagePath);
    $publicFinancialUploadView.update({ downloadSensibleUrl: null });
    throw new Error('Failed to upload file to storage');
  }

  const sensibleBody = {
    url: downloadURL,
    documentType: sensibleType,
    configurationName: sensibleType,
    environment: 'development',
    documentName: file.name,
  };

  const sensibleResponse = await postToSensibleApi(sensibleBody);
  const parsedDocument = sensibleResponse?.data?.parsed_document ?? sensibleResponse?.parsed_document ?? null;

  await cleanupStoragePath(storagePath);
  $publicFinancialUploadView.update({ downloadSensibleUrl: null });

  if (!parsedDocument) return;

  let extractedData = null;
  if (documentType === 'incomeStatement') {
    extractedData = extractIncomeStatementFromApiResponse(parsedDocument);
  } else {
    extractedData = extractBalanceSheetFromApiResponse(parsedDocument);
  }

  if (!extractedData) return;

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
};

/**
 * After all staged PDFs are chosen, upload to storage and run Sensible for each (income statement, then balance sheet).
 */
export const runPublicFinancialExtraction = async () => {
  const { token } = $publicFinancialUploadView.value;
  if (!token) {
    $publicFinancialUploadView.update({ error: 'Upload link not ready. Please refresh the page.' });
    return;
  }

  const incomeFiles = $publicIncomeStatementUploader.value.financialDocs || [];
  const balanceFiles = $publicBalanceSheetUploader.value.financialDocs || [];

  if (!incomeFiles.length || !balanceFiles.length) {
    $publicFinancialUploadView.update({
      error: 'Please upload both an income statement and a balance sheet PDF before running extraction.',
    });
    return;
  }

  $publicFinancialUploadView.update({ isExtracting: true, error: null });

  try {
    await EXTRACTION_ORDER.reduce(async (previous, sectionKey) => {
      await previous;
      const uploader = UPLOADER_BY_SECTION[sectionKey];
      const files = uploader.value.financialDocs || [];
      const [file] = files;
      if (!file) {
        throw new Error(`Missing file for ${sectionKey}`);
      }
      await extractOnePublicFinancialFile(sectionKey, file, token);
    }, Promise.resolve());

    $publicFinancialUploadView.update({
      ocrApplied: true,
      flowStep: 'review',
      sectionsExtracted: {
        ...initialPublicFinancialSectionsExtracted,
        incomeStatement: true,
        balanceSheet: true,
      },
      refreshKey: $publicFinancialUploadView.value.refreshKey + 1,
      isExtracting: false,
      downloadSensibleUrl: null,
    });
    resetAllPublicFinancialUploaders();
  } catch (error) {
    const pathToClean = $publicFinancialUploadView.value.downloadSensibleUrl;
    if (pathToClean) {
      await cleanupStoragePath(pathToClean);
      $publicFinancialUploadView.update({ downloadSensibleUrl: null });
    }
    dangerAlert(error?.message ?? 'Failed to extract financial data from documents');
    $publicFinancialUploadView.update({
      isExtracting: false,
      error: error?.message ?? 'Failed to extract financial data from documents',
    });
  }
};

/**
 * Return to step 1 to replace PDFs and re-run extraction (keeps current form values).
 */
export const handleBackToPublicUploadStep = () => {
  $publicFinancialUploadView.update({
    flowStep: 'upload',
    ocrApplied: false,
    error: null,
    isExtracting: false,
    sectionsExtracted: { ...initialPublicFinancialSectionsExtracted },
  });
  resetPublicFinancialPdfPreview();
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
      documentIds: [],
    };

    const response = await submitFinancialsViaToken(token, financialData);

    if (response.status === 'success') {
      $publicFinancialUploadView.update({
        success: true,
        isSubmitting: false,
        isExtracting: false,
        sectionsExtracted: { ...initialPublicFinancialSectionsExtracted },
        ocrApplied: false,
        flowStep: 'upload',
      });
      $publicFinancialForm.reset();
      resetAllPublicFinancialUploaders();
    } else {
      $publicFinancialUploadView.update({
        error: response.message || 'Failed to submit financial data',
        isSubmitting: false,
      });
    }
  } catch (err) {
    dangerAlert(err?.message || 'An error occurred while submitting financial data');
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
    isExtracting: false,
    sectionsExtracted: { ...initialPublicFinancialSectionsExtracted },
    flowStep: 'upload',
  });
  $publicFinancialForm.reset();
  resetAllPublicFinancialUploaders();
};

/**
 * Clear error message
 */
export const clearError = () => {
  $publicFinancialUploadView.update({ error: null });
};
