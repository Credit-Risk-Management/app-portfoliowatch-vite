import { useState } from 'react';
import { Form, Row, Col } from 'react-bootstrap';
import UniversalModal from '@src/components/global/UniversalModal';
import UniversalInput from '@src/components/global/Inputs/UniversalInput';
import {
  $borrowerGuarantorModal,
  $borrowerGuarantorModalForm,
} from '../../../../_helpers/borrowerDetail.consts';
import * as guarantorModalEvents from '../_helpers/guarantorModal.events';
import * as guarantorModalResolvers from '../_helpers/guarantorModal.resolvers';

const AddEditGuarantorModal = () => {
  const [, setFormVersion] = useState(0);
  const bumpForm = () => setFormVersion((v) => v + 1);

  const { show, editingGuarantorId, isSubmitting } = $borrowerGuarantorModal.value;
  const form = $borrowerGuarantorModalForm.value;
  const headerText = editingGuarantorId ? 'Edit guarantor' : 'Add guarantor';
  const nameVal = form.name?.trim() || '';

  const makeChangeHandler = (field) => (e) => {
    $borrowerGuarantorModalForm.update({ [field]: e.target.value });
    bumpForm();
  };

  return (
    <UniversalModal
      show={show}
      onHide={guarantorModalEvents.closeBorrowerGuarantorModal}
      closeButton
      headerText={headerText}
      leftBtnText="Cancel"
      leftBtnOnClick={guarantorModalEvents.closeBorrowerGuarantorModal}
      rightBtnText={editingGuarantorId ? 'Save changes' : 'Add guarantor'}
      rightBtnOnClick={() => guarantorModalResolvers.submitBorrowerGuarantorModal()}
      rightButtonDisabled={isSubmitting || !nameVal}
      size="lg"
    >
      <Form className="text-white align-items-start mt-8">
        <Row>
          <Col md={12} className="mb-16">
            <UniversalInput
              label="Name"
              type="text"
              name="name"
              signal={$borrowerGuarantorModalForm}
              placeholder="Full name"
              customOnChange={makeChangeHandler('name')}
            />
          </Col>
        </Row>
        <Row>
          <Col md={6} className="mb-16">
            <UniversalInput
              label="Email"
              type="email"
              name="email"
              signal={$borrowerGuarantorModalForm}
              placeholder="email@example.com"
              customOnChange={makeChangeHandler('email')}
            />
          </Col>
          <Col md={6} className="mb-16">
            <UniversalInput
              label="Phone"
              type="text"
              name="phone"
              signal={$borrowerGuarantorModalForm}
              placeholder="Phone number"
              customOnChange={makeChangeHandler('phone')}
            />
          </Col>
        </Row>
      </Form>
    </UniversalModal>
  );
};

export default AddEditGuarantorModal;
