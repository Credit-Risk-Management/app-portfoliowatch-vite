/* eslint-disable react/no-danger */
import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Button, Collapse, Spinner } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faArrowRight, faMagic, faUser, faLandmark, faFileAlt, faSync } from '@fortawesome/free-solid-svg-icons';
import PageHeader from '@src/components/global/PageHeader';
import UniversalCard from '@src/components/global/UniversalCard';
import SignalAccordion from '@src/components/global/SignalAccordion';
import SignalTable from '@src/components/global/SignalTable';
import { $loan, WATCH_SCORE_OPTIONS } from '@src/consts/consts';
import { formatCurrency } from '@src/utils/formatCurrency';
import Loadable from '@src/components/global/Loadable';
import { useEffectAsync } from '@fyclabs/tools-fyc-react/utils';
import SubmitCollateralModal from './_components/SubmitCollateralModal';
import { $loanCollateralView } from './_components/submitCollateralModal.signals';
import AddCreditMemoModal from './_components/AddCreditMemoModal';
import { handleOpenModal as handleOpenCreditMemoModal } from './_components/addCreditMemoModal.handlers';
import LoanRadarChart from './_components/LoanRadarChart';
import LoanComments from './_components/LoanComments';
import {
  formatDate,
  formatPercent,
  formatRatio,
  getCovenantStatus,
  getHealthScoreColor,
  renderMarkdownLinks,
} from './_helpers/loans.helpers';
import {
  $loanDetailNewComment,
  $loanDetailShowSecondaryContacts,
  $loanDetailFinancials,
  $loanDetailCollateral,
  $loanDetailCollateralDateFilter,
  $loanDetailCollateralAccordionExpanded,
  $industryReportGenerating,
  $loanDetailGuarantors,
} from './_helpers/loans.consts';
import { fetchLoanDetail } from './_helpers/loans.resolvers';
import {
  handleGenerateIndustryReport,
} from './_helpers/loans.events';

const LoanDetail = () => {
  const { loanId } = useParams();
  const navigate = useNavigate();

  // Fetch loan detail on mount or when loanId changes
  useEffectAsync(async () => {
    await fetchLoanDetail(loanId);
  }, []);

  // Reset component state when the loan changes
  useEffect(() => {
    $loanDetailNewComment.value = '';
    $loanDetailShowSecondaryContacts.value = false;
    $loanDetailFinancials.value = [];
    $loanDetailCollateral.value = [];
    $loanDetailGuarantors.value = [];
    $loanDetailCollateralDateFilter.value = null;
    $loanDetailCollateralAccordionExpanded.value = undefined;
  }, [loanId]);

  if ($loan.value?.isLoading) {
    return (
      <Container fluid className="py-24">
        <PageHeader title="Loading..." />
      </Container>
    );
  }

  if (!$loan.value?.loan) {
    return (
      <Container fluid className="py-24">
        <Button
          onClick={() => navigate('/loans')}
          className="btn-sm border-dark text-dark-800 bg-grey-50"
        >
          <FontAwesomeIcon icon={faArrowLeft} className="me-8" />
          Back to Loans
        </Button>
        <PageHeader title="Loan Not Found" />
      </Container>
    );
  }

  const collateralEntries = ($loanDetailCollateral.value || [])
    .sort((a, b) => new Date(b.asOfDate || 0) - new Date(a.asOfDate || 0));
  const collateralAccordionItems = collateralEntries.map((entry, idx) => {
    const collateralItems = Array.isArray(entry.collateralItems) ? entry.collateralItems : [];
    const totalNetValue = collateralItems.reduce((sum, item) => {
      const previousLiens = item.previousLiens || 0;
      return sum + ((item.value || 0) - previousLiens);
    }, 0);
    const prevEntry = collateralEntries[idx + 1];
    const prevTotal = prevEntry
      ? (Array.isArray(prevEntry.collateralItems) ? prevEntry.collateralItems : []).reduce(
        (sum, item) => sum + ((item.value || 0) - (item.previousLiens || 0)),
        0,
      )
      : 0;
    const trendText =
      prevTotal > 0 && prevEntry
        ? `${totalNetValue >= prevTotal ? '↑' : '↓'} ${formatPercent(Math.abs((totalNetValue - prevTotal) / prevTotal) * 100)} vs ${formatDate(prevEntry.asOfDate)}`
        : null;
    const tableHeaders = [
      { key: 'item', value: 'Item' },
      { key: 'value', value: 'Value' },
      { key: 'previousLiens', value: 'Previous Liens' },
      { key: 'netValue', value: 'Net Value' },
    ];
    const tableRows = collateralItems.map((item) => {
      const previousLiens = item.previousLiens || 0;
      const netValue = (item.value || 0) - previousLiens;
      return {
        item: item.description || 'N/A',
        value: formatCurrency(item.value || 0),
        previousLiens: formatCurrency(previousLiens),
        netValue: formatCurrency(netValue),
      };
    });
    return {
      id: String(entry.id ?? entry.asOfDate ?? idx),
      label: formatDate(entry.asOfDate),
      value: formatCurrency(totalNetValue),
      trendText: trendText || undefined,
      content: (
        <>
          <SignalTable
            headers={tableHeaders}
            rows={tableRows}
            hasPagination={false}
          />
          <div className="d-flex justify-content-between align-items-center py-12 px-16 bg-info-800 border-top border-info-500 text-white fw-bold small">
            <span>Total Net Value</span>
            <span>{formatCurrency(totalNetValue)}</span>
          </div>
        </>
      ),
    };
  });
  const firstEntry = collateralEntries[0];
  const firstItems = firstEntry && Array.isArray(firstEntry.collateralItems) ? firstEntry.collateralItems : [];
  const footerNetValue = firstEntry
    ? firstItems.reduce(
      (sum, item) => sum + ((item.value || 0) - (item.previousLiens || 0)),
      0,
    )
    : 0;
  const principalBalance = $loan.value?.loan?.principalAmount || 0;
  const footerCoverage = principalBalance > 0 ? footerNetValue / principalBalance : 0;

  const guarantorsTableRows = $loanDetailGuarantors.value.map((guarantor) => ({
    ...guarantor,
    name: `${guarantor.name}`,
    email: guarantor.email,
    phone: guarantor.phone,
    totalAssets: formatCurrency(guarantor.financials?.[0]?.totalAssets || 0),
    totalLiabilities: formatCurrency(guarantor.financials?.[0]?.totalLiabilities || 0),
    netWorth: formatCurrency(guarantor.financials?.[0]?.netWorth || 0),
    liquidity: formatCurrency(guarantor.financials?.[0]?.liquidity || 0),
    debtService: formatCurrency(($loan.value?.loan?.paymentAmount || 0) * 12 || 0),
  }));
  const guarantorsTableHeaders = [
    { key: 'name', value: 'Name', sortKey: 'name' },
    { key: 'email', value: 'Email', sortKey: 'email' },
    { key: 'phone', value: 'Phone', sortKey: 'phone' },
    { key: 'totalAssets', value: 'Total Assets', sortKey: 'totalAssets' },
    { key: 'totalLiabilities', value: 'Total Liabilities', sortKey: 'totalLiabilities' },
    { key: 'netWorth', value: 'Net Worth', sortKey: 'netWorth' },
    { key: 'liquidity', value: 'Liquidity', sortKey: 'liquidity' },
    { key: 'debtService', value: 'Total Debt Service', sortKey: 'debtService' },
  ];

  return (
    <Loadable signal={$loan} template="fullscreen">
      <Container className="py-16 py-md-24">
        <div className="d-flex justify-content-between align-items-center">
          <Button
            onClick={() => navigate('/loans')}
            className="btn-sm border-dark text-dark-800 bg-grey-50 mb-12 mb-md-16"
          >
            <FontAwesomeIcon icon={faArrowLeft} className="me-8" />
            Back to Loans
          </Button>
          <div>
            {$loan.value?.loan?.borrower?.id && (
              <Button
                variant="outline-primary-100"
                onClick={() => navigate(`/borrowers/${$loan.value?.loan?.borrower?.id}`)}
                className="me-8 mb-8 mb-md-0"
              >
                <FontAwesomeIcon icon={faUser} className="me-8" />
                View Borrower
              </Button>
            )}
            <Button
              variant="outline-info-100"
              onClick={handleOpenCreditMemoModal}
              className="me-8 mb-8 mb-md-0"
            >
              <FontAwesomeIcon icon={faFileAlt} className="me-8" />
              {(() => {
                const loan = $loan.value?.loan;
                // Check if there are any credit memo values (debtService, currentRatio, liquidity, liquidityRatio)
                const hasCreditMemoValues = loan && (
                  loan.debtService != null ||
                  loan.currentRatio != null ||
                  loan.liquidity != null ||
                  loan.liquidityRatio != null
                );
                // Also check if there are documents
                const hasDocuments = $loanDetailFinancials.value && $loanDetailFinancials.value.length > 0;
                return (hasCreditMemoValues || hasDocuments) ? 'Update Credit Memo' : 'Add Credit Memo';
              })()}
            </Button>
            <Button
              variant="outline-success-100"
              onClick={() => {
                const hasExistingCollateral = $loanDetailCollateral.value && $loanDetailCollateral.value.length > 0;
                const latestCollateralId = hasExistingCollateral && $loanDetailCollateral.value[0]?.id
                  ? $loanDetailCollateral.value[0].id
                  : null;
                $loanCollateralView.update({
                  showSubmitModal: true,
                  currentLoanId: $loan.value?.loan?.id,
                  isEditMode: hasExistingCollateral,
                  editingCollateralId: latestCollateralId,
                });
              }}
            >
              <FontAwesomeIcon icon={faLandmark} className="me-8" />
              {$loanDetailCollateral.value && $loanDetailCollateral.value.length > 0
                ? 'Update Collateral Value'
                : 'Submit Collateral Value'}
            </Button>
          </div>
        </div>
        <div className="text-info-50">Loan Id: {$loan.value?.loan?.loanNumber}</div>
        <PageHeader
          title={`${$loan.value?.loan?.borrowerName}`}
          AdditionalComponents={() => (
            <div className={`text-${WATCH_SCORE_OPTIONS[$loan.value?.loan?.watchScore].color}-200`}><h4>WATCH Score: {WATCH_SCORE_OPTIONS[$loan.value?.loan?.watchScore].label}</h4></div>
          )}
        />
        <Row>
          <Col xs={12} md={3} className="mb-12 mb-md-16">
            <UniversalCard headerText="Loan Details">
              <div style={{ height: '982px' }}>
                <div className="text-info-100 fw-200 mt-8">Principal Balance</div>
                <div className="text-success-500 d-flex align-items-end mb-8"><h4 className="mb-0">{formatCurrency($loan.value?.loan?.principalAmount)}</h4></div>
                <div className="text-info-100 fw-200 mt-8">Last Submitted Financials</div>
                <div className="text-info-50 lead fw-500">{formatDate($loan.value?.loan?.lastFinancialStatement)}</div>
                <div className="text-info-100 fw-200 mt-8">Financial Submission Frequency</div>
                <div className="text-info-50 lead fw-500">Monthly</div>
                <div className="text-info-100 fw-200 mt-8">Next Financials Due</div>
                <div className="text-info-50 lead fw-500">12/20/2025</div>
                <div className="text-info-100 fw-200 mt-8">Interest Rate</div>
                <div className="text-info-50 lead fw-500">{formatPercent($loan.value?.loan?.currentInterestRate)}</div>
                <div className="text-info-100 fw-200 mt-8">Interest Type</div>
                <div className="text-info-50 lead fw-500">{$loan.value?.loan?.typeOfInterest}</div>
                <div className="text-info-100 fw-200 mt-8">Index</div>
                <div className="text-info-50 lead fw-500">{$loan.value?.loan?.indexName || '-'}</div>
                <div className="text-info-100 fw-200 mt-8">Index Rate</div>
                <div className="text-info-50 lead fw-500">{formatPercent($loan.value?.loan?.indexRate)}</div>
                <div className="text-info-100 fw-200 mt-8">Spread</div>
                <div className="text-info-50 lead fw-500">{formatPercent($loan.value?.loan?.spread)}</div>
                <div className="text-info-100 fw-200 mt-8">Next Rate Adjustment</div>
                <div className="text-info-50 lead fw-500">{formatDate($loan.value?.loan?.nextRateAdjustmentDate)}</div>
                <div className="text-info-100 fw-200 mt-8">Maturity Date</div>
                <div className="text-info-50 lead fw-500">{formatDate($loan.value?.loan?.loanMaturityDate)}</div>
                <div className="text-info-100 fw-200 mt-8">Origination Date</div>
                <div className="text-info-50 lead fw-500">{formatDate($loan.value?.loan?.loanOriginationDate)}</div>
                <div className="text-info-100 fw-200 mt-8">Last Annual Review</div>
                <div className="text-info-50 lead fw-500">{formatDate($loan.value?.loan?.lastAnnualReview)}</div>
                <div className="text-info-100 fw-200 mt-8">Internal Risk Rating</div>
                <div className="text-info-50 lead fw-500">{$loan.value?.loan?.currentRiskRating}</div>
              </div>
            </UniversalCard>
          </Col>
          <Col xs={12} md={6} className="mb-12 mb-md-16">
            <LoanRadarChart />
          </Col>
          <Col xs={12} md={3} className="mb-12 mb-md-16">
            <UniversalCard headerText="Borrower Details">
              <div style={{ height: '982px' }}>
                <div>
                  {$loan.value?.loan?.borrower ? (
                    <>
                      <div className="text-info-100 fw-200 mt-8">Borrower Name</div>
                      <div className="text-info-50 lead fw-500">{$loan.value?.loan?.borrower.name || 'Unknown'}</div>
                      <div className="text-info-100 fw-200 mt-8">Borrower ID</div>
                      <div className="text-info-50 lead fw-500">{$loan.value?.loan?.borrower.borrowerId || 'Unknown'}</div>
                      <div className="text-info-100 fw-200 mt-8">Borrower Type</div>
                      <div className="text-info-50 lead fw-500">{$loan.value?.loan?.borrower.borrowerType || 'N/A'}</div>
                      <div className="text-info-100 fw-200 mt-8">Primary Contact</div>
                      <div className="text-info-50 lead fw-500">{$loan.value?.loan?.borrower.primaryContact || 'N/A'}</div>
                      <div className="text-info-100 fw-200 mt-8">Email</div>
                      <div className="text-info-50 lead fw-500">{$loan.value?.loan?.borrower.email || 'N/A'}</div>
                      <div className="text-info-100 fw-200 mt-8">Phone</div>
                      <div className="text-info-50 lead fw-500">{$loan.value?.loan?.borrower.phoneNumber || 'N/A'}</div>
                      <div className="text-info-100 fw-200 mt-8">Address</div>
                      <div className="text-info-50 lead fw-500">
                        {$loan.value?.loan?.borrower.streetAddress || $loan.value?.loan?.borrower.city || $loan.value?.loan?.borrower.state || $loan.value?.loan?.borrower.zipCode
                          ? `${$loan.value?.loan?.borrower.streetAddress || ''}, ${$loan.value?.loan?.borrower.city || ''}, ${$loan.value?.loan?.borrower.state || ''} ${$loan.value?.loan?.borrower.zipCode || ''}`.replace(/^,\s*|,\s*$/g, '').trim() || 'N/A'
                          : 'N/A'}
                      </div>
                      <div className="text-info-100 fw-200 mt-8">Borrower Fiscal Year End</div>
                      <div className="text-info-50 lead fw-500">12/31/XXXX</div>
                    </>
                  ) : (
                    <div className="text-info-50">Borrower information not available</div>
                  )}

                  {$loan.value?.loan?.borrower?.secondaryContacts && $loan.value?.loan?.borrower.secondaryContacts.length > 0 && (
                    <>
                      <hr className="my-12" />
                      <Button
                        variant="link"
                        onClick={() => {
                          $loanDetailShowSecondaryContacts.value = !$loanDetailShowSecondaryContacts.value;
                        }}
                        aria-controls="secondary-contacts-collapse"
                        aria-expanded={$loanDetailShowSecondaryContacts.value}
                        className="px-0 py-0 text-decoration-none"
                      >
                        {$loanDetailShowSecondaryContacts.value ? '▼' : '▶'} Secondary Contacts ({$loan.value?.loan?.borrower.secondaryContacts.length})
                      </Button>
                      <Collapse in={$loanDetailShowSecondaryContacts.value}>
                        <div id="secondary-contacts-collapse" className="mt-12">
                          {$loan.value?.loan?.borrower.secondaryContacts.map((contact, index) => (
                            <div key={index} className={index > 0 ? 'mt-12 pt-12 border-top' : ''}>
                              <div className="text-info-100 fw-200 mt-8">Name</div>
                              <div className="text-info-50 lead fw-500"><strong>{contact.name}</strong></div>
                              <div className="text-info-100 fw-200 mt-8">Role</div>
                              <div className="text-info-50 lead fw-500">{contact.role}</div>
                              <div className="text-info-100 fw-200 mt-8">Email</div>
                              <div className="text-info-50 lead fw-500">{contact.email}</div>
                              <div className="text-info-100 fw-200 mt-8">Phone</div>
                              <div className="text-info-50 lead fw-500">{contact.phone}</div>
                            </div>
                          ))}
                        </div>
                      </Collapse>
                    </>
                  )}
                </div>
                <div className="mt-16">
                  <div className="text-info-100 fw-200 mt-8">Relationship Manager</div>
                  <div className="text-info-50 lead fw-500">
                    {$loan.value?.loan?.relationshipManager ? (
                      <Button
                        variant="link"
                        className="p-0 text-secondary-100 lead fw-500 text-start text-decoration-none"
                        onClick={() => navigate(`/relationship-managers/${$loan.value?.loan?.relationshipManager.id}`)}
                      >
                        {$loan.value?.loan?.relationshipManager.name}
                        <FontAwesomeIcon icon={faArrowRight} className="ms-4" size="xs" />
                      </Button>
                    ) : (
                      'Unknown'
                    )}
                  </div>
                  {$loan.value?.loan?.relationshipManager && (
                    <>
                      <div className="text-info-100 fw-200 mt-8">Position</div>
                      <div className="text-info-50 lead fw-500">{$loan.value?.loan?.relationshipManager.positionTitle}</div>
                      <div className="text-info-100 fw-200 mt-8">Email</div>
                      <div className="text-info-50 lead fw-500">
                        {$loan.value?.loan?.relationshipManager.email}
                      </div>
                      <div className="text-info-100 fw-200 mt-8">Phone</div>
                      <div className="text-info-50 lead fw-500">
                        {$loan.value?.loan?.relationshipManager.phone}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </UniversalCard>
          </Col>
        </Row>
        <Row>
          <Col xs={12} md={12}>
            <UniversalCard headerText="Guarantors" bodyContainer="container-fluid" className="mt-12 mt-md-16">
              <Row className="mt-12 mb-12">
                <SignalTable
                  headers={guarantorsTableHeaders}
                  rows={guarantorsTableRows}
                  className="shadow"
                  onRowClick={(guarantor) => navigate(`/guarantors/${guarantor.id}`)}
                />
              </Row>
            </UniversalCard>
            <UniversalCard headerText="Covenants" bodyContainer="container-fluid" className="mt-12 mt-md-16">
              <Row>
                <Col xs={12} md={6} className="mb-12 mb-md-0">
                  <div className="text-info-100 fw-200 mt-16 mb-4">Debt Service Coverage</div>
                  <div>
                    <span className="text-info-50 fw-500 me-8">Actual:</span>
                    <span className={`fs-5 fw-bold text-${getCovenantStatus($loan.value?.loan?.debtService, $loan.value?.loan?.debtServiceCovenant).variant}`}>
                      {formatRatio($loan.value?.loan?.debtService)}
                    </span>
                  </div>
                  <div className="mb-8">
                    <span className="text-info-50 fw-500 me-8">Covenant:</span>
                    <span className="fs-5 fw-bold text-secondary-200">
                      {formatRatio($loan.value?.loan?.debtServiceCovenant)}
                    </span>
                  </div>
                </Col>
                <Col xs={12} md={6} className="mb-12 mb-md-0">
                  <div className="text-info-100 fw-200 mt-16 mb-4">Liquidity Ratio</div>
                  <div>
                    <span className="text-info-50 fw-500 me-8">Actual:</span>
                    <span className={`fs-5 fw-bold text-${getCovenantStatus($loan.value?.loan?.liquidityRatio, $loan.value?.loan?.liquidityRatioCovenant).variant}`}>
                      {formatRatio($loan.value?.loan?.liquidityRatio)}
                    </span>
                  </div>
                  <div className="mb-8">
                    <span className="text-info-50 fw-500 me-8">Covenant:</span>
                    <span className="fs-5 fw-bold text-secondary-200">
                      {formatRatio($loan.value?.loan?.liquidityRatioCovenant)}
                    </span>
                  </div>
                </Col>
                <Col xs={12} md={6} className="mb-12 mb-md-0">
                  <div className="text-info-100 fw-200 mt-16 mb-4">Current Ratio</div>
                  <div>
                    <span className="text-info-50 fw-500 me-8">Actual:</span>
                    <span className={`fs-5 fw-bold text-${getCovenantStatus($loan.value?.loan?.currentRatio, $loan.value?.loan?.currentRatioCovenant).variant}`}>
                      {formatRatio($loan.value?.loan?.currentRatio)}
                    </span>
                    <div className="mb-8">
                      <span className="text-info-50 fw-500 me-8">Covenant:</span>
                      <span className="fs-5 fw-bold text-secondary-200">
                        {formatRatio($loan.value?.loan?.currentRatioCovenant)}
                      </span>
                    </div>
                  </div>
                </Col>
                <Col xs={12} md={6} className="mb-12 mb-md-0">
                  <div className="text-info-100 fw-200 mt-16 mb-4">Liquidity Total</div>
                  <div>
                    <span className="text-info-50 fw-500 me-8">Actual:</span>
                    <span className={`fs-5 fw-bold text-${getCovenantStatus($loan.value?.loan?.liquidity, $loan.value?.loan?.liquidityCovenant).variant}`}>
                      {formatCurrency($loan.value?.loan?.liquidity)}
                    </span>
                  </div>
                  <div className="mb-8">
                    <span className="text-info-50 fw-500 me-8">Covenant:</span>
                    <span className="fs-5 fw-bold text-secondary-200">
                      {formatCurrency($loan.value?.loan?.liquidityCovenant)}
                    </span>
                  </div>
                </Col>
              </Row>
            </UniversalCard>
            <UniversalCard headerText="Industry Analysis" className="mt-12 mt-md-16">
              <Row>
                <Col xs={12} md={8} className="mb-12 mb-md-0">
                  <Button
                    variant="primary-100 mt-16"
                    size="sm"
                    onClick={handleGenerateIndustryReport}
                    disabled={$industryReportGenerating.value}
                  >
                    {$industryReportGenerating.value ? (
                      <>
                        <Spinner animation="border" size="sm" className="me-8" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <FontAwesomeIcon icon={faMagic} className="me-8" />
                        Generate Industry Report
                      </>
                    )}
                  </Button>
                  <div className="mt-16">
                    <span className="text-info-100 fw-200">NAICS Code: </span>
                    <span className="fw-bold">{$loan.value?.loan?.naicsCode || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-info-100 fw-200">Industry: </span>
                    <span className="fw-bold">{$loan.value?.loan?.naicsDescription || 'N/A'}</span>
                  </div>
                </Col>
                <Col xs={12} md={4} className="text-md-end">
                  <div className="text-info-100 fw-200">Industry Health Score</div>
                  <div className={`fs-1 fw-bold ${getHealthScoreColor($loan.value?.loan?.borrower?.industryHealthScore)}`}>
                    {$loan.value?.loan?.borrower?.industryHealthScore || '-'}
                  </div>
                  <div className="text-info-100 fw-200 small">out of 100</div>
                </Col>
              </Row>
              <Row>
                <Col xs={12} md={12}>
                  <div>
                    <div className="text-info-100 fw-200 mt-16 mb-8 fw-semibold">Industry Analysis</div>
                    {$loan.value?.loan?.borrower?.industryHealthReport ? (
                      <div
                        dangerouslySetInnerHTML={{ __html: renderMarkdownLinks($loan.value?.loan?.borrower?.industryHealthReport) }}
                        style={{ lineHeight: '1.6' }}
                      />
                    ) : (
                      <div className="text-info-100 fw-200 fst-italic">
                        No industry report generated yet. Click the button above to generate one.
                      </div>
                    )}
                  </div>
                </Col>
              </Row>
            </UniversalCard>
            <UniversalCard headerText="Collateral Values" className="mt-12 mt-md-16">
              {$loanDetailCollateral.value && $loanDetailCollateral.value.length > 0 ? (
                <div className="mt-16">
                  <SignalAccordion
                    items={collateralAccordionItems}
                    defaultExpandedId={collateralAccordionItems[0]?.id}
                    $expandedId={$loanDetailCollateralAccordionExpanded}
                    footer={{
                      netValueLabel: 'Net Value',
                      netValue: formatCurrency(footerNetValue),
                      coverageLabel: 'Coverage Ratio',
                      coverageValue: formatRatio(footerCoverage),
                    }}
                  />
                  <div className="mt-16 pt-16 border-top d-flex justify-content-center">
                    <Button
                      variant="info"
                      size="sm"
                      disabled
                      style={{ opacity: 0.7 }}
                    >
                      <FontAwesomeIcon icon={faSync} className="me-8" />
                      Update Collateral (Coming soon...)
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-info-100 fw-200 fst-italic py-16">
                  No collateral values submitted yet. Click the &quot;Submit Collateral Value&quot; button above to add collateral.
                </div>
              )}
            </UniversalCard>
            <UniversalCard headerText="Comments" className="mt-12 mt-md-16">
              <LoanComments loanId={loanId} />
            </UniversalCard>
          </Col>
        </Row>

        {/* Collateral Modal */}
        <SubmitCollateralModal />

        {/* Credit Memo Modal */}
        <AddCreditMemoModal />
      </Container>
    </Loadable>
  );
};

export default LoanDetail;
