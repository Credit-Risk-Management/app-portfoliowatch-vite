import { useEffectAsync } from '@fyclabs/tools-fyc-react/utils';
import { Container, Row, Col, Badge } from 'react-bootstrap';
import { faEye, faEdit } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';
import PageHeader from '@src/components/global/PageHeader';
import SignalTable from '@src/components/global/SignalTable';
import Search from '@src/components/global/Inputs/Search';
import ContextMenu from '@src/components/global/ContextMenu';
import {
  $relationshipManagers,
  $relationshipManagersFilter,
  $relationshipManagersView,
  $loans,
} from '@src/signals';
import { fetchManagers } from './_helpers/managers.events';
import AddManagerModal from './_components/AddManagerModal';
import EditManagerModal from './_components/EditManagerModal';
import * as consts from './_helpers/managers.consts';
import * as helpers from './_helpers/managers.helpers';

const Managers = () => {
  const navigate = useNavigate();

  useEffectAsync(async () => {
    await fetchManagers();
  }, [
    $relationshipManagersFilter.value.searchTerm,
    $relationshipManagersFilter.value.isActive,
    $relationshipManagersFilter.value.page,
    $relationshipManagersFilter.value.sortKey,
    $relationshipManagersFilter.value.sortDirection,
  ]);

  const managers = $relationshipManagers.value.list || [];
  const loans = $loans.value?.list || [];

  const rows = managers.map((manager) => ({
    ...manager,
    manager: helpers.getManagerName(manager.manager_id, managers),
    reports_count: helpers.getReportsCount(manager.id, managers),
    loans_count: helpers.getLoansCount(manager.id, managers, loans, true),
    status: () => (
      <Badge bg={manager.is_active ? 'success' : 'secondary'}>
        {manager.is_active ? 'Active' : 'Inactive'}
      </Badge>
    ),
    actions: () => (
      <ContextMenu
        items={[
          { label: 'Edit', icon: faEdit, action: 'edit' },
          { label: 'View Details', icon: faEye, action: 'view' },
        ]}
        onItemClick={(item) => {
          if (item.action === 'edit') {
            $relationshipManagers.update({ selectedManager: manager });
            $relationshipManagersView.update({ showEditModal: true });
          } else if (item.action === 'view') {
            navigate(`/relationship-managers/${manager.id}`);
          }
        }}
      />
    ),
  }));

  return (
    <>
      <Container fluid className="py-24">
        <PageHeader
          title="Relationship Managers"
          actionButton
          actionButtonText="Add Manager"
          onActionClick={() => $relationshipManagersView.update({ showAddModal: true })}
        />

        <Row className="mb-24">
          <Col md={6}>
            <Search
              placeholder="Search managers..."
              value={$relationshipManagersFilter.value.searchTerm}
              onChange={(e) => $relationshipManagersFilter.update({ searchTerm: e.target.value, page: 1 })}
            />
          </Col>
          <Col md={3}>
            <select
              className="form-select"
              value={$relationshipManagersFilter.value.isActive === true ? 'active' : $relationshipManagersFilter.value.isActive === false ? 'inactive' : 'all'}
              onChange={(e) => {
                const value = helpers.parseStatusFilter(e.target.value);
                $relationshipManagersFilter.update({ isActive: value, page: 1 });
              }}
            >
              <option value="all">All Statuses</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive Only</option>
            </select>
          </Col>
        </Row>

        <Row>
          <Col>
            <SignalTable
              $filter={$relationshipManagersFilter}
              $view={$relationshipManagersView}
              headers={consts.TABLE_HEADERS}
              rows={rows}
              totalCount={$relationshipManagers.value.totalCount}
              currentPage={$relationshipManagersFilter.value.page}
              itemsPerPageAmount={10}
            />
          </Col>
        </Row>
      </Container>

      <AddManagerModal />
      <EditManagerModal />
    </>
  );
};

export default Managers;
