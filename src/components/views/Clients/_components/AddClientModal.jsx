import { Form, Row, Col } from 'react-bootstrap';
import UniversalModal from '@src/components/global/UniversalModal';
import UniversalInput from '@src/components/global/Inputs/UniversalInput';
import { $clientsView, $clientsForm, $relationshipManagers } from '@src/signals';
import { handleAddClient } from '../_helpers/clients.events';
import * as consts from '../_helpers/clients.consts';
import * as helpers from '../_helpers/clients.helpers';

const AddClientModal = () => {
  const managers = $relationshipManagers.value?.list || [];
  const managerOptions = helpers.getManagerOptions(managers);

  const modalBody = (
    <Form>
      <Row>
        <Col md={6} className="mb-16">
          <UniversalInput
            label="Borrower ID"
            type="text"
            placeholder="CLT-2024-XXX"
            value={$clientsForm.value.client_id}
            onChange={(e) => $clientsForm.update({ client_id: e.target.value })}
          />
        </Col>
        <Col md={6} className="mb-16">
          <Form.Label>Borrower Type</Form.Label>
          <UniversalInput
            type="select"
            name="client_type"
            signal={$clientsForm}
            selectOptions={consts.CLIENT_TYPE_OPTIONS}
            value={consts.CLIENT_TYPE_OPTIONS.find((opt) => opt.value === $clientsForm.value.client_type)}
            customOnChange={(option) => $clientsForm.update({ client_type: option?.value })}
          />
        </Col>
      </Row>

      <Row>
        <Col md={12} className="mb-16">
          <UniversalInput
            label="Name"
            type="text"
            placeholder="Enter borrower name"
            value={$clientsForm.value.name}
            onChange={(e) => $clientsForm.update({ name: e.target.value })}
          />
        </Col>
      </Row>

      <Row>
        <Col md={6} className="mb-16">
          <UniversalInput
            label="Email"
            type="email"
            placeholder="email@example.com"
            value={$clientsForm.value.email}
            onChange={(e) => $clientsForm.update({ email: e.target.value })}
          />
        </Col>
        <Col md={6} className="mb-16">
          <UniversalInput
            label="Phone Number"
            type="text"
            placeholder="555-123-4567"
            value={$clientsForm.value.phone_number}
            onChange={(e) => $clientsForm.update({ phone_number: e.target.value })}
          />
        </Col>
      </Row>

      <Row>
        <Col md={12} className="mb-16">
          <UniversalInput
            label="Street Address"
            type="text"
            placeholder="123 Main St"
            value={$clientsForm.value.street_address}
            onChange={(e) => $clientsForm.update({ street_address: e.target.value })}
          />
        </Col>
      </Row>

      <Row>
        <Col md={4} className="mb-16">
          <UniversalInput
            label="City"
            type="text"
            placeholder="City"
            value={$clientsForm.value.city}
            onChange={(e) => $clientsForm.update({ city: e.target.value })}
          />
        </Col>
        <Col md={4} className="mb-16">
          <UniversalInput
            label="State"
            type="text"
            placeholder="State"
            value={$clientsForm.value.state}
            onChange={(e) => $clientsForm.update({ state: e.target.value })}
          />
        </Col>
        <Col md={4} className="mb-16">
          <UniversalInput
            label="Zip Code"
            type="text"
            placeholder="12345"
            value={$clientsForm.value.zip_code}
            onChange={(e) => $clientsForm.update({ zip_code: e.target.value })}
          />
        </Col>
      </Row>

      <Row>
        <Col md={6} className="mb-16">
          <Form.Label>KYC Status</Form.Label>
          <UniversalInput
            type="select"
            name="kyc_status"
            signal={$clientsForm}
            selectOptions={consts.KYC_STATUS_OPTIONS}
            value={consts.KYC_STATUS_OPTIONS.find((opt) => opt.value === $clientsForm.value.kyc_status)}
            customOnChange={(option) => $clientsForm.update({ kyc_status: option?.value })}
          />
        </Col>
        <Col md={6} className="mb-16">
          <Form.Label>Risk Rating</Form.Label>
          <UniversalInput
            type="select"
            name="client_risk_rating"
            signal={$clientsForm}
            selectOptions={consts.RISK_RATING_OPTIONS}
            value={consts.RISK_RATING_OPTIONS.find((opt) => opt.value === $clientsForm.value.client_risk_rating)}
            customOnChange={(option) => $clientsForm.update({ client_risk_rating: option?.value })}
          />
        </Col>
      </Row>

      <Row>
        <Col md={12} className="mb-16">
          <Form.Label>Relationship Manager</Form.Label>
          <UniversalInput
            type="select"
            name="relationship_manager_id"
            signal={$clientsForm}
            selectOptions={managerOptions}
            value={managerOptions.find((opt) => opt.value === $clientsForm.value.relationship_manager_id)}
            customOnChange={(option) => $clientsForm.update({ relationship_manager_id: option?.value })}
          />
        </Col>
      </Row>
    </Form>
  );

  return (
    <UniversalModal
      show={$clientsView.value.showAddModal}
      onHide={() => {
        $clientsView.update({ showAddModal: false });
        $clientsForm.reset();
      }}
      headerText="Add New Borrower"
      body={modalBody}
      leftBtnText="Cancel"
      rightBtnText="Add Borrower"
      rightBtnOnClick={handleAddClient}
    />
  );
};

export default AddClientModal;
