import { Button, Col, Container, Row } from 'react-bootstrap';
import { $form } from '@src/signals';
import { handleBrowse, handleDrop, handleFileSelection } from './_helpers/fileUploader.events';

const FileUploader = ({
  name = 'files',
  acceptedTypes,
  signal = $form,
  hideNoFiles,
  onUpload,
}) => (
  <Container
    fluid
    onDragOver={e => e.preventDefault()}
    onDrop={e => handleDrop(e, signal, name, onUpload)}
    className="file-uploader "
  >
    <Row className="p-0 m-0">
      <input
        type="file"
        id="file-input"
        className="d-none"
        onChange={e => handleFileSelection(e, signal, name, onUpload)}
        multiple
        accept={acceptedTypes}
      />
      <Col className="p-0 m-0 d-flex align-items-center">
        <Button
          variant="primary-100"
          className={`
            ${signal.value?.[name]?.length ? 'mb-16' : ''}
            ${hideNoFiles ? '' : 'me-64'}
          `}
          onClick={handleBrowse}
        >
          Choose File
        </Button>
      </Col>
    </Row>
  </Container>
);

export default FileUploader;
