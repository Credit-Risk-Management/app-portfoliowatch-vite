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
    headerText="Add New Borrower"
    leftBtnText="Cancel"
    rightBtnText="Add Borrower"
    rightBtnOnClick={handleAddBorrower}
  >
    <Form>
      <Row>
        <Col md={6} className="mb-16">
          <UniversalInput
            label="Borrower ID"
            type="text"
            placeholder="CLT-2024-XXX"
            value={$borrowersForm.value.borrowerId}
            onChange={(e) => $borrowersForm.update({ borrowerId: e.target.value })}
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

      <Row>
        <Col md={12} className="mb-16">
          <UniversalInput
            label="Name"
            type="text"
            placeholder="Enter borrower name"
            value={$borrowersForm.value.name}
            onChange={(e) => $borrowersForm.update({ name: e.target.value })}
          />
        </Col>
      </Row>

      <Row>
        <Col md={6} className="mb-16">
          <UniversalInput
            label="Email"
            type="email"
            placeholder="email@example.com"
            value={$borrowersForm.value.email}
            onChange={(e) => $borrowersForm.update({ email: e.target.value })}
          />
        </Col>
        <Col md={6} className="mb-16">
          <UniversalInput
            label="Phone Number"
            type="text"
            placeholder="555-123-4567"
            value={$borrowersForm.value.phoneNumber}
            onChange={(e) => $borrowersForm.update({ phoneNumber: e.target.value })}
          />
        </Col>
      </Row>

      <Row>
        <Col md={12} className="mb-16">
          <UniversalInput
            label="Street Address"
            type="text"
            placeholder="123 Main St"
            value={$borrowersForm.value.streetAddress}
            onChange={(e) => $borrowersForm.update({ streetAddress: e.target.value })}
          />
        </Col>
      </Row>

      <Row>
        <Col md={4} className="mb-16">
          <UniversalInput
            label="City"
            type="text"
            placeholder="City"
            value={$borrowersForm.value.city}
            onChange={(e) => $borrowersForm.update({ city: e.target.value })}
          />
        </Col>
        <Col md={4} className="mb-16">
          <UniversalInput
            label="State"
            type="text"
            placeholder="State"
            value={$borrowersForm.value.state}
            onChange={(e) => $borrowersForm.update({ state: e.target.value })}
          />
        </Col>
        <Col md={4} className="mb-16">
          <UniversalInput
            label="Zip Code"
            type="text"
            placeholder="12345"
            value={$borrowersForm.value.zipCode}
            onChange={(e) => $borrowersForm.update({ zipCode: e.target.value })}
          />
        </Col>
      </Row>

      <Row>
        <Col md={6} className="mb-16">
          <Form.Label>Risk Rating</Form.Label>
          <SelectInput
            name="borrowerRiskRating"
            signal={$borrowersForm}
            options={consts.RISK_RATING_OPTIONS}
            value={consts.RISK_RATING_OPTIONS.find((opt) => opt.value === $borrowersForm.value.borrowerRiskRating)?.value}
            onChange={(option) => $borrowersForm.update({ borrowerRiskRating: option?.value })}
          />
        </Col>
      </Row>

      <Row>
        <Col md={12} className="mb-16">
          <Form.Label>Relationship Manager</Form.Label>
          <SelectInput
            name="relationshipManagerId"
            signal={$borrowersForm}
            options={helpers.getManagerOptions($relationshipManagers.value?.list || [])}
            value={helpers.getManagerOptions($relationshipManagers.value?.list || []).find((opt) => opt.value === $borrowersForm.value.relationshipManagerId)?.value}
            onChange={(option) => $borrowersForm.update({ relationshipManagerId: option?.value })}
          />
        </Col>
      </Row>
    </Form>
  </UniversalModal>
);

export default AddBorrowerModal;
