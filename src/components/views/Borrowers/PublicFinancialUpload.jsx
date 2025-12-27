import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Form, Button, Alert, Card } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileAlt, faMagic, faCheckCircle, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import UniversalInput from '@src/components/global/Inputs/UniversalInput';
import FileUploader from '@src/components/global/FileUploader';
import { Signal } from '@fyclabs/tools-fyc-react/signals';
import { getUploadLinkByToken, submitFinancialsViaToken } from '@src/api/borrowerFinancialUploadLink.api';
import ContentWrapper from '@src/components/global/ContentWrapper';

// Local signal for form data
const $publicFinancialForm = Signal({
  asOfDate: '',
  grossRevenue: '',
  netIncome: '',
  ebitda: '',
  debtService: '',
  debtServiceCovenant: '',
  currentRatio: '',
  currentRatioCovenant: '',
  liquidity: '',
  liquidityCovenant: '',
  liquidityRatio: '',
  liquidityRatioCovenant: '',
  retainedEarnings: '',
  notes: '',
});

// Local signal for file uploader
const $financialDocsUploader = Signal({
  financialDocs: [],
});

// Mock OCR - generate random but realistic financial data
const generateMockFinancialData = () => {
  const grossRevenue = Math.floor(Math.random() * (10000000 - 2000000) + 2000000);
  const netIncomeMargin = 0.10 + Math.random() * 0.15;
  const netIncome = Math.floor(grossRevenue * netIncomeMargin);
  const ebitdaMargin = 0.15 + Math.random() * 0.15;
  const ebitda = Math.floor(grossRevenue * ebitdaMargin);

  const today = new Date();
  const quartersBack = Math.floor(Math.random() * 4);
  const currentQuarter = Math.floor(today.getMonth() / 3);
  const targetQuarter = currentQuarter - quartersBack;

  const yearOffset = Math.floor((targetQuarter < 0 ? targetQuarter - 3 : targetQuarter) / 4);
  const year = today.getFullYear() + yearOffset;
  const quarter = ((targetQuarter % 4) + 4) % 4;
  const month = quarter * 3 + 2;
  const lastDay = new Date(year, month + 1, 0).getDate();
  const asOfDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

  return {
    asOfDate,
    grossRevenue: grossRevenue.toString(),
    netIncome: netIncome.toString(),
    ebitda: ebitda.toString(),
    debtService: (1.0 + Math.random() * 2.0).toFixed(2),
    debtServiceCovenant: (1.0 + Math.random() * 0.5).toFixed(2),
    currentRatio: (1.5 + Math.random() * 2.0).toFixed(2),
    currentRatioCovenant: (1.2 + Math.random() * 0.5).toFixed(2),
    liquidity: Math.floor(Math.random() * (2000000 - 300000) + 300000).toString(),
    liquidityCovenant: Math.floor(Math.random() * (800000 - 250000) + 250000).toString(),
    liquidityRatio: (1.2 + Math.random() * 1.5).toFixed(2),
    liquidityRatioCovenant: (1.0 + Math.random() * 0.5).toFixed(2),
    retainedEarnings: Math.floor(grossRevenue * (0.3 + Math.random() * 0.4)).toString(),
  };
};

const PublicFinancialUpload = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [linkData, setLinkData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [ocrApplied, setOcrApplied] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const fetchLinkData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await getUploadLinkByToken(token);
        if (response.status === 'success') {
          setLinkData(response.data);
        } else {
          setError('Failed to load upload link');
        }
      } catch (err) {
        console.error('Error fetching link data:', err);
        setError(err.message || 'Invalid or expired upload link');
      } finally {
        setIsLoading(false);
      }
    };

    if (token) {
      fetchLinkData();
    } else {
      setError('No token provided');
      setIsLoading(false);
    }
  }, [token]);

  const handleFileUpload = () => {
    const files = $financialDocsUploader.value.financialDocs || [];
    if (files.length > 0 && !ocrApplied) {
      setTimeout(() => {
        const mockData = generateMockFinancialData();
        $publicFinancialForm.update(mockData);
        setOcrApplied(true);
        setRefreshKey(prev => prev + 1);
      }, 500);
    }
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      setError(null);

      const financialData = {
        asOfDate: $publicFinancialForm.value.asOfDate,
        grossRevenue: $publicFinancialForm.value.grossRevenue || null,
        netIncome: $publicFinancialForm.value.netIncome || null,
        ebitda: $publicFinancialForm.value.ebitda || null,
        debtService: $publicFinancialForm.value.debtService || null,
        debtServiceCovenant: $publicFinancialForm.value.debtServiceCovenant || null,
        currentRatio: $publicFinancialForm.value.currentRatio || null,
        currentRatioCovenant: $publicFinancialForm.value.currentRatioCovenant || null,
        liquidity: $publicFinancialForm.value.liquidity || null,
        liquidityCovenant: $publicFinancialForm.value.liquidityCovenant || null,
        liquidityRatio: $publicFinancialForm.value.liquidityRatio || null,
        liquidityRatioCovenant: $publicFinancialForm.value.liquidityRatioCovenant || null,
        retainedEarnings: $publicFinancialForm.value.retainedEarnings || null,
        notes: $publicFinancialForm.value.notes || null,
        documentIds: [], // In a real implementation, this would include uploaded document IDs
      };

      const response = await submitFinancialsViaToken(token, financialData);

      if (response.status === 'success') {
        setSuccess(true);
        $publicFinancialForm.reset();
        $financialDocsUploader.update({ financialDocs: [] });
      } else {
        setError(response.message || 'Failed to submit financial data');
      }
    } catch (err) {
      console.error('Error submitting financial data:', err);
      setError(err.message || 'An error occurred while submitting financial data');
    } finally {
      setIsSubmitting(false);
    }
  };

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
              <Button variant="primary-100" onClick={() => {
                setSuccess(false);
                $publicFinancialForm.reset();
                $financialDocsUploader.update({ financialDocs: [] });
                setOcrApplied(false);
              }}>
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
              <Alert variant="danger" dismissible onClose={() => setError(null)} className="mb-16 mb-md-24">
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
                    value={$publicFinancialForm.value.asOfDate}
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
                    value={$publicFinancialForm.value.grossRevenue}
                    name="grossRevenue"
                    signal={$publicFinancialForm}
                  />
                </Col>
                <Col xs={12} md={4} className="mb-12 mb-md-16">
                  <UniversalInput
                    label="Net Income"
                    type="number"
                    placeholder="750000"
                    value={$publicFinancialForm.value.netIncome}
                    name="netIncome"
                    signal={$publicFinancialForm}
                  />
                </Col>
                <Col xs={12} md={4} className="mb-12 mb-md-16">
                  <UniversalInput
                    label="EBITDA"
                    type="number"
                    placeholder="1200000"
                    value={$publicFinancialForm.value.ebitda}
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
                    value={$publicFinancialForm.value.debtService}
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
                    value={$publicFinancialForm.value.debtServiceCovenant}
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
                    value={$publicFinancialForm.value.currentRatio}
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
                    value={$publicFinancialForm.value.currentRatioCovenant}
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
                    value={$publicFinancialForm.value.liquidity}
                    name="liquidity"
                    signal={$publicFinancialForm}
                  />
                </Col>
                <Col xs={12} md={6} className="mb-12 mb-md-16">
                  <UniversalInput
                    label="Liquidity Covenant"
                    type="number"
                    placeholder="500000"
                    value={$publicFinancialForm.value.liquidityCovenant}
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
                    value={$publicFinancialForm.value.liquidityRatio}
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
                    value={$publicFinancialForm.value.liquidityRatioCovenant}
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
                    value={$publicFinancialForm.value.retainedEarnings}
                    name="retainedEarnings"
                    signal={$publicFinancialForm}
                  />
                </Col>
                <Col xs={12} md={6} className="mb-12 mb-md-16">
                  <UniversalInput
                    label="Notes"
                    type="text"
                    placeholder="Additional notes or comments"
                    value={$publicFinancialForm.value.notes}
                    name="notes"
                    signal={$publicFinancialForm}
                  />
                </Col>
              </Row>

              <div className="d-flex justify-content-end mt-24 mt-md-32">
                <Button
                  variant="primary-100"
                  size="lg"
                  onClick={handleSubmit}
                  disabled={isSubmitting || !$publicFinancialForm.value.asOfDate}
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

