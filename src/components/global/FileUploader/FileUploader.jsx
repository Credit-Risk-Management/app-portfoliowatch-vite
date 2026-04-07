import { useState, useCallback } from 'react';
import { Button, Col, Container, Row } from 'react-bootstrap';
import { $form } from '@src/signals';
import { handleBrowse, handleDrop, handleFileSelection } from './_helpers/fileUploader.events';

const FileUploader = ({
  name = 'files',
  acceptedTypes,
  signal = $form,
  hideNoFiles,
  onUpload,
  id = 'file-input',
  /** `'dropzone'` — centered layout, dashed border, drag-over highlight (still uses same signal + handlers). */
  variant = 'default',
  children,
}) => {
  const [dragDepth, setDragDepth] = useState(0);
  const isDragOver = variant === 'dropzone' && dragDepth > 0;

  const onDropWrapped = useCallback((e) => {
    if (variant === 'dropzone') {
      setDragDepth(0);
    }
    handleDrop(e, signal, name, onUpload);
  }, [variant, signal, name, onUpload]);

  const onDragEnter = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragDepth((d) => d + 1);
  }, []);

  const onDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragDepth((d) => Math.max(0, d - 1));
  }, []);

  const dropzoneClass = variant === 'dropzone'
    ? [
      'file-uploader',
      'file-uploader--dropzone',
      'w-100',
      'px-24',
      'py-32',
      'text-center',
      'border',
      isDragOver ? 'border-primary border-2 bg-primary-50' : 'border-dashed border-grey-400 bg-light-100',
    ].join(' ')
    : 'file-uploader';

  return (
    <Container
      fluid
      className={dropzoneClass}
      style={variant === 'dropzone' ? { minHeight: '12rem' } : undefined}
      onDragOver={(e) => e.preventDefault()}
      onDragEnter={variant === 'dropzone' ? onDragEnter : undefined}
      onDragLeave={variant === 'dropzone' ? onDragLeave : undefined}
      onDrop={onDropWrapped}
    >
      <Row className={`p-0 m-0 ${variant === 'dropzone' ? 'justify-content-center' : ''}`}>
        <input
          type="file"
          id={id}
          className="d-none"
          onChange={(e) => handleFileSelection(e, signal, name, onUpload)}
          multiple
          accept={acceptedTypes}
        />
        <Col
          xs={12}
          className={`p-0 m-0 d-flex ${
            variant === 'dropzone'
              ? 'flex-column align-items-center justify-content-center'
              : 'align-items-center'
          }`}
        >
          {variant === 'dropzone' && children ? (
            <div className="mb-16 w-100">{children}</div>
          ) : null}
          <Button
            variant="primary-100"
            className={[
              'rounded-pill',
              signal.value?.[name]?.length ? 'mb-12 mb-md-16' : '',
              !hideNoFiles && variant === 'default' ? 'me-48 me-md-64' : '',
            ].filter(Boolean).join(' ')}
            onClick={() => handleBrowse(id)}
          >
            Choose File
          </Button>
          {variant === 'dropzone' && (
            <p className="text-grey-600 small mt-16 mb-0">
              or drag and drop your PDF here
            </p>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default FileUploader;
