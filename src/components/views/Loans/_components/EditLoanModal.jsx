import { useEffect } from 'react';
import { Form, Row, Col } from 'react-bootstrap';
import UniversalModal from '@src/components/global/UniversalModal';
import UniversalInput from '@src/components/global/Inputs/UniversalInput';
import SelectInput from '@src/components/global/Inputs/SelectInput';
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [$loansView.value.showEditModal]);

  const managers = $relationshipManagers.value?.list || [];
  const borrowers = $borrowers.value?.list || [];

  const relationshipManagerOptions = helpers.getRelationshipManagerOptions(managers);
  const borrowerOptions = helpers.getBorrowerOptions(borrowers);

  const formatOverrideDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleString('en-US');
  };

  return (
    <UniversalModal
      show={$loansView.value.showEditModal}
      onHide={() => {
        $loansView.update({ showEditModal: false });
        $loansForm.reset();
      }}
      closeButton
      headerText="Edit Loan"
      leftBtnText="Cancel"
      rightBtnText="Save Changes"
      rightBtnOnClick={handleEditLoan}
      size="fullscreen"
    >
      <Form className="text-white">
        {$loansForm.value.financialMetricsOverrideBy && (
          <div className="mb-16 p-16" style={{ backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
            <small className="text-muted">
              <strong>Override Information:</strong><br />
              Last modified by: {$loansForm.value.financialMetricsOverrideBy}<br />
              Date: {formatOverrideDate($loansForm.value.financialMetricsOverrideDate)}
              {$loansForm.value.financialMetricsOverrideNotes && (
                <><br />Notes: {$loansForm.value.financialMetricsOverrideNotes}</>
              )}
            </small>
          </div>
        )}

        <div className="lead mb-16">Basic Information</div>
        <Row>
          <Col md={6} className="mb-16">
            <Form.Label>Loan Number</Form.Label>
            <UniversalInput
              type="text"
              name="loanNumber"
              signal={$loansForm}
              placeholder="Enter loan number"
            />
          </Col>
          <Col md={6} className="mb-16">
            <Form.Label>Type of Interest</Form.Label>
            <SelectInput
              name="typeOfInterest"
              signal={$loansForm}
              options={consts.INTEREST_TYPE_OPTIONS}
              value={consts.INTEREST_TYPE_OPTIONS.find((opt) => opt.value === $loansForm.value.typeOfInterest)?.value}
              onChange={(option) => $loansForm.update({ typeOfInterest: option?.value })}
            />
          </Col>
        </Row>

        <Row>
          <Col md={12} className="mb-16">
            <Form.Label>Borrower</Form.Label>
            <SelectInput
              name="borrowerId"
              signal={$loansForm}
              options={borrowerOptions}
              value={borrowerOptions.find((opt) => opt.value === $loansForm.value.borrowerId)?.value}
              onChange={(option) => helpers.handleBorrowerChange(option, borrowers, $loansForm.update)}
            />
          </Col>
        </Row>

        {$loansForm.value.borrowerId === null && (
          <Row>
            <Col md={12} className="mb-16">
              <Form.Label>Borrower Name</Form.Label>
              <UniversalInput
                type="text"
                name="borrowerName"
                signal={$loansForm}
                placeholder="Enter borrower name"
              />
            </Col>
          </Row>
        )}

        <hr className="my-24" />
        <div className="lead mb-16">Loan Details</div>
        <Row>
          <Col md={6} className="mb-16">
            <Form.Label>Principal Amount</Form.Label>
            <UniversalInput
              type="number"
              name="principalAmount"
              signal={$loansForm}
              placeholder="0.00"
            />
          </Col>
          <Col md={6} className="mb-16">
            <Form.Label>Payment Amount</Form.Label>
            <UniversalInput
              type="number"
              name="paymentAmount"
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
              name="currentInterestRate"
              signal={$loansForm}
              step="0.01"
              placeholder="0.00"
            />
          </Col>
          <Col md={6} className="mb-16">
            <Form.Label>Loan Origination Date</Form.Label>
            <DatePicker
              name="loanOriginationDate"
              signal={$loansForm}
            />
          </Col>
        </Row>

        <Row>
          <Col md={6} className="mb-16">
            <Form.Label>Loan Maturity Date</Form.Label>
            <DatePicker
              name="loanMaturityDate"
              signal={$loansForm}
            />
          </Col>
          <Col md={6} className="mb-16">
            <Form.Label>Next Rate Adjustment Date</Form.Label>
            <DatePicker
              name="nextRateAdjustmentDate"
              signal={$loansForm}
            />
          </Col>
        </Row>

        <hr className="my-24" />
        <div className="lead mb-16">Payment Information</div>
        <Row>
          <Col md={6} className="mb-16">
            <Form.Label>Next Payment Due Date</Form.Label>
            <DatePicker
              name="nextPaymentDueDate"
              signal={$loansForm}
            />
          </Col>
          <Col md={6} className="mb-16">
            <Form.Label>Last Payment Received Date</Form.Label>
            <DatePicker
              name="lastPaymentReceivedDate"
              signal={$loansForm}
            />
          </Col>
        </Row>

        <Row>
          <Col md={6} className="mb-16">
            <Form.Label>Last Annual Review</Form.Label>
            <DatePicker
              name="lastAnnualReview"
              signal={$loansForm}
            />
          </Col>
          <Col md={6} className="mb-16">
            <Form.Label>Last Financial Statement</Form.Label>
            <DatePicker
              name="lastFinancialStatement"
              signal={$loansForm}
            />
          </Col>
        </Row>

        <hr className="my-24" />
        <div className="lead mb-16">Financial Metrics</div>
        <Row>
          <Col md={4} className="mb-16">
            <Form.Label>Gross Revenue</Form.Label>
            <UniversalInput
              type="number"
              name="grossRevenue"
              signal={$loansForm}
              placeholder="0.00"
            />
          </Col>
          <Col md={4} className="mb-16">
            <Form.Label>Net Income</Form.Label>
            <UniversalInput
              type="number"
              name="netIncome"
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
              name="debtService"
              signal={$loansForm}
              step="0.01"
              placeholder="0.00"
            />
          </Col>
          <Col md={4} className="mb-16">
            <Form.Label>Current Ratio</Form.Label>
            <UniversalInput
              type="number"
              name="currentRatio"
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
              name="retainedEarnings"
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
              name="financialMetricsOverrideNotes"
              signal={$loansForm}
              placeholder="Reason for manual entry or override"
            />
          </Col>
        </Row>

        <hr className="my-24" />
        <div className="lead mb-16">Additional Information</div>
        <Row>
          <Col md={6} className="mb-16">
            <Form.Label>Risk Rating</Form.Label>
            <SelectInput
              name="currentRiskRating"
              signal={$loansForm}
              options={consts.LOAN_RISK_RATING_OPTIONS}
              value={consts.LOAN_RISK_RATING_OPTIONS.find((opt) => opt.value === $loansForm.value.currentRiskRating)?.value}
              onChange={(option) => $loansForm.update({ currentRiskRating: option?.value })}
            />
          </Col>
          <Col md={6} className="mb-16">
            <Form.Label>Relationship Manager</Form.Label>
            <SelectInput
              name="relationshipManagerId"
              signal={$loansForm}
              options={relationshipManagerOptions}
              value={relationshipManagerOptions.find((opt) => opt.value === $loansForm.value.relationshipManagerId)?.value}
              onChange={(option) => $loansForm.update({ relationshipManagerId: option?.value })}
            />
          </Col>
        </Row>

        <Row>
          <Col md={6} className="mb-16">
            <Form.Label>NAICS Code</Form.Label>
            <UniversalInput
              type="text"
              name="naics"
              signal={$loansForm}
              placeholder="Enter NAICS code"
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

export default EditLoanModal;
