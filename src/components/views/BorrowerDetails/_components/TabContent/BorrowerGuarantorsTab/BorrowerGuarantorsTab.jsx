/* eslint-disable react-hooks/exhaustive-deps */
import { Card, Row, Col, Button } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRight } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';
import { $borrower } from '@src/consts/consts';
import { formatCurrency } from '@src/utils/formatCurrency';
import getBorrowerGuarantorsTabHelpers from './_helpers/borrowerGuarantorsTab.helpers';

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
        const financials = guarantor.financials?.sort((a, b) => new Date(b.asOfDate) - new Date(a.asOfDate))[0] || {};
        const annualDebtService =
          guarantor.loans.reduce((acc, loan) => acc + Number(loan.paymentAmount || 0), 0) * 12;

        const leverage = getBorrowerGuarantorsTabHelpers.calculateLeverage(
          financials.totalLiabilities,
          financials.totalAssets,
        );

        const liquidityCoverage = getBorrowerGuarantorsTabHelpers.calculateLiquidityCoverage(
          financials.liquidity,
          annualDebtService,
        );

        const score =
          (liquidityCoverage !== null ? getBorrowerGuarantorsTabHelpers.liquidityScore(liquidityCoverage) : 0) +
          (leverage !== null ? getBorrowerGuarantorsTabHelpers.leverageScore(leverage) : 0);

        const strength = getBorrowerGuarantorsTabHelpers.getStrengthMeta(score);

        return (
          <Col key={guarantor.id} xs={12} lg={6} className="mb-3">
            <Card className="bg-info-800 border-info-600 h-100">
              <Card.Body className="d-flex flex-column">
                <div className="d-flex justify-content-between align-items-center mb-12">
                  <h5 className="text-info-50 mb-0 fw-bold">
                    Guarantor: {guarantor.name}
                  </h5>

                  <div
                    className={`px-12 py-4 rounded-pill bg-${strength.color}-700 text-${strength.color}-100 small fw-600`}
                  >
                    {score} / 100 · {strength.label}
                  </div>
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
                    <div className="text-info-50 fw-500" style={{ fontSize: '16px' }}>
                      {formatCurrency(guarantor.financials?.[0]?.totalAssets || 'N/A')}
                    </div>
                  </Col>
                  <Col xs={12} md={4}>
                    <div className="text-info-200 small fw-300">Total Liabilities</div>
                    <div className="text-info-50 fw-500" style={{ fontSize: '16px' }}>
                      {formatCurrency(guarantor.financials?.[0]?.totalLiabilities || 'N/A')}
                    </div>
                  </Col>

                </Row>
                <Row className="mb-16 g-2 justify-content-between">
                  <Col xs={12} md={4}>  <div className="text-info-200 small fw-300">Liquidity</div>
                    <div className="text-info-50 fw-500" style={{ fontSize: '16px' }}>
                      {formatCurrency(guarantor.financials?.[0]?.liquidity || 'N/A')}
                    </div>
                  </Col>
                  <Col xs={12} md={4}>  <div className="text-info-200 small fw-300">Debt Service</div>
                    <div className="text-info-50 fw-500" style={{ fontSize: '16px' }}>
                      {formatCurrency(guarantor.loans.reduce((acc, loan) => acc + +loan.paymentAmount, 0) * 12 || 'N/A')}
                    </div>
                  </Col>
                </Row>
                <Row className="mb-16 g-2 justify-content-between">
                  <Col xs={12} md={4}>
                    <div className="text-info-200 small fw-300">Leverage Ratio</div>
                    <div className="text-info-50 fw-600">
                      {leverage !== null ? `${Math.round(leverage * 100)}%` : 'N/A'}
                      {leverage > 0.65 && (
                      <span className="text-danger-400 ms-8 small">⚠ High</span>
                      )}
                    </div>
                  </Col>

                  <Col xs={12} md={4}>
                    <div className="text-info-200 small fw-300">Liquidity Coverage</div>
                    <div className="text-info-50 fw-600">
                      {liquidityCoverage !== null
                        ? `${liquidityCoverage.toFixed(1)}×`
                        : 'N/A'}
                      {liquidityCoverage < 1.25 && (
                      <span className="text-danger-400 ms-8 small">⚠ Weak</span>
                      )}
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
