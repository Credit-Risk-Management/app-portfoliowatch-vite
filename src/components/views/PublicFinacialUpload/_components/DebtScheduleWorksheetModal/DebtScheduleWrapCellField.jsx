import { useId } from 'react';
import UniversalInput from '@src/components/global/Inputs/UniversalInput/UniversalInput';
import { $debtScheduleWorksheetForm } from '../../_helpers/publicFinancialUpload.consts';
import * as consts from './_helpers/debtScheduleWorksheetModal.consts';
import * as events from './_helpers/debtScheduleWorksheetModal.events';

/**
 * Creditor / collateral: reliable one-line ellipsis via a preview `button`; edit with `UniversalInput` textarea + autoSize.
 */
export default function DebtScheduleWrapCellField({
  name,
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

  if (!isEditing) {
    return (
      <>
        <label htmlFor={previewId} className="visually-hidden">
          {ariaLabel}
        </label>
        <button
          id={previewId}
          type="button"
          className={[
            consts.TABLE_CELL_INPUT_CLASS,
            alignClassName,
            'min-w-0 bg-info-800 px-6 py-4 text-info-100 border border-info-800 text-start',
          ].filter(Boolean).join(' ')}
          style={consts.INPUT_LIGHT_STYLE}
          onClick={() => events.onDebtScheduleWrapCellEditStart(name)}
        >
          <span className="d-block text-truncate">
            {hasText ? display : placeholder}
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
      className={[consts.TABLE_CELL_INPUT_CLASS, alignClassName, 'min-w-0'].filter(Boolean).join(' ')}
      style={{ textAlign: 'left' }}
      autoSize
      rows={1}
      placeholder={placeholder}
      aria-label={ariaLabel}
      customOnChange={patchWorksheetText}
      onBlur={() => events.onDebtScheduleWrapCellEditEnd(name)}
      autoFocus
    />
  );
}
