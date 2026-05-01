import apiClient from './client';
import publicClient from './publicClient';

/**
 * Get or create permanent upload link for guarantor (protected)
 */
const getPermanentGuarantorUploadLink = async (guarantorId) => {
  const response = await apiClient.get(`/guarantor-financial-upload-links/guarantor/${guarantorId}/permanent`);
  return response;
};

/**
 * Create annual / custom guarantor upload link (protected).
 * @param {string} guarantorId
 * @param {object} [options] same shape as borrower create (submissionCadence, reportingPeriodEndDate, …)
 */
export const createGuarantorUploadLink = async (guarantorId, options = {}) => {
  const response = await apiClient.post('/guarantor-financial-upload-links', {
    guarantorId,
    ...options,
  });
  return response;
};

/**
 * Public: load link metadata for token
 */
export const getGuarantorUploadLinkByToken = async (token) => {
  const response = await publicClient.get(
    `/guarantor-financial-upload-links/public/${encodeURIComponent(token)}`,
  );
  return response;
};

export const getGuarantorPublicPriorDebtScheduleDownload = async (token) => publicClient.get(
  `/guarantor-financial-upload-links/public/${encodeURIComponent(token)}/prior-debt-schedule-download`,
);

/**
 * Public: create guarantor financial + signed upload slots (then PUT files to Storage).
 */
export const submitGuarantorFinancialsViaToken = async (token, body) => publicClient.post(
  `/guarantor-financial-upload-links/public/${encodeURIComponent(token)}/submit`,
  body,
);

/**
 * After PDFs are in Storage, start EXTRACT_GUARANTOR_FINANCIALS (Sensible).
 * @param {string} taskId
 */
export const notifyGuarantorExtractReadyViaToken = async (token, taskId) => publicClient.post(
  `/guarantor-financial-upload-links/public/${encodeURIComponent(token)}/extract-ready`,
  { taskId },
);

export default getPermanentGuarantorUploadLink;
