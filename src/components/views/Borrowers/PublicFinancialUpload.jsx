import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Form, Button, Alert, Card } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileAlt, faMagic, faCheckCircle, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import UniversalInput from '@src/components/global/Inputs/UniversalInput';
import FileUploader from '@src/components/global/FileUploader';
import ContentWrapper from '@src/components/global/ContentWrapper';
import exampleLogo from '@src/assets/exampleLogo.svg?url';
import { normalizeCurrencyValue } from '@src/components/global/Inputs/UniversalInput/_helpers/universalinput.events';
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

  // Fetch upload link data on mount
  useEffect(() => {
    fetchUploadLinkData(token);
  }, [token]);

  // Destructure signals for easier access
  const { linkData, isLoading, isSubmitting, error, success, ocrApplied } = $publicFinancialUploadView.value;
  const formData = $publicFinancialForm.value;

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
    <ContentWrapper fluid className="min-vh-100 ">
      <Container className="py-16 py-md-24">
        <Card className="border-0 shadow-sm">
          <Card.Header className="bg-white border-0 pb-0">
            <div className="d-flex justify-content-between align-items-center">

              <h2 className="text-dark mb-0">Submit Financial Data</h2>
              <img src={exampleLogo} alt="Saber Bank Logo" className="img-fluid" />
            </div>
            {linkData && (
            <div className="mt-8">
              <p className="text-grey-600 mb-0">
                <strong>Borrower:</strong> {linkData.borrower.name}
              </p>
              <p className="text-grey-600 mb-0">
                <strong>Organization:</strong> {linkData.organization.name}
              </p>
            </div>
            )}
          </Card.Header>
          <Card.Body className=" py-16 py-md-24">
            {error && (
            <Alert variant="danger" dismissible onClose={clearError} className="mb-32">
              {error}
            </Alert>
            )}

            {/* File Upload Section */}
            <div className="mb-32 p-24 bg-light-100 border border-primary-200 rounded-4">
              <h5 className="text-dark mb-16">
                <FontAwesomeIcon icon={faFileAlt} className="me-8" />
                Upload Financial Documents
              </h5>
              <p className="text-grey-600 small">
                Upload financial statements (PDF, Excel, etc.). Our system will automatically extract financial data.
              </p>
              <FileUploader
                name="financialDocs"
                signal={$financialDocsUploader}
                acceptedTypes=".pdf,.xlsx,.xls,.doc,.docx,.csv"
                onUpload={handleFileUpload}
              />
              {ocrApplied && (
              <Alert variant="success" className="mt-24 mb-0">
                <FontAwesomeIcon icon={faMagic} className="me-8" />
                Financial data extracted from documents and populated below. Please review and adjust as needed.
              </Alert>
              )}
            </div>

            <Form>
              <Card className="border-0 shadow-sm mb-40">
                <Card.Body>
                  <h5 className="text-dark fw-600 mb-24">Financial Period</h5>
                  <Row>
                    <Col xs={12} md={6} className="mb-24">
                      <UniversalInput
                        label="As Of Date (Financial Statement Date)"
                        type="date"
                        placeholder="YYYY-MM-DD"
                        value={formData.asOfDate}
                        name="asOfDate"
                        signal={$publicFinancialForm}
                        required
                      />
                      <Form.Text className="text-grey-600">
                        The date these financials are effective (e.g., end of quarter: 03-31-2024)
                      </Form.Text>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
              <Card className="border-0 shadow-sm mb-40">
                <Card.Body>
                  <h5 className="text-dark fw-600 mb-24">Revenue & Income</h5>
                  <Row>
                    <Col xs={12} md={4} className="mb-24">
                      <UniversalInput
                        label="Gross Revenue"
                        type="currency"
                        placeholder="$ USD"
                        value={formData.grossRevenue}
                        name="grossRevenue"
                        signal={$publicFinancialForm}
                        inputFormatCallback={normalizeCurrencyValue}
                      />
                    </Col>
                    <Col xs={12} md={4} className="mb-24">
                      <UniversalInput
                        label="Net Income"
                        type="currency"
                        placeholder="$ USD"
                        value={formData.netIncome}
                        name="netIncome"
                        signal={$publicFinancialForm}
                        inputFormatCallback={normalizeCurrencyValue}
                      />
                    </Col>
                    <Col xs={12} md={4} className="mb-24">
                      <UniversalInput
                        label="EBITDA"
                        type="currency"
                        placeholder="$ USD"
                        value={formData.ebitda}
                        name="ebitda"
                        signal={$publicFinancialForm}
                        inputFormatCallback={normalizeCurrencyValue}
                      />
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
              <Card className="border-0 shadow-sm mb-40">
                <Card.Body>
                  <h5 className="text-dark fw-600 mb-24">Debt Service Coverage</h5>
                  <Row>
                    <Col xs={12} md={6} className="mb-24">
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
                    <Col xs={12} md={6} className="mb-24">
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
                </Card.Body>
              </Card>
              <Card className="border-0 shadow-sm mb-40">
                <Card.Body>
                  <h5 className="text-dark fw-600 mb-24">Current Ratio</h5>
                  <Row>
                    <Col xs={12} md={6} className="mb-24">
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
                    <Col xs={12} md={6} className="mb-24">
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
                </Card.Body>
              </Card>
              <Card className="border-0 shadow-sm mb-40">
                <Card.Body>
                  <h5 className="text-dark fw-600 mb-24">Liquidity</h5>
                  <Row>
                    <Col xs={12} md={6} className="mb-24">
                      <UniversalInput
                        label="Liquidity"
                        type="currency"
                        step="0.01"
                        placeholder="$ USD"
                        value={formData.liquidity}
                        name="liquidity"
                        signal={$publicFinancialForm}
                        inputFormatCallback={normalizeCurrencyValue}
                      />
                    </Col>
                    <Col xs={12} md={6} className="mb-24">
                      <UniversalInput
                        label="Liquidity Covenant"
                        type="number"
                        step="0.01"
                        placeholder="1.5"
                        value={formData.liquidityCovenant}
                        name="liquidityCovenant"
                        signal={$publicFinancialForm}
                      />
                    </Col>
                  </Row>

                </Card.Body>
              </Card>

              <Card className="border-0 shadow-sm mb-40">
                <Card.Body>
                  <h5 className="text-dark fw-600 mb-24">Other</h5>
                  <Row>
                    <Col xs={12} md={6} className="mb-24">
                      <UniversalInput
                        label="Retained Earnings"
                        type="currency"
                        placeholder="$ USD"
                        value={formData.retainedEarnings}
                        name="retainedEarnings"
                        signal={$publicFinancialForm}
                        inputFormatCallback={normalizeCurrencyValue}
                      />
                    </Col>
                    <Col xs={12} md={6} className="mb-24">
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
                </Card.Body>
              </Card>

              <div className="d-flex justify-content-end mt-32">
                <Button
                  variant="primary"
                  size="lg"
                  className="rounded-pill"
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
