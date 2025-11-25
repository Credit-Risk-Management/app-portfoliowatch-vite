import { useEffectAsync } from '@fyclabs/tools-fyc-react/utils';
import { Container, Row, Col } from 'react-bootstrap';
import { faTrash, faEye } from '@fortawesome/free-solid-svg-icons';
import PageHeader from '@src/components/global/PageHeader';
import SignalTable from '@src/components/global/SignalTable';
import Search from '@src/components/global/Inputs/Search';
import ContextMenu from '@src/components/global/ContextMenu';
import {
  $documentsView,
  $documentsFilter,
  $documents,
  $loans,
} from '@src/signals';
import DeleteDocumentModal from './_components/DeleteDocumentModal';
import * as consts from './_helpers/documents.consts';
import * as resolvers from './_helpers/documents.resolvers';
import * as helpers from './_helpers/documents.helpers';
import { handleDocumentFilterChange, handleDownloadDocument } from './_helpers/documents.events';

const Documents = () => {
  useEffectAsync(async () => {
    await resolvers.loadReferenceData();
    await resolvers.fetchAndSetDocumentData();
  }, []);

  const rows = $documents.value.list.map((document) => ({
    ...document,
    documentName: document.documentName,
    loanNumber: helpers.getLoanNumber(document.loanId, $loans.value.list),
    uploadedAt: helpers.formatUploadDate(document.uploadedAt),
    fileSize: helpers.formatFileSize(Number(document.fileSize)),
    actions: () => (
      <ContextMenu
        items={[
          { label: 'View', icon: faEye, action: 'download' },
          { label: 'Delete', icon: faTrash, action: 'delete' },
        ]}
        onItemClick={(item) => {
          if (item.action === 'download') {
            handleDownloadDocument(document.id, document.documentName);
          } else if (item.action === 'delete') {
            $documents.update({ selectedDocument: document });
            $documentsView.update({ showDeleteModal: true });
          }
        }}
      />
    ),
  }));

  return (
    <>
      <Container className="py-24">
        <PageHeader
          title="Documents"
        />

        <Row className="mb-16">
          <Col md={12}>
            <Search
              placeholder="Search by document name or loan number..."
              value={$documentsFilter.value.searchTerm}
              onChange={handleDocumentFilterChange}
              signal={$documentsFilter}
              name="searchTerm"
            />
          </Col>
        </Row>

        <Row>
          <Col>
            <SignalTable
              $filter={$documentsFilter}
              $view={$documentsView}
              headers={consts.TABLE_HEADERS}
              rows={rows}
              totalCount={$documents.value.totalCount}
              currentPage={$documentsFilter.value.page}
              itemsPerPageAmount={10}
              className="shadow"
            />
          </Col>
        </Row>
      </Container>
      <DeleteDocumentModal />
    </>
  );
};

export default Documents;
