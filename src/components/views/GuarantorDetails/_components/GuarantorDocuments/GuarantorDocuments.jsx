/* eslint-disable react-hooks/exhaustive-deps */
import { useEffectAsync } from '@fyclabs/tools-fyc-react/utils';
import { useMemo } from 'react';
import SignalTable from '@src/components/global/SignalTable';
import ContextMenu from '@src/components/global/ContextMenu';
import { faEye, faTrash } from '@fortawesome/free-solid-svg-icons';
import { handleDownloadDocument } from '@src/components/views/Documents/_helpers/documents.events';
import { $guarantorDocumentsView, $guarantorDocumentsDetails, $guarantorDocumentsFilter, TABLE_HEADERS, formatFileSize, formatUploadDate } from './_helpers/guarantorDocuments.consts';
import { fetchGuarantorDocuments } from './_helpers/guarantorDocuments.resolvers';
import { handleDocumentRowClick } from './_helpers/guarantorDocuments.events';

export function GuarantorDocuments() {
  useEffectAsync(async () => {
    await fetchGuarantorDocuments();
  }, []);

  const documentsTableRows = useMemo(
    () => $guarantorDocumentsDetails.value?.list?.map((doc) => ({
      ...doc,
      fileName: doc.fileName,
      documentType: doc.documentType,
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
              if (doc.storageUrl) {
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
              $guarantorDocumentsDetails.update({ selectedDocument: doc });
              $guarantorDocumentsView.update({ showDeleteModal: true });
            }
          }}
        />
      ),
    })),
    [$guarantorDocumentsDetails.value?.list],
  );
  const isLoading = $guarantorDocumentsView.value?.isTableLoading && !$guarantorDocumentsDetails.value?.list?.length;

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
      $filter={$guarantorDocumentsFilter}
      $view={$guarantorDocumentsView}
      headers={TABLE_HEADERS}
      rows={documentsTableRows}
      className="shadow"
      totalCount={$guarantorDocumentsDetails.value?.totalCount || 0}
      currentPage={$guarantorDocumentsFilter.value.page}
      onRowClick={handleDocumentRowClick}
      itemsPerPageAmount={10}
    />
  );
}
export default GuarantorDocuments;
