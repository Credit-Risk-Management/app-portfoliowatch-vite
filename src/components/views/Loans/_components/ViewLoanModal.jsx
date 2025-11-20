import { Row, Col } from 'react-bootstrap';
import UniversalModal from '@src/components/global/UniversalModal';
import { $loansView, $loans, $relationshipManagers } from '@src/signals';
import { formatCurrency } from '@src/utils/formatCurrency';
import * as consts from '../_helpers/loans.consts';
import * as helpers from '../_helpers/loans.helpers';

const ViewLoanModal = () => {
  const loan = $loans.value.selectedLoan;
  const managers = $relationshipManagers.value?.list || [];

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const modalBody = loan ? (
    <div>
      <h6 className="mb-16 fw-700">Basic Information</h6>
      <Row className="mb-16">
        <Col md={6}>
          <strong>Loan Number:</strong> {loan.loan_number}
        </Col>
        <Col md={6}>
          <strong>Borrower:</strong> {loan.borrower_name}
        </Col>
      </Row>
      <Row className="mb-16">
        <Col md={6}>
          <strong>Type of Interest:</strong> {loan.type_of_interest}
        </Col>
        <Col md={6}>
          <strong>Current Interest Rate:</strong> {helpers.formatPercentage(loan.current_interest_rate)}
        </Col>
      </Row>

      <hr className="my-24" />
      <h6 className="mb-16 fw-700">Loan Details</h6>
      <Row className="mb-16">
        <Col md={6}>
          <strong>Principal Amount:</strong> {formatCurrency(loan.principal_amount)}
        </Col>
        <Col md={6}>
          <strong>Payment Amount:</strong> {formatCurrency(loan.payment_amount)}
        </Col>
      </Row>
      <Row className="mb-16">
        <Col md={6}>
          <strong>Loan Origination Date:</strong> {formatDate(loan.loan_origination_date)}
        </Col>
        <Col md={6}>
          <strong>Loan Maturity Date:</strong> {formatDate(loan.loan_maturity_date)}
        </Col>
      </Row>
      <Row className="mb-16">
        <Col md={12}>
          <strong>Next Rate Adjustment Date:</strong> {formatDate(loan.next_rate_adjustment_date) || 'N/A'}
        </Col>
      </Row>

      <hr className="my-24" />
      <h6 className="mb-16 fw-700">Payment Information</h6>
      <Row className="mb-16">
        <Col md={6}>
          <strong>Next Payment Due Date:</strong> {formatDate(loan.next_payment_due_date)}
        </Col>
        <Col md={6}>
          <strong>Last Payment Received:</strong> {formatDate(loan.last_payment_received_date)}
        </Col>
      </Row>
      <Row className="mb-16">
        <Col md={6}>
          <strong>Last Annual Review:</strong> {formatDate(loan.last_annual_review)}
        </Col>
        <Col md={6}>
          <strong>Last Financial Statement:</strong> {formatDate(loan.last_financial_statement)}
        </Col>
      </Row>

      <hr className="my-24" />
      <h6 className="mb-16 fw-700">Financial Metrics</h6>
      <Row className="mb-16">
        <Col md={4}>
          <strong>Gross Revenue:</strong> {formatCurrency(loan.gross_revenue)}
        </Col>
        <Col md={4}>
          <strong>Net Income:</strong> {formatCurrency(loan.net_income)}
        </Col>
        <Col md={4}>
          <strong>EBITDA:</strong> {formatCurrency(loan.ebitda)}
        </Col>
      </Row>
      <Row className="mb-16">
        <Col md={4}>
          <strong>Debt Service:</strong> {helpers.formatRatio(loan.debt_service)}
        </Col>
        <Col md={4}>
          <strong>Current Ratio:</strong> {helpers.formatRatio(loan.current_ratio)}
        </Col>
        <Col md={4}>
          <strong>Liquidity:</strong> {formatCurrency(loan.liquidity)}
        </Col>
      </Row>
      <Row className="mb-16">
        <Col md={12}>
          <strong>Retained Earnings:</strong> {formatCurrency(loan.retained_earnings)}
        </Col>
      </Row>

      {loan.financial_metrics_override_by && (
        <div className="mb-16 p-16" style={{ backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
          <small className="text-muted">
            <strong>Override Information:</strong><br />
            Modified by: {loan.financial_metrics_override_by}<br />
            Date: {new Date(loan.financial_metrics_override_date).toLocaleString('en-US')}
            {loan.financial_metrics_override_notes && (
              <><br />Notes: {loan.financial_metrics_override_notes}</>
            )}
          </small>
        </div>
      )}

      <hr className="my-24" />
      <h6 className="mb-16 fw-700">Additional Information</h6>
      <Row className="mb-16">
        <Col md={6}>
          <strong>Risk Rating:</strong> {helpers.getRiskRatingLabel(loan.current_risk_rating, consts.RISK_RATING_LABELS)}
        </Col>
        <Col md={6}>
          <strong>Loan Officer:</strong> {helpers.getLoanOfficerName(loan.loan_officer_id)}
        </Col>
      </Row>
      <Row className="mb-16">
        <Col md={6}>
          <strong>MAICS Code:</strong> {loan.maics || '-'}
        </Col>
        <Col md={6}>
          <strong>Industry:</strong> {loan.industry || '-'}
        </Col>
      </Row>
    </div>
  ) : null;

  return (
    <UniversalModal
      show={$loansView.value.showViewModal}
      onHide={() => $loansView.update({ showViewModal: false })}
      headerText="Loan Details"
      body={modalBody}
      leftBtnText="Close"
      rightBtnText=""
      rightBtnOnClick={() => { }}
      footerClass="justify-content-start"
      size="xl"
    />
  );
};

export default ViewLoanModal;
