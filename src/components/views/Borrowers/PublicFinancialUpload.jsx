import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Button, Alert, Card } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faFileAlt,
  faCheck,
  faCheckCircle,
  faExclamationTriangle,
} from '@fortawesome/free-solid-svg-icons';
import FileUploader from '@src/components/global/FileUploader';
import ContentWrapper from '@src/components/global/ContentWrapper';
import sabreFinanceWordmark from '@src/assets/sabre_finance.svg?url';
import { formatDate } from '@src/components/global/Inputs/UniversalInput/_helpers/universalinput.events';
import { $publicFinancialUploadView } from './_helpers/publicFinancialUpload.consts';
import {
  getRequiredPdfSectionsForLink,
  hasPdfStagedForSection,
  getPublicUploaderSignalForSection,
} from './_helpers/publicFinancialUpload.helpers';
import { fetchUploadLinkData } from './_helpers/publicFinancialUpload.resolvers';
import {
  handleFileUpload,
  clearError,
  clearPublicFinancialSectionFiles,
  handleOpenPriorDebtSchedulePdf,
} from './_helpers/publicFinancialUpload.events';

const PublicFinancialUpload = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  // Fetch upload link data on mount
  useEffect(() => {
    fetchUploadLinkData(token);
  }, [token]);

  const {
    linkData,
    isLoading,
    isExtracting,
    error,
    success,
    priorDebtOpening,
  } = $publicFinancialUploadView.value;

  const extracting = isExtracting ?? false;

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
          <Card className="bg-info-800 ">
            <Card.Body className="text-center py-32">
              <FontAwesomeIcon icon={faCheckCircle} className="text-success mb-16" size="3x" />
              <h3 className="text-info-100 mb-16">Financial Data Submitted Successfully</h3>
              <p className="text-info-200 mb-24">
                Thank you for submitting your financial information. Your data has been received and will be processed shortly.
              </p>
              <Button variant="primary-100" onClick={() => navigate('/')}>
                Go to Dashboard
              </Button>
            </Card.Body>
          </Card>
        </Container>
      </ContentWrapper>
    );
  }

  const requiredPdfSections = getRequiredPdfSectionsForLink(linkData);
  const canRunExtraction = requiredPdfSections.length > 0
    && requiredPdfSections.every(({ sectionId }) => hasPdfStagedForSection(sectionId));

  return (
    <ContentWrapper fluid className="min-vh-100 bg-info-900">
      <Container className="py-16 py-md-24">
        <Card className="shadow-sm">
          <Card.Header className=" border-0 border-bottom border-grey-200 px-16 px-md-24 py-20" style={{ backgroundColor: '#f5f5f5' }}>
            <div className="d-flex justify-content-between align-items-start gap-24">
              <div className="flex-grow-1 min-w-0">
                <h1 className="h4 fw-bold text-dark mb-8 lh-sm">Submit Financial Data</h1>
                {linkData && (
                <div className="d-flex flex-column gap-4">
                  <div className="d-flex gap-8 fs-6">
                    <span className="fw-semibold text-dark text-nowrap">Borrower</span>
                    <span className="text-grey-600">{linkData.borrower.name}</span>
                  </div>
                  <div className="d-flex gap-8 fs-6">
                    <span className="fw-semibold text-dark text-nowrap">Organization</span>
                    <span className="text-grey-600">{linkData.organization.name}</span>
                  </div>
                  <div className="d-flex gap-8 fs-6">
                    <span className="fw-semibold text-dark text-nowrap">Financial period</span>
                    <span className="text-grey-600">
                      {linkData.reportingPeriodEndDate
                        ? formatDate(new Date(linkData.reportingPeriodEndDate))
                        : 'N/A'}
                    </span>
                  </div>
                </div>
                )}
              </div>
              {linkData?.organization?.name?.toLowerCase().includes('sabre') ? (
                <img
                  src={sabreFinanceWordmark}
                  alt="Sabre Finance"
                  className="flex-shrink-0"
                  style={{ height: '60px', width: 'auto' }}
                />
              ) : (
                <img
                  src="/logo_dark.svg"
                  alt={linkData?.organization?.name || 'Portfolio Watch'}
                  className="flex-shrink-0"
                  style={{ height: '38px', width: 'auto' }}
                />
              )}
            </div>
          </Card.Header>
          <Card.Body className="px-16 px-md-24 py-20 py-md-24">
            {error && (
            <Alert variant="danger" dismissible onClose={clearError} className="mb-24">
              {error}
            </Alert>
            )}
            <Card className="rounded p-16">
              <Card.Title className="h4 fw-bold text-dark mb-8 d-flex align-items-center gap-8">
                <FontAwesomeIcon icon={faFileAlt} style={{ color: '#6b7280' }} />
                Upload financial documents
              </Card.Title>
              <Card.Text className="fs-7 " style={{ color: '#6b7280' }}>
                {linkData?.lenderInstructions
              || 'Upload each required PDF below. When every file is attached, run extraction to continue.'}
              </Card.Text>
              <div className="table-secondary overflow-hidden">
                <table className="primary-table table table-hover mb-0 align-middle">
                  <thead>
                    <tr className="border-bottom border-grey-200">
                      <th className=" fw-semibold text-uppercase  px-16" style={{ width: '32%', color: '#71717a', letterSpacing: '0.06em' }}>Document</th>
                      <th className=" fw-semibold text-uppercase  px-16" style={{ width: '18%', color: '#71717a', letterSpacing: '0.06em' }}>Status</th>
                      <th className=" fw-semibold text-uppercase  px-16" style={{ color: '#71717a', letterSpacing: '0.06em' }}>File</th>
                      <th className=" fw-semibold text-uppercase  px-16 text-end" style={{ width: '12%', color: '#71717a', letterSpacing: '0.06em' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {requiredPdfSections.map(({ sectionId, title, inputId }, rowIndex) => {
                      const uploaderSignal = getPublicUploaderSignalForSection(sectionId);
                      const hasPdf = hasPdfStagedForSection(sectionId);
                      const firstFileName = (uploaderSignal.value.financialDocs || [])[0]?.name;
                      const isLast = rowIndex === requiredPdfSections.length - 1;
                      return (
                        <tr
                          key={sectionId}
                          className={isLast ? undefined : 'border-bottom border-grey-200'}
                        >
                          <td className="px-16 py-8">
                            <div className="fw-semibold text-dark">{title}</div>
                            {sectionId === 'debtSchedule' && linkData?.priorDebtSchedule && (
                              <div className="mt-8 fw-semibold small text-dark">
                                <div className="mb-4">
                                  Previous schedule on file:
                                  {' '}
                                  <span className="text-dark">{linkData.priorDebtSchedule.fileName}</span>
                                </div>
                                <Button
                                  type="button"
                                  variant="dark"
                                  size="sm"
                                  className="px-12"
                                  disabled={priorDebtOpening}
                                  onClick={() => handleOpenPriorDebtSchedulePdf()}
                                >
                                  {priorDebtOpening ? 'Opening…' : 'Open previous PDF'}
                                </Button>
                              </div>
                            )}
                          </td>
                          <td className="px-16 py-8">
                            {hasPdf ? (
                              <span className="d-inline-flex align-items-center fw-semibold text-success-700">
                                <span className="me-4">
                                  <FontAwesomeIcon icon={faCheck} size="sm" className="text-success-700" />
                                </span>
                                Uploaded
                              </span>
                            ) : (
                              <span className="text-grey-600 fw-normal">Not uploaded</span>
                            )}
                          </td>
                          <td className="px-16 py-8 text-grey-600 text-truncate" style={{ maxWidth: 0 }}>
                            {hasPdf ? firstFileName : '—'}
                          </td>
                          <td className="px-16 py-8 text-end">
                            <div className="d-none">
                              <FileUploader
                                id={inputId}
                                name="financialDocs"
                                signal={uploaderSignal}
                                acceptedTypes=".pdf"
                              />
                            </div>
                            {hasPdf ? (
                              <Button
                                size="sm"
                                variant="link"
                                className="fw-bold text-dark p-0 text-decoration-none"
                                onClick={() => clearPublicFinancialSectionFiles(sectionId)}
                              >
                                Remove
                              </Button>
                            ) : (

                              <label htmlFor={inputId} className="fw-bold text-dark mb-0" style={{ cursor: 'pointer' }}>
                                Upload
                              </label>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="d-flex justify-content-end gap-8 mt-24">
                <Button
                  className="px-20"
                  style={{ borderRadius: '0.375rem', backgroundColor: '#151517', borderColor: '#5e6470', color: '#fff' }}
                  onClick={() => handleFileUpload()}
                  disabled={!canRunExtraction || extracting}
                >
                  {extracting ? 'Submitting...' : 'Submit Financials'}
                </Button>
              </div>
            </Card>
          </Card.Body>
        </Card>
      </Container>
    </ContentWrapper>
  );
};

export default PublicFinancialUpload;
