import UniversalModal from '@src/components/global/UniversalModal';
import { $documentsView, $documents } from '@src/signals';
import { handleDeleteDocument } from '../_helpers/documents.events';

const DeleteDocumentModal = () => (
  <UniversalModal
    show={$documentsView.value.showDeleteModal}
    onHide={() => $documentsView.update({ showDeleteModal: false })}
    headerText="Delete Document"
    headerBgColor="danger"
    leftBtnText="Cancel"
    rightBtnText="Delete"
    rightBtnVariant="danger"
    rightBtnClass="text-white"
    rightBtnOnClick={() => handleDeleteDocument($documents.value.selectedDocument?.id)}
  >
    {$documents.value.selectedDocument ? (
      <div>
        <p>Are you sure you want to delete this document?</p>
        <p className="fw-700">{$documents.value.selectedDocument.documentName}</p>
        <p className="text-danger">This action cannot be undone.</p>
      </div>
    ) : null}
  </UniversalModal>
);

export default DeleteDocumentModal;

