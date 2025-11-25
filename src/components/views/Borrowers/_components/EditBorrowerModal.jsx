/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect } from 'react';
import { Form, Row, Col, Table, Button, Badge } from 'react-bootstrap';
import { faPlus, faEdit, faTrash, faStar } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import UniversalModal from '@src/components/global/UniversalModal';
import UniversalInput from '@src/components/global/Inputs/UniversalInput';
import {
  $borrowersView,
  $borrowersForm,
  $borrowers,
  $relationshipManagers,
  $contacts,
  $contactsView,
  $contactsForm,
  $user,
} from '@src/signals';
import { handleEditBorrower } from '../_helpers/borrowers.events';
import { handleSetPrimaryContact } from '../_helpers/contacts.events';
import * as helpers from '../_helpers/borrowers.helpers';
import * as contactsHelpers from '../_helpers/contacts.helpers';
import * as contactsResolvers from '../_helpers/contacts.resolvers';
import AddContactModal from './AddContactModal';
import EditContactModal from './EditContactModal';
import DeleteContactModal from './DeleteContactModal';

const EditClientModal = () => {
  useEffect(() => {
    if ($borrowersView.value.showEditModal && $borrowers.value.selectedClient) {
      $borrowersForm.update($borrowers.value.selectedClient);
      // Load contacts for this borrower
      if ($borrowers.value.selectedClient?.id) {
        contactsResolvers.fetchAndSetContactsData($borrowers.value.selectedClient.id);
      }
    }
  }, [$borrowersView.value.showEditModal]);

  const managers = $relationshipManagers.value?.list || [];
  // eslint-disable-next-line no-unused-vars
  const managerOptions = helpers.getManagerOptions(managers);

  const handleAddContactClick = () => {
    $contactsForm.update({
      borrowerId: $borrowers.value.selectedClient?.id,
      organizationId: $user.value.organizationId,
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      title: '',
      isPrimary: false,
    });
    $contactsView.update({ showAddModal: true });
  };

  const handleEditContactClick = (contact) => {
    $contacts.update({ selectedContact: contact });
    $contactsView.update({ showEditModal: true });
  };

  const handleDeleteContactClick = (contact) => {
    $contacts.update({ selectedContact: contact });
    $contactsView.update({ showDeleteModal: true });
  };

  const modalBody = (
    <Form>
      <Row>
        <Col md={12} className="mb-16">
          <UniversalInput
            label="Name"
            type="text"
            value={$borrowersForm.value.name}
            signal={$borrowersForm}
            name="name"
          />
        </Col>
      </Row>
      <Row>
        <Col md={6} className="mb-16">
          <UniversalInput
            label="Email"
            type="email"
            value={$borrowersForm.value.email}
            signal={$borrowersForm}
            name="email"
          />
        </Col>
        <Col md={6} className="mb-16">
          <UniversalInput
            label="Phone"
            type="text"
            value={$borrowersForm.value.phoneNumber}
            signal={$borrowersForm}
            name="phoneNumber"
          />
        </Col>
      </Row>

      {/* Contacts Section */}
      <Row className="mt-24">
        <Col md={12}>
          <div className="d-flex justify-content-between align-items-center mb-16">
            <h5 className="mb-0">Contacts</h5>
            <Button
              variant="primary"
              size="sm"
              onClick={handleAddContactClick}
            >
              <FontAwesomeIcon icon={faPlus} className="me-2" />
              Add Contact
            </Button>
          </div>

          {$contacts.value.isLoading && (
            <p>Loading contacts...</p>
          )}
          {!$contacts.value.isLoading && $contacts.value.list.length > 0 && (
            <Table striped bordered hover size="sm">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Title</th>
                  <th>Primary</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {$contacts.value.list.map((contact) => (
                  <tr key={contact.id}>
                    <td>{contactsHelpers.formatContactName(contact)}</td>
                    <td>{contact.email || '-'}</td>
                    <td>{contact.phone || '-'}</td>
                    <td>{contact.title || '-'}</td>
                    <td>
                      {contact.isPrimary ? (
                        <Badge bg="success">
                          <FontAwesomeIcon icon={faStar} className="me-1" />
                          Primary
                        </Badge>
                      ) : (
                        <Button
                          variant="link"
                          size="sm"
                          onClick={() => handleSetPrimaryContact(contact.id, contact.borrowerId)}
                          className="p-0 text-decoration-none"
                        >
                          Set as Primary
                        </Button>
                      )}
                    </td>
                    <td>
                      <Button
                        variant="link"
                        size="sm"
                        onClick={() => handleEditContactClick(contact)}
                        className="p-1 me-2"
                        aria-label="Edit contact"
                      >
                        <FontAwesomeIcon icon={faEdit} />
                      </Button>
                      <Button
                        variant="link"
                        size="sm"
                        onClick={() => handleDeleteContactClick(contact)}
                        className="p-1 text-danger"
                        aria-label="Delete contact"
                      >
                        <FontAwesomeIcon icon={faTrash} />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
          {!$contacts.value.isLoading && $contacts.value.list.length === 0 && (
            <p className="text-muted">No contacts found. Add a contact to get started.</p>
          )}
        </Col>
      </Row>
    </Form>
  );

  return (
    <>
      <UniversalModal
        show={$borrowersView.value.showEditModal}
        onHide={() => {
          $borrowersView.update({ showEditModal: false });
          $borrowersForm.reset();
          $contacts.update({ list: [] });
        }}
        headerText="Edit Borrower"
        leftBtnText="Cancel"
        rightBtnText="Save Changes"
        rightBtnOnClick={handleEditBorrower}
        size="lg"
      >
        {modalBody}
      </UniversalModal>

      <AddContactModal />
      <EditContactModal />
      <DeleteContactModal />
    </>
  );
};

export default EditClientModal;
