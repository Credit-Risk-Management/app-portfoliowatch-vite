import { useMemo, useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Button, Form, ListGroup, Collapse } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileAlt, faDownload, faTrash, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { Signal } from '@fyclabs/tools-fyc-react/signals';
import { useEffectAsync } from '@fyclabs/tools-fyc-react/utils';
import PageHeader from '@src/components/global/PageHeader';
import FileUploader from '@src/components/global/FileUploader';
import MetricCard from '@src/components/global/MetricCard';
import UniversalCard from '@src/components/global/UniversalCard';
import { $loans } from '@src/signals';
import borrowersApi from '@src/api/borrowers.api';
import commentsApi from '@src/api/comments.api';
import relationshipManagersApi from '@src/api/relationshipManagers.api';
import { formatCurrency } from '@src/utils/formatCurrency';
import { signal } from '@preact/signals-react';
import LoanRadarChart from './_components/LoanRadarChart';
import LoanTrendChart from './_components/LoanTrendChart';

// Create signals for data
const $financialsUploader = Signal({ financialFiles: [] });
const $borrowers = signal([]);
const $managers = signal([]);
const $comments = signal([]);

const formatDate = (dateString) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' });
};

const formatPercent = (value) => {
  if (value === null || value === undefined || value === '') return '-';
  const num = Number(value);
  if (Number.isNaN(num)) return '-';
  return `${num.toFixed(2)}%`;
};

const formatRatio = (value) => {
  if (value === null || value === undefined || value === '') return '-';
  const num = Number(value);
  if (Number.isNaN(num)) return '-';
  return num.toFixed(2);
};

// Calculate covenant status and return variant for color coding
// All covenants: higher actual is better (actual should be >= covenant)
const getCovenantStatus = (actual, covenant) => {
  if (!actual || !covenant) return { variant: 'secondary', status: 'N/A', percentage: null };

  const percentage = (actual / covenant) * 100;

  if (actual >= covenant) {
    return { variant: 'success', status: 'Meeting', percentage };
  } if (percentage >= 90) {
    return { variant: 'warning', status: 'Warning', percentage };
  }
  return { variant: 'danger', status: 'Below', percentage };
};

// Get health score color class based on score value
const getHealthScoreColor = (score) => {
  if (score >= 80) return 'text-success';
  if (score >= 60) return 'text-warning';
  return 'text-danger';
};

// Convert markdown links to HTML anchor tags
const renderMarkdownLinks = (text) => {
  if (!text) return '';
  // Replace [text](url) with <a> tags
  return text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
};

const LoanDetail = () => {
  const { loanId } = useParams();
  const navigate = useNavigate();

  const loan = useMemo(() => $loans.value.list.find((l) => `${l.id}` === `${loanId}`), [loanId]);
  const borrowers = $borrowers.value || [];
  const managers = $managers.value || [];

  const matchedClient = useMemo(() => {
    if (!loan || !borrowers.length) return undefined;
    if (loan.borrowerId) {
      return borrowers.find((c) => `${c.id}` === `${loan.borrowerId}`);
    }
    return borrowers.find((c) => c.name === loan.borrowerName);
  }, [loan, borrowers]);

  const loanOfficer = useMemo(() => {
    if (!loan || !loan.loanOfficerId || !managers.length) return null;
    return managers.find((m) => m.id === loan.loanOfficerId);
  }, [loan, managers]);

  const loanOfficerManager = useMemo(() => {
    if (!loanOfficer || !loanOfficer.managerId || !managers.length) return null;
    return managers.find((m) => m.id === loanOfficer.managerId);
  }, [loanOfficer, managers]);

  const [newComment, setNewComment] = useState('');
  const [showSecondaryContacts, setShowSecondaryContacts] = useState(false);
  const [financials, setFinancials] = useState([]);

  // Fetch data on mount or when loanId changes
  useEffectAsync(async () => {
    if (!loanId) return;

    const [borrowersResponse, managersResponse, commentsResponse] = await Promise.all([
      borrowersApi.getAll(),
      relationshipManagersApi.getAll(),
      commentsApi.getByLoan(loanId),
    ]);

    $borrowers.value = borrowersResponse.data || [];
    $managers.value = managersResponse.data || [];
    $comments.value = commentsResponse.data || [];
  }, [loanId]);

  // Reset the financials uploader signal when the loan changes
  useEffect(() => {
    $financialsUploader.update({ financialFiles: [] });
  }, [loanId]);

  const localComments = $comments.value || [];

  if (!loan) {
    return (
      <Container fluid className="py-24">
        <PageHeader title="Loan Not Found" />
        <Button variant="link" onClick={() => navigate('/loans')}>
          <FontAwesomeIcon icon={faArrowLeft} className="me-8" />
          Back to Loans
        </Button>
      </Container>
    );
  }

  const handleAddComment = async () => {
    const text = newComment?.trim();
    if (!text) return;

    const newCommentData = {
      loan_id: loan.id,
      text,
    };

    await commentsApi.create(newCommentData);
    const updatedCommentsResponse = await commentsApi.getByLoan(loanId);
    $comments.value = updatedCommentsResponse.data || [];
    setNewComment('');
  };

  const handleUploadFinancials = () => {
    const files = $financialsUploader.value?.financialFiles || [];
    if (!files.length) return;

    const newFinancials = files.map((file) => ({
      id: `${Date.now()}_${Math.random()}`,
      loan_id: loan.id,
      file_name: file.name,
      file_size: file.size,
      file_type: file.type,
      uploaded_at: new Date().toISOString(),
      uploaded_by: 'Current User',
    }));

    setFinancials([...financials, ...newFinancials]);
    $financialsUploader.update({ financialFiles: [] });
  };

  const handleDeleteFinancial = (financialId) => {
    setFinancials(financials.filter((f) => f.id !== financialId));
  };

  const handleDownloadFinancial = (financial) => {
    // In a real implementation, this would download the file from storage
    // Download logic for financial.file_name
  };

  return (
    <Container className="py-24">
      <div className="mb-32">
        <Button
          onClick={() => navigate('/loans')}
          className="btn-sm border-dark text-dark-800 bg-dark-50"
        >
          <FontAwesomeIcon icon={faArrowLeft} className="me-8" />
          Back to Loans
        </Button>
      </div>
      <PageHeader title={`${loan.borrowerName}`} />

      <Row className="mb-24">
        <Col md={3} className="mb-16">
          <MetricCard
            title="Loan Balance"
            value={formatCurrency(loan.principalAmount)}
            variant="primary"
          />
        </Col>
        <Col md={3} className="mb-16">
          <MetricCard
            title="Interest Rate"
            value={formatPercent(loan.currentInterestRate)}
            variant="secondary"
            SubComponent={() => (
              <div className="small d-flex mt-12">
                <div className="mb-4 me-8"><span className="text-muted">Index: </span>{loan.indexName || '-'}</div>
                <div className="mb-4 me-8"><span className="text-muted">Index Rate: </span>{formatPercent(loan.indexRate)}</div>
                <div><span className="text-muted">Spread: </span>{formatPercent(loan.spread)}</div>
              </div>
            )}
          />
        </Col>
        <Col md={3} className="mb-16">
          <MetricCard
            title="Last Submitted Financials"
            value={formatDate(loan.lastFinancialStatement)}
            variant="info"
          />
        </Col>
        <Col md={3} className="mb-16">
          <MetricCard
            title="Loan Number"
            value={loan.loanNumber}
            variant="success"
          />
        </Col>
      </Row>

      <Row className="mb-24">
        <Col lg={6} className="mb-16">
          <LoanRadarChart loan={loan} />
        </Col>
        <Col lg={6} className="mb-16">
          <LoanTrendChart loan={loan} />
        </Col>
      </Row>

      <Row className="mb-24">
        <Col md={5} className="mb-16">
          <UniversalCard headerText="Borrower Owner Info">
            <div className="py-16">
              <div className="mb-8"><span className="text-muted">Primary Contact: </span>{matchedClient?.primary_contact || 'Unknown'}</div>
              <div className="mb-8"><span className="text-muted">Email: </span>{matchedClient?.email || 'Unknown'}</div>
              <div className="mb-8"><span className="text-muted">Phone: </span>{matchedClient?.phone_number || 'Unknown'}</div>
              <div className="mb-8"><span className="text-muted">Address: </span>{matchedClient ? `${matchedClient.street_address}, ${matchedClient.city}, ${matchedClient.state} ${matchedClient.zip_code}` : 'Unknown'}</div>

              {matchedClient?.secondary_contacts && matchedClient.secondary_contacts.length > 0 && (
                <>
                  <hr className="my-12" />
                  <Button
                    variant="link"
                    onClick={() => setShowSecondaryContacts(!showSecondaryContacts)}
                    aria-controls="secondary-contacts-collapse"
                    aria-expanded={showSecondaryContacts}
                    className="px-0 py-0 text-decoration-none"
                  >
                    {showSecondaryContacts ? '▼' : '▶'} Secondary Contacts ({matchedClient.secondary_contacts.length})
                  </Button>
                  <Collapse in={showSecondaryContacts}>
                    <div id="secondary-contacts-collapse" className="mt-12">
                      {matchedClient.secondary_contacts.map((contact, index) => (
                        <div key={index} className={index > 0 ? 'mt-12 pt-12 border-top' : ''}>
                          <div className="mb-4"><span className="text-muted">Name: </span><strong>{contact.name}</strong></div>
                          <div className="mb-4"><span className="text-muted">Role: </span>{contact.role}</div>
                          <div className="mb-4"><span className="text-muted">Email: </span>{contact.email}</div>
                          <div className="mb-4"><span className="text-muted">Phone: </span>{contact.phone}</div>
                        </div>
                      ))}
                    </div>
                  </Collapse>
                </>
              )}
            </div>
          </UniversalCard>
        </Col>

        <Col md={7} className="mb-16">
          <Row>
            <Col md={12} className="mb-16">
              <UniversalCard headerText="Loan Officer & Management" bodyContainer="container-fluid">
                <Row>
                  <Col md={6}>
                    <div className="mb-8">
                      <span className="text-muted">Loan Officer: </span>
                      {loanOfficer ? (
                        <Button
                          variant="link"
                          className="p-0"
                          onClick={() => navigate(`/relationship-managers/${loanOfficer.id}`)}
                        >
                          {loanOfficer.name}
                        </Button>
                      ) : (
                        'Unknown'
                      )}
                    </div>
                    {loanOfficer && (
                      <>
                        <div className="mb-8">
                          <span className="text-muted">Position: </span>
                          {loanOfficer.position_title}
                        </div>
                        <div className="mb-8">
                          <span className="text-muted">Email: </span>
                          <a href={`mailto:${loanOfficer.email}`}>{loanOfficer.email}</a>
                        </div>
                        <div className="mb-8">
                          <span className="text-muted">Phone: </span>
                          <a href={`tel:${loanOfficer.phone}`}>{loanOfficer.phone}</a>
                        </div>
                      </>
                    )}
                  </Col>
                  <Col md={6}>
                    {loanOfficerManager ? (
                      <>
                        <div className="mb-8">
                          <span className="text-muted">Reports To: </span>
                          <Button
                            variant="link"
                            className="p-0"
                            onClick={() => navigate(`/relationship-managers/${loanOfficerManager.id}`)}
                          >
                            {loanOfficerManager.name}
                          </Button>
                        </div>
                        <div className="mb-8">
                          <span className="text-muted">Position: </span>
                          {loanOfficerManager.position_title}
                        </div>
                        <div className="mb-8">
                          <span className="text-muted">Email: </span>
                          <a href={`mailto:${loanOfficerManager.email}`}>{loanOfficerManager.email}</a>
                        </div>
                        <div className="mb-8">
                          <span className="text-muted">Phone: </span>
                          <a href={`tel:${loanOfficerManager.phone}`}>{loanOfficerManager.phone}</a>
                        </div>
                      </>
                    ) : (
                      <div className="text-muted">No manager assigned</div>
                    )}
                  </Col>
                </Row>
              </UniversalCard>
            </Col>
            <Col md={12}>
              <UniversalCard headerText="Covenants" bodyContainer="container-fluid">
                <Row>
                  <Col md={6} className="mb-16">
                    <div className="text-muted mb-4">Debt Service Coverage</div>
                    <div className="mb-8">
                      <span className="fw-bold me-8">Actual:</span>
                      <span className={`fs-5 fw-bold text-${getCovenantStatus(loan.debtService, loan.debtServiceCovenant).variant}`}>
                        {formatRatio(loan.debtService)}
                      </span>
                    </div>
                    <div className="text-muted small">
                      Covenant: {formatRatio(loan.debtServiceCovenant)}
                    </div>
                  </Col>
                  <Col md={6} className="mb-16">
                    <div className="text-muted mb-4">Liquidity Ratio</div>
                    <div className="mb-8">
                      <span className="fw-bold me-8">Actual:</span>
                      <span className={`fs-5 fw-bold text-${getCovenantStatus(loan.liquidityRatio, loan.liquidityRatioCovenant).variant}`}>
                        {formatRatio(loan.liquidityRatio)}
                      </span>
                    </div>
                    <div className="text-muted small">
                      Covenant: {formatRatio(loan.liquidityRatioCovenant)}
                    </div>
                  </Col>
                  <Col md={6} className="mb-16">
                    <div className="text-muted mb-4">Current Ratio</div>
                    <div className="d-flex align-items-center">
                      <div className="mb-8">
                        <span className="fw-bold me-8">Actual:</span>
                        <span className={`fs-5 fw-bold text-${getCovenantStatus(loan.currentRatio, loan.currentRatioCovenant).variant}`}>
                          {formatRatio(loan.currentRatio)}
                        </span>
                      </div>
                      <div className="text-muted small ms-8">
                        {formatRatio(loan.currentRatioCovenant)}
                      </div>
                    </div>
                  </Col>
                  <Col md={6} className="mb-16">
                    <div className="text-muted mb-4">Liquidity Total</div>
                    <div className="mb-8">
                      <span className="fw-bold me-8">Actual:</span>
                      <span className={`fs-5 fw-bold text-${getCovenantStatus(loan.liquidity, loan.liquidityCovenant).variant}`}>
                        {formatCurrency(loan.liquidity)}
                      </span>
                    </div>
                    <div className="text-muted small">
                      Covenant: {formatCurrency(loan.liquidityCovenant)}
                    </div>
                  </Col>
                </Row>
              </UniversalCard>
            </Col>
          </Row>
        </Col>
      </Row>

      <Row className="mb-24">
        <Col md={12} className="mb-16">
          <UniversalCard headerText="Loan Details" bodyContainer="container-fluid">
            <Row>
              <Col md={3} className="mb-12">
                <div className="text-muted">Interest Type</div>
                <div className="fw-bold">{loan.typeOfInterest}</div>
              </Col>
              <Col md={3} className="mb-12">
                <div className="text-muted">Next Rate Adjustment</div>
                <div className="fw-bold">{formatDate(loan.nextRateAdjustmentDate)}</div>
              </Col>
              <Col md={3} className="mb-12">
                <div className="text-muted">Maturity Date</div>
                <div className="fw-bold">{formatDate(loan.loanMaturityDate)}</div>
              </Col>
              <Col md={3} className="mb-12">
                <div className="text-muted">Origination Date</div>
                <div className="fw-bold">{formatDate(loan.loanOriginationDate)}</div>
              </Col>
              <Col md={3} className="mb-12">
                <div className="text-muted">Last Annual Review</div>
                <div className="fw-bold">{formatDate(loan.lastAnnualReview)}</div>
              </Col>
              <Col md={3} className="mb-12">
                <div className="text-muted">Risk Rating</div>
                <div className="fw-bold">{loan.currentRiskRating}</div>
              </Col>
            </Row>
          </UniversalCard>
        </Col>
      </Row>

      <Row className="mb-24">
        <Col md={12} className="mb-16">
          <UniversalCard headerText="Financials" bodyContainer="">
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

            {financials.length === 0 ? (
              <div className="text-muted">No financial documents uploaded yet.</div>
            ) : (
              <ListGroup variant="flush">
                {financials.map((financial) => (
                  <ListGroup.Item key={financial.id} className="d-flex justify-content-between align-items-center">
                    <div className="d-flex align-items-center">
                      <FontAwesomeIcon icon={faFileAlt} className="me-12 text-primary" />
                      <div>
                        <div className="fw-bold">{financial.file_name}</div>
                        <div className="small text-muted">
                          Uploaded by {financial.uploaded_by} on {formatDate(financial.uploaded_at)}
                          {financial.file_size && ` • ${(financial.file_size / 1024).toFixed(2)} KB`}
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
        </Col>
      </Row>

      <Row className="mb-24">
        <Col md={12} className="mb-16">
          <UniversalCard headerText="Industry Information" bodyContainer="container-fluid">
            <Row className="mb-16">
              <Col md={8}>
                <div className="mb-8">
                  <span className="text-muted">NAICS Code: </span>
                  <span className="fw-bold">{loan.naicsCode}</span>
                </div>
                <div className="mb-16">
                  <span className="text-muted">Industry: </span>
                  <span className="fw-bold">{loan.naicsDescription}</span>
                </div>
              </Col>
              <Col md={4} className="text-md-end">
                <div className="text-muted mb-4">Industry Health Score</div>
                <div className={`fs-1 fw-bold ${getHealthScoreColor(loan.industryHealthScore)}`}>
                  {loan.industryHealthScore}
                </div>
                <div className="text-muted small">out of 100</div>
              </Col>
            </Row>
            <div>
              <div className="text-muted mb-8 fw-semibold">Industry Analysis</div>
              <div
                dangerouslySetInnerHTML={{ __html: renderMarkdownLinks(loan.industryNarrative) }}
                style={{ lineHeight: '1.6' }}
              />
            </div>
          </UniversalCard>
        </Col>
      </Row>

      <Row>
        <Col md={12}>
          <UniversalCard headerText="Comments" bodyContainer="">
            <Form className="mb-16" onSubmit={(e) => { e.preventDefault(); handleAddComment(); }}>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="Add a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="mb-8"
              />
              <Button onClick={handleAddComment} disabled={!newComment.trim()}>Add Comment</Button>
            </Form>
            {!localComments.length && (<div className="text-muted">No comments yet.</div>)}
            {!!localComments.length && (
              <ListGroup variant="flush">
                {localComments.map((c) => (
                  <ListGroup.Item key={c.id}>
                    <div className="d-flex justify-content-between">
                      <div className="fw-bold">{c.user_name}</div>
                      <div className="text-muted">{formatDate(c.created_at)}</div>
                    </div>
                    <div>{c.text}</div>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            )}
          </UniversalCard>
        </Col>
      </Row>
    </Container>
  );
};

export default LoanDetail;
