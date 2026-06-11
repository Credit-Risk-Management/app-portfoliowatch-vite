import { Row, Col, Badge, OverlayTrigger, Tooltip } from 'react-bootstrap';
import UniversalCard from '@src/components/global/UniversalCard';
import {
  dscrColorClass,
  formatSummaryCurrency,
  formatSummaryDscr,
} from '../_helpers/debtService.helpers';

const NA_TOOLTIP_EBITDA = 'EBITDA is not available for this basis. Add or update financials with income data.';
const NA_TOOLTIP_DEBT_SERVICE = 'Debt service is not available. Add a debt service worksheet with total monthly payment.';
const NA_TOOLTIP_DSCR = 'DSCR cannot be calculated without both EBITDA and debt service for this basis.';
const NA_TOOLTIP_COVENANT = 'No debt service covenant is set on this borrower\'s loans.';
const NA_TOOLTIP_LAST_QUARTER_NO_QUARTERLY_INCOME = 'Not applicable without a financial filing that includes a quarterly income statement package.';
const NA_TOOLTIP_TTM_NO_FOUR_QUARTERS = 'Not applicable without four consecutive quarterly income filings that include EBITDA (trailing twelve months).';

const MetricColumn = ({
  label,
  rawValue,
  formattedValue,
  valueClassName = 'text-info-50',
  tooltipId,
  naTooltip,
}) => {
  const isNAValue = rawValue == null;
  const inner = (
    <span className={`fs-5 fw-bold ${valueClassName}`}>{formattedValue}</span>
  );
  return (
    <Col xs={6} md={3} className="mb-4 mb-md-0">
      <div className="text-info-200 small mb-4">{label}</div>
      {isNAValue && naTooltip ? (
        <OverlayTrigger
          placement="top"
          overlay={<Tooltip id={tooltipId}>{naTooltip}</Tooltip>}
        >
          <span className="d-inline-block" role="note">
            {inner}
          </span>
        </OverlayTrigger>
      ) : inner}
    </Col>
  );
};

const SummarySection = ({
  sectionKey,
  title,
  badge,
  ebitda,
  totalDebtService,
  dscr,
  covenantDSCR,
  isLast = false,
  naTooltipWhenMissingQuarterlyIncome = null,
  naTooltipWhenTtmNotComputable = null,
}) => {
  const sharedBasisTooltip =
    naTooltipWhenMissingQuarterlyIncome ?? naTooltipWhenTtmNotComputable;

  const ebitdaNa =
    ebitda == null && sharedBasisTooltip
      ? sharedBasisTooltip
      : NA_TOOLTIP_EBITDA;
  const tdsNa =
    totalDebtService == null && sharedBasisTooltip
      ? sharedBasisTooltip
      : NA_TOOLTIP_DEBT_SERVICE;
  const dscrNa =
    dscr == null && sharedBasisTooltip
      ? sharedBasisTooltip
      : NA_TOOLTIP_DSCR;

  return (
    <div className={isLast ? 'mb-0 mt-8' : 'mt-8 pb-16 border-bottom border-info-400'}>
      <div className="d-flex align-items-center gap-8 mb-16">
        <h6 className="text-info-50 fw-600 mb-0">{title}</h6>
        {badge ? (
          <Badge bg="success-500" className="text-info-900 fw-600">
            {badge}
          </Badge>
        ) : null}
      </div>
      <Row>
        <MetricColumn
          label="EBITDA"
          rawValue={ebitda}
          formattedValue={formatSummaryCurrency(ebitda)}
          tooltipId={`debt-summ-${sectionKey}-ebitda`}
          naTooltip={ebitdaNa}
        />
        <MetricColumn
          label="Total Debt Service"
          rawValue={totalDebtService}
          formattedValue={formatSummaryCurrency(totalDebtService)}
          valueClassName="text-warning-500"
          tooltipId={`debt-summ-${sectionKey}-tds`}
          naTooltip={tdsNa}
        />
        <MetricColumn
          label="DSCR"
          rawValue={dscr}
          formattedValue={formatSummaryDscr(dscr)}
          valueClassName={dscrColorClass(dscr, covenantDSCR)}
          tooltipId={`debt-summ-${sectionKey}-dscr`}
          naTooltip={dscrNa}
        />
        <MetricColumn
          label="Covenant"
          rawValue={covenantDSCR}
          formattedValue={formatSummaryDscr(covenantDSCR)}
          valueClassName="text-info-50"
          tooltipId={`debt-summ-${sectionKey}-cov`}
          naTooltip={NA_TOOLTIP_COVENANT}
        />
      </Row>
    </div>
  );
};

const DebtServiceQuarterlySummary = ({ sections }) => (
  <UniversalCard headerText="Debt Service Summary" className="mb-16">
    {sections.map((section, index) => (
      <SummarySection
        key={section.key}
        sectionKey={section.key}
        title={section.title}
        badge={section.badge}
        ebitda={section.ebitda}
        totalDebtService={section.totalDebtService}
        dscr={section.dscr}
        covenantDSCR={section.covenantDSCR}
        isLast={index === sections.length - 1}
        naTooltipWhenMissingQuarterlyIncome={
          section.key === 'lastQuarter' && section.lastQuarterUsesQuarterlyFinancials === false
            ? NA_TOOLTIP_LAST_QUARTER_NO_QUARTERLY_INCOME
            : null
        }
        naTooltipWhenTtmNotComputable={
          section.key === 'ttm' && section.ebitda == null
            ? NA_TOOLTIP_TTM_NO_FOUR_QUARTERS
            : null
        }
      />
    ))}
  </UniversalCard>
);

export default DebtServiceQuarterlySummary;
