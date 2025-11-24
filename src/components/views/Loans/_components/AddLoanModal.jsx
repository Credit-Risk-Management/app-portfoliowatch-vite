import { Form, Row, Col } from 'react-bootstrap';
import UniversalModal from '@src/components/global/UniversalModal';
import UniversalInput from '@src/components/global/Inputs/UniversalInput';
import DatePicker from '@src/components/global/Inputs/DatePicker';
import { $loansView, $loansForm, $relationshipManagers, $borrowers } from '@src/signals';
import { handleAddLoan } from '../_helpers/loans.events';
import * as consts from '../_helpers/loans.consts';
import * as helpers from '../_helpers/loans.helpers';

const AddLoanModal = () => {
  const managers = $relationshipManagers.value?.list || [];
  const borrowers = $borrowers.value?.list || [];

  const loanOfficerOptions = helpers.getLoanOfficerOptions(managers);
  const borrowerOptions = helpers.getBorrowerOptions(borrowers);

  return (
    <UniversalModal
      show={$loansView.value.showAddModal}
      onHide={() => {
        $loansView.update({ showAddModal: false });
        $loansForm.reset();
      }}
      headerText="Add New Loan"
      leftBtnText="Cancel"
      rightBtnText="Add Loan"
      rightBtnOnClick={handleAddLoan}
      size="xl"
    >
      <Form>
        <h6 className="mb-16 fw-700">Basic Information</h6>
        <Row>
          <Col md={6} className="mb-16">
            <Form.Label>Loan Number</Form.Label>
            <UniversalInput
              type="text"
              name="loan_number"
              signal={$loansForm}
              placeholder="Enter loan number"
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
              <Form.Label>Borrower Name</Form.Label>
              <UniversalInput
                type="text"
                name="borrower_name"
                signal={$loansForm}
                placeholder="Enter borrower name"
              />
            </Col>
          </Row>
        )}

        <hr className="my-24" />
        <h6 className="mb-16 fw-700">Loan Details</h6>
        <Row>
          <Col md={6} className="mb-16">
            <Form.Label>Principal Amount</Form.Label>
            <UniversalInput
              type="number"
              name="principal_amount"
              signal={$loansForm}
              placeholder="0.00"
            />
          </Col>
          <Col md={6} className="mb-16">
            <Form.Label>Payment Amount</Form.Label>
            <UniversalInput
              type="number"
              name="payment_amount"
              signal={$loansForm}
              placeholder="0.00"
            />
          </Col>
        </Row>

        <Row>
          <Col md={6} className="mb-16">
            <Form.Label>Current Interest Rate (%)</Form.Label>
            <UniversalInput
              type="number"
              name="current_interest_rate"
              signal={$loansForm}
              step="0.01"
              placeholder="0.00"
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
            <Form.Label>Gross Revenue</Form.Label>
            <UniversalInput
              type="number"
              name="gross_revenue"
              signal={$loansForm}
              placeholder="0.00"
            />
          </Col>
          <Col md={4} className="mb-16">
            <Form.Label>Net Income</Form.Label>
            <UniversalInput
              type="number"
              name="net_income"
              signal={$loansForm}
              placeholder="0.00"
            />
          </Col>
          <Col md={4} className="mb-16">
            <Form.Label>EBITDA</Form.Label>
            <UniversalInput
              type="number"
              name="ebitda"
              signal={$loansForm}
              placeholder="0.00"
            />
          </Col>
        </Row>

        <Row>
          <Col md={4} className="mb-16">
            <Form.Label>Debt Service</Form.Label>
            <UniversalInput
              type="number"
              name="debt_service"
              signal={$loansForm}
              step="0.01"
              placeholder="0.00"
            />
          </Col>
          <Col md={4} className="mb-16">
            <Form.Label>Current Ratio</Form.Label>
            <UniversalInput
              type="number"
              name="current_ratio"
              signal={$loansForm}
              step="0.01"
              placeholder="0.00"
            />
          </Col>
          <Col md={4} className="mb-16">
            <Form.Label>Liquidity</Form.Label>
            <UniversalInput
              type="number"
              name="liquidity"
              signal={$loansForm}
              placeholder="0.00"
            />
          </Col>
        </Row>

        <Row>
          <Col md={12} className="mb-16">
            <Form.Label>Retained Earnings</Form.Label>
            <UniversalInput
              type="number"
              name="retained_earnings"
              signal={$loansForm}
              placeholder="0.00"
            />
          </Col>
        </Row>

        <Row>
          <Col md={12} className="mb-16">
            <Form.Label>Override Notes</Form.Label>
            <UniversalInput
              type="text"
              name="financial_metrics_override_notes"
              signal={$loansForm}
              placeholder="Reason for manual entry or override"
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
            <Form.Label>MAICS Code</Form.Label>
            <UniversalInput
              type="text"
              name="maics"
              signal={$loansForm}
              placeholder="Enter MAICS code"
            />
          </Col>
          <Col md={6} className="mb-16">
            <Form.Label>Industry</Form.Label>
            <UniversalInput
              type="text"
              name="industry"
              signal={$loansForm}
              placeholder="Enter industry"
            />
          </Col>
        </Row>
      </Form>
    </UniversalModal>
  );
};

export default AddLoanModal;
