/* eslint-disable react-hooks/exhaustive-deps */
import { Card, Row, Col, Button } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRight } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';
import { $borrower } from '@src/consts/consts';
import { formatCurrency } from '@src/utils/formatCurrency';
import { calculateAnnualDebtServiceFromLoans } from '@src/utils/currency';

export function BorrowerGuarantorsTab() {
  const navigate = useNavigate();
  const borrower = $borrower.value?.borrower;

  const handleViewDetails = (guarantorId) => {
    if (guarantorId) {
      navigate(`/guarantors/${guarantorId}`);
    }
  };

  if (borrower?.guarantors?.length === 0) {
    return (
      <div className="text-info-100 fw-200">No guarantors found for this borrower.</div>
    );
  }

  if ($borrower.value.isLoading) {
    return (
      <div className="text-info-100 fw-200">Loading borrower guarantors...</div>
    );
  }

  return (
    <Row className="g-4">
      {borrower?.guarantors?.map((guarantor) => {
        const annualDebtService = calculateAnnualDebtServiceFromLoans(guarantor.loans || []);

        return (
          <Col key={guarantor.id} xs={12} lg={6} className="mb-3">
            <Card className="bg-info-800 border-info-600 h-100">
              <Card.Body className="d-flex flex-column">
                <div className="d-flex justify-content-between align-items-center mb-12">
                  <h5 className="text-info-50 mb-0 fw-bold">
                    Guarantor: {guarantor.name}
                  </h5>
                </div>

                <Row className="mb-16 g-2  justify-content-between">
                  <Col xs={12} md={4}>
                    <div className="text-info-200 small fw-300">Email</div>
                    <div className="text-info-50 fw-600 ">
                      {guarantor.email || 'N/A'}
                    </div>
                  </Col>
                  <Col xs={12} md={4}>
                    <div className="text-info-200 small fw-300">Phone</div>
                    <div className="text-info-50 fw-600">
                      {guarantor.phone || 'N/A'}
                    </div>
                  </Col>
                </Row>
                <Row className="mb-16 g-2">
                  <Col xs={12} md={4}>
                    <div className="text-info-200 small fw-300">Net Worth</div>
                    <div className="text-success-400 fw-600 fs-5">
                      {formatCurrency(guarantor.financials?.[0]?.netWorth || 'N/A')}
                    </div>
                  </Col>
                  <Col xs={12} md={4}>
                    <div className="text-info-200 small fw-300">Total Assets</div>
                    <div className="text-info-50 fw-500 fs-5">
                      {formatCurrency(guarantor.financials?.[0]?.totalAssets || 'N/A')}
                    </div>
                  </Col>
                  <Col xs={12} md={4}>
                    <div className="text-info-200 small fw-300">Total Liabilities</div>
                    <div className="text-info-50 fw-500 fs-5">
                      {formatCurrency(guarantor.financials?.[0]?.totalLiabilities || 'N/A')}
                    </div>
                  </Col>

                </Row>
                <Row className="mb-16 g-2 justify-content-between">
                  <Col xs={12} md={4}>  <div className="text-info-200 small fw-300">Debt Service</div>
                    <div className="text-info-50 fw-500 fs-5">
                      {formatCurrency(annualDebtService)}
                    </div>
                  </Col>
                </Row>

                <div className="mt-auto">
                  <Button
                    variant="outline-primary-100"
                    size="sm"
                    onClick={() => handleViewDetails(guarantor.id)}
                    className="w-100"
                  >
                    View Guarantor Details
                    <FontAwesomeIcon icon={faArrowRight} className="ms-8" />
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        );
      })}
    </Row>
  );
}

export default BorrowerGuarantorsTab;
