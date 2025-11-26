import { Form, Row, Col, Alert } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileAlt, faMagic } from '@fortawesome/free-solid-svg-icons';
import UniversalModal from '@src/components/global/UniversalModal';
import UniversalInput from '@src/components/global/Inputs/UniversalInput';
import FileUploader from '@src/components/global/FileUploader';
import { $borrowerFinancialsView, $borrowerFinancialsForm, $user } from '@src/signals';
import borrowerFinancialsApi from '@src/api/borrowerFinancials.api';
import { Signal } from '@fyclabs/tools-fyc-react/signals';
import { useState } from 'react';
import { successAlert } from '@src/components/global/Alert/_helpers/alert.events';

// Mock OCR - generate random but realistic financial data
const generateMockFinancialData = () => {
  // Generate realistic random values within typical ranges
  const grossRevenue = Math.floor(Math.random() * (10000000 - 2000000) + 2000000); // $2M - $10M
  const netIncomeMargin = 0.10 + Math.random() * 0.15; // 10% - 25% margin
  const netIncome = Math.floor(grossRevenue * netIncomeMargin);
  const ebitdaMargin = 0.15 + Math.random() * 0.15; // 15% - 30% margin
  const ebitda = Math.floor(grossRevenue * ebitdaMargin);

  // Generate a quarter-end date (randomly pick last 4 quarters)
  const today = new Date();
  const quartersBack = Math.floor(Math.random() * 4); // 0-3 quarters back
  const currentQuarter = Math.floor(today.getMonth() / 3);
  const targetQuarter = currentQuarter - quartersBack;

  // Calculate year and quarter
  const yearOffset = Math.floor((targetQuarter < 0 ? targetQuarter - 3 : targetQuarter) / 4);
  const year = today.getFullYear() + yearOffset;
  const quarter = ((targetQuarter % 4) + 4) % 4; // Handle negative modulo

  // Quarter end months: 0=Mar(2), 1=Jun(5), 2=Sep(8), 3=Dec(11)
  const month = quarter * 3 + 2;
  const lastDay = new Date(year, month + 1, 0).getDate();
  const asOfDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

  return {
    asOfDate,
    grossRevenue: grossRevenue.toString(),
    netIncome: netIncome.toString(),
    ebitda: ebitda.toString(),
    debtService: (1.0 + Math.random() * 2.0).toFixed(2), // 1.0 - 3.0
    debtServiceCovenant: (1.0 + Math.random() * 0.5).toFixed(2), // 1.0 - 1.5
    currentRatio: (1.5 + Math.random() * 2.0).toFixed(2), // 1.5 - 3.5
    currentRatioCovenant: (1.2 + Math.random() * 0.5).toFixed(2), // 1.2 - 1.7
    liquidity: Math.floor(Math.random() * (2000000 - 300000) + 300000).toString(), // $300K - $2M
    liquidityCovenant: Math.floor(Math.random() * (800000 - 250000) + 250000).toString(), // $250K - $800K
    liquidityRatio: (1.2 + Math.random() * 1.5).toFixed(2), // 1.2 - 2.7
    liquidityRatioCovenant: (1.0 + Math.random() * 0.5).toFixed(2), // 1.0 - 1.5
    retainedEarnings: Math.floor(grossRevenue * (0.3 + Math.random() * 0.4)).toString(), // 30% - 70% of revenue
  };
};

// Local signal for file uploader
const $financialDocsUploader = Signal({
  financialDocs: [],
});

const SubmitFinancialsModal = () => {
  const [ocrApplied, setOcrApplied] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  // eslint-disable-next-line no-unused-vars
  const [refreshKey, setRefreshKey] = useState(0);

  const handleClose = () => {
    $borrowerFinancialsView.update({
      showSubmitModal: false,
    });
    $borrowerFinancialsForm.reset();
    $financialDocsUploader.update({ financialDocs: [] });
    setOcrApplied(false);
    setError(null);
  };

  const handleFileUpload = () => {
    // Mock OCR: When files are uploaded, auto-populate the form with mock data
    // Get files from the signal
    const files = $financialDocsUploader.value.financialDocs || [];

    if (files.length > 0 && !ocrApplied) {
      // Simulate OCR processing
      setTimeout(() => {
        const mockData = generateMockFinancialData();
        $borrowerFinancialsForm.update(mockData);
        setOcrApplied(true);
        // Force React to re-render so inputs show updated values
        setRefreshKey(prev => prev + 1);
      }, 500);
    }
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      setError(null);

      const financialData = {
        borrowerId: $borrowerFinancialsView.value.currentBorrowerId,
        asOfDate: $borrowerFinancialsForm.value.asOfDate,
        grossRevenue: $borrowerFinancialsForm.value.grossRevenue || null,
        netIncome: $borrowerFinancialsForm.value.netIncome || null,
        ebitda: $borrowerFinancialsForm.value.ebitda || null,
        debtService: $borrowerFinancialsForm.value.debtService || null,
        debtServiceCovenant: $borrowerFinancialsForm.value.debtServiceCovenant || null,
        currentRatio: $borrowerFinancialsForm.value.currentRatio || null,
        currentRatioCovenant: $borrowerFinancialsForm.value.currentRatioCovenant || null,
        liquidity: $borrowerFinancialsForm.value.liquidity || null,
        liquidityCovenant: $borrowerFinancialsForm.value.liquidityCovenant || null,
        liquidityRatio: $borrowerFinancialsForm.value.liquidityRatio || null,
        liquidityRatioCovenant: $borrowerFinancialsForm.value.liquidityRatioCovenant || null,
        retainedEarnings: $borrowerFinancialsForm.value.retainedEarnings || null,
        notes: $borrowerFinancialsForm.value.notes || null,
        submittedBy: $user.value.email || $user.value.name || 'Unknown User',
        organizationId: $user.value.organizationId,
        documentIds: [], // In a real implementation, this would include uploaded document IDs
      };

      const response = await borrowerFinancialsApi.create(financialData);

      if (response.success) {
        handleClose();
        // INSERT_YOUR_CODE
        successAlert('Submitted new financials! Loan health scores will update shortly.', 'toast');
      } else {
        setError(response.error || 'Failed to submit financial data');
      }
    } catch (err) {
      console.error('Error submitting financial data:', err);
      setError(err.message || 'An error occurred while submitting financial data');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <UniversalModal
      show={$borrowerFinancialsView.value.showSubmitModal}
      onHide={handleClose}
      headerText="Submit Financial Data"
      leftBtnText="Cancel"
      rightBtnText={isSubmitting ? 'Submitting...' : 'Submit'}
      rightBtnOnClick={handleSubmit}
      rightButtonDisabled={isSubmitting}
      size="fullscreen"
      closeButton
    >
      <div className="py-16">
        {error && (
          <Alert variant="danger" dismissible onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* File Upload Section */}
        <div className="mb-32 p-24 bg-info-800 rounded">
          <h5 className="text-info-100 mb-16">
            <FontAwesomeIcon icon={faFileAlt} className="me-8" />
            Upload Financial Documents
          </h5>
          <p className="text-info-200 small mb-16">
            Upload financial statements (PDF, Excel, etc.). Our system will automatically extract financial data.
          </p>
          <FileUploader
            name="financialDocs"
            signal={$financialDocsUploader}
            acceptedTypes=".pdf,.xlsx,.xls,.doc,.docx,.csv"
            onUpload={handleFileUpload}
          />
          {ocrApplied && (
            <Alert variant="success" className="mt-16 mb-0">
              <FontAwesomeIcon icon={faMagic} className="me-8" />
              Financial data extracted from documents and populated below. Please review and adjust as needed.
            </Alert>
          )}
        </div>

        <Form>
          <h5 className="text-info-100 mb-16 fw-600">Financial Period</h5>
          <Row>
            <Col md={6} className="mb-24">
              <UniversalInput
                label="As Of Date (Financial Statement Date)"
                type="date"
                placeholder="YYYY-MM-DD"
                value={$borrowerFinancialsForm.value.asOfDate}
                name="asOfDate"
                signal={$borrowerFinancialsForm}
                required
              />
              <Form.Text className="text-info-200">
                The date these financials are effective (e.g., end of quarter: 2024-03-31)
              </Form.Text>
            </Col>
          </Row>

          <hr className="my-24 border-info-700" />

          <h5 className="text-info-100 mb-16 fw-600">Revenue & Income</h5>
          <Row>
            <Col md={4} className="mb-16">
              <UniversalInput
                label="Gross Revenue"
                type="number"
                placeholder="5000000"
                value={$borrowerFinancialsForm.value.grossRevenue}
                name="grossRevenue"
                signal={$borrowerFinancialsForm}
              />
            </Col>
            <Col md={4} className="mb-16">
              <UniversalInput
                label="Net Income"
                type="number"
                placeholder="750000"
                value={$borrowerFinancialsForm.value.netIncome}
                name="netIncome"
                signal={$borrowerFinancialsForm}
              />
            </Col>
            <Col md={4} className="mb-16">
              <UniversalInput
                label="EBITDA"
                type="number"
                placeholder="1200000"
                value={$borrowerFinancialsForm.value.ebitda}
                name="ebitda"
                signal={$borrowerFinancialsForm}
              />
            </Col>
          </Row>

          <hr className="my-24 border-info-700" />

          <h5 className="text-info-100 mb-16 fw-600">Debt Service Coverage</h5>
          <Row>
            <Col md={6} className="mb-16">
              <UniversalInput
                label="Debt Service Ratio"
                type="number"
                step="0.01"
                placeholder="1.45"
                value={$borrowerFinancialsForm.value.debtService}
                name="debtService"
                signal={$borrowerFinancialsForm}
              />
            </Col>
            <Col md={6} className="mb-16">
              <UniversalInput
                label="Debt Service Covenant"
                type="number"
                step="0.01"
                placeholder="1.25"
                value={$borrowerFinancialsForm.value.debtServiceCovenant}
                name="debtServiceCovenant"
                signal={$borrowerFinancialsForm}
              />
            </Col>
          </Row>

          <hr className="my-24 border-info-700" />

          <h5 className="text-info-100 mb-16 fw-600">Current Ratio</h5>
          <Row>
            <Col md={6} className="mb-16">
              <UniversalInput
                label="Current Ratio"
                type="number"
                step="0.01"
                placeholder="2.1"
                value={$borrowerFinancialsForm.value.currentRatio}
                name="currentRatio"
                signal={$borrowerFinancialsForm}
              />
            </Col>
            <Col md={6} className="mb-16">
              <UniversalInput
                label="Current Ratio Covenant"
                type="number"
                step="0.01"
                placeholder="1.5"
                value={$borrowerFinancialsForm.value.currentRatioCovenant}
                name="currentRatioCovenant"
                signal={$borrowerFinancialsForm}
              />
            </Col>
          </Row>

          <hr className="my-24 border-info-700" />

          <h5 className="text-info-100 mb-16 fw-600">Liquidity</h5>
          <Row>
            <Col md={6} className="mb-16">
              <UniversalInput
                label="Liquidity"
                type="number"
                placeholder="850000"
                value={$borrowerFinancialsForm.value.liquidity}
                name="liquidity"
                signal={$borrowerFinancialsForm}
              />
            </Col>
            <Col md={6} className="mb-16">
              <UniversalInput
                label="Liquidity Covenant"
                type="number"
                placeholder="500000"
                value={$borrowerFinancialsForm.value.liquidityCovenant}
                name="liquidityCovenant"
                signal={$borrowerFinancialsForm}
              />
            </Col>
          </Row>

          <Row>
            <Col md={6} className="mb-16">
              <UniversalInput
                label="Liquidity Ratio"
                type="number"
                step="0.01"
                placeholder="1.85"
                value={$borrowerFinancialsForm.value.liquidityRatio}
                name="liquidityRatio"
                signal={$borrowerFinancialsForm}
              />
            </Col>
            <Col md={6} className="mb-16">
              <UniversalInput
                label="Liquidity Ratio Covenant"
                type="number"
                step="0.01"
                placeholder="1.2"
                value={$borrowerFinancialsForm.value.liquidityRatioCovenant}
                name="liquidityRatioCovenant"
                signal={$borrowerFinancialsForm}
              />
            </Col>
          </Row>

          <hr className="my-24 border-info-700" />

          <h5 className="text-info-100 mb-16 fw-600">Other</h5>
          <Row>
            <Col md={6} className="mb-16">
              <UniversalInput
                label="Retained Earnings"
                type="number"
                placeholder="2300000"
                value={$borrowerFinancialsForm.value.retainedEarnings}
                name="retainedEarnings"
                signal={$borrowerFinancialsForm}
              />
            </Col>
            <Col md={6} className="mb-16">
              <UniversalInput
                label="Notes"
                type="text"
                placeholder="Additional notes or comments"
                value={$borrowerFinancialsForm.value.notes}
                name="notes"
                signal={$borrowerFinancialsForm}
              />
            </Col>
          </Row>
        </Form>
      </div>
    </UniversalModal>
  );
};

export default SubmitFinancialsModal;
