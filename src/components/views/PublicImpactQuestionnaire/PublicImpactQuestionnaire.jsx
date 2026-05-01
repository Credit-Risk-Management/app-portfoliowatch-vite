import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Container, Row, Col, Card, Alert, Button,
} from 'react-bootstrap';
import ContentWrapper from '@src/components/global/ContentWrapper';
import UniversalInput from '@src/components/global/Inputs/UniversalInput';
import {
  $publicImpactQuestionnaireForm,
  $publicImpactQuestionnaireView,
} from './_helpers/publicImpactQuestionnaire.consts';
import * as resolvers from './_helpers/publicImpactQuestionnaire.resolvers';
import * as events from './_helpers/publicImpactQuestionnaire.events';

function PublicImpactQuestionnaireLayout({ children }) {
  return (
    <ContentWrapper
      fluid
      className="bg-white min-vh-100 d-flex align-items-center justify-content-center py-20 py-md-24"
    >
      <Container>
        <Row className="justify-content-center">
          <Col xs={12} md={10} lg={7} xl={6}>
            {children}
          </Col>
        </Row>
      </Container>
    </ContentWrapper>
  );
}

export default function PublicImpactQuestionnaire() {
  const { token } = useParams();

  useEffect(() => {
    resolvers.loadImpactQuestionnairePublic(token);
  }, [token]);

  const {
    isLoading,
    error,
    payload,
    isSubmitting,
    submitSuccess,
  } = $publicImpactQuestionnaireView.value;

  if (isLoading) {
    return (
      <PublicImpactQuestionnaireLayout>
        <p className="text-grey-600 fs-6 text-center mb-0">Loading…</p>
      </PublicImpactQuestionnaireLayout>
    );
  }

  if (error && !payload) {
    return (
      <PublicImpactQuestionnaireLayout>
        <div className="text-center mb-20 mb-md-24">
          <img
            src="/logo_dark.svg"
            alt="Portfolio Watch"
            className="d-block mx-auto w-auto"
            height={34}
          />
        </div>
        <Card className="border-0 shadow-sm rounded-3 overflow-hidden bg-white">
          <Card.Body className="p-24 p-md-32 text-center">
            <h2 className="h5 fw-semibold text-grey-800 mb-12">Link unavailable</h2>
            <p className="text-grey-600 mb-0">{error}</p>
          </Card.Body>
        </Card>
      </PublicImpactQuestionnaireLayout>
    );
  }

  const alreadyDone = payload?.alreadySubmitted === true || submitSuccess;

  return (
    <PublicImpactQuestionnaireLayout>
      <div className="text-center mb-20 mb-md-24">
        <img
          src="/logo_dark.svg"
          alt="Portfolio Watch"
          className="d-block mx-auto w-auto"
          height={34}
        />
      </div>
      <Card className="border-0 shadow-sm rounded-3 overflow-hidden bg-white">
        <Card.Header className="bg-grey-50 border-bottom border-grey-200 px-20 py-16 py-md-16 rounded-0">
          <div>
            <h1 className="h4 fw-bold text-grey-900 mb-8 lh-sm">Impact questionnaire</h1>
            {payload?.organizationName ? (
              <p className="text-grey-600 small mb-4 mb-md-8">{payload.organizationName}</p>
            ) : null}
            {payload?.borrowerName ? (
              <p className="text-grey-800 fw-bold mb-0 fs-6">{payload.borrowerName}</p>
            ) : null}
          </div>
        </Card.Header>
        <Card.Body className="bg-white p-20 p-md-24">
          {alreadyDone ? (
            <Alert
              variant="light"
              className="mb-0 shadow-none bg-grey-50 border border-dark text-grey-800"
            >
              Thank you. Your questionnaire responses have already been submitted.
            </Alert>
          ) : (
            <>
              <p className="text-grey-600 small mb-20">
                Please complete all fields below. Your lender uses this information for portfolio reporting.
              </p>
              <Row className="gy-20">
                <Col xs={12}>
                  <UniversalInput
                    label="Current number of employees"
                    labelClassName="text-grey-600"
                    controlClassName="form-control bg-white border border-dark text-grey-900 rounded-3 shadow-none"
                    type="number"
                    name="currentEmployees"
                    placeholder="e.g. 25"
                    value={$publicImpactQuestionnaireForm.value.currentEmployees}
                    signal={$publicImpactQuestionnaireForm}
                    required
                  />
                </Col>
                <Col xs={12}>
                  <UniversalInput
                    label="Average monthly FTE"
                    labelClassName="text-grey-600"
                    controlClassName="form-control bg-white border border-dark text-grey-900 rounded-3 shadow-none"
                    type="number"
                    name="averageMonthlyFte"
                    placeholder="e.g. 20.5"
                    value={$publicImpactQuestionnaireForm.value.averageMonthlyFte}
                    signal={$publicImpactQuestionnaireForm}
                    required
                  />
                </Col>
                <Col xs={12}>
                  <UniversalInput
                    label="Average employee wage – per hour"
                    labelClassName="text-grey-600"
                    controlClassName="form-control bg-white border border-dark text-grey-900 rounded-3 shadow-none"
                    type="currencyCents"
                    name="averageEmployeeWage"
                    placeholder="e.g. 18.00"
                    value={$publicImpactQuestionnaireForm.value.averageEmployeeWage}
                    signal={$publicImpactQuestionnaireForm}
                    required
                  />
                </Col>
                <Col xs={12}>
                  <Button
                    type="button"
                    variant="dark"
                    className="w-100 py-4 fw-bold rounded-pill border-0"
                    disabled={isSubmitting}
                    onClick={() => events.handleSubmitPublicImpactQuestionnaire(token)}
                  >
                    {isSubmitting ? 'Submitting…' : 'Submit'}
                  </Button>
                </Col>
              </Row>
            </>
          )}
        </Card.Body>
      </Card>
    </PublicImpactQuestionnaireLayout>
  );
}
