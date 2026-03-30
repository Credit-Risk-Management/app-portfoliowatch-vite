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
import { getRequiredSectionIdsForLink } from './publicFinancialUpload.helpers';

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

export const resetAllPublicFinancialUploaders = () => {
  $publicIncomeStatementUploader.update({ financialDocs: [] });
  $publicBalanceSheetUploader.update({ financialDocs: [] });
  $publicCashFlowUploader.update({ financialDocs: [] });
  $publicOtherFinancialsUploader.update({ financialDocs: [] });
};

/** Clear staged files for one public-upload section (show dropzone again). */
export const clearPublicFinancialSectionFiles = (sectionId) => {
  const uploader = UPLOADER_BY_SECTION[sectionId];
  if (uploader) uploader.update({ financialDocs: [] });
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

  const sectionOrder = getRequiredSectionIdsForLink($publicFinancialUploadView.value.linkData);
  const missing = sectionOrder.find(
    (id) => !((UPLOADER_BY_SECTION[id].value.financialDocs || []).length),
  );
  if (missing) {
    $publicFinancialUploadView.update({
      error: 'Please upload all required PDFs before running extraction.',
    });
    return;
  }

  $publicFinancialUploadView.update({ isExtracting: true, error: null });

  try {
    await sectionOrder.reduce(async (previous, sectionKey) => {
      await previous;
      const uploader = UPLOADER_BY_SECTION[sectionKey];
      const files = uploader.value.financialDocs || [];
      const [file] = files;
      if (!file) {
        throw new Error(`Missing file for ${sectionKey}`);
      }
      await extractOnePublicFinancialFile(sectionKey, file, token);
    }, Promise.resolve());

    const sectionsExtracted = { ...initialPublicFinancialSectionsExtracted };
    sectionOrder.forEach((id) => {
      sectionsExtracted[id] = true;
    });

    $publicFinancialUploadView.update({
      ocrApplied: true,
      flowStep: 'review',
      sectionsExtracted,
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

/**
 * Generate mock financial data from OCR (simulated)
 * In production, this would call a real OCR service
 */
const generateMockFinancialData = () => {
  const grossRevenue = Math.floor(Math.random() * (10000000 - 2000000) + 2000000);
  const netIncomeMargin = 0.10 + Math.random() * 0.15;
  const netIncome = Math.floor(grossRevenue * netIncomeMargin);
  const ebitdaMargin = 0.15 + Math.random() * 0.15;
  const ebitda = Math.floor(grossRevenue * ebitdaMargin);

  const today = new Date();
  const quartersBack = Math.floor(Math.random() * 4);
  const currentQuarter = Math.floor(today.getMonth() / 3);
  const targetQuarter = currentQuarter - quartersBack;

  const yearOffset = Math.floor((targetQuarter < 0 ? targetQuarter - 3 : targetQuarter) / 4);
  const year = today.getFullYear() + yearOffset;
  const quarter = ((targetQuarter % 4) + 4) % 4;
  const month = quarter * 3 + 2;
  const lastDay = new Date(year, month + 1, 0).getDate();
  const asOfDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

  return {
    asOfDate,
    grossRevenue: grossRevenue.toString(),
    netIncome: netIncome.toString(),
    ebitda: ebitda.toString(),
    debtService: (1.0 + Math.random() * 2.0).toFixed(2),
    debtServiceCovenant: (1.0 + Math.random() * 0.5).toFixed(2),
    currentRatio: (1.5 + Math.random() * 2.0).toFixed(2),
    currentRatioCovenant: (1.2 + Math.random() * 0.5).toFixed(2),
    liquidity: Math.floor(Math.random() * (2000000 - 300000) + 300000).toString(),
    liquidityCovenant: Math.floor(Math.random() * (800000 - 250000) + 250000).toString(),
    liquidityRatio: (1.2 + Math.random() * 1.5).toFixed(2),
    liquidityRatioCovenant: (1.0 + Math.random() * 0.5).toFixed(2),
    retainedEarnings: Math.floor(grossRevenue * (0.3 + Math.random() * 0.4)).toString(),
  };
};

/**
 * Handle file upload and trigger OCR
 */
export const handleFileUpload = () => {
  const files = $publicIncomeStatementUploader.value.financialDocs || [];
  const { ocrApplied } = $publicFinancialUploadView.value;

  if (files.length > 0 && !ocrApplied) {
    // Simulate OCR processing delay
    setTimeout(() => {
      const mockData = generateMockFinancialData();
      $publicFinancialForm.update(mockData);
      $publicFinancialUploadView.update({
        ocrApplied: true,
        refreshKey: $publicFinancialUploadView.value.refreshKey + 1,
        isExtracting: false,
        downloadSensibleUrl: null,
        flowStep: 'review',
        sectionsExtracted: {
          ...initialPublicFinancialSectionsExtracted,
          incomeStatement: true,
          balanceSheet: true,
        },
      });
    }, 500);
  }
};
