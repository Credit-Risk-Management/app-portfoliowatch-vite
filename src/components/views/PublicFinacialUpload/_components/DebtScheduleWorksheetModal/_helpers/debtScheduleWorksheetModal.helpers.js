import { WORKSHEET_COL_ALIGN, WORKSHEET_WRAP_KEYS } from './debtScheduleWorksheetModal.consts';

export const getWorksheetColumnAlignClass = (colKey) => WORKSHEET_COL_ALIGN[colKey] ?? 'text-start';

/** Textarea for wrap columns once value length exceeds threshold (matches table UX). */
export const worksheetCellUsesTextarea = (colKey, rawValue) => {
  const cellLen = String(rawValue ?? '').length;
  return WORKSHEET_WRAP_KEYS.has(colKey) && cellLen > 20;
};
