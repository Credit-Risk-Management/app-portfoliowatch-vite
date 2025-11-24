/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect } from 'react';
import { Form, Row, Col } from 'react-bootstrap';
import UniversalModal from '@src/components/global/UniversalModal';
import UniversalInput from '@src/components/global/Inputs/UniversalInput';
import { $borrowersView, $borrowersForm, $borrowers, $relationshipManagers } from '@src/signals';
import { handleEditBorrower } from '../_helpers/borrowers.events';
import * as consts from '../_helpers/borrowers.consts';
import * as helpers from '../_helpers/borrowers.helpers';

const EditClientModal = () => {
  useEffect(() => {
    if ($borrowersView.value.showEditModal && $borrowers.value.selectedClient) {
      $borrowersForm.update($borrowers.value.selectedClient);
    }
  }, [$borrowersView.value.showEditModal]);

  const managers = $relationshipManagers.value?.list || [];
  // eslint-disable-next-line no-unused-vars
  const managerOptions = helpers.getManagerOptions(managers);

  const modalBody = (
    <Form>
      <Row>
        <Col md={12} className="mb-16">
          <UniversalInput
            label="Name"
            type="text"
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
            value={$borrowersForm.value.email}
            onChange={(e) => $borrowersForm.update({ email: e.target.value })}
          />
        </Col>
        <Col md={6} className="mb-16">
          <UniversalInput
            label="Phone"
            type="text"
            value={$borrowersForm.value.phone_number}
            onChange={(e) => $borrowersForm.update({ phone_number: e.target.value })}
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
    </Form>
  );

  return (
    <UniversalModal
      show={$borrowersView.value.showEditModal}
      onHide={() => {
        $borrowersView.update({ showEditModal: false });
        $borrowersForm.reset();
      }}
      headerText="Edit Borrower"
      body={modalBody}
      leftBtnText="Cancel"
      rightBtnText="Save Changes"
      rightBtnOnClick={handleEditBorrower}
    />
  );
};

export default EditClientModal;
