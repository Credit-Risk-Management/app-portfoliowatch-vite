import { Form, Row, Col } from 'react-bootstrap';
import UniversalModal from '@src/components/global/UniversalModal';
import UniversalInput from '@src/components/global/Inputs/UniversalInput';
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
            value={$borrowersForm.value.client_id}
            onChange={(e) => $borrowersForm.update({ client_id: e.target.value })}
          />
        </Col>
        <Col md={6} className="mb-16">
          <Form.Label>Borrower Type</Form.Label>
          <UniversalInput
            type="select"
            name="client_type"
            signal={$borrowersForm}
            selectOptions={consts.CLIENT_TYPE_OPTIONS}
            value={consts.CLIENT_TYPE_OPTIONS.find((opt) => opt.value === $borrowersForm.value.client_type)}
            customOnChange={(option) => $borrowersForm.update({ client_type: option?.value })}
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
            value={$borrowersForm.value.phone_number}
            onChange={(e) => $borrowersForm.update({ phone_number: e.target.value })}
          />
        </Col>
      </Row>

      <Row>
        <Col md={12} className="mb-16">
          <UniversalInput
            label="Street Address"
            type="text"
            placeholder="123 Main St"
            value={$borrowersForm.value.street_address}
            onChange={(e) => $borrowersForm.update({ street_address: e.target.value })}
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
            value={$borrowersForm.value.zip_code}
            onChange={(e) => $borrowersForm.update({ zip_code: e.target.value })}
          />
        </Col>
      </Row>

      <Row>
        <Col md={6} className="mb-16">
          <Form.Label>KYC Status</Form.Label>
          <UniversalInput
            type="select"
            name="kyc_status"
            signal={$borrowersForm}
            selectOptions={consts.KYC_STATUS_OPTIONS}
            value={consts.KYC_STATUS_OPTIONS.find((opt) => opt.value === $borrowersForm.value.kyc_status)}
            customOnChange={(option) => $borrowersForm.update({ kyc_status: option?.value })}
          />
        </Col>
        <Col md={6} className="mb-16">
          <Form.Label>Risk Rating</Form.Label>
          <UniversalInput
            type="select"
            name="client_risk_rating"
            signal={$borrowersForm}
            selectOptions={consts.RISK_RATING_OPTIONS}
            value={consts.RISK_RATING_OPTIONS.find((opt) => opt.value === $borrowersForm.value.client_risk_rating)}
            customOnChange={(option) => $borrowersForm.update({ client_risk_rating: option?.value })}
          />
        </Col>
      </Row>

      <Row>
        <Col md={12} className="mb-16">
          <Form.Label>Relationship Manager</Form.Label>
          <UniversalInput
            type="select"
            name="relationship_manager_id"
            signal={$borrowersForm}
            selectOptions={helpers.getManagerOptions($relationshipManagers.value?.list || [])}
            value={helpers.getManagerOptions($relationshipManagers.value?.list || []).find((opt) => opt.value === $borrowersForm.value.relationship_manager_id)}
            customOnChange={(option) => $borrowersForm.update({ relationship_manager_id: option?.value })}
          />
        </Col>
      </Row>
    </Form>
  </UniversalModal>
);

export default AddBorrowerModal;
