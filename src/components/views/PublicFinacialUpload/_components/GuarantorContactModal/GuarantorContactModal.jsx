import { Modal, Button, Row, Col, Alert } from 'react-bootstrap';
import UniversalInput from '@src/components/global/Inputs/UniversalInput/UniversalInput';
import { $publicFinancialUploadView } from '../../_helpers/publicFinancialUpload.consts';
import { INPUT_LIGHT_STYLE } from '../DebtScheduleWorksheetModal/_helpers/debtScheduleWorksheetModal.consts';
import { getGuarantorContactSignal } from './_helpers/guarantorContactModal.consts';
import * as events from './_helpers/guarantorContactModal.events';
import '../DebtScheduleWorksheetModal/DebtScheduleWorksheetModal.scss';

const GuarantorContactModal = ({ show, isSubmitting }) => {
  const { linkData, guarantorContactErrors } = $publicFinancialUploadView.value;
  const guarantorsNeedingContact = linkData?.guarantorsNeedingContact ?? [];
  const multiple = guarantorsNeedingContact.length > 1;
  const hasValidationErrors = guarantorContactErrors
    && Object.keys(guarantorContactErrors).length > 0;

  return (
    <Modal
      show={show}
      onHide={events.closeGuarantorContactModal}
      centered
      scrollable
      backdrop="static"
      fullscreen
    >
      <Modal.Header closeButton className="border-bottom border-grey-200 px-16 px-md-24 py-16">
        <Modal.Title className="fw-bold fs-5 text-dark">
          Guarantor contact information
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="debt-schedule-worksheet-modal px-16 px-md-24 py-24 bg-white">
        {hasValidationErrors ? (
          <Alert variant="danger" dismissible onClose={events.clearGuarantorContactModalErrors} className="py-10 mb-16">
            Please complete all required fields for each guarantor.
          </Alert>
        ) : null}

        <div className="debt-schedule-section-title mt-2">
          Contact details
        </div>
        <p className="text-dark mb-16 lh-base">
          We need contact details for each guarantor so we can send annual guarantor document requests.
          This must be completed before you can submit financials.
        </p>

        {guarantorsNeedingContact.map(({ id, name }, index) => {
          const signal = getGuarantorContactSignal(id);
          const rowErrors = guarantorContactErrors?.[id] ?? {};
          if (!signal) return null;
          return (
            <div
              key={id}
              className={multiple && index < guarantorsNeedingContact.length - 1
                ? 'mb-24 pb-24 border-bottom border-grey-200'
                : 'mb-0'}
            >
              {multiple && (
                <div className="debt-schedule-section-title mb-8">
                  {name}
                </div>
              )}
              <Row className="g-4 mb-8">
                <Col xs={12} md={6}>
                  <UniversalInput
                    label="First name"
                    labelClassName="debt-schedule-field-label mb-6"
                    type="text"
                    name="firstName"
                    placeholder="First name"
                    style={INPUT_LIGHT_STYLE}
                    signal={signal}
                    value={signal.value.firstName}
                    required
                    disabled={isSubmitting}
                    isInvalid={Boolean(rowErrors.firstName)}
                  />
                </Col>
                <Col xs={12} md={6}>
                  <UniversalInput
                    label="Last name"
                    labelClassName="debt-schedule-field-label mb-6"
                    type="text"
                    name="lastName"
                    placeholder="Last name"
                    style={INPUT_LIGHT_STYLE}
                    signal={signal}
                    value={signal.value.lastName}
                    required
                    disabled={isSubmitting}
                    isInvalid={Boolean(rowErrors.lastName)}
                  />
                </Col>
                <Col xs={12} md={6}>
                  <UniversalInput
                    label="Email"
                    labelClassName="debt-schedule-field-label mb-6"
                    type="email"
                    name="email"
                    placeholder="name@example.com"
                    style={INPUT_LIGHT_STYLE}
                    signal={signal}
                    value={signal.value.email}
                    required
                    disabled={isSubmitting}
                    isInvalid={Boolean(rowErrors.email)}
                  />
                </Col>
                <Col xs={12} md={6}>
                  <UniversalInput
                    label="Phone"
                    labelClassName="debt-schedule-field-label mb-6"
                    type="phone"
                    name="phone"
                    placeholder="(555) 555-0100"
                    style={INPUT_LIGHT_STYLE}
                    signal={signal}
                    value={signal.value.phone}
                    required
                    disabled={isSubmitting}
                    isInvalid={Boolean(rowErrors.phone)}
                  />
                </Col>
              </Row>
            </div>
          );
        })}
      </Modal.Body>
      <Modal.Footer className="debt-schedule-worksheet-modal-footer border-top px-16 px-md-24 py-12 d-flex flex-wrap justify-content-end gap-8 bg-white">
        <Button
          type="button"
          variant="outline-secondary"
          className="text-dark rounded-2"
          onClick={events.closeGuarantorContactModal}
          disabled={isSubmitting}
        >
          Close
        </Button>
        <Button
          type="button"
          className="rounded-2 bg-dark text-white border-0"
          onClick={events.saveGuarantorContactModal}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Saving…' : 'Save'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default GuarantorContactModal;
