import { Alert, Row, Col } from 'react-bootstrap';
import UniversalModal from '@src/components/global/UniversalModal';
import UniversalInput from '@src/components/global/Inputs/UniversalInput';
import { $addGuarantorView, $addGuarantorForm, $addGuarantorModalState } from './addGuarantorModal.signals';
import { handleClose, handleSubmit } from './addGuarantorModal.handlers';

const AddGuarantorModal = () => {
  const { showModal } = $addGuarantorView.value;
  const { isSubmitting, error } = $addGuarantorModalState.value;

  return (
    <UniversalModal
      show={showModal}
      onHide={handleClose}
      headerText="Add Guarantor"
      leftBtnText="Cancel"
      rightBtnText={isSubmitting ? 'Adding...' : 'Add Guarantor'}
      rightBtnOnClick={handleSubmit}
      rightButtonDisabled={isSubmitting}
      size="lg"
      closeButton
    >
      <div className="pt-16">
        {error && (
          <Alert variant="danger" dismissible onClose={() => $addGuarantorModalState.update({ error: null })}>
            {error}
          </Alert>
        )}

        <Row className="mb-12">
          <Col xs={12} md={6}>
            <UniversalInput
              label="Name"
              labelClassName="text-info-100"
              type="text"
              placeholder="Full name"
              name="name"
              signal={$addGuarantorForm}
              required
            />
          </Col>
        </Row>

        <Row className="mb-12">
          <Col xs={12} md={6}>
            <UniversalInput
              label="Email (Optional)"
              labelClassName="text-info-100"
              type="email"
              placeholder="email@example.com"
              name="email"
              signal={$addGuarantorForm}
            />
          </Col>
        </Row>

        <Row>
          <Col xs={12} md={6}>
            <UniversalInput
              label="Phone (Optional)"
              labelClassName="text-info-100"
              type="tel"
              placeholder="(555) 123-4567"
              name="phone"
              signal={$addGuarantorForm}
            />
          </Col>
        </Row>
      </div>
    </UniversalModal>
  );
};

export default AddGuarantorModal;
