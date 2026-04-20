import { Alert, Row, Col } from 'react-bootstrap';
import UniversalModal from '@src/components/global/UniversalModal';
import UniversalInput from '@src/components/global/Inputs/UniversalInput';
import { $borrowerFinancialsView } from '@src/signals';
import * as events from './_helpers/impactQuestionnaireModal.events';
import { $impactQuestionnaireForm, $impactQuestionnaireState } from './_helpers/impactQuestionnaireModal.consts';

const ImpactQuestionnaireModal = () => {
  const { activeModalKey } = $borrowerFinancialsView.value;
  const { isSubmitting, error } = $impactQuestionnaireState.value;

  return (
    <UniversalModal
      show={activeModalKey === 'impactQuaestionnaire'}
      onHide={events.closeImpactQuestionnaire}
      headerText="Impact Questionnaire"
      leftBtnText="Cancel"
      rightBtnText={isSubmitting ? 'Submitting...' : 'Submit'}
      rightBtnOnClick={events.handleSubmit}
      rightButtonDisabled={isSubmitting}
      closeButton
    >
      {error && (
        <Alert variant="danger" dismissible onClose={() => $impactQuestionnaireState.update({ error: null })}>
          {error}
        </Alert>
      )}

      <Row className="gy-16">
        <Col xs={12}>
          <UniversalInput
            label="Current number of Employees"
            labelClassName="text-info-100"
            type="number"
            name="currentEmployees"
            placeholder="e.g. 25"
            value={$impactQuestionnaireForm.value.currentEmployees}
            signal={$impactQuestionnaireForm}
          />
        </Col>
        <Col xs={12}>
          <UniversalInput
            label="Average monthly FTE"
            labelClassName="text-info-100"
            type="number"
            name="averageMonthlyFte"
            placeholder="e.g. 20.5"
            value={$impactQuestionnaireForm.value.averageMonthlyFte}
            signal={$impactQuestionnaireForm}
          />
        </Col>
        <Col xs={12}>
          <UniversalInput
            label="Average employee wage – per hour"
            labelClassName="text-info-100"
            type="currency"
            name="averageEmployeeWage"
            placeholder="e.g. 18.00"
            value={$impactQuestionnaireForm.value.averageEmployeeWage}
            signal={$impactQuestionnaireForm}
          />
        </Col>
      </Row>
    </UniversalModal>
  );
};

export default ImpactQuestionnaireModal;
