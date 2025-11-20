import { Row, Col } from 'react-bootstrap';
import { formatCurrency } from '@src/utils/formatCurrency';

const LoanChart = ({ loans }) => {
  // Calculate metrics for the chart
  const totalPrincipal = loans.reduce((sum, loan) => sum + (loan.principal_amount || 0), 0);
  const totalPayment = loans.reduce((sum, loan) => sum + (loan.payment_amount || 0), 0);
  const avgDebtService = loans.length > 0
    ? loans.reduce((sum, loan) => sum + (loan.debt_service || 0), 0) / loans.length
    : 0;
  const avgCurrentRatio = loans.length > 0
    ? loans.reduce((sum, loan) => sum + (loan.current_ratio || 0), 0) / loans.length
    : 0;

  // Risk rating distribution
  const riskDistribution = loans.reduce((acc, loan) => {
    const rating = loan.current_risk_rating || 0;
    acc[rating] = (acc[rating] || 0) + 1;
    return acc;
  }, {});

  // Interest type distribution
  const interestTypeDistribution = loans.reduce((acc, loan) => {
    const type = loan.type_of_interest || 'Unknown';
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {});

  // Create bar chart data
  const maxRiskCount = Math.max(...Object.values(riskDistribution), 1);
  const maxInterestCount = Math.max(...Object.values(interestTypeDistribution), 1);

  return (
    <div>
      <Row className="mb-24">
        <Col md={3}>
          <div className="text-center p-16 bg-light rounded">
            <div className="text-muted small mb-4">Total Principal</div>
            <div className="h4 mb-0 fw-700">{formatCurrency(totalPrincipal)}</div>
          </div>
        </Col>
        <Col md={3}>
          <div className="text-center p-16 bg-light rounded">
            <div className="text-muted small mb-4">Total Payment</div>
            <div className="h4 mb-0 fw-700">{formatCurrency(totalPayment)}</div>
          </div>
        </Col>
        <Col md={3}>
          <div className="text-center p-16 bg-light rounded">
            <div className="text-muted small mb-4">Avg Debt Service</div>
            <div className="h4 mb-0 fw-700">{avgDebtService.toFixed(2)}</div>
          </div>
        </Col>
        <Col md={3}>
          <div className="text-center p-16 bg-light rounded">
            <div className="text-muted small mb-4">Avg Current Ratio</div>
            <div className="h4 mb-0 fw-700">{avgCurrentRatio.toFixed(2)}</div>
          </div>
        </Col>
      </Row>

      <Row>
        <Col md={6}>
          <h6 className="mb-16">Risk Rating Distribution</h6>
          <div className="chart-container">
            {[1, 2, 3, 4, 5].map((rating) => {
              const count = riskDistribution[rating] || 0;
              const percentage = maxRiskCount > 0 ? (count / maxRiskCount) * 100 : 0;
              return (
                <div key={rating} className="mb-12">
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <span className="small">
                      Rating {rating}: {count} loan{count !== 1 ? 's' : ''}
                    </span>
                    <span className="small text-muted">{count}</span>
                  </div>
                  <div className="progress" style={{ height: '24px' }}>
                    <div
                      className={`progress-bar ${
                        rating <= 2 ? 'bg-success' : rating === 3 ? 'bg-warning' : 'bg-danger'
                      }`}
                      role="progressbar"
                      style={{ width: `${percentage}%` }}
                      aria-valuenow={count}
                      aria-valuemin="0"
                      aria-valuemax={maxRiskCount}
                    >
                      {count > 0 && count}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Col>

        <Col md={6}>
          <h6 className="mb-16">Interest Type Distribution</h6>
          <div className="chart-container">
            {Object.entries(interestTypeDistribution).map(([type, count]) => {
              const percentage = maxInterestCount > 0 ? (count / maxInterestCount) * 100 : 0;
              return (
                <div key={type} className="mb-12">
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <span className="small">
                      {type}: {count} loan{count !== 1 ? 's' : ''}
                    </span>
                    <span className="small text-muted">{count}</span>
                  </div>
                  <div className="progress" style={{ height: '24px' }}>
                    <div
                      className="progress-bar bg-info"
                      role="progressbar"
                      style={{ width: `${percentage}%` }}
                      aria-valuenow={count}
                      aria-valuemin="0"
                      aria-valuemax={maxInterestCount}
                    >
                      {count}
                    </div>
                  </div>
                </div>
              );
            })}
            {Object.keys(interestTypeDistribution).length === 0 && (
              <div className="text-muted text-center py-24">No data available</div>
            )}
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default LoanChart;

