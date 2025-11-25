import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Button, ListGroup, Collapse } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileAlt, faDownload, faTrash, faArrowLeft, faArrowRight } from '@fortawesome/free-solid-svg-icons';
import PageHeader from '@src/components/global/PageHeader';
import FileUploader from '@src/components/global/FileUploader';
import MetricCard from '@src/components/global/MetricCard';
import UniversalCard from '@src/components/global/UniversalCard';
import { $loan, WATCH_SCORE_OPTIONS } from '@src/consts/consts';
import { formatCurrency } from '@src/utils/formatCurrency';
import { getWatchScoreColor } from '@src/components/views/Dashboard/_helpers/dashboard.consts';
import LoanRadarChart from './_components/LoanRadarChart';
import LoanTrendChart from './_components/LoanTrendChart';
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
} from './_helpers/loans.consts';
import { fetchLoanDetail } from './_helpers/loans.resolvers';
import {
  handleUploadFinancials,
  handleDeleteFinancial,
  handleDownloadFinancial,
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
      <Button
        onClick={() => navigate('/loans')}
        className="btn-sm border-dark text-dark-800 bg-grey-50 mb-16"
      >
        <FontAwesomeIcon icon={faArrowLeft} className="me-8" />
        Back to Loans
      </Button>
      <div className="text-info-300">Loan Id: {$loan.value?.loan?.loanNumber}</div>
      <PageHeader
        title={`${$loan.value?.loan?.borrowerName}`}
        AdditionalComponents={() => (
          <div className={`text-info-300 text-${getWatchScoreColor($loan.value?.loan?.watchScore)}-200`}><h4>Watch Score: {WATCH_SCORE_OPTIONS[$loan.value?.loan?.watchScore].label}</h4></div>
        )}
      />
      <Row>
        <Col md={3}>
          <UniversalCard headerText="Loan Details">
            <div style={{ minHeight: '400px' }}>
              <div className="text-info-100 fw-200 mt-8">Principal Balance</div>
              <div className="text-info-300 d-flex align-items-end mb-8"><h4 className="mb-0">{formatCurrency($loan.value?.loan?.principalAmount)}</h4></div>
              <div className="text-info-100 fw-200 mt-8">Last Submitted Financials</div>
              <div className="text-info-300 lead fw-500">{formatDate($loan.value?.loan?.lastFinancialStatement)}</div>
              <div className="text-info-100 fw-200 mt-8">Interest Rate</div>
              <div className="text-info-300 lead fw-500">{formatPercent($loan.value?.loan?.currentInterestRate)}</div>
              <div className="text-info-100 fw-200 mt-8">Interest Type</div>
              <div className="text-info-300 lead fw-500">{$loan.value?.loan?.typeOfInterest}</div>
              <div className="text-info-100 fw-200 mt-8">Index</div>
              <div className="text-info-300 lead fw-500">{$loan.value?.loan?.indexName || '-'}</div>
              <div className="text-info-100 fw-200 mt-8">Index Rate</div>
              <div className="text-info-300 lead fw-500">{formatPercent($loan.value?.loan?.indexRate)}</div>
              <div className="text-info-100 fw-200 mt-8">Spread</div>
              <div className="text-info-300 lead fw-500">{formatPercent($loan.value?.loan?.spread)}</div>
              <div className="text-info-100 fw-200 mt-8">Next Rate Adjustment</div>
              <div className="text-info-300 lead fw-500">{formatDate($loan.value?.loan?.nextRateAdjustmentDate)}</div>
              <div className="text-info-100 fw-200 mt-8">Maturity Date</div>
              <div className="text-info-300 lead fw-500">{formatDate($loan.value?.loan?.loanMaturityDate)}</div>
              <div className="text-info-100 fw-200 mt-8">Origination Date</div>
              <div className="text-info-300 lead fw-500">{formatDate($loan.value?.loan?.loanOriginationDate)}</div>
              <div className="text-info-100 fw-200 mt-8">Last Annual Review</div>
              <div className="text-info-300 lead fw-500">{formatDate($loan.value?.loan?.lastAnnualReview)}</div>
              <div className="text-info-100 fw-200 mt-8">Internal Risk Rating</div>
              <div className="text-info-300 lead fw-500">{$loan.value?.loan?.currentRiskRating}</div>
            </div>
          </UniversalCard>
          <UniversalCard headerText="Borrower Owner Info" className="mt-16">
            <div className="py-16">
              <div className="text-info-100 fw-200 mt-8">Primary Contact</div>
              <div className="text-info-300 lead fw-500">{$loan.value?.loan?.borrower?.primaryContact || 'Unknown'}</div>
              <div className="text-info-100 fw-200 mt-8">Email</div>
              <div className="text-info-300 lead fw-500">{$loan.value?.loan?.borrower?.email || 'Unknown'}</div>
              <div className="text-info-100 fw-200 mt-8">Phone</div>
              <div className="text-info-300 lead fw-500">{$loan.value?.loan?.borrower?.phoneNumber || 'Unknown'}</div>
              <div className="text-info-100 fw-200 mt-8">Address</div>
              <div className="text-info-300 lead fw-500">{$loan.value?.loan?.borrower ? `${$loan.value?.loan?.borrower.streetAddress || ''}, ${$loan.value?.loan?.borrower.city || ''}, ${$loan.value?.loan?.borrower.state || ''} ${$loan.value?.loan?.borrower.zipCode || ''}`.replace(/^,\s*|,\s*$/g, '').trim() || 'Unknown' : 'Unknown'}</div>

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
                          <div className="text-info-300 lead fw-500"><strong>{contact.name}</strong></div>
                          <div className="text-info-100 fw-200 mt-8">Role</div>
                          <div className="text-info-300 lead fw-500">{contact.role}</div>
                          <div className="text-info-100 fw-200 mt-8">Email</div>
                          <div className="text-info-300 lead fw-500">{contact.email}</div>
                          <div className="text-info-100 fw-200 mt-8">Phone</div>
                          <div className="text-info-300 lead fw-500">{contact.phone}</div>
                        </div>
                      ))}
                    </div>
                  </Collapse>
                </>
              )}
            </div>
          </UniversalCard>
        </Col>
        <Col md={6}>
          <LoanRadarChart />
          <div className="mt-16">
            <LoanTrendChart loan={$loan.value?.loan} />
          </div>
          <UniversalCard headerText="Covenants" bodyContainer="container-fluid" className="mt-16">
            <Row>
              <Col md={6} className="mb-16">
                <div className="text-muted mb-4">Debt Service Coverage</div>
                <div className="mb-8">
                  <span className="fw-bold me-8">Actual:</span>
                  <span className={`fs-5 fw-bold text-${getCovenantStatus($loan.value?.loan?.debtService, $loan.value?.loan?.debtServiceCovenant).variant}`}>
                    {formatRatio($loan.value?.loan?.debtService)}
                  </span>
                </div>
                <div className="text-muted small">
                  Covenant: {formatRatio($loan.value?.loan?.debtServiceCovenant)}
                </div>
              </Col>
              <Col md={6} className="mb-16">
                <div className="text-muted mb-4">Liquidity Ratio</div>
                <div className="mb-8">
                  <span className="fw-bold me-8">Actual:</span>
                  <span className={`fs-5 fw-bold text-${getCovenantStatus($loan.value?.loan?.liquidityRatio, $loan.value?.loan?.liquidityRatioCovenant).variant}`}>
                    {formatRatio($loan.value?.loan?.liquidityRatio)}
                  </span>
                </div>
                <div className="text-muted small">
                  Covenant: {formatRatio($loan.value?.loan?.liquidityRatioCovenant)}
                </div>
              </Col>
              <Col md={6} className="mb-16">
                <div className="text-muted mb-4">Current Ratio</div>
                <div className="d-flex align-items-center">
                  <div className="mb-8">
                    <span className="fw-bold me-8">Actual:</span>
                    <span className={`fs-5 fw-bold text-${getCovenantStatus($loan.value?.loan?.currentRatio, $loan.value?.loan?.currentRatioCovenant).variant}`}>
                      {formatRatio($loan.value?.loan?.currentRatio)}
                    </span>
                  </div>
                  <div className="text-muted small ms-8">
                    {formatRatio($loan.value?.loan?.currentRatioCovenant)}
                  </div>
                </div>
              </Col>
              <Col md={6} className="mb-16">
                <div className="text-muted mb-4">Liquidity Total</div>
                <div className="mb-8">
                  <span className="fw-bold me-8">Actual:</span>
                  <span className={`fs-5 fw-bold text-${getCovenantStatus($loan.value?.loan?.liquidity, $loan.value?.loan?.liquidityCovenant).variant}`}>
                    {formatCurrency($loan.value?.loan?.liquidity)}
                  </span>
                </div>
                <div className="text-muted small">
                  Covenant: {formatCurrency($loan.value?.loan?.liquidityCovenant)}
                </div>
              </Col>
            </Row>
          </UniversalCard>
          <UniversalCard headerText="Industry Analysis" bodyContainer="container-fluid" className="mt-16">
            <Row className="mb-16">
              <Col md={8}>
                <div className="mb-8">
                  <span className="text-muted">NAICS Code: </span>
                  <span className="fw-bold">{$loan.value?.loan?.naicsCode}</span>
                </div>
                <div className="mb-16">
                  <span className="text-muted">Industry: </span>
                  <span className="fw-bold">{$loan.value?.loan?.naicsDescription}</span>
                </div>
              </Col>
              <Col md={4} className="text-md-end">
                <div className="text-muted mb-4">Industry Health Score</div>
                <div className={`fs-1 fw-bold ${getHealthScoreColor($loan.value?.loan?.industryHealthScore)}`}>
                  {$loan.value?.loan?.industryHealthScore}
                </div>
                <div className="text-muted small">out of 100</div>
              </Col>
            </Row>
            <div>
              <div className="text-muted mb-8 fw-semibold">Industry Analysis</div>
              <div
                dangerouslySetInnerHTML={{ __html: renderMarkdownLinks($loan.value?.loan?.industryNarrative) }}
                style={{ lineHeight: '1.6' }}
              />
            </div>
          </UniversalCard>
        </Col>
        <Col md={3}>
          <UniversalCard headerText="Relationship Manager(s)">
            <div className="text-info-100 fw-200 mt-8">Relationship Manager</div>
            <div className="text-info-300 lead fw-500">
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
                <div className="text-info-300 lead fw-500">{$loan.value?.loan?.relationshipManager.positionTitle}</div>
                <div className="text-info-100 fw-200 mt-8">Email</div>
                <div className="text-info-300 lead fw-500">
                  {$loan.value?.loan?.relationshipManager.email}
                </div>
                <div className="text-info-100 fw-200 mt-8">Phone</div>
                <div className="text-info-300 lead fw-500">
                  {$loan.value?.loan?.relationshipManager.phone}
                </div>
              </>
            )}

          </UniversalCard>
          <UniversalCard headerText="Financials" bodyContainer="" className="mt-16">
            <div className="mb-16">
              <div className="d-flex align-items-end gap-2">
                <div style={{ flex: 1 }}>
                  <FileUploader
                    name="financialFiles"
                    signal={$financialsUploader}
                    acceptedTypes=".pdf,.xlsx,.xls,.doc,.docx,.csv"
                    hideNoFiles={false}
                  />
                </div>
                <Button
                  variant="primary"
                  onClick={handleUploadFinancials}
                  disabled={!$financialsUploader.value?.financialFiles?.length}
                >
                  Upload
                </Button>
              </div>
            </div>

            {$loanDetailFinancials.value.length === 0 ? (
              <div className="text-muted">No financial documents uploaded yet.</div>
            ) : (
              <ListGroup variant="flush">
                {$loanDetailFinancials.value.map((financial) => (
                  <ListGroup.Item key={financial.id} className="d-flex justify-content-between align-items-center">
                    <div className="d-flex align-items-center">
                      <FontAwesomeIcon icon={faFileAlt} className="me-12 text-primary" />
                      <div>
                        <div className="fw-bold">{financial.fileName}</div>
                        <div className="small text-muted">
                          Uploaded by {financial.uploadedBy} on {formatDate(financial.uploadedAt)}
                          {financial.fileSize && ` • ${(financial.fileSize / 1024).toFixed(2)} KB`}
                        </div>
                      </div>
                    </div>
                    <div className="d-flex gap-2">
                      <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={() => handleDownloadFinancial(financial)}
                      >
                        <FontAwesomeIcon icon={faDownload} />
                      </Button>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => handleDeleteFinancial(financial.id)}
                      >
                        <FontAwesomeIcon icon={faTrash} />
                      </Button>
                    </div>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            )}
          </UniversalCard>
          <UniversalCard headerText="Comments" className="mt-16">
            <LoanComments loanId={loanId} />
          </UniversalCard>
        </Col>
      </Row>
    </Container>
  );
};

export default LoanDetail;
