import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Button, ListGroup, Badge } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faArrowRight, faEdit, faMagic, faEnvelope, faPhone, faHistory, faChartLine, faFileAlt } from '@fortawesome/free-solid-svg-icons';
import PageHeader from '@src/components/global/PageHeader';
import UniversalCard from '@src/components/global/UniversalCard';
import { $borrower, WATCH_SCORE_OPTIONS } from '@src/consts/consts';
import { $contacts, $borrowerFinancialsView } from '@src/signals';
import { formatCurrency } from '@src/utils/formatCurrency';
import { getWatchScoreColor } from '@src/components/views/Dashboard/_helpers/dashboard.consts';
import FinancialHistoryModal from './_components/FinancialHistoryModal';
import SubmitFinancialsModal from './_components/SubmitFinancialsModal';
import EditBorrowerDetailModal from './_components/EditBorrowerDetailModal';
import {
  formatDate,
  formatAddress,
  formatPhoneNumber,
  formatEmail,
  getContactName,
  getHealthScoreColor,
  renderMarkdownLinks,
} from './_helpers/borrowerDetail.helpers';
import {
  $borrowerDetailView,
} from './_helpers/borrowerDetail.consts';
import { fetchBorrowerDetail } from './_helpers/borrowerDetail.resolvers';
import { handleGenerateIndustryReport, handleGenerateAnnualReview } from './_helpers/borrowerDetail.events';

const BorrowerDetail = () => {
  const { borrowerId } = useParams();
  const navigate = useNavigate();

  // Fetch borrower detail on mount or when borrowerId changes
  useEffect(() => {
    fetchBorrowerDetail(borrowerId);
  }, [borrowerId]);

  // Reset component state when the borrower changes
  useEffect(() => {
    // Component state reset if needed
  }, [borrowerId]);

  if ($borrower.value?.isLoading) {
    return (
      <Container fluid className="py-24">
        <PageHeader title="Loading..." />
      </Container>
    );
  }

  if (!$borrower.value?.borrower) {
    return (
      <Container fluid className="py-24">
        <Button
          onClick={() => navigate('/borrowers')}
          className="btn-sm border-dark text-dark-800 bg-grey-50"
        >
          <FontAwesomeIcon icon={faArrowLeft} className="me-8" />
          Back to Borrowers
        </Button>
        <PageHeader title="Borrower Not Found" />
      </Container>
    );
  }

  const { borrower } = $borrower.value;
  const contacts = $contacts.value?.list || [];
  const loans = borrower.loans || [];

  return (
    <Container className="py-24">
      <div className="d-flex justify-content-between align-items-center">
        <Button
          onClick={() => navigate('/borrowers')}
          className="btn-sm border-dark text-dark-800 bg-grey-50 mb-16"
        >
          <FontAwesomeIcon icon={faArrowLeft} className="me-8" />
          Back to Borrowers
        </Button>
        <div>
          <Button
            onClick={() => $borrowerDetailView.update({ showEditBorrowerModal: true })}
            variant="outline-primary-100"
            className="me-8"
          >
            <FontAwesomeIcon icon={faEdit} className="me-8" />
            Edit Borrower
          </Button>
          <Button
            variant="outline-success-500"
            onClick={() => handleGenerateAnnualReview(borrowerId)}
            disabled={loans.length === 0}
          >
            <FontAwesomeIcon icon={faFileAlt} className="me-8" />
            Generate Annual Review
          </Button>
        </div>
      </div>
      <div className="text-info-50">Borrower ID: {borrower.borrowerId}</div>
      <PageHeader
        title={`${borrower.name}`}
        AdditionalComponents={() => (
          <div className="text-info-50">
            <Badge bg="secondary-100" className="me-8">{borrower.borrowerType}</Badge>
            {borrower.industryType && <Badge bg="info-100">{borrower.industryType}</Badge>}
          </div>
        )}
      />
      <Row>
        <Col md={4}>
          <UniversalCard headerText="Borrower Details">
            <div style={{ minHeight: '600px' }}>
              <div className="text-info-100 fw-200 mt-8">Borrower Type</div>
              <div className="text-info-50 lead fw-500">{borrower.borrowerType || 'Unknown'}</div>

              <div className="text-info-100 fw-200 mt-16">Primary Contact</div>
              <div className="text-info-50 lead fw-500">{borrower.primaryContact || 'N/A'}</div>

              <div className="text-info-100 fw-200 mt-16">Email</div>
              <div className="text-info-50 lead fw-500">{formatEmail(borrower.email)}</div>

              <div className="text-info-100 fw-200 mt-16">Phone</div>
              <div className="text-info-50 lead fw-500">{formatPhoneNumber(borrower.phoneNumber)}</div>

              <div className="text-info-100 fw-200 mt-16">Address</div>
              <div className="text-info-50 lead fw-500">{formatAddress(borrower)}</div>

              {borrower.taxId && (
                <>
                  <div className="text-info-100 fw-200 mt-16">Tax ID</div>
                  <div className="text-info-50 lead fw-500">{borrower.taxId}</div>
                </>
              )}

              {borrower.creditScore && (
                <>
                  <div className="text-info-100 fw-200 mt-16">Credit Score</div>
                  <div className="text-info-50 lead fw-500">{borrower.creditScore}</div>
                </>
              )}

              {borrower.dateOfBirth && (
                <>
                  <div className="text-info-100 fw-200 mt-16">Date of Birth</div>
                  <div className="text-info-50 lead fw-500">{formatDate(borrower.dateOfBirth)}</div>
                </>
              )}

              {borrower.businessStartDate && (
                <>
                  <div className="text-info-100 fw-200 mt-16">Business Start Date</div>
                  <div className="text-info-50 lead fw-500">{formatDate(borrower.businessStartDate)}</div>
                </>
              )}

              {borrower.relationshipManager && (
                <>
                  <hr className="my-16" />
                  <div className="lead mb-12">Relationship Manager</div>
                  <div className="text-info-100 fw-200 mt-8">Name</div>
                  <div className="text-info-50 lead fw-500">
                    <Button
                      variant="link"
                      className="p-0 text-secondary-100 lead fw-500 text-start text-decoration-none"
                      onClick={() => navigate(`/relationship-managers/${borrower.relationshipManager.id}`)}
                    >
                      {borrower.relationshipManager.name}
                      <FontAwesomeIcon icon={faArrowRight} className="ms-4" size="xs" />
                    </Button>
                  </div>
                  {borrower.relationshipManager.email && (
                    <>
                      <div className="text-info-100 fw-200 mt-8">Email</div>
                      <div className="text-info-50 lead fw-500">{borrower.relationshipManager.email}</div>
                    </>
                  )}
                  {borrower.relationshipManager.phone && (
                    <>
                      <div className="text-info-100 fw-200 mt-8">Phone</div>
                      <div className="text-info-50 lead fw-500">{borrower.relationshipManager.phone}</div>
                    </>
                  )}
                  {borrower.relationshipManager.officeLocation && (
                    <>
                      <div className="text-info-100 fw-200 mt-8">Office</div>
                      <div className="text-info-50 lead fw-500">{borrower.relationshipManager.officeLocation}</div>
                    </>
                  )}
                </>
              )}
            </div>
          </UniversalCard>
        </Col>
        <Col md={4}>
          <UniversalCard headerText="Contacts">
            <div style={{ minHeight: '600px' }}>
              {contacts.length === 0 ? (
                <div className="text-info-100 fw-200">No contacts found for this borrower.</div>
              ) : (
                <ListGroup variant="flush">
                  {contacts.map((contact) => (
                    <ListGroup.Item key={contact.id} className="px-0">
                      <div className="d-flex justify-content-between align-items-start">
                        <div>
                          <div className="fw-bold text-white">
                            {getContactName(contact)}
                            {contact.isPrimary && (
                              <Badge bg="primary-100" className="ms-8">Primary</Badge>
                            )}
                          </div>
                          {contact.title && (
                            <div className="small text-info-100">{contact.title}</div>
                          )}
                          {contact.email && (
                            <div className="small text-info-50 mt-4">
                              <FontAwesomeIcon icon={faEnvelope} className="me-4" />
                              {contact.email}
                            </div>
                          )}
                          {contact.phone && (
                            <div className="small text-info-50">
                              <FontAwesomeIcon icon={faPhone} className="me-4" />
                              {contact.phone}
                            </div>
                          )}
                        </div>
                      </div>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              )}
            </div>
          </UniversalCard>
        </Col>
        <Col md={4}>
          <UniversalCard headerText="Associated Loans">
            <div style={{ minHeight: '600px' }}>
              {loans.length === 0 ? (
                <div className="text-info-100 fw-200">No loans found for this borrower.</div>
              ) : (
                <ListGroup variant="flush">
                  {loans.map((loan) => (
                    <ListGroup.Item key={loan.id} className="px-0">
                      <div className="d-flex justify-content-between align-items-start">
                        <div className="flex-grow-1">
                          <div className="d-flex justify-content-between align-items-center">
                            <Button
                              variant="link"
                              className="p-0 text-secondary-100 fw-bold text-start text-decoration-none"
                              onClick={() => navigate(`/loans/${loan.loanId}`)}
                            >
                              {loan.loanName || loan.loanId}
                              <FontAwesomeIcon icon={faArrowRight} className="ms-4" size="xs" />
                            </Button>
                          </div>
                          {loan.loanAmount && (
                            <div className="small text-success-500 mt-4">
                              {formatCurrency(loan.loanAmount)}
                            </div>
                          )}
                          {loan.status && (
                            <div className="small text-info-100 mt-4">
                              Status: {loan.status}
                            </div>
                          )}
                        </div>
                      </div>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              )}
            </div>
          </UniversalCard>
        </Col>
      </Row>
      <Row>
        <Col md={12}>
          <UniversalCard headerText="Financials" className="mt-16">
            <div className="d-flex justify-content-between align-items-center mb-16">
              <p className="text-info-200 mb-0">
                Track and manage financial submissions for this borrower
              </p>
              <div className="d-flex gap-2">
                <Button
                  variant="outline-secondary-100"
                  size="sm"
                  onClick={() => {
                    $borrowerFinancialsView.update({
                      showHistoryModal: true,
                      currentBorrowerId: borrower.id,
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
                      currentBorrowerId: borrower.id,
                    });
                  }}
                >
                  <FontAwesomeIcon icon={faChartLine} className="me-8" />
                  Submit Financials
                </Button>
              </div>
            </div>
          </UniversalCard>
        </Col>
      </Row>
      <Row>
        <Col md={12}>
          <UniversalCard headerText="Industry Analysis" className="mt-16">
            <div style={{ minHeight: '300px' }}>
              <Row>
                <Col md={8}>
                  <Button
                    variant="primary-100"
                    size="sm"
                    onClick={() => handleGenerateIndustryReport(borrowerId)}
                  >
                    <FontAwesomeIcon icon={faMagic} className="me-8" />
                    Generate Industry Report
                  </Button>
                  {borrower.industryType && (
                    <div className="mt-16">
                      <span className="text-info-100 fw-200">Industry Type: </span>
                      <span className="fw-bold">{borrower.industryType}</span>
                    </div>
                  )}
                </Col>
                <Col md={4} className="text-md-end">
                  {borrower.industryHealthScore && (
                    <>
                      <div className="text-info-100 fw-200">Industry Health Score</div>
                      <div className={`fs-1 fw-bold ${getHealthScoreColor(borrower.industryHealthScore)}`}>
                        {borrower.industryHealthScore}
                      </div>
                      <div className="text-info-100 fw-200 small">out of 100</div>
                    </>
                  )}
                </Col>
              </Row>
              <Row>
                <Col md={12}>
                  <div>
                    <div className="text-info-100 fw-200 mt-16 mb-8 fw-semibold">Industry Analysis</div>
                    {borrower.industryHealthReport ? (
                      <div
                        dangerouslySetInnerHTML={{ __html: renderMarkdownLinks(borrower.industryHealthReport) }}
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
        </Col>
      </Row>
      {borrower.notes && (
        <Row>
          <Col md={12}>
            <UniversalCard headerText="Notes" className="mt-16">
              <div className="text-info-50">{borrower.notes}</div>
            </UniversalCard>
          </Col>
        </Row>
      )}

      {/* Financial Modals */}
      <FinancialHistoryModal />
      <SubmitFinancialsModal />

      {/* Edit Borrower Modal */}
      <EditBorrowerDetailModal />
    </Container>
  );
};

export default BorrowerDetail;
