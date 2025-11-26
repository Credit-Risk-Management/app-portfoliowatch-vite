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

  const rows = $borrowers.value.list.map((borrower) => ({
    ...borrower,
    clientRiskRating: () => <StatusBadge status={borrower.clientRiskRating} type="risk" />,
    relationshipManager: helpers.getManagerName(borrower.relationshipManagerId, $relationshipManagers.value.list),
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
    <Container className="py-24">
      <PageHeader
        title="Borrowers"
      />

      <Row className="mb-16">
        <Col md={6}>
          <Search
            placeholder="Search borrowers..."
            value={$borrowersFilter.value.searchTerm}
            onChange={handleBorrowerFilterChange}
            signal={$borrowersFilter}
            name="searchTerm"
          />
        </Col>
        <Col md={3}>
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
        <Col md={3}>
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
        <Col>
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
