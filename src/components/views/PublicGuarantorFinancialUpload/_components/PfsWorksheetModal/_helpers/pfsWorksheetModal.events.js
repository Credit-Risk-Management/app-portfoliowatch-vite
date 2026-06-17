import { dangerAlert, successAlert } from '@src/components/global/Alert/_helpers/alert.events';
import { $publicGuarantorUploadView } from '../../../_helpers/publicGuarantorFinancialUpload.consts';
import {
  $pfsWorksheetForm,
  $pfsWorksheetScheduleRowCounts,
  $pfsWorksheetSummariesFromSchedules,
  $pfsWorksheetStep,
  createDefaultPfsScheduleRowCounts,
  PFS_SCHEDULE_DEFINITIONS,
  PFS_WORKSHEET_MAX_ROW_COUNT,
  PFS_WORKSHEET_STEPS,
  pfsWorksheetField,
} from './pfsWorksheetModal.consts';
import {
  getPfsScheduleDisplayRowCount,
  inferPfsScheduleRowCountsFromForm,
  mergePriorPfsWorksheetIntoForm,
  validatePfsWorksheetForSubmit,
} from './pfsWorksheetModal.helpers';
import { applyPfsWorksheetRollup } from './pfsWorksheetRollup.helpers';

export const resetPfsWorksheetScheduleRowCounts = () => {
  $pfsWorksheetScheduleRowCounts.update(createDefaultPfsScheduleRowCounts());
};

export const resetPfsWorksheetSummariesFromSchedules = () => {
  $pfsWorksheetSummariesFromSchedules.update(false);
};

export const syncPfsWorksheetScheduleRowCountsFromForm = (form) => {
  $pfsWorksheetScheduleRowCounts.update(inferPfsScheduleRowCountsFromForm(form || {}));
};

export const hydratePfsWorksheetFromPriorLinkData = (linkData) => {
  if (!linkData?.priorPfsWorksheet) return null;
  const merged = applyPfsWorksheetRollup(
    mergePriorPfsWorksheetIntoForm(
      linkData.priorPfsWorksheet,
      linkData,
      $pfsWorksheetForm.value || {},
    ),
  );
  $pfsWorksheetForm.update(merged);
  syncPfsWorksheetScheduleRowCountsFromForm(merged);
  resetPfsWorksheetSummariesFromSchedules();
  return merged;
};

export const addPfsWorksheetRow = (scheduleId) => {
  const rowCounts = { ...($pfsWorksheetScheduleRowCounts.value || {}) };
  const current = getPfsScheduleDisplayRowCount(scheduleId, rowCounts);
  if (current >= PFS_WORKSHEET_MAX_ROW_COUNT) return;

  const sch = PFS_SCHEDULE_DEFINITIONS.find((s) => s.id === scheduleId);
  if (!sch) return;

  const newRowIdx = current;
  const patch = {};
  sch.columns.forEach((col) => {
    patch[pfsWorksheetField(scheduleId, newRowIdx, col.key)] = '';
  });

  rowCounts[scheduleId] = current + 1;
  $pfsWorksheetScheduleRowCounts.update(rowCounts);
  patchPfsWorksheetForm(patch);
};

export const openPfsWorksheetModal = () => {
  const { linkData } = $publicGuarantorUploadView.value;
  if (linkData?.priorPfsWorksheet) {
    hydratePfsWorksheetFromPriorLinkData(linkData);
  } else {
    syncPfsWorksheetScheduleRowCountsFromForm($pfsWorksheetForm.value || {});
    resetPfsWorksheetSummariesFromSchedules();
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
  if (Object.keys(patch).some((key) => /^sch[A-Z]_r\d+_/.test(key))) {
    $pfsWorksheetSummariesFromSchedules.update(true);
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
