import { Modal, Button, Row, Col, Alert } from 'react-bootstrap';
import UniversalInput from '@src/components/global/Inputs/UniversalInput/UniversalInput';
import {
  $debtScheduleWorksheetForm,
  $publicFinancialUploadView,
  DEBT_SCHEDULE_XLSX_DATA_ROW_COUNT,
  DEBT_SCHEDULE_FORM_COLUMN_KEYS,
  debtScheduleFormField,
} from '../../_helpers/publicFinancialUpload.consts';
import {
  computeDebtWorksheetTotals,
  formatDebtScheduleCurrency,
} from '../../_helpers/publicFinancialUpload.helpers';
import * as consts from './_helpers/debtScheduleWorksheetModal.consts';
import * as helpers from './_helpers/debtScheduleWorksheetModal.helpers';
import * as events from './_helpers/debtScheduleWorksheetModal.events';

const DebtScheduleWorksheetModal = ({ show, isSubmitting, worksheetSubmitting }) => {
  const form = $debtScheduleWorksheetForm.value;
  const { debtScheduleWorksheetErrors: wsErrors } = $publicFinancialUploadView.value;
  const busy = isSubmitting || worksheetSubmitting;
  const { totalBalance, totalMonthly } = computeDebtWorksheetTotals(form);
  const debtRowInvalid = Boolean(wsErrors?.debtRows);
  const colIdxBalance = DEBT_SCHEDULE_FORM_COLUMN_KEYS.indexOf('currentBalance');
  const colIdxPayment = DEBT_SCHEDULE_FORM_COLUMN_KEYS.indexOf('monthlyPayment');
  const creditorHeader = consts.WORKSHEET_COLUMN_HEADERS[0];

  return (
    <Modal
      show={show}
      onHide={events.onCloseDebtScheduleWorksheetModal}
      centered
      scrollable
      backdrop="static"
      fullscreen
    >
      <Modal.Header closeButton className="border-bottom border-grey-200 px-16 px-md-24 py-16 ">
        <Modal.Title className="fw-bold fs-5 text-dark">
          Business Debt Schedule
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="px-16 px-md-24 py-20 bg-white">

        {wsErrors && Object.keys(wsErrors).length > 0 ? (
          <Alert variant="danger" className="py-10 small mb-16">
            <div className="fw-semibold mb-4">Please fix the following:</div>
            <ul className="mb-0 ps-16">
              {wsErrors.signatoryName ? <li>{wsErrors.signatoryName}</li> : null}
              {wsErrors.signatoryTitle ? <li>{wsErrors.signatoryTitle}</li> : null}
              {wsErrors.debtRows ? <li>{wsErrors.debtRows}</li> : null}
            </ul>
          </Alert>
        ) : null}

        <h6 className="text-dark fw-semibold fs-7 text-uppercase mb-8 mt-4" style={{ letterSpacing: '0.04em' }}>
          Business &amp; period
        </h6>
        <Row className="g-3 mb-20">
          <Col xs={12} md={6}>
            <UniversalInput
              type="text"
              name="businessName"
              signal={$debtScheduleWorksheetForm}
              style={consts.INPUT_LIGHT_STYLE}
              placeholder="Legal business name"
              label="Business name"
              labelClassName="text-dark small fw-semibold mb-6"
              customOnChange={(e) => events.onPatchDebtScheduleWorksheetForm({ businessName: e.target.value })}
            />
          </Col>
          <Col xs={12} md={6}>
            <UniversalInput
              type="date"
              name="asOfDate"
              signal={$debtScheduleWorksheetForm}
              style={consts.INPUT_LIGHT_STYLE}
              label="As of date"
              labelClassName="text-dark small fw-semibold mb-6"
              customOnChange={(e) => events.onPatchDebtScheduleWorksheetForm({ asOfDate: e.target.value })}
            />
          </Col>
        </Row>

        <h6 className="text-dark fw-semibold fs-7 text-uppercase mb-8" style={{ letterSpacing: '0.04em' }}>
          Debt line items
        </h6>
        <p className="text-dark small mb-16 lh-base">
          Fill in your debts below (same layout as the Excel template). When you submit, we will check
          that you have entered your
          {' '}
          <strong>printed name</strong>
          ,{' '}
          <strong>title</strong>
          , and
          {' '}
          <strong>at least one row</strong>
          {' '}
          with both
          {' '}
          <strong>current balance</strong>
          {' '}
          and
          {' '}
          <strong>monthly payment</strong>
          .
        </p>
        <div className="rounded-2 border overflow-hidden bg-grey-50">
          <div className="table-responsive">
            <table className="table table-sm mb-0 text-dark" style={{ fontSize: '0.8125rem' }}>
              <thead className="table-light" style={{ position: 'sticky', top: 0, zIndex: 2 }}>
                <tr className="border-bottom ">
                  {consts.WORKSHEET_COLUMN_HEADERS.map((header, colIdx) => {
                    const colKey = DEBT_SCHEDULE_FORM_COLUMN_KEYS[colIdx];
                    const align = helpers.getWorksheetColumnAlignClass(colKey);
                    return (
                      <th
                        key={header}
                        className={`text-dark fw-semibold py-10 ${align}`}
                        style={{
                          minWidth: header === creditorHeader ? '140px' : '96px',
                          verticalAlign: 'middle',
                        }}
                      >
                        {header}
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: DEBT_SCHEDULE_XLSX_DATA_ROW_COUNT }, (_, rowIdx) => (
                  <tr
                    key={`debt-schedule-xlsx-row-${rowIdx}`}
                    className={rowIdx % 2 === 0 ? 'bg-white' : 'bg-light'}
                  >
                    {DEBT_SCHEDULE_FORM_COLUMN_KEYS.map((colKey, colIdx) => {
                      const name = debtScheduleFormField(rowIdx, colKey);
                      const highlightDebt = debtRowInvalid && (colIdx === colIdxBalance || colIdx === colIdxPayment);
                      const useTextarea = helpers.worksheetCellUsesTextarea(colKey, form[name]);
                      const colAlign = helpers.getWorksheetColumnAlignClass(colKey);
                      const inputAlignClass = useTextarea ? 'text-start' : colAlign;
                      return (
                        <td
                          key={name}
                          className={`p-6 pt-4 align-top ${colAlign}`}
                        >
                          <UniversalInput
                            type={useTextarea ? 'textarea' : 'text'}
                            name={name}
                            signal={$debtScheduleWorksheetForm}
                            className={`${consts.TABLE_CELL_INPUT_CLASS} ${inputAlignClass}`}
                            style={{
                              ...consts.INPUT_LIGHT_STYLE,
                              ...(useTextarea ? { textAlign: 'left' } : {}),
                            }}
                            autoSize={useTextarea}
                            rows={useTextarea ? 1 : undefined}
                            placeholder={colIdx === 0 ? 'Creditor' : '—'}
                            aria-label={`${consts.WORKSHEET_COLUMN_HEADERS[colIdx]}, data row ${rowIdx + 1} of 6`}
                            isInvalid={highlightDebt}
                            customOnChange={(e) => events.onPatchDebtScheduleWorksheetForm({ [name]: e.target.value })}
                          />
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="fw-semibold border-top table-light align-middle">
                  <td colSpan={4} className="text-start text-dark px-8 py-10">
                    Totals
                  </td>
                  <td className="text-end text-dark px-8 py-10 tabular-nums align-middle">
                    {formatDebtScheduleCurrency(totalBalance) || '—'}
                  </td>
                  <td colSpan={2} className="px-8 py-10 bg-transparent align-middle" aria-hidden="true">
                    <span className="visually-hidden">No total in this section</span>
                  </td>
                  <td className="text-end text-dark px-8 py-10 tabular-nums align-middle">
                    {formatDebtScheduleCurrency(totalMonthly) || '—'}
                  </td>
                  <td colSpan={2} className="px-8 py-10 bg-transparent align-middle" aria-hidden="true">
                    <span className="visually-hidden">No total in this section</span>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        <p className="text-grey-600 small mt-10 mb-20">
          Totals sum the Current balance and Monthly payment columns across all six rows.
        </p>

        <h6 className="text-dark fw-semibold fs-7 text-uppercase mb-8" style={{ letterSpacing: '0.04em' }}>
          Authorization
        </h6>
        <Row className="g-3">
          <Col xs={12} md={4}>
            <UniversalInput
              type="text"
              name="signatoryName"
              signal={$debtScheduleWorksheetForm}
              style={consts.INPUT_LIGHT_STYLE}
              placeholder="Printed name of signatory"
              label="Printed name"
              labelClassName="text-dark small fw-semibold mb-6"
              isInvalid={Boolean(wsErrors?.signatoryName)}
              customOnChange={(e) => events.onPatchDebtScheduleWorksheetForm({ signatoryName: e.target.value })}
            />
          </Col>
          <Col xs={12} md={4}>
            <UniversalInput
              type="text"
              name="signatoryTitle"
              signal={$debtScheduleWorksheetForm}
              style={consts.INPUT_LIGHT_STYLE}
              placeholder="e.g. CFO, President"
              label="Title"
              labelClassName="text-dark small fw-semibold mb-6"
              isInvalid={Boolean(wsErrors?.signatoryTitle)}
              customOnChange={(e) => events.onPatchDebtScheduleWorksheetForm({ signatoryTitle: e.target.value })}
            />
          </Col>
          <Col xs={12} md={4}>
            <UniversalInput
              type="date"
              name="signDate"
              signal={$debtScheduleWorksheetForm}
              style={consts.INPUT_LIGHT_STYLE}
              label="Signature date"
              labelClassName="text-dark small fw-semibold mb-6"
              customOnChange={(e) => events.onPatchDebtScheduleWorksheetForm({ signDate: e.target.value })}
            />
          </Col>
        </Row>
      </Modal.Body>
      <Modal.Footer className="border-top border-grey-200 px-16 py-12 d-flex flex-wrap justify-content-end gap-8 bg-light">
        <Button
          variant="outline-secondary"
          className="text-dark rounded-2"
          onClick={events.onCloseDebtScheduleWorksheetModal}
          disabled={busy}
        >
          Close
        </Button>
        <Button
          className="rounded-2 bg-dark text-white border-0"
          onClick={events.onSaveDebtScheduleWorksheet}
          disabled={busy}
        >
          {worksheetSubmitting ? 'Saving…' : 'Save worksheet'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default DebtScheduleWorksheetModal;
