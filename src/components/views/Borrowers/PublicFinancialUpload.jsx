import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Form, Button, Alert, Card } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileAlt, faMagic, faCheckCircle, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import UniversalInput from '@src/components/global/Inputs/UniversalInput';
import FileUploader from '@src/components/global/FileUploader';
import { useSignal } from '@fyclabs/tools-fyc-react/signals';
import ContentWrapper from '@src/components/global/ContentWrapper';
import {
  $publicFinancialForm,
  $financialDocsUploader,
  $publicFinancialUploadView,
} from './_helpers/publicFinancialUpload.consts';
import { fetchUploadLinkData } from './_helpers/publicFinancialUpload.resolvers';
import {
  handleFileUpload,
  handleSubmit,
  handleSubmitAnother,
  clearError,
} from './_helpers/publicFinancialUpload.events';

const PublicFinancialUpload = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  // Use signals for reactive state
  const viewState = useSignal($publicFinancialUploadView);
  const formData = useSignal($publicFinancialForm);

  // Fetch upload link data on mount
  useEffect(() => {
    fetchUploadLinkData(token);
  }, [token]);

  // Destructure view state for easier access
  const { linkData, isLoading, isSubmitting, error, success, ocrApplied } = viewState;

  if (isLoading) {
    return (
      <ContentWrapper fluid className="min-vh-100 bg-info-900">
        <Container className="py-24">
          <div className="text-center text-info-100">Loading...</div>
        </Container>
      </ContentWrapper>
    );
  }

  if (error && !linkData) {
    return (
      <ContentWrapper fluid className="min-vh-100 bg-info-900">
        <Container className="py-24">
          <Card className="bg-info-800 border-danger">
            <Card.Body className="text-center py-32">
              <FontAwesomeIcon icon={faExclamationTriangle} className="text-danger mb-16" size="3x" />
              <h3 className="text-info-100 mb-16">Upload Link Error</h3>
              <p className="text-info-200 mb-24">{error}</p>
              <Button variant="primary-100" onClick={() => navigate('/')}>
                Go to Home
              </Button>
            </Card.Body>
          </Card>
        </Container>
      </ContentWrapper>
    );
  }

  if (success) {
    return (
      <ContentWrapper fluid className="min-vh-100 bg-info-900">
        <Container className="py-24">
          <Card className="bg-info-800 border-success">
            <Card.Body className="text-center py-32">
              <FontAwesomeIcon icon={faCheckCircle} className="text-success mb-16" size="3x" />
              <h3 className="text-info-100 mb-16">Financial Data Submitted Successfully</h3>
              <p className="text-info-200 mb-24">
                Thank you for submitting your financial information. Your data has been received and will be processed shortly.
              </p>
              <Button variant="primary-100" onClick={handleSubmitAnother}>
                Submit Another
              </Button>
            </Card.Body>
          </Card>
        </Container>
      </ContentWrapper>
    );
  }

  return (
    <ContentWrapper fluid className="min-vh-100 bg-info-900">
      <Container className="py-16 py-md-24">
        <Card className="bg-info-800">
          <Card.Header className="bg-info-700">
            <h2 className="text-info-100 mb-0">Submit Financial Data</h2>
            {linkData && (
              <div className="mt-8">
                <p className="text-info-200 mb-0">
                  <strong>Borrower:</strong> {linkData.borrower.name}
                </p>
                <p className="text-info-200 mb-0 small">
                  <strong>Organization:</strong> {linkData.organization.name}
                </p>
              </div>
            )}
          </Card.Header>
          <Card.Body className="py-16 py-md-24">
            {error && (
              <Alert variant="danger" dismissible onClose={clearError} className="mb-16 mb-md-24">
                {error}
              </Alert>
            )}

            {/* File Upload Section */}
            <div className="mb-24 mb-md-32 p-16 p-md-24 bg-info-700 rounded">
              <h5 className="text-info-100 mb-12 mb-md-16">
                <FontAwesomeIcon icon={faFileAlt} className="me-8" />
                Upload Financial Documents
              </h5>
              <p className="text-info-200 small mb-12 mb-md-16">
                Upload financial statements (PDF, Excel, etc.). Our system will automatically extract financial data.
              </p>
              <FileUploader
                name="financialDocs"
                signal={$financialDocsUploader}
                acceptedTypes=".pdf,.xlsx,.xls,.doc,.docx,.csv"
                onUpload={handleFileUpload}
              />
              {ocrApplied && (
                <Alert variant="success" className="mt-12 mt-md-16 mb-0">
                  <FontAwesomeIcon icon={faMagic} className="me-8" />
                  Financial data extracted from documents and populated below. Please review and adjust as needed.
                </Alert>
              )}
            </div>

            <Form>
              <h5 className="text-info-100 mb-12 mb-md-16 fw-600">Financial Period</h5>
              <Row>
                <Col xs={12} md={6} className="mb-16 mb-md-24">
                  <UniversalInput
                    label="As Of Date (Financial Statement Date)"
                    type="date"
                    placeholder="YYYY-MM-DD"
                    value={formData.asOfDate}
                    name="asOfDate"
                    signal={$publicFinancialForm}
                    required
                  />
                  <Form.Text className="text-info-200">
                    The date these financials are effective (e.g., end of quarter: 2024-03-31)
                  </Form.Text>
                </Col>
              </Row>

              <hr className="my-16 my-md-24 border-info-700" />

              <h5 className="text-info-100 mb-12 mb-md-16 fw-600">Revenue & Income</h5>
              <Row>
                <Col xs={12} md={4} className="mb-12 mb-md-16">
                  <UniversalInput
                    label="Gross Revenue"
                    type="number"
                    placeholder="5000000"
                    value={formData.grossRevenue}
                    name="grossRevenue"
                    signal={$publicFinancialForm}
                  />
                </Col>
                <Col xs={12} md={4} className="mb-12 mb-md-16">
                  <UniversalInput
                    label="Net Income"
                    type="number"
                    placeholder="750000"
                    value={formData.netIncome}
                    name="netIncome"
                    signal={$publicFinancialForm}
                  />
                </Col>
                <Col xs={12} md={4} className="mb-12 mb-md-16">
                  <UniversalInput
                    label="EBITDA"
                    type="number"
                    placeholder="1200000"
                    value={formData.ebitda}
                    name="ebitda"
                    signal={$publicFinancialForm}
                  />
                </Col>
              </Row>

              <hr className="my-16 my-md-24 border-info-700" />

              <h5 className="text-info-100 mb-12 mb-md-16 fw-600">Debt Service Coverage</h5>
              <Row>
                <Col xs={12} md={6} className="mb-12 mb-md-16">
                  <UniversalInput
                    label="Debt Service Ratio"
                    type="number"
                    step="0.01"
                    placeholder="1.45"
                    value={formData.debtService}
                    name="debtService"
                    signal={$publicFinancialForm}
                  />
                </Col>
                <Col xs={12} md={6} className="mb-12 mb-md-16">
                  <UniversalInput
                    label="Debt Service Covenant"
                    type="number"
                    step="0.01"
                    placeholder="1.25"
                    value={formData.debtServiceCovenant}
                    name="debtServiceCovenant"
                    signal={$publicFinancialForm}
                  />
                </Col>
              </Row>

              <hr className="my-16 my-md-24 border-info-700" />

              <h5 className="text-info-100 mb-12 mb-md-16 fw-600">Current Ratio</h5>
              <Row>
                <Col xs={12} md={6} className="mb-12 mb-md-16">
                  <UniversalInput
                    label="Current Ratio"
                    type="number"
                    step="0.01"
                    placeholder="2.1"
                    value={formData.currentRatio}
                    name="currentRatio"
                    signal={$publicFinancialForm}
                  />
                </Col>
                <Col xs={12} md={6} className="mb-12 mb-md-16">
                  <UniversalInput
                    label="Current Ratio Covenant"
                    type="number"
                    step="0.01"
                    placeholder="1.5"
                    value={formData.currentRatioCovenant}
                    name="currentRatioCovenant"
                    signal={$publicFinancialForm}
                  />
                </Col>
              </Row>

              <hr className="my-16 my-md-24 border-info-700" />

              <h5 className="text-info-100 mb-12 mb-md-16 fw-600">Liquidity</h5>
              <Row>
                <Col xs={12} md={6} className="mb-12 mb-md-16">
                  <UniversalInput
                    label="Liquidity"
                    type="number"
                    placeholder="850000"
                    value={formData.liquidity}
                    name="liquidity"
                    signal={$publicFinancialForm}
                  />
                </Col>
                <Col xs={12} md={6} className="mb-12 mb-md-16">
                  <UniversalInput
                    label="Liquidity Covenant"
                    type="number"
                    placeholder="500000"
                    value={formData.liquidityCovenant}
                    name="liquidityCovenant"
                    signal={$publicFinancialForm}
                  />
                </Col>
              </Row>

              <Row>
                <Col xs={12} md={6} className="mb-12 mb-md-16">
                  <UniversalInput
                    label="Liquidity Ratio"
                    type="number"
                    step="0.01"
                    placeholder="1.85"
                    value={formData.liquidityRatio}
                    name="liquidityRatio"
                    signal={$publicFinancialForm}
                  />
                </Col>
                <Col xs={12} md={6} className="mb-12 mb-md-16">
                  <UniversalInput
                    label="Liquidity Ratio Covenant"
                    type="number"
                    step="0.01"
                    placeholder="1.2"
                    value={formData.liquidityRatioCovenant}
                    name="liquidityRatioCovenant"
                    signal={$publicFinancialForm}
                  />
                </Col>
              </Row>

              <hr className="my-16 my-md-24 border-info-700" />

              <h5 className="text-info-100 mb-12 mb-md-16 fw-600">Other</h5>
              <Row>
                <Col xs={12} md={6} className="mb-12 mb-md-16">
                  <UniversalInput
                    label="Retained Earnings"
                    type="number"
                    placeholder="2300000"
                    value={formData.retainedEarnings}
                    name="retainedEarnings"
                    signal={$publicFinancialForm}
                  />
                </Col>
                <Col xs={12} md={6} className="mb-12 mb-md-16">
                  <UniversalInput
                    label="Notes"
                    type="text"
                    placeholder="Additional notes or comments"
                    value={formData.notes}
                    name="notes"
                    signal={$publicFinancialForm}
                  />
                </Col>
              </Row>

              <div className="d-flex justify-content-end mt-24 mt-md-32">
                <Button
                  variant="primary-100"
                  size="lg"
                  onClick={() => handleSubmit(token)}
                  disabled={isSubmitting || !formData.asOfDate}
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Financial Data'}
                </Button>
              </div>
            </Form>
          </Card.Body>
        </Card>
      </Container>
    </ContentWrapper>
  );
};

export default PublicFinancialUpload;
