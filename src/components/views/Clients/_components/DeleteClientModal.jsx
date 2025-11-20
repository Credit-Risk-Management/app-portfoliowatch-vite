import UniversalModal from '@src/components/global/UniversalModal';
import { $clientsView, $clients } from '@src/signals';
import { handleDeleteClient } from '../_helpers/clients.events';

const DeleteClientModal = () => {
  const client = $clients.value.selectedClient;

  const modalBody = client ? (
    <div>
      <p>Are you sure you want to delete this borrower?</p>
      <p className="fw-700">{client.name} ({client.client_id})</p>
      <p className="text-danger">This action cannot be undone.</p>
    </div>
  ) : null;

  return (
    <UniversalModal
      show={$clientsView.value.showDeleteModal}
      onHide={() => $clientsView.update({ showDeleteModal: false })}
      headerText="Delete Borrower"
      headerBgColor="danger"
      body={modalBody}
      leftBtnText="Cancel"
      rightBtnText="Delete"
      rightBtnVariant="danger"
      rightBtnClass="text-white"
      rightBtnOnClick={() => handleDeleteClient(client?.id)}
    />
  );
};

export default DeleteClientModal;
