/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect } from 'react';
import { Form, Row, Col } from 'react-bootstrap';
import UniversalModal from '@src/components/global/UniversalModal';
import UniversalInput from '@src/components/global/Inputs/UniversalInput';
import { $contactsView, $contactsForm, $contacts } from '@src/signals';
import { handleEditContact } from '../_helpers/contacts.events';

const EditContactModal = () => {
  useEffect(() => {
    if ($contactsView.value.showEditModal && $contacts.value.selectedContact) {
      $contactsForm.update($contacts.value.selectedContact);
    }
  }, [$contactsView.value.showEditModal]);

  return (
    <UniversalModal
      show={$contactsView.value.showEditModal}
      onHide={() => {
        $contactsView.update({ showEditModal: false });
        $contactsForm.reset();
      }}
      headerText="Edit Contact"
      leftBtnText="Cancel"
      rightBtnText="Save Changes"
      rightBtnOnClick={handleEditContact}
    >
      <Form>
        <Row>
          <Col md={6} className="mb-16">
            <UniversalInput
              label="First Name"
              type="text"
              placeholder="Enter first name"
              value={$contactsForm.value.firstName}
              name="firstName"
              signal={$contactsForm}
              required
            />
          </Col>
          <Col md={6} className="mb-16">
            <UniversalInput
              label="Last Name"
              type="text"
              placeholder="Enter last name"
              value={$contactsForm.value.lastName}
              name="lastName"
              signal={$contactsForm}
              required
            />
          </Col>
        </Row>

        <Row>
          <Col md={6} className="mb-16">
            <UniversalInput
              label="Email"
              type="email"
              placeholder="email@example.com"
              value={$contactsForm.value.email}
              name="email"
              signal={$contactsForm}
            />
          </Col>
          <Col md={6} className="mb-16">
            <UniversalInput
              label="Phone"
              type="text"
              placeholder="555-123-4567"
              value={$contactsForm.value.phone}
              name="phone"
              signal={$contactsForm}
            />
          </Col>
        </Row>

        <Row>
          <Col md={12} className="mb-16">
            <UniversalInput
              label="Title/Position"
              type="text"
              placeholder="e.g. CEO, CFO, Manager"
              value={$contactsForm.value.title}
              name="title"
              signal={$contactsForm}
            />
          </Col>
        </Row>

        <Row>
          <Col md={12} className="mb-16">
            <Form.Check
              type="checkbox"
              label="Set as Primary Contact"
              checked={$contactsForm.value.isPrimary}
              onChange={(e) => $contactsForm.update({ isPrimary: e.target.checked })}
              name="isPrimary"
            />
          </Col>
        </Row>
      </Form>
    </UniversalModal>
  );
};

export default EditContactModal;
