import { useEffect } from 'react';
import { Form, Row, Col } from 'react-bootstrap';
import UniversalModal from '@src/components/global/UniversalModal';
import UniversalInput from '@src/components/global/Inputs/UniversalInput';
import { $clientsView, $clientsForm, $clients, $relationshipManagers } from '@src/signals';
import { handleEditClient } from '../_helpers/clients.events';
import * as consts from '../_helpers/clients.consts';
import * as helpers from '../_helpers/clients.helpers';

const EditClientModal = () => {
  useEffect(() => {
    if ($clientsView.value.showEditModal && $clients.value.selectedClient) {
      $clientsForm.update($clients.value.selectedClient);
    }
  }, [$clientsView.value.showEditModal]);

  const managers = $relationshipManagers.value?.list || [];
  const managerOptions = helpers.getManagerOptions(managers);

  const modalBody = (
    <Form>
      <Row>
        <Col md={12} className="mb-16">
          <UniversalInput
            label="Name"
            type="text"
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
            value={$clientsForm.value.email}
            onChange={(e) => $clientsForm.update({ email: e.target.value })}
          />
        </Col>
        <Col md={6} className="mb-16">
          <UniversalInput
            label="Phone"
            type="text"
            value={$clientsForm.value.phone_number}
            onChange={(e) => $clientsForm.update({ phone_number: e.target.value })}
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
    </Form>
  );

  return (
    <UniversalModal
      show={$clientsView.value.showEditModal}
      onHide={() => {
        $clientsView.update({ showEditModal: false });
        $clientsForm.reset();
      }}
      headerText="Edit Borrower"
      body={modalBody}
      leftBtnText="Cancel"
      rightBtnText="Save Changes"
      rightBtnOnClick={handleEditClient}
    />
  );
};

export default EditClientModal;
