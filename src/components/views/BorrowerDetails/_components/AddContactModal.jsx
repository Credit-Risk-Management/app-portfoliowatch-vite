import { Form, Row, Col } from 'react-bootstrap';
import UniversalModal from '@src/components/global/UniversalModal';
import UniversalInput from '@src/components/global/Inputs/UniversalInput';
import { $contactsView, $contactsForm } from '@src/signals';
import { handleAddContact } from '../_helpers/contacts.events';

const AddContactModal = () => (
  <UniversalModal
    show={$contactsView.value.showAddModal}
    onHide={() => {
      $contactsView.update({ showAddModal: false });
      $contactsForm.reset();
    }}
    headerText="Add New Contact"
    leftBtnText="Cancel"
    rightBtnText="Add Contact"
    rightBtnOnClick={handleAddContact}
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
            required
            signal={$contactsForm}
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
            signal={$contactsForm}
            name="email"
          />
        </Col>
        <Col md={6} className="mb-16">
          <UniversalInput
            label="Phone"
            type="text"
            placeholder="555-123-4567"
            value={$contactsForm.value.phone}
            signal={$contactsForm}
            name="phone"
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
            signal={$contactsForm}
            name="title"
          />
        </Col>
      </Row>

      <Row>
        <Col md={12} className="mb-16">
          <Form.Check
            type="checkbox"
            label="Set as Primary Contact"
            checked={$contactsForm.value.isPrimary}
            name="isPrimary"
          />
        </Col>
      </Row>
    </Form>
  </UniversalModal>
);

export default AddContactModal;
