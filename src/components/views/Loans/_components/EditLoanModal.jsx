import { useEffect } from 'react';
import { Form, Row, Col } from 'react-bootstrap';
import UniversalModal from '@src/components/global/UniversalModal';
import UniversalInput from '@src/components/global/Inputs/UniversalInput';
import DatePicker from '@src/components/global/Inputs/DatePicker';
import { $loansView, $loansForm, $loans, $relationshipManagers, $borrowers } from '@src/signals';
import { handleEditLoan } from '../_helpers/loans.events';
import * as consts from '../_helpers/loans.consts';
import * as helpers from '../_helpers/loans.helpers';

const EditLoanModal = () => {
  useEffect(() => {
    if ($loansView.value.showEditModal && $loans.value.selectedLoan) {
      $loansForm.update($loans.value.selectedLoan);
    }
  }, [$loansView.value.showEditModal]);

  const managers = $relationshipManagers.value?.list || [];
  const borrowers = $borrowers.value?.list || [];

  const loanOfficerOptions = helpers.getLoanOfficerOptions(managers);
  const borrowerOptions = helpers.getBorrowerOptions(borrowers);

  const formatOverrideDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleString('en-US');
  };

  const modalBody = (
    <Form>
      {$loansForm.value.financial_metrics_override_by && (
        <div className="mb-16 p-16" style={{ backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
          <small className="text-muted">
            <strong>Override Information:</strong><br />
            Last modified by: {$loansForm.value.financial_metrics_override_by}<br />
            Date: {formatOverrideDate($loansForm.value.financial_metrics_override_date)}
            {$loansForm.value.financial_metrics_override_notes && (
              <><br />Notes: {$loansForm.value.financial_metrics_override_notes}</>
            )}
          </small>
        </div>
      )}

      <h6 className="mb-16 fw-700">Basic Information</h6>
      <Row>
        <Col md={6} className="mb-16">
          <UniversalInput
            label="Loan Number"
            type="text"
            value={$loansForm.value.loan_number}
            onChange={(e) => $loansForm.update({ loan_number: e.target.value })}
          />
        </Col>
        <Col md={6} className="mb-16">
          <Form.Label>Type of Interest</Form.Label>
          <UniversalInput
            type="select"
            name="type_of_interest"
            signal={$loansForm}
            selectOptions={consts.INTEREST_TYPE_OPTIONS}
            value={consts.INTEREST_TYPE_OPTIONS.find((opt) => opt.value === $loansForm.value.type_of_interest)}
            customOnChange={(option) => $loansForm.update({ type_of_interest: option?.value })}
          />
        </Col>
      </Row>

      <Row>
        <Col md={12} className="mb-16">
          <Form.Label>Borrower</Form.Label>
          <UniversalInput
            type="select"
            name="borrower_id"
            signal={$loansForm}
            selectOptions={borrowerOptions}
            value={borrowerOptions.find((opt) => opt.value === $loansForm.value.borrower_id)}
            customOnChange={(option) => helpers.handleBorrowerChange(option, borrowers, $loansForm.update)}
          />
        </Col>
      </Row>

      {$loansForm.value.borrower_id === null && (
        <Row>
          <Col md={12} className="mb-16">
            <UniversalInput
              label="Borrower Name"
              type="text"
              value={$loansForm.value.borrower_name}
              onChange={(e) => $loansForm.update({ borrower_name: e.target.value })}
            />
          </Col>
        </Row>
      )}

      <hr className="my-24" />
      <h6 className="mb-16 fw-700">Loan Details</h6>
      <Row>
        <Col md={6} className="mb-16">
          <UniversalInput
            label="Principal Amount"
            type="number"
            value={$loansForm.value.principal_amount}
            onChange={(e) => $loansForm.update({ principal_amount: e.target.value })}
          />
        </Col>
        <Col md={6} className="mb-16">
          <UniversalInput
            label="Payment Amount"
            type="number"
            value={$loansForm.value.payment_amount}
            onChange={(e) => $loansForm.update({ payment_amount: e.target.value })}
          />
        </Col>
      </Row>

      <Row>
        <Col md={6} className="mb-16">
          <UniversalInput
            label="Current Interest Rate (%)"
            type="number"
            step="0.01"
            value={$loansForm.value.current_interest_rate}
            onChange={(e) => $loansForm.update({ current_interest_rate: e.target.value })}
          />
        </Col>
        <Col md={6} className="mb-16">
          <Form.Label>Loan Origination Date</Form.Label>
          <DatePicker
            name="loan_origination_date"
            signal={$loansForm}
          />
        </Col>
      </Row>

      <Row>
        <Col md={6} className="mb-16">
          <Form.Label>Loan Maturity Date</Form.Label>
          <DatePicker
            name="loan_maturity_date"
            signal={$loansForm}
          />
        </Col>
        <Col md={6} className="mb-16">
          <Form.Label>Next Rate Adjustment Date</Form.Label>
          <DatePicker
            name="next_rate_adjustment_date"
            signal={$loansForm}
          />
        </Col>
      </Row>

      <hr className="my-24" />
      <h6 className="mb-16 fw-700">Payment Information</h6>
      <Row>
        <Col md={6} className="mb-16">
          <Form.Label>Next Payment Due Date</Form.Label>
          <DatePicker
            name="next_payment_due_date"
            signal={$loansForm}
          />
        </Col>
        <Col md={6} className="mb-16">
          <Form.Label>Last Payment Received Date</Form.Label>
          <DatePicker
            name="last_payment_received_date"
            signal={$loansForm}
          />
        </Col>
      </Row>

      <Row>
        <Col md={6} className="mb-16">
          <Form.Label>Last Annual Review</Form.Label>
          <DatePicker
            name="last_annual_review"
            signal={$loansForm}
          />
        </Col>
        <Col md={6} className="mb-16">
          <Form.Label>Last Financial Statement</Form.Label>
          <DatePicker
            name="last_financial_statement"
            signal={$loansForm}
          />
        </Col>
      </Row>

      <hr className="my-24" />
      <h6 className="mb-16 fw-700">Financial Metrics</h6>
      <Row>
        <Col md={4} className="mb-16">
          <UniversalInput
            label="Gross Revenue"
            type="number"
            value={$loansForm.value.gross_revenue}
            onChange={(e) => $loansForm.update({ gross_revenue: e.target.value })}
          />
        </Col>
        <Col md={4} className="mb-16">
          <UniversalInput
            label="Net Income"
            type="number"
            value={$loansForm.value.net_income}
            onChange={(e) => $loansForm.update({ net_income: e.target.value })}
          />
        </Col>
        <Col md={4} className="mb-16">
          <UniversalInput
            label="EBITDA"
            type="number"
            value={$loansForm.value.ebitda}
            onChange={(e) => $loansForm.update({ ebitda: e.target.value })}
          />
        </Col>
      </Row>

      <Row>
        <Col md={4} className="mb-16">
          <UniversalInput
            label="Debt Service"
            type="number"
            step="0.01"
            value={$loansForm.value.debt_service}
            onChange={(e) => $loansForm.update({ debt_service: e.target.value })}
          />
        </Col>
        <Col md={4} className="mb-16">
          <UniversalInput
            label="Current Ratio"
            type="number"
            step="0.01"
            value={$loansForm.value.current_ratio}
            onChange={(e) => $loansForm.update({ current_ratio: e.target.value })}
          />
        </Col>
        <Col md={4} className="mb-16">
          <UniversalInput
            label="Liquidity"
            type="number"
            value={$loansForm.value.liquidity}
            onChange={(e) => $loansForm.update({ liquidity: e.target.value })}
          />
        </Col>
      </Row>

      <Row>
        <Col md={12} className="mb-16">
          <UniversalInput
            label="Retained Earnings"
            type="number"
            value={$loansForm.value.retained_earnings}
            onChange={(e) => $loansForm.update({ retained_earnings: e.target.value })}
          />
        </Col>
      </Row>

      <Row>
        <Col md={12} className="mb-16">
          <UniversalInput
            label="Override Notes"
            type="text"
            placeholder="Reason for manual entry or override"
            value={$loansForm.value.financial_metrics_override_notes}
            onChange={(e) => $loansForm.update({ financial_metrics_override_notes: e.target.value })}
          />
        </Col>
      </Row>

      <hr className="my-24" />
      <h6 className="mb-16 fw-700">Additional Information</h6>
      <Row>
        <Col md={6} className="mb-16">
          <Form.Label>Risk Rating</Form.Label>
          <UniversalInput
            type="select"
            name="current_risk_rating"
            signal={$loansForm}
            selectOptions={consts.LOAN_RISK_RATING_OPTIONS}
            value={consts.LOAN_RISK_RATING_OPTIONS.find((opt) => opt.value === $loansForm.value.current_risk_rating)}
            customOnChange={(option) => $loansForm.update({ current_risk_rating: option?.value })}
          />
        </Col>
        <Col md={6} className="mb-16">
          <Form.Label>Loan Officer</Form.Label>
          <UniversalInput
            type="select"
            name="loan_officer_id"
            signal={$loansForm}
            selectOptions={loanOfficerOptions}
            value={loanOfficerOptions.find((opt) => opt.value === $loansForm.value.loan_officer_id)}
            customOnChange={(option) => $loansForm.update({ loan_officer_id: option?.value })}
          />
        </Col>
      </Row>

      <Row>
        <Col md={6} className="mb-16">
          <UniversalInput
            label="MAICS Code"
            type="text"
            value={$loansForm.value.maics}
            onChange={(e) => $loansForm.update({ maics: e.target.value })}
          />
        </Col>
        <Col md={6} className="mb-16">
          <UniversalInput
            label="Industry"
            type="text"
            value={$loansForm.value.industry}
            onChange={(e) => $loansForm.update({ industry: e.target.value })}
          />
        </Col>
      </Row>
    </Form>
  );

  return (
    <UniversalModal
      show={$loansView.value.showEditModal}
      onHide={() => {
        $loansView.update({ showEditModal: false });
        $loansForm.reset();
      }}
      headerText="Edit Loan"
      body={modalBody}
      leftBtnText="Cancel"
      rightBtnText="Save Changes"
      rightBtnOnClick={handleEditLoan}
      size="xl"
    />
  );
};

export default EditLoanModal;
