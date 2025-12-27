import { useEffectAsync } from '@fyclabs/tools-fyc-react/utils';
import { Container, Row, Col } from 'react-bootstrap';
import PageHeader from '@src/components/global/PageHeader';
import SignalTable from '@src/components/global/SignalTable';
import Search from '@src/components/global/Inputs/Search';
import {
  $documentsView,
  $documentsFilter,
  $documents,
  $loans,
} from '@src/signals';
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
  }));

  const handleRowClick = (row) => {
    handleDownloadDocument(row.id, row.documentName);
  };

  return (
    <Container className="py-16 py-md-24">
      <PageHeader
        title="Documents"
      />

      <Row className="mb-12 mb-md-16">
        <Col xs={12} md={12}>
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
        <Col xs={12}>
          <SignalTable
            $filter={$documentsFilter}
            $view={$documentsView}
            headers={consts.TABLE_HEADERS}
            rows={rows}
            totalCount={$documents.value.totalCount}
            currentPage={$documentsFilter.value.page}
            itemsPerPageAmount={10}
            className="shadow"
            onRowClick={handleRowClick}
          />
        </Col>
      </Row>
    </Container>
  );
};

export default Documents;
