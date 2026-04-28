import {
  closeDebtScheduleWorksheetModal,
  handleSubmitDebtScheduleWorksheet,
  patchDebtScheduleWorksheetForm,
} from '../../../_helpers/publicFinancialUpload.events';

export const onCloseDebtScheduleWorksheetModal = () => {
  closeDebtScheduleWorksheetModal();
};

export const onSaveDebtScheduleWorksheet = () => {
  handleSubmitDebtScheduleWorksheet().catch(() => {});
};

export const onPatchDebtScheduleWorksheetForm = (patch) => {
  patchDebtScheduleWorksheetForm(patch);
};
