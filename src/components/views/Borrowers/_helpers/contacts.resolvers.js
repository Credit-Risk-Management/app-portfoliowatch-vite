/* eslint-disable import/prefer-default-export */
import { $contacts } from '@src/signals';
import contactsApi from '@src/api/contacts.api';
import { dangerAlert } from '@src/components/global/Alert/_helpers/alert.events';

export const fetchAndSetContactsData = async (borrowerId) => {
  try {
    $contacts.update({ isLoading: true });
    const response = await contactsApi.getByBorrowerId(borrowerId);
    $contacts.update({
      list: response.data || [],
      totalCount: response.count || 0,
    });
  } catch (error) {
    dangerAlert(error.message || 'Failed to fetch contacts');
  } finally {
    $contacts.update({ isLoading: false });
  }
};
