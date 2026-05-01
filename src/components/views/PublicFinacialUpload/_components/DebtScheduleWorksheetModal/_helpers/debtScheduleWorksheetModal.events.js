import {
  closeDebtScheduleWorksheetModal,
  handleSubmitDebtScheduleWorksheet,
  patchDebtScheduleWorksheetForm,
} from '../../../_helpers/publicFinancialUpload.events';
import * as consts from './debtScheduleWorksheetModal.consts';
import * as helpers from './debtScheduleWorksheetModal.helpers';

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

const escapeDebtWorksheetFocusAttr = (value) => (
  typeof CSS !== 'undefined' && CSS.escape ? CSS.escape(String(value)) : String(value).replace(/\\/g, '\\\\').replace(/"/g, '\\"')
);

/** Focus a worksheet table cell control (input, textarea, wrap preview button, or react-select combobox). */
export const focusDebtWorksheetFieldElement = (fieldName) => {
  if (fieldName == null || fieldName === '') return;
  const attr = consts.DEBT_WORKSHEET_FOCUS_DATA_ATTR;
  const safe = escapeDebtWorksheetFocusAttr(fieldName);
  requestAnimationFrame(() => {
    const host = document.querySelector(`[${attr}="${safe}"]`);
    if (!host) return;
    if (host.matches('button, input, textarea, select')) {
      host.focus();
      return;
    }
    const combobox = host.querySelector('[role="combobox"]');
    if (combobox) {
      combobox.focus();
      return;
    }
    const inp = host.querySelector('input');
    if (inp) inp.focus();
  });
};

/** Tab / Shift+Tab from wrap-cell textarea: move to adjacent column like a spreadsheet (default Tab inserts a tab). */
export const onDebtWorksheetWrapTextareaKeyDown = (fieldName, e) => {
  if (e.key !== 'Tab') return;
  const next = helpers.getAdjacentDebtWorksheetFieldName(fieldName, e.shiftKey);
  if (!next) return;
  e.preventDefault();
  focusDebtWorksheetFieldElement(next);
};
