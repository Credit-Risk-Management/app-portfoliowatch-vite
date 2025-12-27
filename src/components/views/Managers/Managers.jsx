import { useEffectAsync } from '@fyclabs/tools-fyc-react/utils';
import { Container, Row, Col, Badge } from 'react-bootstrap';
import { faEye, faEdit, faPlus } from '@fortawesome/free-solid-svg-icons';
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
import SelectInput from '@src/components/global/Inputs/SelectInput';
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
    manager: helpers.getManagerName(manager.managerId, managers),
    reports_count: helpers.getReportsCount(manager.id, managers),
    loans_count: helpers.getLoansCount(manager.id, managers, loans, true),
    status: () => (
      <Badge bg={manager.isActive ? 'success' : 'secondary'}>
        {manager.isActive ? 'Active' : 'Inactive'}
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
      <Container fluid className="py-16 py-md-24">
        <PageHeader
          title="Relationship Managers"
          actionButton
          actionButtonText="Add Manager"
          actionButtonIcon={faPlus}
          onActionClick={() => $relationshipManagersView.update({ showAddModal: true })}
        />

        <Row className="mb-16 mb-md-24">
          <Col xs={12} md={6} className="mb-12 mb-md-0">
            <Search
              placeholder="Search managers..."
              value={$relationshipManagersFilter.value.searchTerm}
              signal={$relationshipManagersFilter}
              name="searchTerm"
              onChange={() => $relationshipManagersFilter.update({ page: 1 })}
            />
          </Col>
          <Col xs={12} md={3} className="mb-12 mb-md-0">
            <SelectInput
              name="isActive"
              signal={$relationshipManagersFilter}
              value={
                // eslint-disable-next-line no-nested-ternary
                $relationshipManagersFilter.value.isActive === true
                  ? 'active'
                  : $relationshipManagersFilter.value.isActive === false
                    ? 'inactive'
                    : 'all'
              }
              options={[
                { value: 'all', label: 'All Statuses' },
                { value: 'active', label: 'Active Only' },
                { value: 'inactive', label: 'Inactive Only' },
              ]}
              onChange={() => {
                // SelectInput handles signal.update already, but we want consistent filter logic.
                // So manually parse and set.
                const val = $relationshipManagersFilter.value.isActive;
                let parsed;
                if (val === 'active') parsed = true;
                else if (val === 'inactive') parsed = false;
                else parsed = null;
                $relationshipManagersFilter.update({ isActive: parsed, page: 1 });
              }}
              notClearable
              placeholder="Status"
            />
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
