/* eslint-disable import/prefer-default-export */
import { getGuarantorUploadLinkByToken } from '@src/api/guarantorFinancialUploadLink.api';
import { dangerAlert } from '@src/components/global/Alert/_helpers/alert.events';
import { hydratePfsWorksheetFromPriorLinkData } from '../_components/PfsWorksheetModal/_helpers/pfsWorksheetModal.events';
import { $publicGuarantorUploadView } from './publicGuarantorFinancialUpload.consts';

export const fetchGuarantorUploadLinkData = async (token) => {
  if (!token) {
    $publicGuarantorUploadView.update({
      error: 'No token provided',
      isLoading: false,
    });
    return;
  }

  try {
    $publicGuarantorUploadView.update({ isLoading: true, error: null });
    const response = await getGuarantorUploadLinkByToken(token);
    const linkData = response?.data ?? null;
    $publicGuarantorUploadView.update({
      linkData,
      token,
    });
    hydratePfsWorksheetFromPriorLinkData(linkData);
  } catch (err) {
    dangerAlert(err.message || 'Invalid or expired upload link');
    $publicGuarantorUploadView.update({
      linkData: null,
      isLoading: false,
      error: err.message || 'Invalid or expired upload link',
    });
  } finally {
    $publicGuarantorUploadView.update({ isLoading: false });
  }
};
