import { Row, Col } from 'react-bootstrap';
import UniversalModal from '@src/components/global/UniversalModal';
import { $clientsView, $clients } from '@src/signals';

const ViewClientModal = () => {
  const client = $clients.value.selectedClient;

  const modalBody = client ? (
    <div>
      <Row className="mb-16">
        <Col md={6}>
          <strong>Borrower ID:</strong> {client.client_id}
        </Col>
        <Col md={6}>
          <strong>Name:</strong> {client.name}
        </Col>
      </Row>
      <Row className="mb-16">
        <Col md={6}>
          <strong>Email:</strong> {client.email}
        </Col>
        <Col md={6}>
          <strong>Phone:</strong> {client.phone_number}
        </Col>
      </Row>
      <Row className="mb-16">
        <Col md={12}>
          <strong>Address:</strong> {client.street_address}, {client.city}, {client.state} {client.zip_code}
        </Col>
      </Row>
      <Row className="mb-16">
        <Col md={6}>
          <strong>KYC Status:</strong> {client.kyc_status}
        </Col>
        <Col md={6}>
          <strong>Risk Rating:</strong> {client.client_risk_rating}
        </Col>
      </Row>
    </div>
  ) : null;

  return (
    <UniversalModal
      show={$clientsView.value.showViewModal}
      onHide={() => $clientsView.update({ showViewModal: false })}
      headerText="Borrower Contact Information"
      body={modalBody}
      leftBtnText="Close"
      rightBtnText=""
      rightBtnOnClick={() => {}}
      footerClass="justify-content-start"
    />
  );
};

export default ViewClientModal;
