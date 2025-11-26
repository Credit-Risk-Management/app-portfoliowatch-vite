/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect } from 'react';
import { Form, Row, Col } from 'react-bootstrap';
import UniversalModal from '@src/components/global/UniversalModal';
import UniversalInput from '@src/components/global/Inputs/UniversalInput';
import SelectInput from '@src/components/global/Inputs/SelectInput';
import DatePicker from '@src/components/global/Inputs/DatePicker';
import { $borrowerDetailView } from '../_helpers/borrowerDetail.consts';
import { $borrower } from '@src/consts/consts';
import { $borrowersForm, $relationshipManagers } from '@src/signals';
import { handleEditBorrowerDetail } from '../_helpers/borrowerDetail.events';
import * as consts from '../_helpers/borrowers.consts';
import * as helpers from '../_helpers/borrowers.helpers';

const EditBorrowerDetailModal = () => {
  // Helper function to format date for HTML date input (YYYY-MM-DD)
  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '';
      return date.toISOString().split('T')[0];
    } catch {
      return '';
    }
  };

  useEffect(() => {
    if ($borrowerDetailView.value.showEditBorrowerModal && $borrower.value?.borrower) {
      const borrower = $borrower.value.borrower;
      
      // Map borrower data to form structure
      $borrowersForm.update({
        id: borrower.id || '',
        client_id: borrower.borrowerId || '',
        name: borrower.name || '',
        client_type: borrower.borrowerType || 'Individual',
        primary_contact: borrower.primaryContact || '',
        email: borrower.email || '',
        phone_number: borrower.phoneNumber || '',
        date_of_birth: formatDateForInput(borrower.dateOfBirth),
        street_address: borrower.streetAddress || '',
        city: borrower.city || '',
        state: borrower.state || '',
        zip_code: borrower.zipCode || '',
        country: borrower.country || 'USA',
        tax_id: borrower.taxId || '',
        business_start_date: formatDateForInput(borrower.businessStartDate),
        industry_type: borrower.industryType || '',
        relationship_manager_id: borrower.relationshipManager?.id || '',
        client_risk_rating: borrower.borrowerRiskRating || 'Medium',
        credit_score: borrower.creditScore || '',
        notes: borrower.notes || '',
      });
    }
  }, [$borrowerDetailView.value.showEditBorrowerModal]);

  const managers = $relationshipManagers.value?.list || [];
  const managerOptions = helpers.getManagerOptions(managers);

  const handleClose = () => {
    $borrowerDetailView.update({ showEditBorrowerModal: false });
    $borrowersForm.reset();
  };

  return (
    <UniversalModal
      show={$borrowerDetailView.value.showEditBorrowerModal}
      onHide={handleClose}
      headerText="Edit Borrower"
      leftBtnText="Cancel"
      rightBtnText="Save Changes"
      rightBtnOnClick={handleEditBorrowerDetail}
      size="lg"
      closeButton
    >
      <Form>
        <Row>
          <Col md={6} className="mb-16">
            <UniversalInput
              label="Borrower ID"
              type="text"
              value={$borrowersForm.value.client_id}
              signal={$borrowersForm}
              name="client_id"
            />
          </Col>
          <Col md={6} className="mb-16">
            <Form.Label>Borrower Type</Form.Label>
            <SelectInput
              name="client_type"
              signal={$borrowersForm}
              options={consts.CLIENT_TYPE_OPTIONS}
              value={consts.CLIENT_TYPE_OPTIONS.find((opt) => opt.value === $borrowersForm.value.client_type)?.value}
              onChange={(option) => $borrowersForm.update({ client_type: option?.value })}
            />
          </Col>
        </Row>

        <Row>
          <Col md={12} className="mb-16">
            <UniversalInput
              label="Name"
              type="text"
              value={$borrowersForm.value.name}
              signal={$borrowersForm}
              name="name"
            />
          </Col>
        </Row>

        <Row>
          <Col md={6} className="mb-16">
            <UniversalInput
              label="Email"
              type="email"
              value={$borrowersForm.value.email}
              signal={$borrowersForm}
              name="email"
            />
          </Col>
          <Col md={6} className="mb-16">
            <UniversalInput
              label="Phone Number"
              type="text"
              value={$borrowersForm.value.phone_number}
              signal={$borrowersForm}
              name="phone_number"
            />
          </Col>
        </Row>

        <Row>
          <Col md={12} className="mb-16">
            <UniversalInput
              label="Primary Contact"
              type="text"
              value={$borrowersForm.value.primary_contact}
              signal={$borrowersForm}
              name="primary_contact"
            />
          </Col>
        </Row>

        <Row>
          <Col md={12} className="mb-16">
            <UniversalInput
              label="Street Address"
              type="text"
              value={$borrowersForm.value.street_address}
              signal={$borrowersForm}
              name="street_address"
            />
          </Col>
        </Row>

        <Row>
          <Col md={4} className="mb-16">
            <UniversalInput
              label="City"
              type="text"
              value={$borrowersForm.value.city}
              signal={$borrowersForm}
              name="city"
            />
          </Col>
          <Col md={4} className="mb-16">
            <UniversalInput
              label="State"
              type="text"
              value={$borrowersForm.value.state}
              signal={$borrowersForm}
              name="state"
            />
          </Col>
          <Col md={4} className="mb-16">
            <UniversalInput
              label="Zip Code"
              type="text"
              value={$borrowersForm.value.zip_code}
              signal={$borrowersForm}
              name="zip_code"
            />
          </Col>
        </Row>

        <Row>
          <Col md={6} className="mb-16">
            <UniversalInput
              label="Tax ID"
              type="text"
              value={$borrowersForm.value.tax_id}
              signal={$borrowersForm}
              name="tax_id"
            />
          </Col>
          <Col md={6} className="mb-16">
            <UniversalInput
              label="Credit Score"
              type="text"
              value={$borrowersForm.value.credit_score}
              signal={$borrowersForm}
              name="credit_score"
            />
          </Col>
        </Row>

        <Row>
          <Col md={6} className="mb-16">
            <Form.Label>Date of Birth</Form.Label>
            <DatePicker
              name="date_of_birth"
              signal={$borrowersForm}
            />
          </Col>
          <Col md={6} className="mb-16">
            <Form.Label>Business Start Date</Form.Label>
            <DatePicker
              name="business_start_date"
              signal={$borrowersForm}
            />
          </Col>
        </Row>

        <Row>
          <Col md={6} className="mb-16">
            <Form.Label>Industry Type</Form.Label>
            <SelectInput
              name="industry_type"
              signal={$borrowersForm}
              options={[{ value: '', label: 'Select Industry' }, ...consts.INDUSTRY_TYPE_OPTIONS]}
              value={consts.INDUSTRY_TYPE_OPTIONS.find((opt) => opt.value === $borrowersForm.value.industry_type)?.value || ''}
              onChange={(option) => $borrowersForm.update({ industry_type: option?.value || '' })}
            />
          </Col>
          <Col md={6} className="mb-16">
            <Form.Label>Risk Rating</Form.Label>
            <SelectInput
              name="client_risk_rating"
              signal={$borrowersForm}
              options={consts.RISK_RATING_OPTIONS}
              value={consts.RISK_RATING_OPTIONS.find((opt) => opt.value === $borrowersForm.value.client_risk_rating)?.value}
              onChange={(option) => $borrowersForm.update({ client_risk_rating: option?.value })}
            />
          </Col>
        </Row>

        <Row>
          <Col md={12} className="mb-16">
            <Form.Label>Relationship Manager</Form.Label>
            <SelectInput
              name="relationship_manager_id"
              signal={$borrowersForm}
              options={[{ value: '', label: 'Select Manager' }, ...managerOptions]}
              value={managerOptions.find((opt) => opt.value === $borrowersForm.value.relationship_manager_id)?.value || ''}
              onChange={(option) => $borrowersForm.update({ relationship_manager_id: option?.value || '' })}
            />
          </Col>
        </Row>

        <Row>
          <Col md={12} className="mb-16">
            <Form.Label>Notes</Form.Label>
            <Form.Control
              as="textarea"
              rows={4}
              value={$borrowersForm.value.notes || ''}
              onChange={(e) => $borrowersForm.update({ notes: e.target.value })}
              className="bg-info-800 border-0 text-info-100"
            />
          </Col>
        </Row>
      </Form>
    </UniversalModal>
  );
};

export default EditBorrowerDetailModal;

