import { Modal, Button, Container } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';

const UniversalModal = ({
  show,
  onHide,
  headerText,
  closeButton,
  leftBtnClass = 'text-decoration-none bg-grey-200 border-grey-900',
  leftBtnText = 'Close',
  leftBtnOnClick = onHide,
  rightBtnClass = 'bg-success-200 border-success-900 text-success-900',
  rightBtnText = 'Save',
  rightButtonDisabled = false,
  rightBtnOnClick,
  footerClass,
  size = 'lg',
  children = null,
}) => {
  const isFullscreen = size === 'fullscreen';

  return (
    <Modal
      show={show}
      onHide={onHide}
      centered={!isFullscreen}
      size={isFullscreen ? undefined : size}
      dialogClassName={isFullscreen ? 'modal-fullscreen-custom' : ''}
      className={isFullscreen ? '' : 'pt-32 text-info-200'}
    >
      <Modal.Header
        className={`bg-info-900 lead border-0 d-flex justify-content-between ${isFullscreen ? 'modal-fullscreen-header pt-16 border-bottom border-info' : ''}`}
      >
        <div className="lead text-info-300 fw-500">
          {headerText}
        </div>
        {closeButton && (
          <FontAwesomeIcon role="button" icon={faTimes} onClick={onHide} size="lg" className="text-info-300" />
        )}
      </Modal.Header>
      <Modal.Body className={`bg-info-900 ${isFullscreen ? 'modal-fullscreen-body pt-16' : ''}`}>
        {size === 'fullscreen' ? (
          <Container>
            {children}
          </Container>
        ) : (
          children
        )}
      </Modal.Body>
      <Modal.Footer className={`border-info border-top bg-info-900 shadow-sm border-0 ${isFullscreen ? 'modal-fullscreen-footer border-info border-top bg-info-900 shadow-sm border-0' : ''} ${footerClass}`}>
        <Button
          className={leftBtnClass}
          onClick={leftBtnOnClick}
        >
          {leftBtnText}
        </Button>
        {rightBtnText !== null && (
          <Button
            className={rightBtnClass}
            onClick={rightBtnOnClick}
            disabled={rightButtonDisabled}
          >
            {rightBtnText}
          </Button>
        )}
      </Modal.Footer>
    </Modal>
  );
};

export default UniversalModal;
