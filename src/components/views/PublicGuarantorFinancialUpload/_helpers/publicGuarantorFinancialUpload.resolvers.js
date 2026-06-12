/* eslint-disable import/prefer-default-export */
import { getGuarantorUploadLinkByToken } from '@src/api/guarantorFinancialUploadLink.api';
import { dangerAlert } from '@src/components/global/Alert/_helpers/alert.events';
import { $pfsWorksheetForm } from '../_components/PfsWorksheetModal/_helpers/pfsWorksheetModal.consts';
import { mergePriorPfsWorksheetIntoForm } from '../_components/PfsWorksheetModal/_helpers/pfsWorksheetModal.helpers';
import { applyPfsWorksheetRollup } from '../_components/PfsWorksheetModal/_helpers/pfsWorksheetRollup.helpers';
import { $publicGuarantorUploadView } from './publicGuarantorFinancialUpload.consts';

const hydratePfsWorksheetFromLinkData = (linkData) => {
  if (!linkData?.priorPfsWorksheet) return;
  const merged = applyPfsWorksheetRollup(
    mergePriorPfsWorksheetIntoForm(linkData.priorPfsWorksheet, linkData),
  );
  $pfsWorksheetForm.update(merged);
};

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
      pfsWorksheetHydratedFromPrior: Boolean(linkData?.priorPfsWorksheet),
    });
    hydratePfsWorksheetFromLinkData(linkData);
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
