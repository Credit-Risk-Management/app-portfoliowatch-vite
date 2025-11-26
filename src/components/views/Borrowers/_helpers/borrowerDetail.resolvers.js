/* eslint-disable import/prefer-default-export */
import { $borrower } from '@src/consts/consts';
import { $contacts } from '@src/signals';
import borrowersApi from '@src/api/borrowers.api';
import contactsApi from '@src/api/contacts.api';
import { dangerAlert } from '@src/components/global/Alert/_helpers/alert.events';

export const fetchBorrowerDetail = async (borrowerId) => {
  if (!borrowerId) return;

  try {
    $borrower.update({ isLoading: true });

    const [borrowerResponse, contactsResponse] = await Promise.all([
      borrowersApi.getById(borrowerId),
      contactsApi.getByBorrowerId(borrowerId),
    ]);

    // The API client interceptor returns response.data, so extract the borrower object
    const borrowerData = borrowerResponse?.data || borrowerResponse;

    $borrower.update({ borrower: borrowerData, isLoading: false });
    $contacts.update({ list: contactsResponse?.data || contactsResponse || [] });
  } catch (error) {
    console.error('Failed to fetch borrower detail:', error);
    $borrower.update({ borrower: null, isLoading: false });
    dangerAlert(`Failed to fetch borrower detail: ${error?.message || 'Unknown error'}`);
  }
};
