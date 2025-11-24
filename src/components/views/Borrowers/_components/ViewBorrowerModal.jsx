import { Row, Col } from 'react-bootstrap';
import UniversalModal from '@src/components/global/UniversalModal';
import { $borrowersView, $borrowers } from '@src/signals';

const ViewClientModal = () => (
  <UniversalModal
    show={$borrowersView.value.showViewModal}
    onHide={() => $borrowersView.update({ showViewModal: false })}
    headerText="Borrower Contact Information"
    leftBtnText="Close"
    rightBtnText=""
    rightBtnOnClick={() => { }}
    footerClass="justify-content-start"
  >
    {$borrowers.value.selectedBorrower ? (
      <div>
        <Row className="mb-16">
          <Col md={6}>
            <strong>Borrower ID:</strong> {$borrowers.value.selectedBorrower.client_id}
          </Col>
          <Col md={6}>
            <strong>Name:</strong> {$borrowers.value.selectedBorrower.name}
          </Col>
        </Row>
        <Row className="mb-16">
          <Col md={6}>
            <strong>Email:</strong> {$borrowers.value.selectedBorrower.email}
          </Col>
          <Col md={6}>
            <strong>Phone:</strong> {$borrowers.value.selectedBorrower.phone_number}
          </Col>
        </Row>
        <Row className="mb-16">
          <Col md={12}>
            <strong>Address:</strong> {$borrowers.value.selectedBorrower.street_address}, {$borrowers.value.selectedBorrower.city}, {$borrowers.value.selectedBorrower.state} {$borrowers.value.selectedBorrower.zip_code}
          </Col>
        </Row>
        <Row className="mb-16">
          <Col md={6}>
            <strong>KYC Status:</strong> {$borrowers.value.selectedBorrower.kyc_status}
          </Col>
          <Col md={6}>
            <strong>Risk Rating:</strong> {$borrowers.value.selectedBorrower.client_risk_rating}
          </Col>
        </Row>
      </div>
    ) : (
      <div>No borrower selected</div>
    )}
  </UniversalModal>
);

export default ViewClientModal;
