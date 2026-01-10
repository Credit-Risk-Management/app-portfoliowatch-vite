import { useEffectAsync } from '@fyclabs/tools-fyc-react/utils';
import { Container, Row, Col, Badge } from 'react-bootstrap';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';
import PageHeader from '@src/components/global/PageHeader';
import SignalTable from '@src/components/global/SignalTable';
import Search from '@src/components/global/Inputs/Search';
import {
  $relationshipManagers,
  $relationshipManagersFilter,
  $relationshipManagersView,
} from '@src/signals';
import SelectInput from '@src/components/global/Inputs/SelectInput';
import { fetchManagers } from './_helpers/managers.events';
import AddManagerModal from './_components/AddManagerModal';
import EditManagerModal from './_components/EditManagerModal';
import * as consts from './_helpers/managers.consts';

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

  const formatCurrency = (value) => {
    if (!value && value !== 0) return '$0';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const rows = managers.map((manager) => ({
    ...manager,
    portfolio_value: formatCurrency(manager.portfolioValue || 0),
    loans_count: manager.loansCount || 0,
    status: () => (
      <Badge bg={manager.isActive ? 'success' : 'secondary'}>
        {manager.isActive ? 'Active' : 'Inactive'}
      </Badge>
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
              onRowClick={(manager) => navigate(`/relationship-managers/${manager.id}`)}
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
