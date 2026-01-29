import UniversalModal from '@src/components/global/UniversalModal';
import { $contactsView, $contacts } from '@src/signals';
import { handleDeleteContact } from '../_helpers/contacts.events';
import * as contactsHelpers from '../_helpers/contacts.helpers';

const DeleteContactModal = () => (
  <UniversalModal
    show={$contactsView.value.showDeleteModal}
    onHide={() => {
      $contactsView.update({ showDeleteModal: false });
      $contacts.update({ selectedContact: null });
    }}
    headerText="Delete Contact"
    headerBgColor="danger"
    leftBtnText="Cancel"
    rightBtnText="Delete"
    rightBtnVariant="danger"
    rightBtnClass="text-white"
    rightBtnOnClick={() => handleDeleteContact(
      $contacts.value.selectedContact?.id,
      $contacts.value.selectedContact?.borrowerId,
    )}
  >
    {$contacts.value.selectedContact ? (
      <div>
        <p>Are you sure you want to delete this contact?</p>
        <p className="fw-700">
          {contactsHelpers.formatContactName($contacts.value.selectedContact)}
        </p>
        {$contacts.value.selectedContact.email && (
          <p>{$contacts.value.selectedContact.email}</p>
        )}
        <p className="text-danger">This action cannot be undone.</p>
      </div>
    ) : null}
  </UniversalModal>
);

export default DeleteContactModal;
