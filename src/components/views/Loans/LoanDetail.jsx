import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Button, ListGroup, Collapse, Spinner } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileAlt, faDownload, faTrash, faArrowLeft, faArrowRight, faEdit, faMagic, faHistory, faChartLine } from '@fortawesome/free-solid-svg-icons';
import PageHeader from '@src/components/global/PageHeader';
import FileUploader from '@src/components/global/FileUploader';
import UniversalCard from '@src/components/global/UniversalCard';
import { $loan, WATCH_SCORE_OPTIONS } from '@src/consts/consts';
import { formatCurrency } from '@src/utils/formatCurrency';
import { getWatchScoreColor } from '@src/components/views/Dashboard/_helpers/dashboard.consts';
import FinancialHistoryModal from '@src/components/views/Borrowers/_components/FinancialHistoryModal';
import SubmitFinancialsModal from '@src/components/views/Borrowers/_components/SubmitFinancialsModal';
import { $borrowerFinancialsView } from '@src/signals';
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
  $financialsUploader,
  $loanDetailNewComment,
  $loanDetailShowSecondaryContacts,
  $loanDetailFinancials,
  $industryReportGenerating,
} from './_helpers/loans.consts';
import { fetchLoanDetail } from './_helpers/loans.resolvers';
import {
  handleGenerateIndustryReport,
} from './_helpers/loans.events';

const LoanDetail = () => {
  const { loanId } = useParams();
  const navigate = useNavigate();

  // Fetch loan detail on mount or when loanId changes
  useEffect(() => {
    fetchLoanDetail(loanId);
  }, [loanId]);

  // Reset the financials uploader signal and component state when the loan changes
  useEffect(() => {
    $financialsUploader.update({ financialFiles: [] });
    $loanDetailNewComment.value = '';
    $loanDetailShowSecondaryContacts.value = false;
    $loanDetailFinancials.value = [];
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

  return (
    <Container className="py-24">
      <div className="d-flex justify-content-between align-items-center">
        <Button
          onClick={() => navigate('/loans')}
          className="btn-sm border-dark text-dark-800 bg-grey-50 mb-16"
        >
          <FontAwesomeIcon icon={faArrowLeft} className="me-8" />
          Back to Loans
        </Button>
        <div>
          <Button
            variant="outline-secondary-100"
            onClick={() => {
              $borrowerFinancialsView.update({
                showHistoryModal: true,
                currentBorrowerId: $loan.value?.loan?.borrower?.id,
              });
            }}
            className="me-8"
          >
            <FontAwesomeIcon icon={faHistory} className="me-8" />
            Financial History
          </Button>
          <Button
            variant="outline-primary-100"
            onClick={() => {
              $borrowerFinancialsView.update({
                showSubmitModal: true,
                currentBorrowerId: $loan.value?.loan?.borrower?.id,
              });
            }}
          >
            <FontAwesomeIcon icon={faChartLine} className="me-8" />
            Submit New Financials
          </Button>
        </div>
      </div>
      <div className="text-info-50">Loan Id: {$loan.value?.loan?.loanNumber}</div>
      <PageHeader
        title={`${$loan.value?.loan?.borrowerName}`}
        AdditionalComponents={() => (
          <div className={`text-info-50 text-${getWatchScoreColor($loan.value?.loan?.watchScore)}-200`}><h4>WATCH Score: {WATCH_SCORE_OPTIONS[$loan.value?.loan?.watchScore].label}</h4></div>
        )}
      />
      <Row>
        <Col md={3}>
          <UniversalCard headerText="Loan Details">
            <div style={{ height: '982px' }}>
              <div className="text-info-100 fw-200 mt-8">Principal Balance</div>
              <div className="text-success-500 d-flex align-items-end mb-8"><h4 className="mb-0">{formatCurrency($loan.value?.loan?.principalAmount)}</h4></div>
              <div className="text-info-100 fw-200 mt-8">Last Submitted Financials</div>
              <div className="text-info-50 lead fw-500">{formatDate($loan.value?.loan?.lastFinancialStatement)}</div>
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
        <Col md={6}>
          <LoanRadarChart />
        </Col>
        <Col md={3}>
          <UniversalCard headerText="Relationship Manager(s)">
            <div style={{ height: '982px' }}>
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
              <div className="mt-16 lead">Borrower Details</div>
              <div>
                {$loan.value?.loan?.borrower ? (
                  <>
                    <div className="text-info-100 fw-200 mt-8">Borrower Name</div>
                    <div className="text-info-50 lead fw-500">{$loan.value?.loan?.borrower.name || 'Unknown'}</div>
                    <div className="text-info-100 fw-200 mt-8">Borrower ID</div>
                    <div className="text-info-50 lead fw-500">{$loan.value?.loan?.borrower.borrowerId || 'Unknown'}</div>
                    <div className="text-info-100 fw-200 mt-8">Borrower Type</div>
                    <div className="text-info-50 lead fw-500">{$loan.value?.loan?.borrower.borrowerType || 'Unknown'}</div>
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
            </div>
          </UniversalCard>
        </Col>
      </Row>
      <Row>
        <Col md={12}>
          <UniversalCard headerText="Covenants" bodyContainer="container-fluid" className="mt-16">
            <Row style={{ height: '500px' }}>
              <Col md={6}>
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
              <Col md={6}>
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
              <Col md={6}>
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
              <Col md={6}>
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
        </Col>
      </Row>
      <Row>
        <Col md={12}>
          <UniversalCard headerText="Industry Analysis" className="mt-16">
            <div style={{ height: '500px' }}>
              <Row>
                <Col md={8}>
                  <Button
                    variant="primary-100"
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
                <Col md={4} className="text-md-end">
                  <div className="text-info-100 fw-200">Industry Health Score</div>
                  <div className={`fs-1 fw-bold ${getHealthScoreColor($loan.value?.loan?.borrower?.industryHealthScore)}`}>
                    {$loan.value?.loan?.borrower?.industryHealthScore || '-'}
                  </div>
                  <div className="text-info-100 fw-200 small">out of 100</div>
                </Col>
              </Row>
              <Row>
                <Col md={12}>
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
            </div>
          </UniversalCard>
          <UniversalCard headerText="Financials" bodyContainer="" className="mt-16">
            <div className="d-flex justify-content-end gap-2 px-24 pt-16">
              <Button
                variant="outline-secondary-100"
                size="sm"
                onClick={() => {
                  $borrowerFinancialsView.update({
                    showHistoryModal: true,
                    currentBorrowerId: $loan.value?.loan?.borrower?.id,
                  });
                }}
              >
                <FontAwesomeIcon icon={faHistory} className="me-8" />
                View History
              </Button>
              <Button
                variant="primary-100"
                size="sm"
                onClick={() => {
                  $borrowerFinancialsView.update({
                    showSubmitModal: true,
                    currentBorrowerId: $loan.value?.loan?.borrower?.id,
                  });
                }}
              >
                <FontAwesomeIcon icon={faChartLine} className="me-8" />
                Submit Financials
              </Button>
            </div>
          </UniversalCard>
          <UniversalCard headerText="Comments" className="mt-16">
            <LoanComments loanId={loanId} />
          </UniversalCard>
        </Col>
      </Row>

      {/* Financial Modals */}
      <FinancialHistoryModal />
      <SubmitFinancialsModal />
    </Container>
  );
};

export default LoanDetail;
