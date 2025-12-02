import apiClient from './client';
import publicClient from './publicClient';

/**
 * Create upload link (protected)
 */
export const createUploadLink = async (borrowerId) => {
  try {
    const response = await apiClient.post('/borrower-financial-upload-links', {
      borrowerId,
    });
    return response;
  } catch (error) {
    console.error('Create upload link API error:', error);
    throw error;
  }
};

/**
 * Get upload links for borrower (protected)
 */
export const getUploadLinks = async (borrowerId) => {
  try {
    const response = await apiClient.get(`/borrower-financial-upload-links/borrower/${borrowerId}`);
    return response;
  } catch (error) {
    console.error('Get upload links API error:', error);
    throw error;
  }
};

/**
 * Get or create permanent upload link for borrower (protected)
 */
export const getPermanentUploadLink = async (borrowerId) => {
  try {
    const response = await apiClient.get(`/borrower-financial-upload-links/borrower/${borrowerId}/permanent`);
    return response;
  } catch (error) {
    console.error('Get permanent upload link API error:', error);
    throw error;
  }
};

/**
 * Revoke upload link (protected)
 */
export const revokeUploadLink = async (linkId) => {
  try {
    const response = await apiClient.delete(`/borrower-financial-upload-links/${linkId}`);
    return response;
  } catch (error) {
    console.error('Revoke upload link API error:', error);
    throw error;
  }
};

/**
 * Get upload link by token (public, no auth)
 */
export const getUploadLinkByToken = async (token) => {
  try {
    const response = await publicClient.get(`/borrower-financial-upload-links/public/${token}`);
    return response;
  } catch (error) {
    console.error('Get upload link by token API error:', error);
    throw error;
  }
};

/**
 * Submit financials via token (public, no auth)
 */
export const submitFinancialsViaToken = async (token, financialData) => {
  try {
    const response = await publicClient.post(
      `/borrower-financial-upload-links/public/${token}/submit`,
      financialData
    );
    return response;
  } catch (error) {
    console.error('Submit financials via token API error:', error);
    throw error;
  }
};

