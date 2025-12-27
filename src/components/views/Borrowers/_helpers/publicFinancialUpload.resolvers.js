/* eslint-disable import/prefer-default-export */
import { getUploadLinkByToken } from '@src/api/borrowerFinancialUploadLink.api';
import { $publicFinancialUploadView } from './publicFinancialUpload.consts';

/**
 * Fetch upload link data by token
 * @param {string} token - The upload link token from URL params
 */
export const fetchUploadLinkData = async (token) => {
  if (!token) {
    $publicFinancialUploadView.update({
      error: 'No token provided',
      isLoading: false,
    });
    return;
  }

  try {
    $publicFinancialUploadView.update({
      isLoading: true,
      error: null,
    });

    const response = await getUploadLinkByToken(token);

    if (response.status === 'success') {
      $publicFinancialUploadView.update({
        linkData: response.data,
        isLoading: false,
      });
    } else {
      $publicFinancialUploadView.update({
        linkData: null,
        isLoading: false,
        error: 'Failed to load upload link',
      });
    }
  } catch (err) {
    console.error('Error fetching link data:', err);
    $publicFinancialUploadView.update({
      linkData: null,
      isLoading: false,
      error: err.message || 'Invalid or expired upload link',
    });
  }
};
