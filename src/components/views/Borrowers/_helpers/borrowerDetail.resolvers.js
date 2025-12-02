/* eslint-disable import/prefer-default-export */
import { $borrower } from '@src/consts/consts';
import { $contacts, $documents } from '@src/signals';
import borrowersApi from '@src/api/borrowers.api';
import contactsApi from '@src/api/contacts.api';
import documentsApi from '@src/api/documents.api';
import { dangerAlert } from '@src/components/global/Alert/_helpers/alert.events';
import { $borrowerDocumentsFilter, $borrowerDocumentsView } from './borrowerDetail.consts';

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

export const fetchBorrowerDocuments = async (borrowerId) => {
  if (!borrowerId) return;

  const borrower = $borrower.value?.borrower;
  if (!borrower?.loans || borrower.loans.length === 0) {
    $documents.update({
      list: [],
      totalCount: 0,
      isLoading: false,
    });
    return;
  }

  try {
    $borrowerDocumentsView.update({ isTableLoading: true });

    // Get all loan IDs for this borrower
    const loanIds = borrower.loans.map((loan) => loan.id);

    // Fetch documents for each loan and combine them
    const documentPromises = loanIds.map((loanId) => documentsApi.getByLoan(loanId));
    const documentResponses = await Promise.all(documentPromises);

    // Combine all documents from all loans
    const allDocuments = documentResponses.flatMap((response) => {
      const data = response?.data || response || [];
      return Array.isArray(data) ? data : [];
    });

    // Remove duplicates based on document ID
    const uniqueDocuments = Array.from(
      new Map(allDocuments.map((doc) => [doc.id, doc])).values()
    );

    $documents.update({
      list: uniqueDocuments,
      totalCount: uniqueDocuments.length,
      isLoading: false,
    });
  } catch (error) {
    console.error('Failed to fetch borrower documents:', error);
    $documents.update({
      list: [],
      totalCount: 0,
      isLoading: false,
    });
  } finally {
    $borrowerDocumentsView.update({ isTableLoading: false });
  }
};
