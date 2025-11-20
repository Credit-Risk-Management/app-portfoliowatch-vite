import { useEffectAsync } from '@fyclabs/tools-fyc-react/utils';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Container, Row, Col, Form, Button } from 'react-bootstrap';
import { faEdit, faEye, faTrash, faSave, faCalculator } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import PageHeader from '@src/components/global/PageHeader';
import SignalTable from '@src/components/global/SignalTable';
import Search from '@src/components/global/Inputs/Search';
import ContextMenu from '@src/components/global/ContextMenu';
import UniversalModal from '@src/components/global/UniversalModal';
import UniversalInput from '@src/components/global/Inputs/UniversalInput';
import {
  $loansView,
  $loansFilter,
  $loans,
  $relationshipManagers,
} from '@src/signals';
import { formatCurrency } from '@src/utils/formatCurrency';
import { AddLoanModal } from '@src/components/views/Loans/_components';
import { fetchLoans, handleSaveToReports, handleSaveReport, handleComputeWatchScores } from './_helpers/loans.events';
import { loadReferenceData } from './_helpers/loans.resolvers';
import { getClientById, getLoanOfficerName, getManagerName, formatRatio, formatDate } from './_helpers/loans.helpers';
import * as consts from './_helpers/loans.consts';

const Loans = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Check for risk rating query parameter on mount and apply filter
  useEffectAsync(async () => {
    const riskRatingParam = searchParams.get('riskRating');
    if (riskRatingParam) {
      const riskRating = Number(riskRatingParam);
      if (riskRating >= 1 && riskRating <= 5) {
        $loansFilter.update({ riskRating, page: 1 });
      }
      // Clear the query parameter after setting the filter
      setSearchParams({});
    }
  }, []);

  // Fetch reference data on mount
  useEffectAsync(async () => {
    await loadReferenceData();
  }, []);

  useEffectAsync(async () => {
    await fetchLoans();
  }, [
    $loansFilter.value.searchTerm,
    $loansFilter.value.interestType,
    $loansFilter.value.riskRating,
    $loansFilter.value.loanOfficer,
    $loansFilter.value.page,
    $loansFilter.value.sortKey,
    $loansFilter.value.sortDirection,
  ]);

  const rows = ($loans.value?.list || []).map((loan) => {
    const client = getClientById(loan.borrowerId);

    return {
      ...loan,
      company_name: client ? client.name : loan.borrowerName || '-',
      primary_contact: client ? client.primaryContact : '-',
      principal_amount: formatCurrency(loan.principalAmount),
      payment_amount: formatCurrency(loan.paymentAmount),
      next_payment_due_date: formatDate(loan.nextPaymentDueDate),
      debt_service: formatRatio(loan.debtService),
      current_ratio: formatRatio(loan.currentRatio),
      liquidity: formatCurrency(loan.liquidity),
      watch_score: loan.watchScore ? formatRatio(loan.watchScore) : '-',
      loan_officer: getLoanOfficerName(loan.loanOfficerId),
      manager: getManagerName(loan.loanOfficerId),
      actions: () => (
        <ContextMenu
          items={[
            { label: 'Edit', icon: faEdit, action: 'edit' },
            { label: 'View Details', icon: faEye, action: 'view' },
            { label: 'Delete', icon: faTrash, action: 'delete' },
          ]}
          onItemClick={(item) => {
            if (item.action === 'edit') {
              $loans.update({ selectedLoan: loan });
              $loansView.update({ showEditModal: true });
            } else if (item.action === 'view') {
              navigate(`/loans/${loan.id}`);
            } else if (item.action === 'delete') {
              $loans.update({ selectedLoan: loan });
              $loansView.update({ showDeleteModal: true });
            }
          }}
        />
      ),
    };
  });

  return (
    <>
      <Container className="py-24">
        <PageHeader
          title="Loans"
          actionButton
          actionButtonText="Add Loan"
          onActionClick={() => $loansView.update({ showAddModal: true })}
        />

        <Row className="mb-24">
          <Col md={3}>
            <Search
              placeholder="Search loans..."
              value={$loansFilter.value.searchTerm}
              onChange={(e) => $loansFilter.update({ searchTerm: e.target.value, page: 1 })}
            />
          </Col>
          <Col md={2}>
            <Form.Select
              className="form-control shadow-none py-8 ps-16"
              value={$loansFilter.value.interestType}
              onChange={(e) => $loansFilter.update({ interestType: e.target.value || '', page: 1 })}
            >
              <option value="">All Types</option>
              {consts.INTEREST_TYPE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Form.Select>
          </Col>
          <Col md={2}>
            <Form.Select
              className="form-control shadow-none py-8 ps-16"
              value={$loansFilter.value.riskRating}
              onChange={(e) => {
                const { value } = e.target;
                $loansFilter.update({ riskRating: value ? Number(value) : '', page: 1 });
              }}
            >
              <option value="">All Ratings</option>
              {consts.LOAN_RISK_RATING_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Form.Select>
          </Col>
          <Col md={2}>
            <Form.Select
              className="form-control shadow-none py-8 ps-16"
              value={$loansFilter.value.loanOfficer}
              onChange={(e) => $loansFilter.update({ loanOfficer: e.target.value || '', page: 1 })}
            >
              <option value="">All Officers</option>
              {($relationshipManagers.value?.list || []).map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </Form.Select>
          </Col>
          <Col md={2} className="d-flex align-items-center gap-2">
            <Button variant="outline-primary" onClick={handleSaveToReports}>
              <FontAwesomeIcon icon={faSave} className="me-8" />
              Save to Reports
            </Button>
            <Button
              variant="outline-success"
              onClick={handleComputeWatchScores}
              disabled={$loansView.value.isComputingWatchScores}
            >
              <FontAwesomeIcon icon={faCalculator} className="me-8" />
              {$loansView.value.isComputingWatchScores ? 'Computing...' : 'Compute Scores'}
            </Button>
          </Col>
        </Row>

        <Row>
          <Col>
            <SignalTable
              $filter={$loansFilter}
              $view={$loansView}
              headers={consts.TABLE_HEADERS}
              rows={rows}
              totalCount={$loans.value?.totalCount || 0}
              currentPage={$loansFilter.value.page}
              itemsPerPageAmount={10}
              onRowClick={(loan) => navigate(`/loans/${loan.id}`)}
            />
          </Col>
        </Row>
      </Container>

      <UniversalModal
        show={$loansView.value.showSaveReportModal}
        onHide={() => $loansView.update({ showSaveReportModal: false, reportName: '' })}
        headerText="Save to Reports"
        body={(
          <div>
            <UniversalInput
              label="Report Name"
              type="text"
              placeholder="Enter report name"
              value={$loansView.value.reportName || ''}
              onChange={(e) => $loansView.update({ reportName: e.target.value })}
            />
            <p className="text-muted mt-16 mb-0">
              This will save the current filters as a report that you can view later.
            </p>
          </div>
        )}
        rightBtnText="Save"
        rightBtnOnClick={handleSaveReport}
        rightBtnVariant="primary"
      />

      <AddLoanModal />
      {/* <EditLoanModal />
      <ViewLoanModal />
      <DeleteLoanModal /> */}
    </>
  );
};

export default Loans;
