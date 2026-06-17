import { Modal, Button, ProgressBar, Row, Col } from 'react-bootstrap';
import UniversalInput from '@src/components/global/Inputs/UniversalInput/UniversalInput';
import { INPUT_LIGHT_STYLE } from '@src/components/views/PublicFinacialUpload/_components/DebtScheduleWorksheetModal/_helpers/debtScheduleWorksheetModal.consts';
import {
  $pfsWorksheetForm,
  $pfsWorksheetScheduleRowCounts,
  $pfsWorksheetStep,
  PFS_HEADER_FIELDS,
  PFS_SUMMARY_FIELDS,
  PFS_WORKSHEET_MAX_ROW_COUNT,
  PFS_WORKSHEET_STEPS,
  pfsWorksheetField,
} from './_helpers/pfsWorksheetModal.consts';
import {
  formatPfsWorksheetCurrencyDisplay,
  formatPfsWorksheetCurrencyTyping,
  getPfsScheduleDisplayRowCount,
  pfsWorksheetColumnIsCurrency,
  schedulesForStep,
} from './_helpers/pfsWorksheetModal.helpers';
import { hasPfsScheduleNumericData } from './_helpers/pfsWorksheetRollup.helpers';
import { $publicGuarantorUploadView } from '../../_helpers/publicGuarantorFinancialUpload.consts';
import * as events from './_helpers/pfsWorksheetModal.events';
import '../../../PublicFinacialUpload/_components/DebtScheduleWorksheetModal/DebtScheduleWorksheetModal.scss';

const PfsWorksheetModal = ({ show, isSubmitting }) => {
  const step = $pfsWorksheetStep.value ?? 0;
  const stepMeta = PFS_WORKSHEET_STEPS[step];
  const { pfsWorksheetErrors: wsErrors } = $publicGuarantorUploadView.value;
  const scheduleRowCounts = $pfsWorksheetScheduleRowCounts.value || {};
  const progress = ((step + 1) / PFS_WORKSHEET_STEPS.length) * 100;

  const renderScheduleTable = (sch) => {
    const rowCount = getPfsScheduleDisplayRowCount(sch.id, scheduleRowCounts);
    const canAddRow = rowCount < PFS_WORKSHEET_MAX_ROW_COUNT;

    return (
      <div key={sch.id} className="mb-24">
        <h6 className="text-dark fw-semibold fs-7 mb-8" style={{ letterSpacing: '0.04em' }}>
          {sch.title}
        </h6>
        <div className="debt-schedule-worksheet-table-shell rounded-2 border overflow-hidden">
          <div className="table-responsive debt-schedule-worksheet-table-responsive">
            <table className="table text-dark debt-schedule-worksheet-table mb-0">
              <thead>
                <tr>
                  <th scope="col" className="small">#</th>
                  {sch.columns.map((col) => (
                    <th key={col.key} scope="col">{col.label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: rowCount }, (_, rowIdx) => (
                  <tr key={`${sch.id}-${rowIdx}`} className="debt-schedule-worksheet-row">
                    <th scope="row" className="small text-grey-600 fw-normal">{rowIdx + 1}</th>
                    {sch.columns.map((col) => {
                      const name = pfsWorksheetField(sch.id, rowIdx, col.key);
                      const isCurrency = pfsWorksheetColumnIsCurrency(col);
                      return (
                        <td key={name} className={isCurrency ? 'text-end' : undefined}>
                          <UniversalInput
                            name={name}
                            type="text"
                            aria-label={`${sch.title} row ${rowIdx + 1} ${col.label}`}
                            placeholder={col.label}
                            signal={$pfsWorksheetForm}
                            style={INPUT_LIGHT_STYLE}
                            className={[
                              'debt-schedule-worksheet-field rounded-2 border-0 shadow-none w-100',
                              isCurrency ? 'text-end tabular-nums' : '',
                            ].filter(Boolean).join(' ')}
                            customOnChange={(e) => {
                              const next = isCurrency
                                ? formatPfsWorksheetCurrencyTyping(e.target.value)
                                : e.target.value;
                              events.patchPfsWorksheetForm({ [name]: next });
                            }}
                            onBlur={isCurrency ? () => {
                              const raw = $pfsWorksheetForm.value?.[name] ?? '';
                              const formatted = formatPfsWorksheetCurrencyDisplay(raw);
                              if (formatted && formatted !== raw) {
                                events.patchPfsWorksheetForm({ [name]: formatted });
                              }
                            } : undefined}
                          />
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        {canAddRow ? (
          <div className="mt-8">
            <Button
              variant="white"
              size="sm"
              className="text-dark rounded-2 border border-dark-200"
              onClick={() => events.addPfsWorksheetRow(sch.id)}
              disabled={isSubmitting}
            >
              Add row
            </Button>
          </div>
        ) : null}
      </div>
    );
  };

  let body;
  if (stepMeta.id === 'about') {
    body = (
      <>
        <div className="debt-schedule-section-title mt-2">About you</div>
        <p className="text-dark mb-16 lh-base small">
          Enter the same information shown at the top of the PFS template. Required fields are marked.
        </p>
        <Row className="g-4">
          {PFS_HEADER_FIELDS.map(({
            key, label, type, required, placeholder,
          }) => (
            <Col key={key} xs={12} md={6}>
              <UniversalInput
                name={key}
                label={label}
                type={type === 'date' ? 'date' : 'text'}
                required={required}
                placeholder={placeholder}
                signal={$pfsWorksheetForm}
                style={INPUT_LIGHT_STYLE}
                labelClassName="debt-schedule-field-label mb-6"
                error={wsErrors?.[key]}
                customOnChange={(e) => events.patchPfsWorksheetForm({ [key]: e.target.value })}
              />
            </Col>
          ))}
        </Row>
      </>
    );
  } else if (stepMeta.id === 'review') {
    const summariesFromSchedules = hasPfsScheduleNumericData($pfsWorksheetForm.value || {});
    body = (
      <>
        <div className="debt-schedule-section-title mt-2">Summary totals</div>
        <p className="small text-grey-600 mb-16">
          {summariesFromSchedules
            ? 'Totals are calculated from your asset and liability schedules. Edit schedules on earlier steps to change these values.'
            : 'Enter summary totals, or go back and fill in schedule rows to calculate them automatically.'}
        </p>
        <Row className="g-4">
          {PFS_SUMMARY_FIELDS.map(({ key, label, placeholder }) => (
            <Col key={key} xs={12} md={6}>
              <UniversalInput
                name={key}
                label={label}
                type="text"
                placeholder={placeholder}
                disabled={summariesFromSchedules}
                signal={$pfsWorksheetForm}
                style={INPUT_LIGHT_STYLE}
                labelClassName="debt-schedule-field-label mb-6"
                className="debt-schedule-worksheet-field rounded-2 border-0 shadow-none w-100 text-end tabular-nums"
                customOnChange={(e) => {
                  events.patchPfsWorksheetForm({
                    [key]: formatPfsWorksheetCurrencyTyping(e.target.value),
                  });
                }}
                onBlur={() => {
                  const raw = $pfsWorksheetForm.value?.[key] ?? '';
                  const formatted = formatPfsWorksheetCurrencyDisplay(raw);
                  if (formatted && formatted !== raw) {
                    events.patchPfsWorksheetForm({ [key]: formatted });
                  }
                }}
              />
            </Col>
          ))}
        </Row>
        {wsErrors?._form && (
          <div className="text-danger small mt-8">{wsErrors._form}</div>
        )}
      </>
    );
  } else {
    const stepIntro = stepMeta.id === 'assets'
      ? 'List cash, investments, retirement accounts, and real estate (schedules A–D). Leave blank rows unused.'
      : 'List mortgage, installment, and revolving debt (schedules G–I). Leave blank rows unused.';
    body = (
      <>
        <div className="debt-schedule-section-title mt-2">{stepMeta.label}</div>
        <p className="text-dark mb-16 lh-base small">{stepIntro}</p>
        {schedulesForStep(stepMeta.id).map(renderScheduleTable)}
      </>
    );
  }

  return (
    <Modal
      show={show}
      onHide={events.closePfsWorksheetModal}
      scrollable
      backdrop="static"
      fullscreen
    >
      <Modal.Header closeButton className="border-bottom border-grey-200 px-16 px-md-24 py-16">
        <Modal.Title className="fw-bold fs-5 text-dark">
          Personal financial statement worksheet
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="debt-schedule-worksheet-modal px-16 px-md-24 py-24 bg-white">
        <div className="mb-24">
          <div className="d-flex justify-content-between align-items-center small text-grey-600 mb-8">
            <span className="fw-semibold text-dark">
              Step
              {' '}
              {step + 1}
              {' '}
              of
              {' '}
              {PFS_WORKSHEET_STEPS.length}
              {' — '}
              {stepMeta.label}
            </span>
          </div>
          <ProgressBar
            variant="dark"
            now={progress}
            className="rounded-pill"
            style={{ height: '6px' }}
            aria-label={`PFS worksheet step ${step + 1} of ${PFS_WORKSHEET_STEPS.length}`}
          />
        </div>
        {body}
      </Modal.Body>
      <Modal.Footer className="debt-schedule-worksheet-modal-footer border-top px-16 px-md-24 py-12 d-flex flex-wrap justify-content-between gap-8 bg-white">
        <Button variant="dark" onClick={events.closePfsWorksheetModal} disabled={isSubmitting}>
          Cancel
        </Button>
        <div className="d-flex gap-8">
          <Button
            variant="outline-dark"
            disabled={step === 0 || isSubmitting}
            onClick={() => events.goPfsWorksheetStep(-1)}
          >
            Back
          </Button>
          {step < PFS_WORKSHEET_STEPS.length - 1 ? (
            <Button variant="dark" onClick={() => events.goPfsWorksheetStep(1)} disabled={isSubmitting}>
              Next
            </Button>
          ) : (
            <Button variant="dark" onClick={events.savePfsWorksheetModal} disabled={isSubmitting}>
              Save worksheet
            </Button>
          )}
        </div>
      </Modal.Footer>
    </Modal>
  );
};

export default PfsWorksheetModal;
