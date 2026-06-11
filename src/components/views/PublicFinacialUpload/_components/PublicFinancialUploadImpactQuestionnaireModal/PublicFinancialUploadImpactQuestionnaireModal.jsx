import { Modal, Button, Row, Col, Alert, Spinner } from 'react-bootstrap';
import UniversalInput from '@src/components/global/Inputs/UniversalInput/UniversalInput';
import {
  $publicImpactQuestionnaireForm,
  $publicImpactQuestionnaireView,
} from '@src/components/views/PublicImpactQuestionnaire/_helpers/publicImpactQuestionnaire.consts';
import { INPUT_LIGHT_STYLE } from '../DebtScheduleWorksheetModal/_helpers/debtScheduleWorksheetModal.consts';
import {
  closeImpactQuestionnaireFromPublicUpload,
  clearPublicImpactQuestionnaireModalError,
  handleSubmitImpactQuestionnaireFromPublicUpload,
} from '../../_helpers/publicFinancialUpload.events';
import '../DebtScheduleWorksheetModal/DebtScheduleWorksheetModal.scss';

const PublicFinancialUploadImpactQuestionnaireModal = ({ show }) => {
  const { isLoading, error, payload, isSubmitting, submitSuccess } = $publicImpactQuestionnaireView.value;
  const alreadyDone = payload?.alreadySubmitted === true || submitSuccess;
  const busy = isLoading || isSubmitting;

  return (
    <Modal
      show={show}
      onHide={closeImpactQuestionnaireFromPublicUpload}
      centered
      scrollable
      backdrop="static"
      fullscreen
    >
      <Modal.Header closeButton className="border-bottom border-grey-200 px-16 px-md-24 py-16">
        <Modal.Title className="fw-bold fs-5 text-dark">
          Impact questionnaire
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="debt-schedule-worksheet-modal px-16 px-md-24 py-24 bg-white">
        {isLoading ? (
          <div className="d-flex flex-column align-items-center justify-content-center py-32 gap-8">
            <Spinner animation="border" role="status" variant="dark" aria-busy="true">
              <span className="visually-hidden">Loading questionnaire…</span>
            </Spinner>
            <p className="text-dark mb-0 small">Loading…</p>
          </div>
        ) : null}

        {!isLoading && error && !payload ? (
          <Alert variant="danger" className="py-10 mb-0">
            {error}
          </Alert>
        ) : null}

        {!isLoading && payload ? (
          <>
            {error ? (
              <Alert variant="danger" dismissible onClose={clearPublicImpactQuestionnaireModalError} className="py-10 mb-16">
                {error}
              </Alert>
            ) : null}

            {alreadyDone ? (
              <div className="debt-schedule-worksheet-table-shell rounded-2 border overflow-hidden p-16 p-md-20">
                <p className="text-dark mb-0 lh-base">
                  Thank you. Your questionnaire responses have already been submitted.
                </p>
              </div>
            ) : (
              <>
                <div className="debt-schedule-section-title mt-2">
                  Workforce metrics
                </div>
                <p className="text-dark mb-16 lh-base">
                  Enter
                  {' '}
                  <strong>positive numbers</strong>
                  {' '}
                  for each field. Your lender uses this for portfolio reporting; it must be completed before you can submit financials.
                </p>
                <Row className="g-4 mb-8">
                  <Col xs={12} md={4}>
                    <UniversalInput
                      label="Current number of Employees"
                      labelClassName="debt-schedule-field-label mb-6"
                      type="number"
                      name="currentEmployees"
                      placeholder="e.g. 25"
                      style={INPUT_LIGHT_STYLE}
                      value={$publicImpactQuestionnaireForm.value.currentEmployees}
                      signal={$publicImpactQuestionnaireForm}
                    />
                  </Col>
                  <Col xs={12} md={4}>
                    <UniversalInput
                      label="Average monthly FTE"
                      labelClassName="debt-schedule-field-label mb-6"
                      type="number"
                      name="averageMonthlyFte"
                      placeholder="e.g. 20.5"
                      style={INPUT_LIGHT_STYLE}
                      value={$publicImpactQuestionnaireForm.value.averageMonthlyFte}
                      signal={$publicImpactQuestionnaireForm}
                    />
                  </Col>
                  <Col xs={12} md={4}>
                    <UniversalInput
                      label="Average employee wage – per hour"
                      labelClassName="debt-schedule-field-label mb-6"
                      type="currency"
                      name="averageEmployeeWage"
                      placeholder="e.g. 18.00"
                      style={INPUT_LIGHT_STYLE}
                      value={$publicImpactQuestionnaireForm.value.averageEmployeeWage}
                      signal={$publicImpactQuestionnaireForm}
                    />
                  </Col>
                </Row>
              </>
            )}
          </>
        ) : null}
      </Modal.Body>
      <Modal.Footer className="debt-schedule-worksheet-modal-footer border-top px-16 px-md-24 py-12 d-flex flex-wrap justify-content-end gap-8 bg-white">
        <Button
          type="button"
          variant="outline-secondary"
          className="text-dark rounded-2"
          onClick={closeImpactQuestionnaireFromPublicUpload}
          disabled={busy}
        >
          Close
        </Button>
        <Button
          type="button"
          className="rounded-2 bg-dark text-white border-0"
          disabled={isLoading || alreadyDone || isSubmitting || !payload}
          onClick={handleSubmitImpactQuestionnaireFromPublicUpload}
        >
          {isSubmitting ? 'Submitting…' : 'Submit'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default PublicFinancialUploadImpactQuestionnaireModal;
