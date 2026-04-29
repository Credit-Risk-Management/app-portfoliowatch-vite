import { useId } from 'react';
import UniversalInput from '@src/components/global/Inputs/UniversalInput/UniversalInput';
import { $debtScheduleWorksheetForm } from '../../_helpers/publicFinancialUpload.consts';
import * as consts from './_helpers/debtScheduleWorksheetModal.consts';
import * as events from './_helpers/debtScheduleWorksheetModal.events';
import * as helpers from './_helpers/debtScheduleWorksheetModal.helpers';

/**
 * Creditor / collateral: reliable one-line ellipsis via a preview `button`; edit with `UniversalInput` textarea + autoSize.
 */
export default function DebtScheduleWrapCellField({
  name,
  columnKey,
  activeEditorName,
  patchWorksheetText,
  placeholder,
  ariaLabel,
  alignClassName,
}) {
  const form = $debtScheduleWorksheetForm.value;
  const isEditing = activeEditorName === name;
  const previewId = useId();
  const raw = form[name] ?? '';
  const display = String(raw);
  const hasText = display.trim().length > 0;
  const previewBody = hasText ? helpers.formatWorksheetWrapCellPreviewDisplay(display, columnKey) : placeholder;
  const showTitle =
    hasText
    && consts.WORKSHEET_WRAP_KEYS.has(columnKey)
    && display.length > consts.WORKSHEET_WRAP_CELL_PREVIEW_MAX_LEN;

  if (!isEditing) {
    return (
      <>
        <label htmlFor={previewId} className="visually-hidden">
          {ariaLabel}
        </label>
        <button
          id={previewId}
          type="button"
          {...{ [consts.DEBT_WORKSHEET_FOCUS_DATA_ATTR]: name }}
          className={[
            consts.TABLE_CELL_INPUT_CLASS,
            alignClassName,
            'debt-schedule-wrap-preview-btn min-w-0 text-start',
          ].filter(Boolean).join(' ')}
          title={showTitle ? display : undefined}
          onClick={() => events.onDebtScheduleWrapCellEditStart(name)}
        >
          <span
            className={`d-block text-truncate ${
              hasText ? 'debt-schedule-preview-text--filled' : 'debt-schedule-preview-text--empty'
            }`}
          >
            {previewBody}
          </span>
        </button>
      </>
    );
  }

  return (
    <UniversalInput
      type="textarea"
      name={name}
      signal={$debtScheduleWorksheetForm}
      {...{ [consts.DEBT_WORKSHEET_FOCUS_DATA_ATTR]: name }}
      className={[consts.TABLE_CELL_INPUT_CLASS, alignClassName, 'min-w-0'].filter(Boolean).join(' ')}
      style={{ ...consts.INPUT_LIGHT_STYLE, textAlign: 'left' }}
      autoSize
      rows={1}
      placeholder={placeholder}
      aria-label={ariaLabel}
      customOnChange={patchWorksheetText}
      onKeyDown={(e) => events.onDebtWorksheetWrapTextareaKeyDown(name, e)}
      onBlur={() => events.onDebtScheduleWrapCellEditEnd(name)}
      autoFocus
    />
  );
}
