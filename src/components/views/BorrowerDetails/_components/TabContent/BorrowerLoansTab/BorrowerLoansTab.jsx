/* eslint-disable react-hooks/exhaustive-deps */
import { Card, Row, Col, Badge, Button } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRight } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';
import { formatCurrency } from '@src/utils/formatCurrency';
import { formatDate } from '@src/utils/formatDate';
import { $borrower } from '@src/consts/consts';
import LoanMiniRadarChart from './_components/LoanMiniRadarChart';
import { getWatchScoreDisplay, formatCategoryBreakdown, hasWatchScoreData, getCategoryTextColor } from './_helpers/loanCard.helpers';
import { $loanWatchScoreBreakdowns } from './_helpers/loanCard.consts';
import { $borrowerFinancialsTableView } from '../../../_helpers/borrowerDetail.consts';

const BorrowerLoansTab = () => {
  const navigate = useNavigate();
  const borrower = $borrower.value?.borrower;

  const handleViewDetails = (loanId) => {
    if (loanId) {
      navigate(`/loans/${loanId}`);
    }
  };

  if (borrower?.loans?.length === 0) {
    return (
      <div className="text-info-100 fw-200">No loans found for this borrower.</div>
    );
  }

  if ($loanWatchScoreBreakdowns.value?.isLoading || $borrowerFinancialsTableView.value.isTableLoading) {
    return (
      <div className="text-info-100 fw-200">Loading watch score breakdowns...</div>
    );
  }

  return (
    <Row className="g-4">
      {borrower?.loans?.map((loan) => {
        const breakdown = $loanWatchScoreBreakdowns.value?.breakdowns[loan.id] || null;
        const watchScoreDisplay = getWatchScoreDisplay(loan?.currentWatchScore);
        const hasWatchScore = hasWatchScoreData(loan);
        const categories = formatCategoryBreakdown(breakdown);
        const loanIdentifier = loan?.loanId || loan?.loanNumber || loan?.id || 'N/A';
        return (
          <Col key={loan.id} xs={12} lg={6} className="mb-3">
            <Card className="bg-info-800 border-info-600 h-100">
              <Card.Body className="d-flex flex-column">
                <div className="d-flex justify-content-between align-items-start mb-16">
                  <div>
                    <h5 className="text-info-50 mb-0 fw-bold">
                      Loan: {loanIdentifier}
                    </h5>
                  </div>
                  {hasWatchScore && (
                    <Badge
                      bg={watchScoreDisplay.color}
                      className="ms-8"
                      style={{ fontSize: '14px', padding: '6px 12px' }}
                    >
                      {watchScoreDisplay.label}
                    </Badge>
                  )}
                </div>

                <Row className="mb-16 g-2">
                  <Col xs={12} md={4}>
                    <div className="text-info-200 small fw-300">Principal Amount</div>
                    <div className="text-success-400 fw-600 fs-5">
                      {loan?.principalAmount ? formatCurrency(loan.principalAmount) : 'N/A'}
                    </div>
                  </Col>
                  <Col xs={12} md={4}>
                    <div className="text-info-200 small fw-300">Payment Amount</div>
                    <div className="text-info-50 fw-500" style={{ fontSize: '16px' }}>
                      {loan?.paymentAmount ? formatCurrency(loan.paymentAmount) : 'N/A'}
                    </div>
                  </Col>
                  <Col xs={12} md={4}>
                    <div className="text-info-200 small fw-300">Next Payment Due</div>
                    <div className="text-info-50 fw-500" style={{ fontSize: '16px' }}>
                      {loan?.nextPaymentDueDate ? formatDate(loan.nextPaymentDueDate) : 'N/A'}
                    </div>
                  </Col>
                </Row>

                {hasWatchScore && breakdown ? (
                  <Row className="mb-16 flex-grow-1">
                    <Col xs={12} md={6} className="mb-12 mb-md-0">
                      <div className="text-info-100 small fw-500 mb-8">Performance Overview</div>
                      <LoanMiniRadarChart breakdown={breakdown} />
                    </Col>
                    <Col xs={12} md={6}>
                      <div className="text-info-100 small fw-500 mb-12">W.A.T.C.H. Categories</div>
                      <div className="d-flex flex-column">
                        {categories.map((category) => (
                          <div
                            key={category.letter}
                            className="d-flex align-items-center justify-content-between mb-8"
                          >
                            <div className="d-flex align-items-center">
                              <Badge
                                bg={category.color}
                                className="d-flex align-items-center justify-content-center me-12"
                                style={{
                                  width: '24px',
                                  height: '24px',
                                  fontSize: '13px',
                                  fontWeight: 'bold',
                                  borderRadius: '4px',
                                  padding: 0,
                                }}
                                title={`Score: ${category.score != null ? category.score.toFixed(2) : 'N/A'}`}
                              >
                                {category.letter}
                              </Badge>
                              <span className="text-info-50" style={{ fontSize: '14px' }}>
                                {category.name}
                              </span>
                            </div>
                            {category.hasData && (
                              <span className={`${getCategoryTextColor(category.color)} fw-600`} style={{ fontSize: '14px' }}>
                                {category.score != null ? category.score.toFixed(2) : 'N/A'}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </Col>
                  </Row>
                ) : (
                  <div className="mb-16 text-center py-24 flex-grow-1">
                    <p className="text-info-300 small mb-0">
                      Watch Score data not available for this loan
                    </p>
                  </div>
                )}

                <div className="mt-auto">
                  <Button
                    variant="outline-primary-100"
                    size="sm"
                    onClick={() => handleViewDetails(loan.id)}
                    className="w-100"
                  >
                    View Loan Details
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
};

export default BorrowerLoansTab;
