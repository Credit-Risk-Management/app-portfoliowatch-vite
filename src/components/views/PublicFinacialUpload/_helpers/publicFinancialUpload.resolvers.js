import { getUploadLinkByToken } from '@src/api/borrowerFinancialUploadLink.api';
import { dangerAlert } from '@src/components/global/Alert/_helpers/alert.events';
import {
  $publicFinancialUploadView,
} from './publicFinancialUpload.consts';

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

    $publicFinancialUploadView.update({
      linkData: response?.data ?? null,
      token,
      debtScheduleWorksheetHydratedFromPrior: false,
    });
  } catch (err) {
    dangerAlert(err.message || 'Invalid or expired upload link');
    $publicFinancialUploadView.update({
      linkData: null,
      isLoading: false,
      error: err.message || 'Invalid or expired upload link',
    });
  } finally {
    $publicFinancialUploadView.update({
      isLoading: false,
    });
  }
};

export default fetchUploadLinkData;
