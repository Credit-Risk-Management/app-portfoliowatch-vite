/* eslint-disable react-hooks/exhaustive-deps */
import { useMemo } from 'react';
import { Row, Col } from 'react-bootstrap';
import { faEye, faTrash } from '@fortawesome/free-solid-svg-icons';
import SignalTable from '@src/components/global/SignalTable';
import ContextMenu from '@src/components/global/ContextMenu';
import SelectInput from '@src/components/global/Inputs/SelectInput';
import { $borrower, PAGE_LIMIT_OPTIONS, resolvePageLimit } from '@src/consts/consts';
import { $documents, $documentsView } from '@src/signals';
import { useEffectAsync } from '@fyclabs/tools-fyc-react/utils';
import { formatFileSize, formatUploadDate, getLoanNumber, DOCUMENTS_TABLE_HEADERS, handleDownloadDocument } from '@src/utils/documents.utils';
import { $borrowerDocumentsFilter, $borrowerDocumentsView } from '@src/components/views/BorrowerDetails/_helpers/borrowerDetail.consts';
import { fetchBorrowerDocuments } from '@src/components/views/BorrowerDetails/_helpers/borrowerDetail.resolvers';

export function BorrowerDocumentsTab() {
  const borrowerId = $borrower.value?.borrower?.id;

  useEffectAsync(async () => {
    if (borrowerId) {
      await fetchBorrowerDocuments(borrowerId);
    }
  }, [borrowerId]);

  useEffectAsync(async () => {
    const documentsList = $documents.value?.list || [];
    if (!documentsList.length) return;

    const page = $borrowerDocumentsFilter.value.page || 1;
    const pageLimit = resolvePageLimit($borrowerDocumentsFilter.value.limit);
    const pagesCount = Math.max(1, Math.ceil(documentsList.length / pageLimit));

    if (page > pagesCount) {
      $borrowerDocumentsFilter.update({ page: pagesCount });
    }
  }, [
    borrowerId,
    $documents.value?.list?.length,
    $borrowerDocumentsFilter.value.page,
    $borrowerDocumentsFilter.value.limit,
  ]);

  const loans = $borrower.value?.borrower?.loans || [];
  const documentsList = $documents.value?.list || [];
  const pageLimit = resolvePageLimit($borrowerDocumentsFilter.value.limit);
  const filterPage = $borrowerDocumentsFilter.value.page || 1;
  const pagesCount = Math.max(1, Math.ceil(documentsList.length / pageLimit));
  const currentPage = Math.min(filterPage, pagesCount);
  const paginatedDocuments = documentsList.slice(
    (currentPage - 1) * pageLimit,
    currentPage * pageLimit,
  );

  const documentsTableRows = useMemo(
    () => paginatedDocuments.map((doc) => ({
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
    [paginatedDocuments, loans],
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
    <div>
      <Row className="mb-8 align-items-center justify-content-end">
        <Col xs="auto" className="d-flex align-items-center gap-2">
          <span className="text-info-100 text-nowrap small me-4">Rows per page</span>
          <SelectInput
            options={PAGE_LIMIT_OPTIONS}
            value={$borrowerDocumentsFilter.value.limit}
            onChange={(selectedOption) => {
              const limit = resolvePageLimit(selectedOption?.value);
              $borrowerDocumentsFilter.update({ limit, page: 1 });
            }}
            placeholder="Limit"
            signal={$borrowerDocumentsFilter}
            name="limit"
            isMulti={false}
            isSearchable={false}
            notClearable
          />
        </Col>
      </Row>
      <SignalTable
        $filter={$borrowerDocumentsFilter}
        $view={$borrowerDocumentsView}
        headers={DOCUMENTS_TABLE_HEADERS}
        rows={documentsTableRows}
        totalCount={documentsList.length}
        currentPage={currentPage}
        currentPageItemsCount={paginatedDocuments.length}
        itemsPerPageAmount={pageLimit}
      />
    </div>
  );
}

export default BorrowerDocumentsTab;
