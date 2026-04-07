import { useEffectAsync } from '@fyclabs/tools-fyc-react/utils';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Container, Row, Col } from 'react-bootstrap';
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
import { useRef } from 'react';
import * as consts from './_helpers/borrowers.consts';
import * as resolvers from './_helpers/borrowers.resolvers';
import * as helpers from './_helpers/borrowers.helpers';
import { handleBorrowerFilterChange } from './_helpers/borrowers.events';
import EditBorrowerModal from './_components/EditBorrowerModal';
import DeleteBorrowerModal from './_components/DeleteBorrowerModal';
import AddBorrowerModal from './_components/AddBorrowerModal';

const Borrowers = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const isInitialMount = useRef(true);

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
      $borrowersFilter.update({
        searchTerm,
        page: parsedPage,
        sortKey,
        sortDirection,
        borrowerType: borrowerTypeParam ? borrowerTypeParam.split(',').filter(Boolean) : [],
        relationshipManager: relationshipManagerParam ? relationshipManagerParam.split(',').filter(Boolean) : [],
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
    };

    await resolvers.fetchAndSetBorrowerData(filters);
  }, [
    $borrowersFilter.value.searchTerm,
    $borrowersFilter.value.borrowerType,
    $borrowersFilter.value.relationshipManager,
    $borrowersFilter.value.page,
    $borrowersFilter.value.sortKey,
    $borrowersFilter.value.sortDirection,
  ]);

  const rows = $borrowers.value.list.map((borrower) => ({
    ...borrower,
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

      <Row className="mb-12 mb-md-16">
        <Col xs={12} md={6} className="mb-12 mb-md-0">
          <Search
            placeholder="Search borrowers..."
            value={$borrowersFilter.value.searchTerm}
            onChange={() => {
              handleBorrowerFilterChange();
              setSearchParams(borrowersFilterToUrlParams($borrowersFilter.value));
            }}
            signal={$borrowersFilter}
            name="searchTerm"
          />
        </Col>
        <Col xs={12} md={3} className="mb-12 mb-md-0">
          <SelectInput
            options={[{ value: '', label: 'All Types' }, ...consts.CLIENT_TYPE_OPTIONS]}
            value={$borrowersFilter.value.borrowerType}
            onChange={() => {
              handleBorrowerFilterChange();
              setSearchParams(borrowersFilterToUrlParams($borrowersFilter.value));
            }}
            placeholder="Borrower Type"
            signal={$borrowersFilter}
            name="borrowerType"
            isMulti
          />
        </Col>
        <Col xs={12} md={3} className="mb-12 mb-md-0">
          <SelectInput
            options={[{ value: '', label: 'All Managers' }, ...relationshipManagerOptions]}
            value={$borrowersFilter.value.relationshipManager}
            onChange={() => {
              handleBorrowerFilterChange();
              setSearchParams(borrowersFilterToUrlParams($borrowersFilter.value));
            }}
            placeholder="Relationship Manager"
            signal={$borrowersFilter}
            name="relationshipManager"
            isMulti
          />
        </Col>
      </Row>

      <AddBorrowerModal />
      <EditBorrowerModal />
      <DeleteBorrowerModal />

      <Row>
        <Col xs={12}>
          <div style={$borrowersView.value.showAllMode ? { maxHeight: '70vh', overflowY: 'auto' } : undefined}>
            <SignalTable
              $filter={$borrowersFilter}
              $view={$borrowersView}
              headers={consts.TABLE_HEADERS}
              rows={rows}
              totalCount={$borrowers.value.totalCount}
              currentPage={$borrowersFilter.value.page}
              itemsPerPageAmount={10}
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
