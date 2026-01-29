import { Row, Col, Card, Badge, Button } from 'react-bootstrap';
import UniversalModal from '@src/components/global/UniversalModal';
import { WATCH_SCORE_OPTIONS } from '@src/consts/consts';
import { $modalState } from './SubmitFinancialModal/_helpers/submitFinancialsModal.signals';

const WatchScoreResultsModal = () => {
  const { showWatchScoreResults, updatedLoans } = $modalState.value;

  const handleClose = () => {
    $modalState.update({
      showWatchScoreResults: false,
      updatedLoans: [],
    });
  };

  const handleLoanClick = (loanId) => {
    window.open(`/loans/${loanId}`, '_blank');
  };

  // Helper function to format currency
  const formatCurrency = (value) => {
    if (value == null || value === '') return 'N/A';

    // Handle string, number, or Decimal object
    let numValue;
    if (typeof value === 'string') {
      numValue = parseFloat(value);
    } else if (typeof value === 'object') {
      numValue = Number(value);
    } else {
      numValue = value;
    }

    if (Number.isNaN(numValue)) return 'N/A';

    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(numValue);
  };

  // Helper function to get the watch score display
  const getWatchScoreDisplay = (loan) => {
    // Use currentWatchScore from the loan
    const scoreValue = loan.currentWatchScore;

    if (scoreValue == null) {
      return {
        label: 'N/A',
        color: 'secondary',
      };
    }

    // Convert Decimal to number if needed
    const numericScore = typeof scoreValue === 'object' ? Number(scoreValue) : scoreValue;
    const roundedScore = Math.round(numericScore);

    const scoreConfig = WATCH_SCORE_OPTIONS[roundedScore] || WATCH_SCORE_OPTIONS.null;
    return scoreConfig;
  };

  // Helper to render category breakdown
  const renderCategoryBreakdown = (categories) => {
    if (!categories) return null;

    const categoryOrder = ['Weighted Exposure', 'AccountabilityScore', 'Triggers', 'Collateral', 'Headwinds'];
    const sortedCategories = Object.entries(categories).sort((a, b) => {
      const indexA = categoryOrder.indexOf(a[0]);
      const indexB = categoryOrder.indexOf(b[0]);
      return indexA - indexB;
    });

    return (
      <div className="mt-12">
        {sortedCategories.map(([categoryName, category]) => (
          <div key={categoryName} className="border-bottom border-info-700">
            <div className="d-flex justify-content-between align-items-center mb-8">
              <div>
                <Badge bg="secondary-100 text-secondary-800" className="me-8">{category.letter}</Badge>
                <strong className="text-info-100">{categoryName}</strong>
              </div>
              <div className="text-info-200">
                Score:{' '}
                <span className={`fw-bold ${(() => {
                  if (category.score <= 2) return 'text-success-200';
                  if (category.score <= 4) return 'text-warning-200';
                  return 'text-danger-200';
                })()}`}
                >
                  {category.score !== null ? category.score.toFixed(2) : 'N/A'}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Helper to get breakdown summary
  const getBreakdownSummary = (breakdown) => {
    if (!breakdown) return null;

    if (breakdown.recommendedAction) {
      return (
        <div className="mt-12">
          <div className="text-info-200 fw-semibold mb-8">Summary:</div>
          <div className="text-info-300 small">
            {breakdown.recommendedAction}
          </div>
          {breakdown.finalLabel && (
            <div className="text-info-300 small mt-4">
              Classification: <span className="fw-semibold">{breakdown.finalLabel}</span>
            </div>
          )}
        </div>
      );
    }

    return null;
  };

  return (
    <UniversalModal
      show={showWatchScoreResults}
      onHide={handleClose}
      headerText="Updated Loan Watch Scores"
      leftBtnText="Done"
      leftBtnOnClick={handleClose}
      rightBtnText={null}
      size="xl"
    >
      <div className="py-16">
        <p className="text-info-100 mb-16">
          The following loan(s) have been updated with the new financial data.
        </p>

        {updatedLoans && updatedLoans.length > 0 ? (
          <Row>
            {updatedLoans.map((loan) => {
              const scoreDisplay = getWatchScoreDisplay(loan);
              const breakdown = loan.watchScoreBreakdown;

              return (
                <Col key={loan.id} md={12} className="mb-16">
                  <Card className="bg-info-800 border-info-600 text-info-100">
                    <Card.Body>
                      <div className="d-flex justify-content-between align-items-start mb-12">
                        <div>
                          <h5 className="text-info-50 mb-4">
                            Loan #{loan.loanNumber || 'N/A'}
                          </h5>
                          <p className="text-info-200 mb-0">
                            {loan.borrowerName || 'Unknown Borrower'}
                          </p>
                        </div>
                        <div className="text-end">
                          <div className={`text-${scoreDisplay.color}-200 fw-700 fs-5 mb-4`}>
                            {scoreDisplay.label}
                          </div>
                          <div className="text-info-300 mb-8">
                            Principal: {formatCurrency(loan.principalAmount)}
                          </div>
                          <Button
                            variant="outline-primary-100"
                            onClick={() => handleLoanClick(loan.id)}
                            size="sm"
                          >
                            View Loan
                          </Button>
                        </div>
                      </div>

                      {breakdown && breakdown.categories && (
                        <div className="mt-16 pt-16 border-top border-info-600">
                          <div className="text-info-100 fw-semibold mb-8">W.A.T.C.H. Score Breakdown:</div>
                          {renderCategoryBreakdown(breakdown.categories)}
                          {getBreakdownSummary(breakdown)}
                        </div>
                      )}
                    </Card.Body>
                  </Card>
                </Col>
              );
            })}
          </Row>
        ) : (
          <div className="text-center text-info-100 py-24">
            <p>No loans found for this borrower.</p>
          </div>
        )}
      </div>
    </UniversalModal>
  );
};

export default WatchScoreResultsModal;
