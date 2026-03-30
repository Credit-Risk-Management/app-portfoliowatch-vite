import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Form, Button, Alert, Card } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faFileAlt,
  faCheck,
  faCheckCircle,
  faExclamationTriangle,
  faArrowLeft,
} from '@fortawesome/free-solid-svg-icons';
import UniversalInput from '@src/components/global/Inputs/UniversalInput';
import FileUploader from '@src/components/global/FileUploader';
import SignalAccordion from '@src/components/global/SignalAccordion/SignalAccordion';
import ContentWrapper from '@src/components/global/ContentWrapper';
import exampleLogo from '@src/assets/exampleLogo.svg?url';
import { normalizeCurrencyValue } from '@src/components/global/Inputs/UniversalInput/_helpers/universalinput.events';
import {
  $publicFinancialForm,
  $publicIncomeStatementUploader,
  $publicBalanceSheetUploader,
  $publicFinancialAccordionExpanded,
  $publicFinancialPdfPreview,
  $publicFinancialUploadView,
  initialPublicFinancialSectionsExtracted,
} from './_helpers/publicFinancialUpload.consts';
import { fetchUploadLinkData } from './_helpers/publicFinancialUpload.resolvers';
import {
  syncPublicFinancialPdfPreview,
  resetPublicFinancialPdfPreview,
} from './_helpers/publicFinancialUpload.pdfPreview.resolvers';
import {
  runPublicFinancialExtraction,
  handleBackToPublicUploadStep,
  handleSubmit,
  handleSubmitAnother,
  clearError,
} from './_helpers/publicFinancialUpload.events';
import PublicFinancialUploadPdfPreview from './PublicFinancialUploadPdfPreview';

/** Show "required*" on mandatory sections until a file is processed; first section (P&L) is check-only when done. */
const SECTIONS_WITH_REQUIRED_STAR = new Set(['balanceSheet', 'incomeStatement']);

const isSectionStaged = (sectionId) => {
  if (sectionId === 'incomeStatement') {
    return ($publicIncomeStatementUploader.value.financialDocs || []).length > 0;
  }
  if (sectionId === 'balanceSheet') {
    return ($publicBalanceSheetUploader.value.financialDocs || []).length > 0;
  }
  return false;
};

const buildFinancialSectionLabel = (sectionId, title, sectionsExtracted, flowStep) => {
  const extracted = sectionsExtracted[sectionId];
  const staged = isSectionStaged(sectionId);
  const done = flowStep === 'review' ? extracted : staged;
  const showRequiredStar = SECTIONS_WITH_REQUIRED_STAR.has(sectionId) && !done;

  return (
    <span className="d-inline-flex align-items-center gap-8 flex-wrap">
      <span>{title}</span>
      {done && (
        <FontAwesomeIcon
          icon={faCheck}
          className="text-success flex-shrink-0"
          aria-label={flowStep === 'review' ? 'Financial data extracted from this document' : 'PDF selected'}
        />
      )}
      {!done && showRequiredStar && (
        <span className="text-warning-300 small fw-normal">required*</span>
      )}
    </span>
  );
};

const PublicFinancialUpload = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  // Fetch upload link data on mount
  useEffect(() => {
    fetchUploadLinkData(token);
  }, [token]);

  // Destructure signals for easier access
  const {
    linkData,
    isLoading,
    isExtracting,
    isSubmitting,
    error,
    success,
    sectionsExtracted: sectionsExtractedRaw,
    flowStep: flowStepRaw,
  } = $publicFinancialUploadView.value;
  const flowStep = flowStepRaw ?? 'upload';
  const extracting = isExtracting ?? false;
  const sectionsExtracted = sectionsExtractedRaw ?? initialPublicFinancialSectionsExtracted;
  const formData = $publicFinancialForm.value;

  const hasIncomePdf = ($publicIncomeStatementUploader.value.financialDocs || []).length > 0;
  const hasBalancePdf = ($publicBalanceSheetUploader.value.financialDocs || []).length > 0;
  const canRunExtraction = hasIncomePdf && hasBalancePdf;

  const expandedAccordionId = $publicFinancialAccordionExpanded.value;
  const incomeFirstFile = ($publicIncomeStatementUploader.value.financialDocs || [])[0];
  const balanceFirstFile = ($publicBalanceSheetUploader.value.financialDocs || [])[0];
  const stagedIncomeKey = incomeFirstFile ? `${incomeFirstFile.name}-${incomeFirstFile.size}` : '';
  const stagedBalanceKey = balanceFirstFile ? `${balanceFirstFile.name}-${balanceFirstFile.size}` : '';

  /** Subscribe so PDF preview updates after sync runs. */
  const publicPdfPreview = $publicFinancialPdfPreview.value;

  useEffect(() => {
    if (flowStep !== 'upload') {
      resetPublicFinancialPdfPreview();
      return undefined;
    }
    syncPublicFinancialPdfPreview();
    return () => {
      resetPublicFinancialPdfPreview();
    };
  }, [flowStep, expandedAccordionId, stagedIncomeKey, stagedBalanceKey]);

  const financialAccordionItems = [
    {
      id: 'incomeStatement',
      label: buildFinancialSectionLabel('incomeStatement', 'Income statement (P&L)', sectionsExtracted, flowStep),
      content: (
        hasIncomePdf ? (
          <PublicFinancialUploadPdfPreview key={publicPdfPreview.pdfBlobUrl || 'no-pdf'} />
        ) : (
          <div className=" pt-0">
            <FileUploader
              variant="dropzone"
              id="public-financial-income-statement"
              name="financialDocs"
              signal={$publicIncomeStatementUploader}
              acceptedTypes=".pdf"
            >
              <p className="text-grey-600 small mb-0 text-center">
                Upload your profit and loss statement as a PDF.
              </p>
            </FileUploader>
          </div>
        )
      ),
    },
    {
      id: 'balanceSheet',
      label: buildFinancialSectionLabel('balanceSheet', 'Balance sheet', sectionsExtracted, flowStep),
      content: (
        hasBalancePdf ? (
          <PublicFinancialUploadPdfPreview key={publicPdfPreview.pdfBlobUrl || 'no-pdf'} />
        ) : (
          <div className=" pt-0">
            <FileUploader
              variant="dropzone"
              id="public-financial-balance-sheet"
              name="financialDocs"
              signal={$publicBalanceSheetUploader}
              acceptedTypes=".pdf"
            >
              <p className="text-grey-600 small mb-0 text-center">
                Upload your balance sheet as a PDF.
              </p>
            </FileUploader>
          </div>
        )),
    },
  ];

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
                <p className="text-grey-600 mb-0">
                  <strong>Financial Period:</strong> {linkData.financialPeriod}
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

            {flowStep === 'upload' && (
              <div className="mb-32 p-24 bg-light-100 border border-primary-200 rounded-4">
                <div className="d-flex flex-wrap align-items-center justify-content-between gap-16 mb-16">
                  <h5 className="text-dark mb-0">
                    <FontAwesomeIcon icon={faFileAlt} className="me-8" />
                    Step 1 — Upload financial documents
                  </h5>
                  <span className="text-grey-600 small">Step 1 of 2</span>
                </div>
                <p className="text-grey-600 small mb-24">
                  Add both PDFs below, then run extraction. Data entry appears on the next step after extraction completes.
                </p>
                <SignalAccordion
                  title="Required PDFs"
                  items={financialAccordionItems}
                  defaultExpandedId="incomeStatement"
                  $expandedId={$publicFinancialAccordionExpanded}
                />
                <div className="d-flex flex-wrap align-items-center justify-content-between gap-16 mt-24 pt-24 border-top border-primary-200">
                  <p className="text-grey-600 small mb-0">
                    {!canRunExtraction
                      ? 'Upload an income statement and a balance sheet to continue.'
                      : 'Ready to extract data from both PDFs.'}
                  </p>
                  <Button
                    variant="primary"
                    size="lg"
                    className="rounded-pill"
                    onClick={() => runPublicFinancialExtraction()}
                    disabled={!canRunExtraction || extracting}
                  >
                    {extracting ? 'Running extraction…' : 'Run extraction'}
                  </Button>
                </div>
              </div>
            )}

            {flowStep === 'review' && (
              <div className="mb-32 d-flex flex-wrap align-items-center justify-content-between gap-16">
                <div>
                  <h5 className="text-dark mb-4">Step 2 — Review &amp; submit</h5>
                  <p className="text-grey-600 small mb-0">
                    Review the fields below and submit when accurate.
                  </p>
                </div>
                <div className="d-flex flex-wrap align-items-center gap-12">
                  <span className="text-grey-600 small">Step 2 of 2</span>
                  <Button variant="outline-secondary" onClick={() => handleBackToPublicUploadStep()}>
                    <FontAwesomeIcon icon={faArrowLeft} className="me-8" />
                    Back to uploads
                  </Button>
                </div>
              </div>
            )}

            {flowStep === 'review' && (
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
            )}
          </Card.Body>
        </Card>
      </Container>
    </ContentWrapper>
  );
};

export default PublicFinancialUpload;
