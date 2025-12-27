import { Row, Col, Alert, Card } from 'react-bootstrap';
import { $borrowerFinancialsForm } from '@src/signals';

const TriggersTab = ({ previousFinancial, isLoadingPrevious }) => {
  const currentForm = $borrowerFinancialsForm.value;

  const calculateChange = (current, previous) => {
    if (!previous || previous === 0) return null;
    const currentVal = parseFloat(current) || 0;
    const previousVal = parseFloat(previous) || 0;
    if (previousVal === 0) return null;
    return ((currentVal - previousVal) / previousVal) * 100;
  };

  const formatCurrency = (value) => {
    if (!value) return 'N/A';
    const num = parseFloat(value);
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(num);
  };

  const formatPercentage = (value) => {
    if (value === null || value === undefined) return 'N/A';
    const sign = value > 0 ? '+' : '';
    return `${sign}${value.toFixed(2)}%`;
  };

  const TriggerCard = ({ title, previousValue, currentValue, isCurrency = true }) => {
    const change = calculateChange(currentValue, previousValue);
    let changeColor = 'text-info-200';
    if (change > 0) {
      changeColor = 'text-success';
    } else if (change < 0) {
      changeColor = 'text-danger';
    }

    return (
      <Card className="bg-info-700 mb-16">
        <Card.Body>
          <h6 className="text-info-100 fw-600 mb-16">{title}</h6>
          <Row>
            <Col xs={12} sm={6} className="mb-12 mb-sm-0">
              <div className="text-info-200 small">Previous</div>
              <div className="text-info-100 fw-600">
                {isCurrency ? formatCurrency(previousValue) : (previousValue || 'N/A')}
              </div>
            </Col>
            <Col xs={12} sm={6}>
              <div className="text-info-200 small">Current</div>
              <div className="text-info-100 fw-600">
                {isCurrency ? formatCurrency(currentValue) : (currentValue || 'N/A')}
              </div>
            </Col>
          </Row>
          <div className={`mt-16 fw-bold ${changeColor}`}>
            Change: {formatPercentage(change)}
            {change !== null && change > 0 && ' ↑'}
            {change !== null && change < 0 && ' ↓'}
          </div>
        </Card.Body>
      </Card>
    );
  };

  if (isLoadingPrevious) {
    return (
      <div className="text-center py-32">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="text-info-200 mt-16">Loading previous financial data...</p>
      </div>
    );
  }

  if (!previousFinancial) {
    return (
      <div className="text-center py-32">
        <Alert variant="info">
          <h5 className="text-info-900 mb-8">No Previous Data Available</h5>
          <p className="mb-0">
            There is no previous quarter financial data to compare against. This is the first
            financial submission for this borrower.
          </p>
        </Alert>
      </div>
    );
  }

  return (
    <div className="py-16">
      <h5 className="text-info-100 mb-24 fw-600">
        Trigger Analysis - Change from Previous Quarter
      </h5>
      <Row>
        <Col xs={12} md={6} className="mb-12 mb-md-0">
          <TriggerCard
            title="Change in Cash"
            previousValue={previousFinancial.cash || previousFinancial.liquidity}
            currentValue={currentForm.cash || currentForm.liquidity}
          />
        </Col>
        <Col md={6}>
          <TriggerCard
            title="Change in EBITDA"
            previousValue={previousFinancial.ebitda}
            currentValue={currentForm.ebitda}
          />
        </Col>
        <Col md={6}>
          <TriggerCard
            title="Change in Accounts Receivable"
            previousValue={previousFinancial.accountsReceivable}
            currentValue={currentForm.accountsReceivable}
          />
        </Col>
        <Col md={6}>
          <TriggerCard
            title="Change in Profit Margin"
            previousValue={previousFinancial.profitMargin}
            currentValue={currentForm.profitMargin}
            isCurrency={false}
          />
        </Col>
        <Col md={6}>
          <TriggerCard
            title="Change in Inventory"
            previousValue={previousFinancial.inventory}
            currentValue={currentForm.inventory}
          />
        </Col>
        <Col md={6}>
          <TriggerCard
            title="Change in Accounts Payable"
            previousValue={previousFinancial.accountsPayable}
            currentValue={currentForm.accountsPayable}
          />
        </Col>
      </Row>
    </div>
  );
};

export default TriggersTab;

