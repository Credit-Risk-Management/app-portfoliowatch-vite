import { useEffectAsync } from '@fyclabs/tools-fyc-react/utils';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col } from 'react-bootstrap';
import { faEdit, faEye, faTrash } from '@fortawesome/free-solid-svg-icons';
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
import * as consts from './_helpers/borrowers.consts';
import * as resolvers from './_helpers/borrowers.resolvers';
import * as helpers from './_helpers/borrowers.helpers';
import { handleBorrowerFilterChange } from './_helpers/borrowers.events';

const Borrowers = () => {
  const navigate = useNavigate();

  useEffectAsync(async () => {
    await resolvers.loadReferenceData();
    await resolvers.fetchAndSetBorrowerData();
  }, []);

  // Watch for filter changes and refresh table data
  useEffectAsync(async () => {
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
    };

    await resolvers.fetchAndSetBorrowerData(filters, false);
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
    relationshipManager: helpers.getManagerName(borrower.relationshipManagerId, $relationshipManagers.value.list),
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

  return (
    <Container className="py-16 py-md-24">
      <PageHeader
        title="Borrowers"
      />

      <Row className="mb-12 mb-md-16">
        <Col xs={12} md={6} className="mb-12 mb-md-0">
          <Search
            placeholder="Search borrowers..."
            value={$borrowersFilter.value.searchTerm}
            onChange={handleBorrowerFilterChange}
            signal={$borrowersFilter}
            name="searchTerm"
          />
        </Col>
        <Col xs={12} md={3} className="mb-12 mb-md-0">
          <SelectInput
            options={[{ value: '', label: 'All Types' }, ...consts.CLIENT_TYPE_OPTIONS]}
            value={$borrowersFilter.value.borrowerType}
            onChange={handleBorrowerFilterChange}
            placeholder="Borrower Type"
            signal={$borrowersFilter}
            name="borrowerType"
            isMulti
          />
        </Col>
        <Col xs={12} md={3} className="mb-12 mb-md-0">
          <SelectInput
            options={[{ value: '', label: 'All Managers' }, ...helpers.getManagerOptions($relationshipManagers.value?.list || [])]}
            value={$borrowersFilter.value.relationshipManager}
            onChange={handleBorrowerFilterChange}
            placeholder="Relationship Manager"
            signal={$borrowersFilter}
            name="relationshipManager"
            isMulti
          />
        </Col>
      </Row>

      <Row>
        <Col xs={12}>
          <SignalTable
            $filter={$borrowersFilter}
            $view={$borrowersView}
            headers={consts.TABLE_HEADERS}
            rows={rows}
            totalCount={$borrowers.value.totalCount}
            currentPage={$borrowersFilter.value.page}
            itemsPerPageAmount={10}
            className="shadow"
            onRowClick={(borrower) => navigate(`/borrowers/${borrower.id}`)}
          />
        </Col>
      </Row>
    </Container>
  );
};

export default Borrowers;
