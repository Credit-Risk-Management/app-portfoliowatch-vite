import { $borrower } from '@src/consts/consts';
import { $contacts, $documents, $relationshipManagers } from '@src/signals';
import borrowersApi from '@src/api/borrowers.api';
import contactsApi from '@src/api/contacts.api';
import documentsApi from '@src/api/documents.api';
import borrowerFinancialsApi from '@src/api/borrowerFinancials.api';
import borrowerFinancialDocumentsApi from '@src/api/borrowerFinancialDocuments.api';
import relationshipManagersApi from '@src/api/relationshipManagers.api';
import loansApi from '@src/api/loans.api';
import { dangerAlert } from '@src/components/global/Alert/_helpers/alert.events';
import { $borrowerDocumentsView } from './borrowerDetail.consts';
import { $loanWatchScoreBreakdowns } from '../../BorrowerLoansTab/_helpers/loanCard.consts';

export const fetchBorrowerDetail = async (borrowerId) => {
  if (!borrowerId) return;

  try {
    $borrower.update({ isLoading: true });

    const [borrowerResponse, contactsResponse, managersResponse] = await Promise.all([
      borrowersApi.getById(borrowerId),
      contactsApi.getByBorrowerId(borrowerId),
      relationshipManagersApi.getAll(),
    ]);

    // The API client interceptor returns response.data, so extract the borrower object
    const borrowerData = borrowerResponse?.data || borrowerResponse;

    $borrower.update({ borrower: borrowerData, isLoading: false });
    $contacts.update({ list: contactsResponse?.data || contactsResponse || [] });
    $relationshipManagers.update({ list: managersResponse?.data || [] });
  } catch (error) {
    console.error('Failed to fetch borrower detail:', error);
    $borrower.update({ borrower: null, isLoading: false });
    dangerAlert(`Failed to fetch borrower detail: ${error?.message || 'Unknown error'}`);
  }
};

export const fetchBorrowerDocuments = async (borrowerId) => {
  if (!borrowerId) return;

  const borrower = $borrower.value?.borrower;

  try {
    $borrowerDocumentsView.update({ isTableLoading: true });

    const allDocuments = [];

    // 1. Fetch loan documents (if borrower has loans)
    if (borrower?.loans && borrower.loans.length > 0) {
      const loanIds = borrower.loans.map((loan) => loan.id);

      // Fetch documents for each loan using getAll (fetch ALL document types, not filtered)
      const loanDocumentPromises = loanIds.map((loanId) => documentsApi.getAll({ loanId }));
      const loanDocumentResponses = await Promise.all(loanDocumentPromises);

      // Process loan documents
      const loanDocuments = loanDocumentResponses.flatMap((response) => {
        if (response?.success && Array.isArray(response.data)) {
          // Map loan documents to match the expected format
          return response.data.map((doc) => ({
            ...doc,
            documentName: doc.documentName || doc.fileName,
            source: 'loan', // Mark as loan document
          }));
        }
        if (Array.isArray(response)) {
          return response.map((doc) => ({
            ...doc,
            documentName: doc.documentName || doc.fileName,
            source: 'loan',
          }));
        }
        if (response?.data && Array.isArray(response.data)) {
          return response.data.map((doc) => ({
            ...doc,
            documentName: doc.documentName || doc.fileName,
            source: 'loan',
          }));
        }
        return [];
      });

      allDocuments.push(...loanDocuments);
    }

    // 2. Fetch borrower financial documents
    try {
      const financialsResponse = await borrowerFinancialsApi.getByBorrowerId(borrowerId, {
        limit: 100, // Get all financial records
      });

      if (financialsResponse?.success && financialsResponse.data) {
        const financials = financialsResponse.data;

        // Fetch documents for each financial record
        const financialDocumentPromises = financials.map((financial) => borrowerFinancialDocumentsApi.getByBorrowerFinancial(financial.id).catch(() => ({ success: true, data: [] })));

        const financialDocumentResponses = await Promise.all(financialDocumentPromises);

        // Process borrower financial documents
        const financialDocuments = financialDocumentResponses.flatMap((response) => {
          if (response?.success && Array.isArray(response.data)) {
            return response.data.map((doc) => ({
              ...doc,
              documentName: doc.fileName, // Borrower financial docs use fileName
              loanId: null, // These aren't linked to loans
              source: 'borrowerFinancial', // Mark as borrower financial document
            }));
          }
          if (Array.isArray(response)) {
            return response.map((doc) => ({
              ...doc,
              documentName: doc.fileName,
              loanId: null,
              source: 'borrowerFinancial',
            }));
          }
          return [];
        });

        allDocuments.push(...financialDocuments);
      }
    } catch (financialError) {
      console.error('Error fetching borrower financial documents:', financialError);
      // Continue even if financial documents fail
    }

    // Remove duplicates based on document ID
    const uniqueDocuments = Array.from(
      new Map(allDocuments.map((doc) => [doc.id, doc])).values(),
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

export const fetchLoanWatchScoreBreakdowns = async (loans) => {
  if (!loans || loans.length === 0) {
    $loanWatchScoreBreakdowns.update({ breakdowns: {}, isLoading: false });
    return;
  }

  try {
    $loanWatchScoreBreakdowns.update({ isLoading: true });

    const breakdownPromises = loans.map((loan) => loansApi.getWatchScoreBreakdown(loan.id).catch((error) => {
      console.warn(`Failed to fetch Watch Score breakdown for loan ${loan.id}:`, error);
      return null;
    }));

    const breakdownResponses = await Promise.all(breakdownPromises);

    const breakdownsMap = {};
    loans.forEach((loan, index) => {
      const response = breakdownResponses[index];
      const breakdownData = response?.data || response;
      if (breakdownData) {
        breakdownsMap[loan.id] = breakdownData;
      }
    });

    $loanWatchScoreBreakdowns.update({ breakdowns: breakdownsMap, isLoading: false });
  } catch (error) {
    console.error('Failed to fetch loan Watch Score breakdowns:', error);
    $loanWatchScoreBreakdowns.update({ breakdowns: {}, isLoading: false });
  }
};
