import { submitFinancialsViaToken } from '@src/api/borrowerFinancialUploadLink.api';
import {
  $publicFinancialForm,
  $financialDocsUploader,
  $publicFinancialUploadView,
} from './publicFinancialUpload.consts';

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
  const files = $financialDocsUploader.value.financialDocs || [];
  const { ocrApplied } = $publicFinancialUploadView.value;

  if (files.length > 0 && !ocrApplied) {
    // Simulate OCR processing delay
    setTimeout(() => {
      const mockData = generateMockFinancialData();
      $publicFinancialForm.update(mockData);
      $publicFinancialUploadView.update({
        ocrApplied: true,
        refreshKey: $publicFinancialUploadView.value.refreshKey + 1,
      });
    }, 500);
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
