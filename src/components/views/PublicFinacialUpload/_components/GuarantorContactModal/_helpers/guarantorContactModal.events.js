import { $publicFinancialUploadView } from '../../../_helpers/publicFinancialUpload.consts';
import { validateGuarantorContactForms } from './guarantorContactModal.helpers';

export const openGuarantorContactModal = () => {
  $publicFinancialUploadView.update({
    activeModalKey: 'guarantorContact',
    guarantorContactErrors: null,
  });
};

export const closeGuarantorContactModal = () => {
  $publicFinancialUploadView.update({
    activeModalKey: null,
    guarantorContactErrors: null,
  });
};

export const clearGuarantorContactModalErrors = () => {
  $publicFinancialUploadView.update({ guarantorContactErrors: null });
};

export const saveGuarantorContactModal = () => {
  const { linkData } = $publicFinancialUploadView.value;
  const guarantorsNeedingContact = linkData?.guarantorsNeedingContact ?? [];
  const { valid, errors } = validateGuarantorContactForms(guarantorsNeedingContact);

  if (!valid) {
    $publicFinancialUploadView.update({ guarantorContactErrors: errors });
    return;
  }

  $publicFinancialUploadView.update({
    guarantorContactComplete: true,
    guarantorContactErrors: null,
    activeModalKey: null,
  });
};
