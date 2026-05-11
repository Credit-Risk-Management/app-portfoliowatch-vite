/* eslint-disable no-nested-ternary */
import { Row, Col, Alert, Card } from 'react-bootstrap';
import { $borrower } from '@src/consts/consts';
import { $borrowerFinancials } from '@src/signals';
import { useEffectAsync } from '@fyclabs/tools-fyc-react/utils';
import {
  normalizeRatioDecimalToPercent,
  formatRatioPercentForDisplay,
} from '@src/utils/ratioPercent';
import { annualizedEbitdaForCovenantDisplay } from '@src/utils/ebitdaIncomePeriod';
import { $modalState } from '../../SubmitFinancialsModal/_helpers/submitFinancialsModal.consts';
import { fetchFinancialHistory } from '../BorrowerFinancialsTab/_helpers/borrowerFinancialsTab.resolvers';
import { hasIncomeStatementAndBalanceSheet } from '../BorrowerFinancialsTab/_helpers/borrowerFinancialsTab.helpers';

const BorrowerTriggersTab = (props = {}) => {
  const list = $borrowerFinancials.value?.list || [];
  const borrowerId = $borrower.value?.borrower?.id;
  const isModalContext = props.currentForm !== undefined || props.previousFinancial !== undefined;

  useEffectAsync(async () => {
    if (isModalContext) return;
    if (borrowerId && list.length === 0) {
      await fetchFinancialHistory();
    }
  }, [borrowerId, list.length, isModalContext]);

  const currentForm = props.currentForm ?? list[0] ?? {};
  const previousFinancial = props.previousFinancial ?? list.slice(1).find(hasIncomeStatementAndBalanceSheet);
  const isLoadingPrevious = props.isLoadingPrevious ?? $modalState.value?.isLoadingPrevious ?? false;
  const currentAsOfDate = currentForm?.asOfDate ? new Date(currentForm.asOfDate) : null;
  const previousAsOfDate = previousFinancial?.asOfDate ? new Date(previousFinancial.asOfDate) : null;

  const calculateChange = (current, previous) => {
    if (previous == null || previous === '' || previous === 0) return null;
    const currentVal = parseFloat(current) || 0;
    const previousVal = parseFloat(previous) || 0;
    if (previousVal === 0) return null;
    return ((currentVal - previousVal) / Math.abs(previousVal)) * 100;
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

  const formatPeriodDate = (dateValue) => {
    if (!dateValue) return 'N/A';
    const date = new Date(dateValue);
    if (Number.isNaN(date.getTime())) return 'N/A';
    return date.toLocaleDateString('en-US');
  };

  const bothHaveRequiredDocs = hasIncomeStatementAndBalanceSheet(currentForm)
    && hasIncomeStatementAndBalanceSheet(previousFinancial);

  const isPeriodComparisonMismatched = !bothHaveRequiredDocs
    && currentAsOfDate
    && previousAsOfDate
    && (
      currentAsOfDate.getMonth() !== previousAsOfDate.getMonth()
      || currentAsOfDate.getDate() !== previousAsOfDate.getDate()
    );

  const curQ = Boolean(currentForm.incomeStatementPackageQuarterly);
  const prevQ = Boolean(previousFinancial?.incomeStatementPackageQuarterly);
  const useEbitdaRunRate = curQ || prevQ;
  const prevEbitdaComparable = annualizedEbitdaForCovenantDisplay(previousFinancial?.ebitda, prevQ);
  const curEbitdaComparable = annualizedEbitdaForCovenantDisplay(currentForm.ebitda, curQ);
  const storedEbitdaChange = currentForm.changeInEbitda != null && String(currentForm.changeInEbitda).trim() !== ''
    ? parseFloat(currentForm.changeInEbitda)
    : null;

  const TriggerCard = ({ title, previousValue, currentValue, isCurrency = true, formatValue }) => {
    const change = calculateChange(currentValue, previousValue);
    let changeColor = 'text-info-200';
    if (change > 0) {
      changeColor = 'text-success-500';
    } else if (change < 0) {
      changeColor = 'text-danger-700';
    }

    return (
      <Card className="bg-info-700 mb-16">
        <Card.Body>
          <h6 className="text-info-100 fw-600 mb-16">{title}</h6>
          <Row>
            <Col xs={12} sm={6} className="mb-12 mb-sm-0">
              <div className="text-info-200 small">Previous</div>
              <div className="text-info-100 fw-600 fs-6">
                {isCurrency
                  ? formatCurrency(previousValue)
                  : (formatValue ? formatValue(previousValue) : (previousValue || 'N/A'))}
              </div>
            </Col>
            <Col xs={12} sm={6}>
              <div className="text-info-200 small">Current</div>
              <div className="text-info-100 fw-600 fs-6">
                {isCurrency
                  ? formatCurrency(currentValue)
                  : (formatValue ? formatValue(currentValue) : (currentValue || 'N/A'))}
              </div>
            </Col>
          </Row>
          <div className={`mt-16 fw-bold fs-6 ${changeColor}`}>
            Change: {formatPercentage(change)}
            {change !== null && change > 0 && ' ↑'}
            {change !== null && change < 0 && ' ↓'}
          </div>
        </Card.Body>
      </Card>
    );
  };

  if (isLoadingPrevious || $borrowerFinancials.value?.isLoading) {
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
            There is no previous period financial data to compare against. This is the first
            financial submission for this borrower.
          </p>
        </Alert>
      </div>
    );
  }

  return (
    <div className="py-14">
      <h5 className="text-info-100 mb-24 fw-600">
        Trigger Analysis - Change from Previous Period
      </h5>
      {useEbitdaRunRate && (
        <Alert variant="secondary" className="mb-16 small text-info-200 border-info-100">
          <strong>Reported</strong> uses EBITDA as filed on the statements. <strong>Estimated</strong> annualizes quarterly
          amounts (×4) for an illustration only—it is not a forecast, and WATCH applies its own rules to the stored metrics.
        </Alert>
      )}
      {isPeriodComparisonMismatched && (
        <Alert variant="warning" className="mb-16">
          <div className="fw-600">Default indicator: period mismatch detected</div>
          <div className="small mt-4">
            Comparison period appears inconsistent ({formatPeriodDate(previousFinancial?.asOfDate)} vs {formatPeriodDate(currentForm?.asOfDate)}).
            Trigger trend analysis may be unreliable.
          </div>
          <div className="small mt-4 fw-600">
            Trigger default score: 3.00
          </div>
        </Alert>
      )}
      <Row>
        <Col xs={12} md={6} className="mb-12 mb-md-0">
          <TriggerCard
            title="Change in Cash"
            previousValue={previousFinancial.cash || previousFinancial.liquidity}
            currentValue={currentForm.cash || currentForm.liquidity}
          />
        </Col>
        <Col md={6}>
          {useEbitdaRunRate ? (
            <div>
              <TriggerCard
                title="Change in EBITDA (reported amounts)"
                previousValue={previousFinancial.ebitda}
                currentValue={currentForm.ebitda}
              />
              <TriggerCard
                title="Change in EBITDA (estimated, annual run-rate)"
                previousValue={prevEbitdaComparable}
                currentValue={curEbitdaComparable}
              />
              <div className="text-info-300 small fst-italic mb-16 px-8">
                Estimated view uses ×4 as a rough annualization for discussion only, not a projection of actual results.
                {storedEbitdaChange != null && Number.isFinite(storedEbitdaChange) ? (
                  <>
                    {' '}
                    WATCH stored change in EBITDA:
                    {' '}
                    {formatPercentage(storedEbitdaChange)}
                    .
                  </>
                ) : null}
              </div>
            </div>
          ) : (
            <TriggerCard
              title="Change in EBITDA"
              previousValue={previousFinancial.ebitda}
              currentValue={currentForm.ebitda}
            />
          )}
        </Col>
        <Col md={6}>
          <TriggerCard
            title="Change in Profit Margin"
            previousValue={normalizeRatioDecimalToPercent(previousFinancial.profitMargin)}
            currentValue={normalizeRatioDecimalToPercent(currentForm.profitMargin)}
            isCurrency={false}
            formatValue={formatRatioPercentForDisplay}
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
            title="Change in A/R"
            previousValue={previousFinancial.accountsReceivable}
            currentValue={currentForm.accountsReceivable}
          />
        </Col>
        <Col md={6}>
          <TriggerCard
            title="Change in A/P"
            previousValue={previousFinancial.accountsPayable}
            currentValue={currentForm.accountsPayable}
          />
        </Col>
      </Row>
    </div>
  );
};

export default BorrowerTriggersTab;
