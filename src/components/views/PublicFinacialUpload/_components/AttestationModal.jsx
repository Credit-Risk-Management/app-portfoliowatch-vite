import { Modal, Button } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShieldAlt } from '@fortawesome/free-solid-svg-icons';

const AttestationModal = ({
  show,
  attestationText,
  isSubmitting,
  onClose,
  onConfirm,
}) => (
  <Modal show={show} onHide={onClose} centered size="lg">
    <Modal.Header closeButton className="border-bottom border-grey-200 px-24 py-20">
      <Modal.Title className="d-flex align-items-center gap-8 fw-bold fs-5">
        <FontAwesomeIcon icon={faShieldAlt} className="text-dark" />
        Certification &amp; Attestation
      </Modal.Title>
    </Modal.Header>
    <Modal.Body className="px-24 py-20">
      <p className="text-grey-700 mb-0 lh-base" style={{ fontSize: '0.9375rem' }}>
        {attestationText}
      </p>
    </Modal.Body>
    <Modal.Footer className="border-top border-grey-200 px-24 py-16 d-flex justify-content-end gap-8">
      <Button variant="secondary" className="text-dark rounded-2" onClick={onClose} disabled={isSubmitting}>
        Cancel
      </Button>
      <Button
        className="rounded-2 bg-dark text-white"
        onClick={onConfirm}
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Submitting…' : 'I certify — Submit'}
      </Button>
    </Modal.Footer>
  </Modal>
);

export default AttestationModal;
