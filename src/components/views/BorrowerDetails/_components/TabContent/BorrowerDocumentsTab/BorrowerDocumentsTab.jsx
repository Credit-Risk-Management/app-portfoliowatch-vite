/* eslint-disable react-hooks/exhaustive-deps */
import { useMemo } from 'react';
import { faEye, faTrash } from '@fortawesome/free-solid-svg-icons';
import SignalTable from '@src/components/global/SignalTable';
import ContextMenu from '@src/components/global/ContextMenu';
import { $borrower } from '@src/consts/consts';
import { $documents, $documentsView } from '@src/signals';
import { useEffectAsync } from '@fyclabs/tools-fyc-react/utils';
import { TABLE_HEADERS as DOCUMENTS_TABLE_HEADERS } from '@src/components/views/Documents/_helpers/documents.consts';
import { formatFileSize, formatUploadDate, getLoanNumber } from '@src/components/views/Documents/_helpers/documents.helpers';
import { handleDownloadDocument } from '@src/components/views/Documents/_helpers/documents.events';
import { $borrowerDocumentsFilter, $borrowerDocumentsView } from '@src/components/views/BorrowerDetails/_helpers/borrowerDetail.consts';
import { fetchBorrowerDocuments } from '@src/components/views/BorrowerDetails/_helpers/borrowerDetail.resolvers';

export function BorrowerDocumentsTab() {
  const borrowerId = $borrower.value?.borrower?.id;

  useEffectAsync(async () => {
    if (borrowerId) {
      await fetchBorrowerDocuments(borrowerId);
    }
  }, [borrowerId]);
  const loans = $borrower.value?.borrower?.loans || [];
  const documentsList = $documents.value?.list || [];

  const documentsTableRows = useMemo(
    () => documentsList.map((doc) => ({
      ...doc,
      documentName: doc.documentName,
      loanNumber: getLoanNumber(doc.loanId, loans),
      uploadedAt: formatUploadDate(doc.uploadedAt),
      fileSize: formatFileSize(Number(doc.fileSize)),
      actions: (
        <ContextMenu
          items={[
            { label: 'View', icon: faEye, action: 'download' },
            { label: 'Delete', icon: faTrash, action: 'delete' },
          ]}
          onItemClick={(item) => {
            if (item.action === 'download') {
              if (doc.source === 'borrowerFinancial' || doc.storageUrl) {
                const link = document.createElement('a');
                link.href = doc.storageUrl;
                link.download = doc.documentName || doc.fileName || 'document';
                link.target = '_blank';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
              } else {
                handleDownloadDocument(doc.id, doc.documentName);
              }
            } else if (item.action === 'delete') {
              $documents.update({ selectedDocument: doc });
              $documentsView.update({ showDeleteModal: true });
            }
          }}
        />
      ),
    })),
    [documentsList, loans],
  );

  const isLoading = $borrowerDocumentsView.value?.isTableLoading && !documentsList.length;

  if (isLoading) {
    return (
      <div className="text-center py-32">
        <p className="text-info-100">Loading documents...</p>
      </div>
    );
  }

  if (documentsTableRows.length === 0) {
    return (
      <div className="text-center py-32">
        <p className="text-info-100 lead">No documents found for this borrower.</p>
      </div>
    );
  }

  return (
    <SignalTable
      $filter={$borrowerDocumentsFilter}
      $view={$borrowerDocumentsView}
      headers={DOCUMENTS_TABLE_HEADERS}
      rows={documentsTableRows}
      totalCount={$documents.value?.totalCount || 0}
      currentPage={$borrowerDocumentsFilter.value.page}
      itemsPerPageAmount={10}
    />
  );
}

export default BorrowerDocumentsTab;
