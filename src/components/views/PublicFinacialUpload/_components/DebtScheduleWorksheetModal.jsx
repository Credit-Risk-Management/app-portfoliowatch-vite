import { Modal, Button, Row, Col } from 'react-bootstrap';
import UniversalInput from '@src/components/global/Inputs/UniversalInput/UniversalInput';
import {
  $debtScheduleWorksheetForm,
  DEBT_SCHEDULE_XLSX_DATA_ROW_COUNT,
  DEBT_SCHEDULE_FORM_COLUMN_KEYS,
  debtScheduleFormField,
} from '../_helpers/publicFinancialUpload.consts';
import {
  computeDebtWorksheetTotals,
  formatDebtScheduleCurrency,
} from '../_helpers/publicFinancialUpload.helpers';
import { closeDebtScheduleWorksheetModal, handleOpenDebtScheduleTemplatePdf } from '../_helpers/publicFinancialUpload.events';

/** XLSX row 5 column labels (1:1 with `Template - Debt Schedule.xlsx`). */
const WORKSHEET_COLUMN_HEADERS = [
  'Name of Creditor',
  'Original Amount Financed (if Term Loan)',
  'Line of Credit Limit',
  'Original Date (Year)',
  'Current Balance',
  'Interest Rate',
  'Maturity Date',
  'Monthly Payment',
  'Collateral',
  'Current or Delinquent',
];

const inputClassTable =
  'py-4 px-6 fs-7 text-dark border border-grey-300 bg-white min-w-0';

const DebtScheduleWorksheetModal = ({ show, isSubmitting }) => {
  const form = $debtScheduleWorksheetForm.value;
  const { totalBalance, totalMonthly } = computeDebtWorksheetTotals(form);

  return (
    <Modal
      show={show}
      onHide={closeDebtScheduleWorksheetModal}
      centered
      size="xl"
      scrollable
      backdrop="static"
    >
      <Modal.Header closeButton className="border-bottom border-grey-200 px-16 px-md-24 py-16">
        <Modal.Title className="fw-bold fs-5 text-dark">
          Business Debt Schedule
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="px-12 px-md-20 py-16">
        <p className="text-grey-600 small mb-12">
          This worksheet matches the Business Debt Schedule Excel template: six data rows, then totals and a signature line.
        </p>

        <Row className="g-2 mb-16">
          <Col xs={12} md={6}>
            <UniversalInput
              type="text"
              name="businessName"
              signal={$debtScheduleWorksheetForm}
              className={inputClassTable}
              placeholder="Business name"
              label="Business Name:"
              labelClassName="text-dark small fw-semibold mb-4"
            />
          </Col>
          <Col xs={12} md={6}>
            <UniversalInput
              type="date"
              name="asOfDate"
              signal={$debtScheduleWorksheetForm}
              className={inputClassTable}
              label="As of:"
              labelClassName="text-dark small fw-semibold mb-4"
            />
          </Col>
        </Row>

        <div className="table-secondary rounded overflow-hidden border border-grey-200">
          <div className="table-responsive" style={{ maxHeight: 'min(60vh, 480px)' }}>
            <table className="table table-bordered table-sm align-middle mb-0 text-dark" style={{ fontSize: '0.75rem' }}>
              <thead className="table-light" style={{ position: 'sticky', top: 0, zIndex: 1 }}>
                <tr>
                  {WORKSHEET_COLUMN_HEADERS.map((h) => (
                    <th
                      key={h}
                      className="text-dark fw-semibold text-wrap px-6 py-8"
                      style={{ minWidth: '88px' }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: DEBT_SCHEDULE_XLSX_DATA_ROW_COUNT }, (_, rowIdx) => (
                  <tr key={`debt-schedule-xlsx-row-${rowIdx}`}>
                    {DEBT_SCHEDULE_FORM_COLUMN_KEYS.map((key, colIdx) => {
                      const name = debtScheduleFormField(rowIdx, key);
                      return (
                        <td key={name} className="p-0 align-top">
                          <UniversalInput
                            type="text"
                            name={name}
                            signal={$debtScheduleWorksheetForm}
                            className={`${inputClassTable} border-0 rounded-0 shadow-none text-dark w-100`}
                            placeholder="—"
                            aria-label={`${WORKSHEET_COLUMN_HEADERS[colIdx]}, data row ${rowIdx + 1} of 6`}
                          />
                        </td>
                      );
                    })}
                  </tr>
                ))}
                <tr className="table-light fw-semibold">
                  <td colSpan={4} className="text-dark px-6 py-8">
                    TOTALS
                  </td>
                  <td className="text-end text-dark px-6 py-8">
                    {formatDebtScheduleCurrency(totalBalance) || '—'}
                  </td>
                  <td colSpan={2} className="px-6 py-8 bg-light">
                    <span className="visually-hidden">No total</span>
                  </td>
                  <td className="text-end text-dark px-6 py-8">
                    {formatDebtScheduleCurrency(totalMonthly) || '—'}
                  </td>
                  <td colSpan={2} className="px-6 py-8 bg-light">
                    <span className="visually-hidden">No total</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="text-grey-600 small mt-8 mb-16">
          Totals reflect the sum of Current Balance and Monthly Payment across the six rows above.
        </div>

        <Row className="g-2">
          <Col xs={12} md={4}>
            <UniversalInput
              type="text"
              name="signatoryName"
              signal={$debtScheduleWorksheetForm}
              className={inputClassTable}
              placeholder="Printed name"
              label="Name:"
              labelClassName="text-dark small fw-semibold mb-4"
            />
          </Col>
          <Col xs={12} md={4}>
            <UniversalInput
              type="text"
              name="signatoryTitle"
              signal={$debtScheduleWorksheetForm}
              className={inputClassTable}
              placeholder="Title"
              label="Title:"
              labelClassName="text-dark small fw-semibold mb-4"
            />
          </Col>
          <Col xs={12} md={4}>
            <UniversalInput
              type="date"
              name="signDate"
              signal={$debtScheduleWorksheetForm}
              className={inputClassTable}
              label="Date:"
              labelClassName="text-dark small fw-semibold mb-4"
            />
          </Col>
        </Row>
      </Modal.Body>
      <Modal.Footer className="border-top border-grey-200 px-16 py-12 d-flex flex-wrap justify-content-end gap-8">
        <Button
          variant="secondary"
          className="text-dark rounded-2"
          onClick={closeDebtScheduleWorksheetModal}
          disabled={isSubmitting}
        >
          Close
        </Button>
        <Button
          className="rounded-2 bg-dark text-white"
          onClick={() => {
            handleOpenDebtScheduleTemplatePdf();
          }}
          disabled={isSubmitting}
        >
          Open fillable PDF
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default DebtScheduleWorksheetModal;
