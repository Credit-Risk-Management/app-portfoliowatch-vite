import { useEffectAsync } from '@fyclabs/tools-fyc-react/utils';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Container, Row, Col, Button } from 'react-bootstrap';
import { faEdit, faEye, faTrash, faSave, faCalculator, faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import PageHeader from '@src/components/global/PageHeader';
import SignalTable from '@src/components/global/SignalTable';
import Search from '@src/components/global/Inputs/Search';
import ContextMenu from '@src/components/global/ContextMenu';
import {
  $loansView,
  $loansFilter,
  $loans,
  $relationshipManagers,
} from '@src/signals';
import { formatCurrency } from '@src/utils/formatCurrency';
import { AddLoanModal, DeleteLoanModal, EditLoanModal, SaveReportModal } from '@src/components/views/Loans/_components';
import SelectInput from '@src/components/global/Inputs/SelectInput';
import { WATCH_SCORE_OPTIONS } from '@src/consts/consts';
import { handleSaveToReports, handleComputeWatchScores } from './_helpers/loans.events';
import { loadReferenceData, fetchAndSetLoans } from './_helpers/loans.resolvers';
import { formatRatio, formatDate } from './_helpers/loans.helpers';
import * as loansConsts from './_helpers/loans.consts';

const Loans = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Check for watch score query parameter on mount and apply filter
  useEffectAsync(async () => {
    const watchScoreParam = searchParams.get('watchScore');
    if (watchScoreParam) {
      const watchScore = Number(watchScoreParam);
      if (watchScore >= 0) {
        $loansFilter.update({ watchScore, page: 1 });
      }
      // Clear the query parameter after setting the filter
      setSearchParams({});
    }
  }, []);

  // Fetch reference data on mount
  useEffectAsync(async () => {
    await loadReferenceData();
    await fetchAndSetLoans({ isShowLoader: true });
  }, []);

  useEffectAsync(async () => {
    await fetchAndSetLoans({ isShowLoader: false });
  }, [
    $loansFilter.value.searchTerm,
    $loansFilter.value.interestType,
    $loansFilter.value.watchScore,
    $loansFilter.value.relationshipManager,
    $loansFilter.value.page,
  ]);

  const rows = ($loans.value?.list || []).map((loan) => ({
    ...loan,
    borrowerName: loan.borrowerName || '-',
    principalAmount: formatCurrency(loan.principalAmount),
    paymentAmount: formatCurrency(loan.paymentAmount),
    nextPaymentDueDate: formatDate(loan.nextPaymentDueDate),
    debtService: formatRatio(loan.debtService),
    currentRatio: formatRatio(loan.currentRatio),
    liquidity: formatCurrency(loan.liquidity),
    // eslint-disable-next-line arrow-body-style
    watchScore: () => {
      const score = WATCH_SCORE_OPTIONS[loan.watchScore];
      return <span className={`text-${score?.color}-200 fw-700`}>{score.label}</span>;
    },
    relationshipManager: loan.relationshipManager ? loan.relationshipManager.name : '-',
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
  }));

  return (
    <>
      <Container className="py-24">
        <PageHeader
          title="Loans"
          actionButton
          actionButtonText="Add Loan"
          actionButtonIcon={faPlus}
          onActionClick={() => $loansView.update({ showAddModal: true })}
          AdditionalComponents={() => (
            <>
              <Button variant="outline-secondary-100" onClick={handleSaveToReports}>
                <FontAwesomeIcon icon={faSave} className="me-8" />
                Save to Reports
              </Button>
              <Button variant="outline-info-100" onClick={handleComputeWatchScores}>
                <FontAwesomeIcon icon={faCalculator} className="me-8" />
                Compute Scores
              </Button>
            </>
          )}
        />

        <Row className="mb-24">
          <Col md={6}>
            <Search
              placeholder="Search loans..."
              value={$loansFilter.value.searchTerm}
              signal={$loansFilter}
              name="searchTerm"
            />
          </Col>
          <Col md={2}>
            <SelectInput
              name="interestType"
              signal={$loansFilter}
              value={$loansFilter.value.interestType}
              options={[
                { value: '', label: 'All Types' },
                ...loansConsts.INTEREST_TYPE_OPTIONS,
              ]}
              onChange={() => $loansFilter.update({ page: 1 })}
              placeholder="All Types"
              notClearable
            />
          </Col>
          <Col md={2}>
            <SelectInput
              name="watchScore"
              signal={$loansFilter}
              value={$loansFilter.value.watchScore}
              options={[
                { value: '', label: 'All Scores' },
                ...loansConsts.LOAN_RISK_RATING_OPTIONS,
              ]}
              onChange={() => $loansFilter.update({ page: 1 })}
              placeholder="All Scores"
              notClearable
            />
          </Col>
          <Col md={2}>
            <SelectInput
              name="relationshipManager"
              signal={$loansFilter}
              value={$loansFilter.value.relationshipManager}
              options={[
                { value: '', label: 'All Managers' },
                ...($relationshipManagers.value?.list || []).map((m) => ({
                  value: m.id,
                  label: m.name,
                })),
              ]}
              onChange={() => $loansFilter.update({ page: 1 })}
              placeholder="All Managers"
              notClearable
            />
          </Col>
        </Row>

        <Row>
          <Col>
            <SignalTable
              $filter={$loansFilter}
              $view={$loansView}
              headers={loansConsts.TABLE_HEADERS}
              rows={rows}
              totalCount={$loans.value?.totalCount || 0}
              currentPage={$loansFilter.value.page}
              itemsPerPageAmount={10}
              onRowClick={(loan) => navigate(`/loans/${loan.id}`)}
            />
          </Col>
        </Row>
      </Container>

      <SaveReportModal />
      <AddLoanModal />
      <EditLoanModal />
      <DeleteLoanModal />
    </>
  );
};

export default Loans;
