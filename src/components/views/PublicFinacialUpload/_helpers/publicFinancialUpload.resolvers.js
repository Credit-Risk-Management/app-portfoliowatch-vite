import { getUploadLinkByToken } from '@src/api/borrowerFinancialUploadLink.api';
import { getImpactQuestionnairePublic } from '@src/api/publicImpactQuestionnaire.api';
import { dangerAlert } from '@src/components/global/Alert/_helpers/alert.events';
import {
  $publicFinancialUploadView,
} from './publicFinancialUpload.consts';
import { parseImpactQuestionnaireTokenFromUrl } from './publicFinancialUpload.helpers';

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
    const linkPayload = response?.data ?? null;

    $publicFinancialUploadView.update({
      linkData: linkPayload,
      token,
      debtScheduleWorksheetHydratedFromPrior: false,
      impactQuestionnaireToken: null,
      impactQuestionnairePublicComplete: false,
    });

    const iqToken = parseImpactQuestionnaireTokenFromUrl(linkPayload?.impactQuestionnaireUrl);
    if (iqToken) {
      try {
        const iqRes = await getImpactQuestionnairePublic(iqToken);
        const p = iqRes?.data ?? iqRes;
        if (p?.alreadySubmitted) {
          $publicFinancialUploadView.update({ impactQuestionnairePublicComplete: true });
        }
      } catch {
        // Questionnaire context is optional for initial load; user can open the row modal.
      }
    }
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
