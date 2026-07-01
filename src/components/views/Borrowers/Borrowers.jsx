import { useEffectAsync } from '@fyclabs/tools-fyc-react/utils';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Container,
  Row,
  Col,
  Badge,
  OverlayTrigger,
  Tooltip,
} from 'react-bootstrap';
import { faEdit, faEye, faTrash, faPlus } from '@fortawesome/free-solid-svg-icons';
import PageHeader from '@src/components/global/PageHeader';
import SignalTable from '@src/components/global/SignalTable';
import Search from '@src/components/global/Inputs/Search';
import StatusBadge from '@src/components/global/StatusBadge';
import ContextMenu from '@src/components/global/ContextMenu';
import {
  $borrowersView,
  $borrowersFilter,
  $borrowers,
  $relationshipManagers,
} from '@src/signals';
import SelectInput from '@src/components/global/Inputs/SelectInput';
import { formatCurrency } from '@src/utils/formatCurrency';
import { borrowersFilterToUrlParams } from '@src/utils/tableFilterUrlParams';
import {
  DEFAULT_PAGE_LIMIT,
  PAGE_LIMIT_OPTIONS,
  resolvePageLimit,
} from '@src/consts/consts';
import { useRef } from 'react';
import * as consts from './_helpers/borrowers.consts';
import * as resolvers from './_helpers/borrowers.resolvers';
import * as helpers from './_helpers/borrowers.helpers';
import { syncBorrowersListUrl } from './_helpers/borrowers.events';
import { BORROWERS_SEARCH_DEBOUNCE_MS } from './_helpers/borrowers.consts';
import EditBorrowerModal from './_components/EditBorrowerModal';
import DeleteBorrowerModal from './_components/DeleteBorrowerModal';
import AddBorrowerModal from './_components/AddBorrowerModal';
import BorrowersComplianceFilter from './_components/BorrowersComplianceFilter/BorrowersComplianceFilter';

const Borrowers = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const isInitialMount = useRef(true);
  const searchDebounceTimerRef = useRef(null);

  useEffectAsync(async () => {
    const q = searchParams.toString();

    if (!q) {
      resolvers.resetBorrowersListFilters();
    } else {
      const searchTerm = searchParams.get('searchTerm') || '';
      const pageParam = searchParams.get('page');
      const parsedPage = pageParam ? Number(pageParam) : 1;
      const sortKey = searchParams.get('sortKey') || 'name';
      const sortDirection = searchParams.get('sortDirection') || 'asc';
      const borrowerTypeParam = searchParams.get('borrowerType');
      const relationshipManagerParam = searchParams.get('relationshipManager');
      const quarterlyPackageParam = searchParams.get('quarterlyPackageComplete') || '';
      const impactQuestionnaireParam = searchParams.get('impactQuestionnaireComplete') || '';
      const taxReturn2025Param = searchParams.get('taxReturn2025Complete') || '';
      const limitParam = searchParams.get('limit');
      const parsedLimit = limitParam ? Number(limitParam) : DEFAULT_PAGE_LIMIT;
      const limit = PAGE_LIMIT_OPTIONS.some((option) => option.value === parsedLimit)
        ? parsedLimit
        : DEFAULT_PAGE_LIMIT;
      $borrowersFilter.update({
        searchTerm,
        page: parsedPage,
        limit,
        sortKey,
        sortDirection,
        borrowerType: borrowerTypeParam ? borrowerTypeParam.split(',').filter(Boolean) : [],
        relationshipManager: relationshipManagerParam ? relationshipManagerParam.split(',').filter(Boolean) : [],
        quarterlyPackageComplete: ['true', 'false'].includes(quarterlyPackageParam) ? quarterlyPackageParam : '',
        impactQuestionnaireComplete: ['true', 'false'].includes(impactQuestionnaireParam) ? impactQuestionnaireParam : '',
        taxReturn2025Complete: ['true', 'false'].includes(taxReturn2025Param) ? taxReturn2025Param : '',
      });
    }

    await resolvers.fetchAndSetBorrowerData();
    await resolvers.loadReferenceData();
    isInitialMount.current = false;
  }, []);

  useEffectAsync(async () => {
    if (isInitialMount.current) return;

    const borrowerTypeValue = Array.isArray($borrowersFilter.value.borrowerType)
      ? $borrowersFilter.value.borrowerType.filter((type) => type !== '').join(',')
      : $borrowersFilter.value.borrowerType;

    const relationshipManagerValue = Array.isArray($borrowersFilter.value.relationshipManager)
      ? $borrowersFilter.value.relationshipManager.filter((manager) => manager !== '').join(',')
      : $borrowersFilter.value.relationshipManager;

    const filters = {
      searchTerm: $borrowersFilter.value.searchTerm,
      borrowerType: borrowerTypeValue,
      relationshipManager: relationshipManagerValue,
      page: $borrowersFilter.value.page,
      limit: resolvePageLimit($borrowersFilter.value.limit),
    };

    await resolvers.fetchAndSetBorrowerData(filters);
  }, [
    $borrowersFilter.value.borrowerType,
    $borrowersFilter.value.relationshipManager,
    $borrowersFilter.value.page,
    $borrowersFilter.value.limit,
    $borrowersFilter.value.sortKey,
    $borrowersFilter.value.sortDirection,
    $borrowersFilter.value.quarterlyPackageComplete,
    $borrowersFilter.value.impactQuestionnaireComplete,
    $borrowersFilter.value.taxReturn2025Complete,
  ]);

  useEffectAsync(async () => {
    if (isInitialMount.current) return;

    if (searchDebounceTimerRef.current) {
      clearTimeout(searchDebounceTimerRef.current);
    }

    await new Promise((resolve) => {
      searchDebounceTimerRef.current = setTimeout(resolve, BORROWERS_SEARCH_DEBOUNCE_MS);
    });

    const borrowerTypeValue = Array.isArray($borrowersFilter.value.borrowerType)
      ? $borrowersFilter.value.borrowerType.filter((type) => type !== '').join(',')
      : $borrowersFilter.value.borrowerType;

    const relationshipManagerValue = Array.isArray($borrowersFilter.value.relationshipManager)
      ? $borrowersFilter.value.relationshipManager.filter((manager) => manager !== '').join(',')
      : $borrowersFilter.value.relationshipManager;

    await resolvers.fetchAndSetBorrowerData({
      searchTerm: $borrowersFilter.value.searchTerm,
      borrowerType: borrowerTypeValue,
      relationshipManager: relationshipManagerValue,
      page: $borrowersFilter.value.page,
      limit: resolvePageLimit($borrowersFilter.value.limit),
    });
  }, [$borrowersFilter.value.searchTerm]);

  const rows = $borrowers.value.list.map((borrower) => ({
    ...borrower,
    name: () => (
      <span className="d-flex align-items-center flex-wrap py-4">
        <span className="text-break me-8">{borrower.name}</span>
        <span className="d-inline-flex align-items-center flex-wrap gap-4">
          {borrower.quarterlyPackageComplete ? (
            <OverlayTrigger
              placement="top"
              trigger={['hover', 'focus']}
              overlay={(
                <Tooltip id={`borrower-${borrower.id}-quarterly-badge`}>
                  Quarterly financial package on file for the current reporting period.
                </Tooltip>
              )}
            >
              <Badge bg="success-600" pill className="text-dark">
                Q1
              </Badge>
            </OverlayTrigger>
          ) : null}
          {borrower.impactQuestionnaireComplete ? (
            <OverlayTrigger
              placement="top"
              trigger={['hover', 'focus']}
              overlay={(
                <Tooltip id={`borrower-${borrower.id}-impact-badge`}>
                  Borrower impact questionnaire has been submitted.
                </Tooltip>
              )}
            >
              <Badge bg="info-600" pill className="text-dark">
                I-Q
              </Badge>
            </OverlayTrigger>
          ) : null}
          {borrower.taxReturn2025Complete ? (
            <OverlayTrigger
              placement="top"
              trigger={['hover', 'focus']}
              overlay={(
                <Tooltip id={`borrower-${borrower.id}-tax-return-2025-badge`}>
                  FY 2025 business tax return is on file.
                </Tooltip>
              )}
            >
              <Badge bg="warning-600" pill className="text-dark">
                2025 TR
              </Badge>
            </OverlayTrigger>
          ) : null}
        </span>
      </span>
    ),
    borrowerType: borrower.borrowerType || '-',
    clientRiskRating: () => <StatusBadge status={borrower.clientRiskRating} type="risk" />,
    relationshipManager: borrower.relationshipManager?.name || '-',
    loanCount: borrower.loanCount || 0,
    totalBalance: formatCurrency(borrower.totalBalance),
    actions: () => (
      <ContextMenu
        items={[
          { label: 'View Detail', icon: faEye, action: 'detail' },
          { label: 'Edit', icon: faEdit, action: 'edit' },
          { label: 'Delete', icon: faTrash, action: 'delete' },
        ]}
        onItemClick={(item) => {
          if (item.action === 'detail') {
            const params = borrowersFilterToUrlParams($borrowersFilter.value);
            window.localStorage.setItem('filterQueryString', params.toString());
            navigate(`/borrowers/${borrower.id}`);
          } else if (item.action === 'edit') {
            $borrowers.update({ selectedClient: borrower });
            $borrowersView.update({ showEditModal: true });
          } else if (item.action === 'delete') {
            $borrowers.update({ selectedBorrower: borrower });
            $borrowersView.update({ showDeleteModal: true });
          }
        }}
      />
    ),
  }));

  const relationshipManagersList = Array.isArray($relationshipManagers.value?.list)
    ? $relationshipManagers.value.list
    : [];
  const relationshipManagerOptions = helpers.getManagerOptions(relationshipManagersList);

  return (
    <Container className="py-16 py-md-24">
      <PageHeader
        title="Borrowers"
        actionButton
        actionButtonText="Add Borrower"
        actionButtonIcon={faPlus}
        onActionClick={() => $borrowersView.update({ showAddModal: true })}
      />

      <Row className="mb-12 mb-md-16 align-items-end">
        <Col xs={12} lg={4} className="mb-12 mb-lg-0">
          <Search
            placeholder="Search borrowers..."
            value={$borrowersFilter.value.searchTerm}
            onChange={() => syncBorrowersListUrl(setSearchParams, { page: 1 })}
            onClear={() => syncBorrowersListUrl(setSearchParams, { page: 1 })}
            signal={$borrowersFilter}
            name="searchTerm"
          />
        </Col>
        <Col xs={12} sm={6} lg={3} className="mb-12 mb-lg-0">
          <SelectInput
            options={[{ value: '', label: 'All Types' }, ...consts.CLIENT_TYPE_OPTIONS]}
            value={$borrowersFilter.value.borrowerType}
            onChange={() => syncBorrowersListUrl(setSearchParams, { page: 1 })}
            placeholder="Borrower Type"
            signal={$borrowersFilter}
            name="borrowerType"
            isMulti
          />
        </Col>
        <Col xs={12} sm={6} lg={3} className="mb-12 mb-lg-0">
          <SelectInput
            options={[{ value: '', label: 'All Managers' }, ...relationshipManagerOptions]}
            value={$borrowersFilter.value.relationshipManager}
            onChange={() => syncBorrowersListUrl(setSearchParams, { page: 1 })}
            placeholder="Relationship Manager"
            signal={$borrowersFilter}
            name="relationshipManager"
            isMulti
          />
        </Col>
        <Col xs={12} lg={2}>
          <BorrowersComplianceFilter setSearchParams={setSearchParams} />
        </Col>
      </Row>
      <AddBorrowerModal />
      <EditBorrowerModal />
      <DeleteBorrowerModal />

      <Row className="mb-8 align-items-center justify-content-end">
        <Col xs="auto" className="d-flex align-items-center gap-2">
          <span className="text-info-100 text-nowrap small me-4">Rows per page</span>
          <SelectInput
            options={PAGE_LIMIT_OPTIONS}
            value={$borrowersFilter.value.limit}
            onChange={(selectedOption) => {
              const limit = resolvePageLimit(selectedOption?.value);
              syncBorrowersListUrl(setSearchParams, { limit, page: 1 });
            }}
            placeholder="Limit"
            signal={$borrowersFilter}
            name="limit"
            isMulti={false}
            isSearchable={false}
            notClearable
          />
        </Col>
      </Row>
      <Row className="mb-8">
        <Col xs={12}>
          <div style={$borrowersView.value.showAllMode ? { maxHeight: '70vh', overflowY: 'auto' } : undefined}>
            <SignalTable
              $filter={$borrowersFilter}
              $view={$borrowersView}
              headers={consts.TABLE_HEADERS}
              rows={rows}
              totalCount={$borrowers.value.totalCount}
              currentPage={$borrowersFilter.value.page}
              currentPageItemsCount={$borrowers.value.list.length}
              itemsPerPageAmount={resolvePageLimit($borrowersFilter.value.limit)}
              hasPagination={!$borrowersView.value.showAllMode}
              className="shadow"
              onRowClick={(borrower) => {
                const params = borrowersFilterToUrlParams($borrowersFilter.value);
                window.localStorage.setItem('filterQueryString', params.toString());
                navigate(`/borrowers/${borrower.id}`);
              }}
              filterToUrlParams={borrowersFilterToUrlParams}
            />
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default Borrowers;
