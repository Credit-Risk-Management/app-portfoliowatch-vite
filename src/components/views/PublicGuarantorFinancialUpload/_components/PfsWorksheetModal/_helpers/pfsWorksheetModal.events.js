import { dangerAlert, successAlert } from '@src/components/global/Alert/_helpers/alert.events';
import { $publicGuarantorUploadView } from '../../../_helpers/publicGuarantorFinancialUpload.consts';
import {
  $pfsWorksheetForm,
  $pfsWorksheetStep,
  createDefaultPfsWorksheetForm,
  PFS_WORKSHEET_STEPS,
} from './pfsWorksheetModal.consts';
import { mergePriorPfsWorksheetIntoForm, validatePfsWorksheetForSubmit } from './pfsWorksheetModal.helpers';
import { applyPfsWorksheetRollup } from './pfsWorksheetRollup.helpers';

export const openPfsWorksheetModal = () => {
  const { linkData, pfsWorksheetHydratedFromPrior } = $publicGuarantorUploadView.value;
  if (linkData?.priorPfsWorksheet && !pfsWorksheetHydratedFromPrior) {
    const merged = mergePriorPfsWorksheetIntoForm(linkData.priorPfsWorksheet, linkData);
    $pfsWorksheetForm.update(merged);
    $publicGuarantorUploadView.update({
      activeModalKey: 'pfs',
      pfsWorksheetErrors: null,
      pfsWorksheetHydratedFromPrior: true,
    });
  } else if (!$pfsWorksheetForm.value?.name) {
    $pfsWorksheetForm.update(
      mergePriorPfsWorksheetIntoForm(createDefaultPfsWorksheetForm(), linkData),
    );
  }
  $pfsWorksheetStep.update(0);
  $publicGuarantorUploadView.update({ activeModalKey: 'pfs', pfsWorksheetErrors: null });
};

export const closePfsWorksheetModal = () => {
  $pfsWorksheetStep.update(0);
  $publicGuarantorUploadView.update({
    activeModalKey: null,
    pfsWorksheetErrors: null,
    pfsWorksheetSubmitting: false,
  });
};

export const patchPfsWorksheetForm = (patch) => {
  if ($publicGuarantorUploadView.value.pfsWorksheetErrors) {
    $publicGuarantorUploadView.update({ pfsWorksheetErrors: null });
  }
  const merged = {
    ...$pfsWorksheetForm.value,
    ...patch,
  };
  $pfsWorksheetForm.update(applyPfsWorksheetRollup(merged));
};

export const goPfsWorksheetStep = (delta) => {
  const cur = $pfsWorksheetStep.value ?? 0;
  const next = Math.min(PFS_WORKSHEET_STEPS.length - 1, Math.max(0, cur + delta));
  if (delta > 0 && PFS_WORKSHEET_STEPS[next]?.id === 'review') {
    $pfsWorksheetForm.update(applyPfsWorksheetRollup($pfsWorksheetForm.value || {}));
  }
  $pfsWorksheetStep.update(next);
};

export const savePfsWorksheetModal = () => {
  const form = applyPfsWorksheetRollup($pfsWorksheetForm.value || {});
  $pfsWorksheetForm.update(form);
  const { valid, errors } = validatePfsWorksheetForSubmit(form);
  if (!valid) {
    $publicGuarantorUploadView.update({ pfsWorksheetErrors: errors });
    dangerAlert('Please complete required PFS fields before saving.');
    return;
  }
  $publicGuarantorUploadView.update({ pfsWorksheetErrors: null });
  closePfsWorksheetModal();
  successAlert('PFS worksheet saved. The official PDF will be generated when you submit.', 'toast');
};
