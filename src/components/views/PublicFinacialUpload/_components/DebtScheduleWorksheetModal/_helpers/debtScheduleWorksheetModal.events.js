import {
  closeDebtScheduleWorksheetModal,
  handleSubmitDebtScheduleWorksheet,
  patchDebtScheduleWorksheetForm,
} from '../../../_helpers/publicFinancialUpload.events';
import * as consts from './debtScheduleWorksheetModal.consts';

export const onDebtScheduleWrapCellEditStart = (fieldName) => {
  consts.$debtScheduleWorksheetWrapCellEdit.update({ name: fieldName });
};

export const onDebtScheduleWrapCellEditEnd = (fieldName) => {
  if (consts.$debtScheduleWorksheetWrapCellEdit.value.name === fieldName) {
    consts.$debtScheduleWorksheetWrapCellEdit.update({ name: null });
  }
};

export const onCloseDebtScheduleWorksheetModal = () => {
  closeDebtScheduleWorksheetModal();
};

export const onSaveDebtScheduleWorksheet = () => {
  handleSubmitDebtScheduleWorksheet().catch(() => { });
};

export const onPatchDebtScheduleWorksheetForm = (patch) => {
  patchDebtScheduleWorksheetForm(patch);
};
