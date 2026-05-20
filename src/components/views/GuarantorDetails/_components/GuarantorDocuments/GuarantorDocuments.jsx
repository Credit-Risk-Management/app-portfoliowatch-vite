/* eslint-disable react-hooks/exhaustive-deps */
import { useEffectAsync } from '@fyclabs/tools-fyc-react/utils';
import { useMemo } from 'react';
import SignalTable from '@src/components/global/SignalTable';
import ContextMenu from '@src/components/global/ContextMenu';
import { faEye, faTrash } from '@fortawesome/free-solid-svg-icons';
import {
  formatFileSize,
  formatUploadDate,
  formatFinancialDocumentType,
  handleDownloadDocument,
  triggerBrowserFileDownload,
} from '@src/utils/documents.utils';
import { fetchGuarantorDocuments } from './_helpers/guarantorDocuments.resolvers';
import { $guarantorDocumentsDetails, $guarantorDocumentsView, $guarantorDocumentsFilter, GUARANTOR_DOCUMENTS_TABLE_HEADERS } from './_helpers/guarantorDocuments.consts';
import { handleDocumentRowClick } from './_helpers/guarantorDocuments.events';

export function GuarantorDocuments() {
  useEffectAsync(async () => {
    await fetchGuarantorDocuments();
  }, []);

  const documentsTableRows = useMemo(
    () => $guarantorDocumentsDetails.value?.list?.map((doc) => ({
      ...doc,
      fileName: doc.fileName,
      documentType: formatFinancialDocumentType(doc.documentType),
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
                triggerBrowserFileDownload(doc.storageUrl, doc.documentName || doc.fileName || 'document');
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
      headers={GUARANTOR_DOCUMENTS_TABLE_HEADERS}
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
