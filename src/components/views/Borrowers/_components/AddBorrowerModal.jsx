import { Form, Row, Col } from 'react-bootstrap';
import UniversalModal from '@src/components/global/UniversalModal';
import UniversalInput from '@src/components/global/Inputs/UniversalInput';
import SelectInput from '@src/components/global/Inputs/SelectInput';
import { $borrowersView, $borrowersForm, $relationshipManagers } from '@src/signals';
import { handleAddBorrower } from '../_helpers/borrowers.events';
import * as consts from '../_helpers/borrowers.consts';
import * as helpers from '../_helpers/borrowers.helpers';

const AddBorrowerModal = () => (
  <UniversalModal
    show={$borrowersView.value.showAddModal}
    onHide={() => {
      $borrowersView.update({ showAddModal: false });
      $borrowersForm.reset();
    }}
    closeButton
    headerText="Add New Borrower"
    leftBtnText="Cancel"
    rightBtnText="Add Borrower"
    rightBtnOnClick={handleAddBorrower}
    size="fullscreen"
  >
    <Form className="text-white align-items-start mt-16">

      <Row>
        <Col md={12} className="mb-16">
          <UniversalInput
            label="Name"
            type="text"
            name="name"
            signal={$borrowersForm}
            placeholder="Enter borrower name"
          />
        </Col>
      </Row>

      <Row>
        <Col md={4} className="mb-16">
          <UniversalInput
            label="Primary Contact"
            type="primarycontact"
            name="primaryContact"
            signal={$borrowersForm}
            placeholder="John Doe"
          />
        </Col>
        <Col md={4} className="mb-16">
          <UniversalInput
            label="Email"
            type="email"
            name="email"
            signal={$borrowersForm}
            placeholder="email@example.com"
          />
        </Col>
        <Col md={4} className="mb-16">
          <UniversalInput
            label="Phone Number"
            type="text"
            name="phoneNumber"
            signal={$borrowersForm}
            placeholder="555-123-4567"
          />
        </Col>
      </Row>

      <Row>
        <Col md={12} className="mb-16">
          <UniversalInput
            label="Street Address"
            type="text"
            name="streetAddress"
            signal={$borrowersForm}
            placeholder="123 Main St"
          />
        </Col>
      </Row>

      <Row>
        <Col md={4} className="mb-16">
          <UniversalInput
            label="City"
            type="text"
            name="city"
            signal={$borrowersForm}
            placeholder="City"
          />
        </Col>
        <Col md={4} className="mb-16">
          <UniversalInput
            label="State"
            type="text"
            name="state"
            signal={$borrowersForm}
            placeholder="State"
          />
        </Col>
        <Col md={4} className="mb-16">
          <UniversalInput
            label="Zip Code"
            type="text"
            name="zipCode"
            signal={$borrowersForm}
            placeholder="12345"
          />
        </Col>
      </Row>

      <Row>
        <Col md={6} className="mb-16">
          <Form.Label>Relationship Manager</Form.Label>
          <SelectInput
            name="relationshipManagerId"
            signal={$borrowersForm}
            placeholder="Select Relationship Manager"
            options={helpers.getManagerOptions($relationshipManagers.value?.list || [])}
            value={helpers.getManagerOptions($relationshipManagers.value?.list || []).find((opt) => opt.value === $borrowersForm.value.relationshipManagerId)?.value}
            onChange={(option) => $borrowersForm.update({ relationshipManagerId: option?.value })}
          />
        </Col>
        <Col md={6} className="mb-16">
          <Form.Label>Borrower Type</Form.Label>
          <SelectInput
            name="borrowerType"
            signal={$borrowersForm}
            options={consts.CLIENT_TYPE_OPTIONS}
            value={consts.CLIENT_TYPE_OPTIONS.find((opt) => opt.value === $borrowersForm.value.borrowerType)?.value}
            onChange={(option) => $borrowersForm.update({ borrowerType: option?.value })}
          />
        </Col>
      </Row>
    </Form>
  </UniversalModal>
);

export default AddBorrowerModal;
