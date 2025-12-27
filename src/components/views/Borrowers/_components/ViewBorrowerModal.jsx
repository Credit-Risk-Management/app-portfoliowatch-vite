/* eslint-disable no-nested-ternary */
/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect } from 'react';
import { Row, Col, Table, Badge } from 'react-bootstrap';
import { faStar } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import UniversalModal from '@src/components/global/UniversalModal';
import { $borrowersView, $borrowers, $contacts } from '@src/signals';
import * as contactsHelpers from '../_helpers/contacts.helpers';
import * as contactsResolvers from '../_helpers/contacts.resolvers';

const ViewClientModal = () => {
  useEffect(() => {
    if ($borrowersView.value.showViewModal && $borrowers.value.selectedBorrower?.id) {
      contactsResolvers.fetchAndSetContactsData($borrowers.value.selectedBorrower.id);
    }
  }, [$borrowersView.value.showViewModal]);

  return (
    <UniversalModal
      show={$borrowersView.value.showViewModal}
      onHide={() => {
        $borrowersView.update({ showViewModal: false });
        $contacts.update({ list: [] });
      }}
      headerText="Borrower Contact Information"
      leftBtnText="Close"
      rightBtnText=""
      rightBtnOnClick={() => { }}
      footerClass="justify-content-start"
      size="lg"
    >
      {$borrowers.value.selectedBorrower ? (
        <div>
          <Row className="mb-16">
            <Col md={6}>
              <strong>Borrower ID:</strong> {$borrowers.value.selectedBorrower.borrowerId}
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
              <strong>Phone:</strong> {$borrowers.value.selectedBorrower.phoneNumber}
            </Col>
          </Row>
          <Row className="mb-16">
            <Col md={12}>
              <strong>Address:</strong> {$borrowers.value.selectedBorrower.streetAddress}, {$borrowers.value.selectedBorrower.city}, {$borrowers.value.selectedBorrower.state} {$borrowers.value.selectedBorrower.zipCode}
            </Col>
          </Row>
          <Row className="mb-16">
            <Col md={6}>
              <strong>Risk Rating:</strong> {$borrowers.value.selectedBorrower.borrowerRiskRating}
            </Col>
          </Row>

          {/* Contacts Section */}
          <Row className="mt-24">
            <Col md={12}>
              <h5 className="mb-16">Contacts</h5>

              {$contacts.value.isLoading ? (
                <p>Loading contacts...</p>
              ) : $contacts.value.list.length > 0 ? (
                <Table striped bordered hover size="sm">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Phone</th>
                      <th>Title</th>
                      <th>Primary</th>
                    </tr>
                  </thead>
                  <tbody>
                    {$contacts.value.list.map((contact) => (
                      <tr key={contact.id}>
                        <td>{contactsHelpers.formatContactName(contact)}</td>
                        <td>{contact.email || '-'}</td>
                        <td>{contact.phone || '-'}</td>
                        <td>{contact.title || '-'}</td>
                        <td>
                          {contact.isPrimary && (
                            <Badge bg="success">
                              <FontAwesomeIcon icon={faStar} className="me-1" />
                              Primary
                            </Badge>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              ) : (
                <p className="text-muted">No contacts found.</p>
              )}
            </Col>
          </Row>
        </div>
      ) : (
        <div>No borrower selected</div>
      )}
    </UniversalModal>
  );
};

export default ViewClientModal;
