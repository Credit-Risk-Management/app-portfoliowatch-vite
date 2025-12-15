import { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Button, ListGroup, Badge } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faArrowRight, faEdit, faMagic, faEnvelope, faPhone, faChartLine, faFileAlt, faCopy, faCheck, faUser, faAddressBook, faMoneyBillWave, faDollarSign, faIndustry, faStickyNote, faEye, faTrash, faFile } from '@fortawesome/free-solid-svg-icons';
import PageHeader from '@src/components/global/PageHeader';
import UniversalCard from '@src/components/global/UniversalCard';
import SignalTable from '@src/components/global/SignalTable';
import ContextMenu from '@src/components/global/ContextMenu';
import { $borrower, WATCH_SCORE_OPTIONS } from '@src/consts/consts';
import { $contacts, $borrowerFinancialsView, $borrowerFinancials, $loansView, $loans, $documents, $documentsView } from '@src/signals';
import { formatCurrency } from '@src/utils/formatCurrency';
import borrowerFinancialsApi from '@src/api/borrowerFinancials.api';
import { successAlert } from '@src/components/global/Alert/_helpers/alert.events';
import { formatRatio, formatDate as formatLoanDate } from '@src/components/views/Loans/_helpers/loans.helpers';
import { TABLE_HEADERS } from '@src/components/views/Loans/_helpers/loans.consts';
import { EditLoanModal, DeleteLoanModal } from '@src/components/views/Loans/_components';
import { handleDownloadDocument } from '@src/components/views/Documents/_helpers/documents.events';
import { formatFileSize, formatUploadDate, getLoanNumber } from '@src/components/views/Documents/_helpers/documents.helpers';
import { TABLE_HEADERS as DOCUMENTS_TABLE_HEADERS } from '@src/components/views/Documents/_helpers/documents.consts';
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
  $borrowerLoansFilter,
  $borrowerLoansView,
  $borrowerFinancialsFilter,
  $borrowerFinancialsTableView,
  $borrowerDocumentsFilter,
  $borrowerDocumentsView,
} from './_helpers/borrowerDetail.consts';
import { fetchBorrowerDetail, fetchBorrowerDocuments } from './_helpers/borrowerDetail.resolvers';
import { handleGenerateIndustryReport, handleGenerateAnnualReview } from './_helpers/borrowerDetail.events';
import DeleteBorrowerDocumentModal from './_components/DeleteBorrowerDocumentModal';

const BorrowerDetail = () => {
  const { borrowerId } = useParams();
  const navigate = useNavigate();
  const [copiedLink, setCopiedLink] = useState(false);
  const [activeTab, setActiveTab] = useState('details');

  // Fetch borrower detail on mount or when borrowerId changes
  useEffect(() => {
    fetchBorrowerDetail(borrowerId);
  }, [borrowerId]);

  // Get upload link URL from borrower
  const borrower = $borrower.value?.borrower;
  const getUploadLinkUrl = useMemo(() => {
    if (!borrower?.borrowerId) return null;
    const baseUrl = window.location.origin;
    return `${baseUrl}/upload-financials/${borrower.borrowerId}`;
  }, [borrower?.borrowerId]);

  // Fetch financial history when financials tab is active
  useEffect(() => {
    if (activeTab === 'financials' && $borrower.value?.borrower?.id) {
      fetchFinancialHistory();
    }
  }, [activeTab, $borrower.value?.borrower?.id, $borrowerFinancialsFilter.value]); // eslint-disable-line react-hooks/exhaustive-deps

  // Fetch documents when documents tab is active
  useEffect(() => {
    if (activeTab === 'documents' && borrowerId) {
      fetchBorrowerDocuments(borrowerId);
    }
  }, [activeTab, borrowerId]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchFinancialHistory = async () => {
    if (!$borrower.value?.borrower?.id) return;
    try {
      $borrowerFinancialsTableView.update({ isTableLoading: true });
      const filter = $borrowerFinancialsFilter.value;
      const response = await borrowerFinancialsApi.getByBorrowerId(
        $borrower.value.borrower.id,
        {
          sortKey: filter.sortKey,
          sortDirection: filter.sortDirection,
          page: filter.page,
        },
      );

      if (response.success) {
        $borrowerFinancials.update({
          list: response.data || [],
          totalCount: response.count || 0,
          isLoading: false,
        });
      }
    } catch (error) {
      console.error('Error fetching financial history:', error);
      $borrowerFinancials.update({
        list: [],
        totalCount: 0,
        isLoading: false,
      });
    } finally {
      $borrowerFinancialsTableView.update({ isTableLoading: false });
    }
  };

  const handleCopyPermanentLink = async () => {
    if (!getUploadLinkUrl) return;
    try {
      // Use modern clipboard API
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(getUploadLinkUrl);
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2000);
      } else {
        // Fallback for older browsers - create a temporary input element
        const tempInput = document.createElement('input');
        tempInput.value = getUploadLinkUrl;
        tempInput.style.position = 'fixed';
        tempInput.style.opacity = '0';
        tempInput.style.left = '-999999px';
        document.body.appendChild(tempInput);
        tempInput.select();
        tempInput.setSelectionRange(0, 99999);
        document.execCommand('copy');
        document.body.removeChild(tempInput);
        setCopiedLink(true);
        successAlert('Copied', 'toast');
        setTimeout(() => setCopiedLink(false), 2000);
      }
    } catch (error) {
      console.error('Error copying link:', error);
      successAlert('Failed to copy link', 'toast');
    }
  };

  // Reset component state when the borrower changes
  useEffect(() => {
    // Component state reset if needed
  }, [borrowerId]);

  const loans = useMemo(() => borrower?.loans || [], [borrower?.loans]);

  // Filter table headers - remove borrowerName since we're already on borrower page
  const loansTableHeaders = TABLE_HEADERS.filter((header) => header.key !== 'borrowerName');

  // Financials table headers
  const financialsTableHeaders = [
    { key: 'asOfDate', value: 'As Of Date', sortKey: 'asOfDate' },
    { key: 'submittedAt', value: 'Submitted Date', sortKey: 'submittedAt' },
    { key: 'grossRevenue', value: 'Gross Revenue', sortKey: 'grossRevenue' },
    { key: 'netIncome', value: 'Net Income', sortKey: 'netIncome' },
    { key: 'ebitda', value: 'EBITDA', sortKey: 'ebitda' },
    { key: 'debtService', value: 'Debt Service', sortKey: 'debtService' },
    { key: 'currentRatio', value: 'Current Ratio', sortKey: 'currentRatio' },
    { key: 'liquidity', value: 'Liquidity', sortKey: 'liquidity' },
    { key: 'submittedBy', value: 'Submitted By', sortKey: 'submittedBy' },
    { key: 'documents', value: 'Documents' },
  ];

  // Format date helper for financials
  const formatFinancialDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Transform financials into table rows
  const financialsTableRows = useMemo(
    () => {
      const financialsList = $borrowerFinancials.value?.list || [];
      return financialsList.map((financial) => ({
        ...financial,
        asOfDate: formatFinancialDate(financial.asOfDate),
        submittedAt: formatFinancialDate(financial.submittedAt),
        grossRevenue: <span className="text-success-500 fw-500">{formatCurrency(financial.grossRevenue)}</span>,
        netIncome: <span className="text-success-500 fw-500">{formatCurrency(financial.netIncome)}</span>,
        ebitda: <span className="text-success-500 fw-500">{formatCurrency(financial.ebitda)}</span>,
        debtService: financial.debtService ? parseFloat(financial.debtService).toFixed(2) : '-',
        currentRatio: financial.currentRatio ? parseFloat(financial.currentRatio).toFixed(2) : '-',
        liquidity: <span className="text-success-500 fw-500">{formatCurrency(financial.liquidity)}</span>,
        submittedBy: financial.submittedBy || '-',
        documents: financial.documentIds && financial.documentIds.length > 0 ? (
          <Badge bg="info-100">{financial.documentIds.length} docs</Badge>
        ) : (
          <span className="text-info-100">-</span>
        ),
      }));
    },
    [$borrowerFinancials.value?.list],
  );

  // Transform loans into table rows
  const loansTableRows = useMemo(
    () => loans.map((loan) => ({
      ...loan,
      principalAmount: formatCurrency(loan.principalAmount),
      paymentAmount: formatCurrency(loan.paymentAmount),
      nextPaymentDueDate: formatLoanDate(loan.nextPaymentDueDate),
      debtService: formatRatio(loan.debtService),
      currentRatio: formatRatio(loan.currentRatio),
      liquidity: formatCurrency(loan.liquidity),
      watchScore: () => {
        const score = WATCH_SCORE_OPTIONS[loan.watchScore];
        if (!score) {
          return <span className="text-info-100 fw-700">-</span>;
        }
        return <span className={`text-${score.color}-200 fw-700`}>{score.label}</span>;
      },
      relationshipManager: loan.relationshipManager ? loan.relationshipManager.name : '-',
      actions: () => (
        <ContextMenu
          items={[
            { label: 'View Details', icon: faEye, action: 'view' },
            { label: 'Edit', icon: faEdit, action: 'edit' },
            { label: 'Delete', icon: faTrash, action: 'delete' },
          ]}
          onItemClick={(item) => {
            if (item.action === 'view') {
              navigate(`/loans/${loan.id}`);
            } else if (item.action === 'edit') {
              $loans.update({ selectedLoan: loan });
              $loansView.update({ showEditModal: true });
            } else if (item.action === 'delete') {
              $loans.update({ selectedLoan: loan });
              $loansView.update({ showDeleteModal: true });
            }
          }}
        />
      ),
    })),
    [loans, navigate],
  );

  // Transform documents into table rows
  const documentsTableRows = useMemo(
    () => {
      const documentsList = $documents.value?.list || [];
      return documentsList.map((document) => ({
        ...document,
        documentName: document.documentName,
        loanNumber: getLoanNumber(document.loanId, loans),
        uploadedAt: formatUploadDate(document.uploadedAt),
        fileSize: formatFileSize(Number(document.fileSize)),
        actions: () => (
          <ContextMenu
            items={[
              { label: 'View', icon: faEye, action: 'download' },
              { label: 'Delete', icon: faTrash, action: 'delete' },
            ]}
            onItemClick={(item) => {
              if (item.action === 'download') {
                handleDownloadDocument(document.id, document.documentName);
              } else if (item.action === 'delete') {
                $documents.update({ selectedDocument: document });
                $documentsView.update({ showDeleteModal: true });
              }
            }}
          />
        ),
      }));
    },
    [$documents.value?.list, loans],
  );

  if ($borrower.value?.isLoading) {
    return (
      <Container fluid className="py-24">
        <PageHeader title="Loading..." />
      </Container>
    );
  }

  if (!borrower) {
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

  const contacts = $contacts.value?.list || [];

  const tabs = [
    { key: 'details', title: 'Details', icon: faUser },
    { key: 'contacts', title: 'Contacts', icon: faAddressBook },
    { key: 'loans', title: 'Loans', icon: faMoneyBillWave },
    { key: 'financials', title: 'Financials', icon: faDollarSign },
    { key: 'documents', title: 'Documents', icon: faFile },
    { key: 'industry', title: 'Industry Analysis', icon: faIndustry },
    ...(borrower.notes ? [{ key: 'notes', title: 'Notes', icon: faStickyNote }] : []),
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'details':
        return (
          <UniversalCard headerText="Borrower Details">
            <div>
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
        );

      case 'contacts':
        return (
          <UniversalCard headerText="Contacts">
            <div>
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
        );

      case 'loans':
        return (
          <div>
            {loans.length === 0 ? (
              <div className="text-info-100 fw-200">No loans found for this borrower.</div>
            ) : (
              <SignalTable
                $filter={$borrowerLoansFilter}
                $view={$borrowerLoansView}
                headers={loansTableHeaders}
                rows={loansTableRows}
                totalCount={loans.length}
                currentPage={$borrowerLoansFilter.value.page}
                itemsPerPageAmount={10}
                onRowClick={(loan) => navigate(`/loans/${loan.id}`)}
              />
            )}
          </div>
        );

      case 'financials':
        return (
          <div>
            {/* Action Buttons */}
            <div className="d-flex justify-content-between align-items-center mb-16">
              <div className="d-flex gap-2 align-items-center flex-grow-1">
                <Button
                  variant="secondary-100"
                  className="me-8"
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
                <Button
                  variant={copiedLink ? 'success' : 'info-100'}
                  onClick={handleCopyPermanentLink}
                  disabled={!getUploadLinkUrl}
                  size="sm"
                >
                  <FontAwesomeIcon icon={copiedLink ? faCheck : faCopy} className="me-8" />
                  {copiedLink ? 'Copied!' : 'Copy Borrower Link'}
                </Button>
              </div>
            </div>

            {/* Financial History Table */}
            {(() => {
              const isLoading = $borrowerFinancials.value?.isLoading && !$borrowerFinancials.value?.list?.length;
              if (isLoading) {
                return (
                  <div className="text-center py-32">
                    <p className="text-info-100">Loading financial history...</p>
                  </div>
                );
              }
              if (financialsTableRows.length === 0) {
                return (
                  <div className="text-center py-32">
                    <p className="text-info-100 lead">No financial history records found.</p>
                    <p className="text-info-200 small">Submit new financials to start tracking history.</p>
                  </div>
                );
              }
              return (
                <SignalTable
                  $filter={$borrowerFinancialsFilter}
                  $view={$borrowerFinancialsTableView}
                  headers={financialsTableHeaders}
                  rows={financialsTableRows}
                  totalCount={$borrowerFinancials.value?.totalCount || 0}
                  currentPage={$borrowerFinancialsFilter.value.page}
                  itemsPerPageAmount={10}
                />
              );
            })()}
          </div>
        );

      case 'industry':
        return (
          <UniversalCard headerText="Industry Analysis">
            <div>
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
        );

      case 'documents':
        return (
          <div>
            {(() => {
              const isLoading = $borrowerDocumentsView.value?.isTableLoading && !$documents.value?.list?.length;
              if (isLoading) {
                return (
                  <div className="text-center py-32">
                    <p className="text-info-100">Loading documents...</p>
                  </div>
                );
              }
              if (documentsTableRows.length === 0) {
                return (
                  <div className="text-center py-32">
                    <p className="text-info-100 lead">No documents found for this borrower.</p>
                  </div>
                );
              }
              return (
                <SignalTable
                  $filter={$borrowerDocumentsFilter}
                  $view={$borrowerDocumentsView}
                  headers={DOCUMENTS_TABLE_HEADERS}
                  rows={documentsTableRows}
                  totalCount={$documents.value?.totalCount || 0}
                  currentPage={$borrowerDocumentsFilter.value.page}
                  itemsPerPageAmount={10}
                />
              );
            })()}
          </div>
        );

      case 'notes':
        return (
          <UniversalCard headerText="Notes">
            <div className="text-info-50">{borrower.notes}</div>
          </UniversalCard>
        );

      default:
        return null;
    }
  };

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
      />
      <Row>
        <Col md={2}>
          <div className="bg-info-800 border border-info-400 rounded p-16" style={{ minHeight: '500px' }}>
            <div className="lead text-light mb-16">Sections</div>
            {tabs.map((tab) => (
              <div
                key={tab.key}
                role="button"
                tabIndex={0}
                onClick={() => setActiveTab(tab.key)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    setActiveTab(tab.key);
                  }
                }}
                className={`d-flex align-items-center p-8 mb-8 rounded cursor-pointer ${activeTab === tab.key
                  ? 'bg-info-100 text-info-900 fw-bold'
                  : 'text-info-100 hover-bg-info-700'
                  }`}
                style={{
                  transition: 'background-color 0.2s ease',
                }}
              >
                <FontAwesomeIcon icon={tab.icon} className="me-12" />
                <span>{tab.title}</span>
              </div>
            ))}
          </div>
        </Col>
        <Col md={9}>
          {renderTabContent()}
        </Col>
      </Row>

      {/* Financial Modals */}
      <SubmitFinancialsModal />

      {/* Edit Borrower Modal */}
      <EditBorrowerDetailModal />

      {/* Loan Modals */}
      <EditLoanModal />
      <DeleteLoanModal />

      {/* Document Modals */}
      <DeleteBorrowerDocumentModal />
    </Container>
  );
};

export default BorrowerDetail;
