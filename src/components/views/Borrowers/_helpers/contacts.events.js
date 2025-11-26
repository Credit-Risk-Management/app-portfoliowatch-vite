import { $contactsView, $contactsForm, $contacts } from '@src/signals';
import contactsApi from '@src/api/contacts.api';
import { dangerAlert, successAlert } from '@src/components/global/Alert/_helpers/alert.events';
import * as resolvers from './contacts.resolvers';

export const handleAddContact = async () => {
  try {
    const formData = $contactsForm.value;

    await contactsApi.create(formData);

    $contactsView.update({ showAddModal: false });
    $contactsForm.reset();

    successAlert('Contact added successfully');

    // Reload contacts for the current borrower
    if (formData.borrowerId) {
      await resolvers.fetchAndSetContactsData(formData.borrowerId);
    }
  } catch (error) {
    dangerAlert(error.message || 'Failed to add contact');
  }
};

export const handleEditContact = async () => {
  try {
    const formData = $contactsForm.value;

    await contactsApi.update(formData.id, formData);

    $contactsView.update({ showEditModal: false });
    $contactsForm.reset();

    successAlert('Contact updated successfully');

    // Reload contacts for the current borrower
    if (formData.borrowerId) {
      await resolvers.fetchAndSetContactsData(formData.borrowerId);
    }
  } catch (error) {
    dangerAlert(error.message || 'Failed to edit contact');
  }
};

export const handleDeleteContact = async (contactId, borrowerId) => {
  try {
    await contactsApi.delete(contactId);

    $contactsView.update({ showDeleteModal: false });
    $contacts.update({ selectedContact: null });

    successAlert('Contact deleted successfully');

    // Reload contacts for the current borrower
    if (borrowerId) {
      await resolvers.fetchAndSetContactsData(borrowerId);
    }
  } catch (error) {
    dangerAlert(error.message || 'Failed to delete contact');
  }
};

export const handleSetPrimaryContact = async (contactId, borrowerId) => {
  try {
    await contactsApi.setPrimary(contactId, borrowerId);

    successAlert('Primary contact updated successfully');

    // Reload contacts for the current borrower
    if (borrowerId) {
      await resolvers.fetchAndSetContactsData(borrowerId);
    }
  } catch (error) {
    dangerAlert(error.message || 'Failed to set primary contact');
  }
};
