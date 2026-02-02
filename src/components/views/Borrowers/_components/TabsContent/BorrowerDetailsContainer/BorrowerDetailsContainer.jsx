/* eslint-disable react/no-danger */
/* eslint-disable react-hooks/exhaustive-deps */
import axios from 'axios';
import { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Button, Badge } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faArrowRight, faEdit, faMagic, faChartLine, faFileAlt, faCopy, faCheck, faBell, faUser, faMoneyBillWave, faDollarSign, faIndustry, faStickyNote, faEye, faTrash, faFile, faReceipt, faTable } from '@fortawesome/free-solid-svg-icons';
import PageHeader from '@src/components/global/PageHeader';
import UniversalCard from '@src/components/global/UniversalCard';
import SignalTable from '@src/components/global/SignalTable';
import ContextMenu from '@src/components/global/ContextMenu';
import { $borrower } from '@src/consts/consts';
import { $borrowerFinancialsView, $borrowerFinancials, $documents, $documentsView } from '@src/signals';
import { formatCurrency } from '@src/utils/formatCurrency';
import { auth } from '@src/utils/firebase';
import borrowerFinancialsApi from '@src/api/borrowerFinancials.api';
import { getPermanentUploadLink } from '@src/api/borrowerFinancialUploadLink.api';
import { dangerAlert, successAlert } from '@src/components/global/Alert/_helpers/alert.events';
import { EditLoanModal, DeleteLoanModal } from '@src/components/views/Loans/_components';
import { handleDownloadDocument } from '@src/components/views/Documents/_helpers/documents.events';
import { formatFileSize, formatUploadDate, getLoanNumber } from '@src/components/views/Documents/_helpers/documents.helpers';
import { TABLE_HEADERS as DOCUMENTS_TABLE_HEADERS } from '@src/components/views/Documents/_helpers/documents.consts';
import { useEffectAsync } from '@fyclabs/tools-fyc-react/utils';
import SubmitFinancialsModal from './_components/SubmitFinancialsModal';
import EditBorrowerDetailModal from '../../EditBorrowerDetailModal';
import DebtServiceContainer from '../DebtServiceContainer/DebtServiceContainer';
import {
  formatDate,
  formatAddress,
  formatPhoneNumber,
  formatEmail,
  getHealthScoreColor,
  renderMarkdownLinks,
} from './_helpers/borrowerDetail.helpers';
import {
  $borrowerDetailView,
  $borrowerFinancialsFilter,
  $borrowerFinancialsTableView,
  $borrowerDocumentsFilter,
  $borrowerDocumentsView,
} from './_helpers/borrowerDetail.consts';
import { fetchBorrowerDetail, fetchBorrowerDocuments, fetchLoanWatchScoreBreakdowns } from './_helpers/borrowerDetail.resolvers';
import { handleGenerateIndustryReport, handleGenerateAnnualReview } from './_helpers/borrowerDetail.events';
import DeleteBorrowerDocumentModal from '../../DeleteBorrowerDocumentModal';
import LoansContainer from '../LoansContainer/LoansContainer';
import TriggersTab from '../../TriggersTab';
import { $modalState } from './_components/submitFinancialsModal.signals';

const BorrowerDetailsContainer = () => {
  const { borrowerId } = useParams();
  const navigate = useNavigate();
  const [copiedLink, setCopiedLink] = useState(false);
  const [activeTab, setActiveTab] = useState('details');
  const [isExportingExcel, setIsExportingExcel] = useState(false);
  const [permanentUploadLink, setPermanentUploadLink] = useState(null);

  // Fetch borrower detail and relationship managers on mount or when borrowerId changes
  useEffectAsync(async () => {
    await fetchBorrowerDetail(borrowerId);
  }, [borrowerId]);

  // Get upload link URL from borrower
  const borrower = $borrower.value?.borrower;

  // Fetch permanent upload link when borrower is loaded
  useEffectAsync(async () => {
    if (borrower?.id) {
      const response = await getPermanentUploadLink(borrower.id);
      if (response.status === 'success') {
        setPermanentUploadLink(response.data);
      }
    }
  }, [borrower?.id]);

  const getUploadLinkUrl = useMemo(() => {
    if (!permanentUploadLink?.token) return null;
    const baseUrl = window.location.origin;
    return `${baseUrl}/upload-financials/${permanentUploadLink.token}`;
  }, [permanentUploadLink?.token]);

  // Get loans from borrower
  const loans = useMemo(() => borrower?.loans || [], [borrower?.loans]);

  // Fetch financial history when financials tab is active
  useEffect(() => {
    if ((activeTab === 'financials' || activeTab === 'triggers') && $borrower.value?.borrower?.id) {
      fetchFinancialHistory();
    }
  }, [activeTab, $borrower.value?.borrower?.id, $borrowerFinancialsFilter.value, $borrowerFinancialsView.value.refreshTrigger]);

  // Fetch documents when documents tab is active
  useEffect(() => {
    if (activeTab === 'documents' && borrowerId) {
      fetchBorrowerDocuments(borrowerId);
    }
  }, [activeTab, borrowerId]);

  // Fetch Watch Score breakdowns when loans tab is active
  useEffect(() => {
    if (activeTab === 'loans' && loans.length > 0) {
      fetchLoanWatchScoreBreakdowns(loans);
    }
  }, [activeTab, loans]);

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

  const handleExportExcel = async () => {
    if (!borrowerId) return;

    try {
      setIsExportingExcel(true);

      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3333';

      const user = auth.currentUser;
      let token = '';
      if (user) {
        token = await user.getIdToken();
      }

      const response = await axios.get(`${API_BASE_URL}/borrowers/${borrowerId}/financials/spreadsheet/excel`, {
        responseType: 'blob',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response && response.data) {
        const blob = new Blob([response.data], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `financial-spreadsheet-${borrowerId}-${new Date().toISOString().split('T')[0]}.xlsx`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        successAlert('Excel file exported successfully!');
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      console.error('Error exporting Excel:', error);
      dangerAlert('Failed to export Excel file');
    } finally {
      setIsExportingExcel(false);
    }
  };

  // Reset component state when the borrower changes
  useEffect(() => {
    // Component state reset if needed
  }, [borrowerId]);

  // Financials table headers
  const financialsTableHeaders = [
    { key: 'asOfDate', value: 'As Of Date', sortKey: 'asOfDate' },
    { key: 'submittedAt', value: 'Submitted Date', sortKey: 'submittedAt' },
    { key: 'accountabilityScore', value: 'Accountability Score', sortKey: 'accountabilityScore' },
    { key: 'grossRevenue', value: 'Gross Revenue', sortKey: 'grossRevenue' },
    { key: 'netIncome', value: 'Net Income', sortKey: 'netIncome' },
    { key: 'ebitda', value: 'EBITDA', sortKey: 'ebitda' },
    { key: 'debtService', value: 'DSCR', sortKey: 'debtService' },
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
        accountabilityScore: financial.accountabilityScore || '-',
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

  // Transform documents into table rows
  const documentsTableRows = useMemo(
    () => {
      const documentsList = $documents.value?.list || [];
      return documentsList.map((doc) => ({
        ...doc,
        documentName: doc.documentName,
        loanNumber: getLoanNumber(doc.loanId, loans),
        uploadedAt: formatUploadDate(doc.uploadedAt),
        fileSize: formatFileSize(Number(doc.fileSize)),
        actions: () => (
          <ContextMenu
            items={[
              { label: 'View', icon: faEye, action: 'download' },
              { label: 'Delete', icon: faTrash, action: 'delete' },
            ]}
            onItemClick={(item) => {
              if (item.action === 'download') {
                // Check if this is a borrower financial document (has storageUrl) or loan document
                if (doc.source === 'borrowerFinancial' || doc.storageUrl) {
                  // Borrower financial documents already have a storageUrl we can use directly
                  const link = document.createElement('a');
                  link.href = doc.storageUrl;
                  link.download = doc.documentName || doc.fileName || 'document';
                  link.target = '_blank';
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                } else {
                  // Loan documents need to get a signed download URL
                  handleDownloadDocument(doc.id, doc.documentName);
                }
              } else if (item.action === 'delete') {
                $documents.update({ selectedDocument: doc });
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

  const tabs = [
    { key: 'details', title: 'Details', icon: faUser },
    { key: 'triggers', title: 'Triggers', icon: faBell },
    // { key: 'contacts', title: 'Contacts', icon: faAddressBook },
    { key: 'loans', title: 'Loans', icon: faMoneyBillWave },
    { key: 'financials', title: 'Financials', icon: faDollarSign },
    // { key: 'covenants', title: 'Covenants', icon: faShieldAlt },
    { key: 'debtService', title: 'Debt Service', icon: faReceipt },
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
              <div className="text-info-50 lead fw-500">{borrower.borrowerType || 'N/A'}</div>

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

      case 'loans':
        return (
          <LoansContainer />
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
                      activeModalKey: 'submitFinancials',
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
                <Button
                  variant="outline-primary-100"
                  onClick={handleExportExcel}
                  disabled={isExportingExcel}
                  size="sm"
                  className="ms-8"
                >
                  <FontAwesomeIcon icon={faTable} className="me-8" />
                  {isExportingExcel ? 'Exporting...' : 'Export Spreadsheet'}
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
                  onRowClick={(financial) => {
                    $borrowerFinancialsView.update({
                      activeModalKey: 'submitFinancials',
                      isEditMode: true,
                      currentBorrowerId: borrower.id,
                      editingFinancialId: financial.id,
                    });
                  }}
                />
              );
            })()}
          </div>
        );

      case 'debtService':
        return <DebtServiceContainer />;
      case 'triggers':
        return (
          <TriggersTab
            currentForm={$borrowerFinancials.value.list[1] || {}}
            previousFinancial={$borrowerFinancials.value.list[2] || {}}
            isLoadingPrevious={$modalState.value.isLoadingPrevious}
          />
        );

      case 'industry':
        return (
          <UniversalCard headerText="Industry Analysis">
            <div>
              <Row>
                <Col xs={12} md={8} className="mb-12 mb-md-0">
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
                <Col xs={12} md={4} className="text-md-end">
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
                <Col xs={12} md={12}>
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
    <Container className="py-16 py-md-24">
      <div className="d-flex justify-content-between align-items-center flex-wrap">
        <Button
          onClick={() => navigate('/borrowers')}
          className="btn-sm border-dark text-dark-800 bg-grey-50 mb-12 mb-md-16"
        >
          <FontAwesomeIcon icon={faArrowLeft} className="me-8" />
          Back to Borrowers
        </Button>
        <div>
          <Button
            onClick={() => $borrowerDetailView.update({ showEditBorrowerModal: true })}
            variant="outline-primary-100"
            className="me-8 mb-8 mb-md-0"
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
        <Col xs={12} md={2} className="mb-12 mb-md-0">
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
                  : 'text-info-100 hover-bg-info-700'}`}
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
        <Col xs={12} md={9}>
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

export default BorrowerDetailsContainer;
