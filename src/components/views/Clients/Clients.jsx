import { useEffectAsync } from '@fyclabs/tools-fyc-react/utils';
import { Container, Row, Col } from 'react-bootstrap';
import { faEdit, faEye, faTrash } from '@fortawesome/free-solid-svg-icons';
import PageHeader from '@src/components/global/PageHeader';
import SignalTable from '@src/components/global/SignalTable';
import Search from '@src/components/global/Inputs/Search';
import StatusBadge from '@src/components/global/StatusBadge';
import ContextMenu from '@src/components/global/ContextMenu';
import {
  $clientsView,
  $clientsFilter,
  $clients,
  $relationshipManagers,
} from '@src/signals';
import AddClientModal from './_components/AddClientModal';
import EditClientModal from './_components/EditClientModal';
import ViewClientModal from './_components/ViewClientModal';
import DeleteClientModal from './_components/DeleteClientModal';
import * as consts from './_helpers/clients.consts';
import * as resolvers from './_helpers/clients.resolvers';
import * as helpers from './_helpers/clients.helpers';

const Clients = () => {
  useEffectAsync(async () => {
    await resolvers.loadReferenceData();
  }, []);

  useEffectAsync(async () => {
    // await fetchClients();
  }, [
    $clientsFilter.value.searchTerm,
    $clientsFilter.value.clientType,
    $clientsFilter.value.kycStatus,
    $clientsFilter.value.riskRating,
    $clientsFilter.value.page,
    $clientsFilter.value.sortKey,
    $clientsFilter.value.sortDirection,
  ]);

  const managers = $relationshipManagers.value?.list || [];

  const rows = $clients.value.list.map((client) => ({
    ...client,
    kyc_status: () => <StatusBadge status={client.kyc_status} type="kyc" />,
    client_risk_rating: () => <StatusBadge status={client.client_risk_rating} type="risk" />,
    relationship_manager: helpers.getManagerName(client.relationship_manager_id, managers),
    actions: () => (
      <ContextMenu
        items={[
          { label: 'Edit', icon: faEdit, action: 'edit' },
          { label: 'View Contact', icon: faEye, action: 'view' },
          { label: 'Delete', icon: faTrash, action: 'delete' },
        ]}
        onItemClick={(item) => {
          if (item.action === 'edit') {
            $clients.update({ selectedClient: client });
            $clientsView.update({ showEditModal: true });
          } else if (item.action === 'view') {
            $clients.update({ selectedClient: client });
            $clientsView.update({ showViewModal: true });
          } else if (item.action === 'delete') {
            $clients.update({ selectedClient: client });
            $clientsView.update({ showDeleteModal: true });
          }
        }}
      />
    ),
  }));

  return (
    <>
      <Container fluid className="py-24">
        <PageHeader
          title="Borrowers"
          actionButton
          actionButtonText="Add Borrower"
          onActionClick={() => $clientsView.update({ showAddModal: true })}
        />

        <Row className="mb-24">
          <Col md={4}>
            <Search
              placeholder="Search borrowers..."
              value={$clientsFilter.value.searchTerm}
              onChange={(e) => $clientsFilter.update({ searchTerm: e.target.value, page: 1 })}
            />
          </Col>
          <Col md={2}>
            {/* <SelectInput
              options={[{ value: '', label: 'All Types' }, ...clientTypeOptions]}
              value={$clientsFilter.value.clientType}
              onChange={(option) => $clientsFilter.update({ clientType: option?.value || '', page: 1 })}
              placeholder="Client Type"
            /> */}
          </Col>
          <Col md={2}>
            {/* <SelectInput
              options={[{ value: '', label: 'All Statuses' }, ...kycStatusOptions]}
              value={$clientsFilter.value.kycStatus}
              onChange={(option) => $clientsFilter.update({ kycStatus: option?.value || '', page: 1 })}
              placeholder="KYC Status"
            /> */}
          </Col>
          <Col md={2}>
            {/* <SelectInput
              options={[{ value: '', label: 'All Ratings' }, ...riskRatingOptions]}
              value={$clientsFilter.value.riskRating}
              onChange={(option) => $clientsFilter.update({ riskRating: option?.value || '', page: 1 })}
              placeholder="Risk Rating"
            /> */}
          </Col>
        </Row>

        <Row>
          <Col>
            <SignalTable
              $filter={$clientsFilter}
              $view={$clientsView}
              headers={consts.TABLE_HEADERS}
              rows={rows}
              totalCount={$clients.value.totalCount}
              currentPage={$clientsFilter.value.page}
              itemsPerPageAmount={10}
            />
          </Col>
        </Row>
      </Container>

      <AddClientModal />
      <EditClientModal />
      <ViewClientModal />
      <DeleteClientModal />
    </>
  );
};

export default Clients;
