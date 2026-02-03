import apiClient from './client';

/**
 * Get or create permanent upload link for guarantor (protected)
 */
const getPermanentGuarantorUploadLink = async (guarantorId) => {
  const response = await apiClient.get(`/guarantor-financial-upload-links/guarantor/${guarantorId}/permanent`);
  return response;
};

export default getPermanentGuarantorUploadLink;
