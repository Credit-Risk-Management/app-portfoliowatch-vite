import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Container, Button, Alert, Card, Spinner, Modal,
} from 'react-bootstrap';
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
import {
  $debtScheduleWorksheetForm,
  $publicFinancialUploadView,
  DEFAULT_PUBLIC_ATTESTATION_TEXT,
} from './_helpers/publicFinancialUpload.consts';
import AttestationModal from './_components/AttestationModal';
import DebtScheduleWorksheetModal from './_components/DebtScheduleWorksheetModal';
import {
  getRequiredPdfSectionsForLink,
  hasPdfStagedForSection,
  getPublicUploaderSignalForSection,
  isSectionReadyForSubmit,
} from './_helpers/publicFinancialUpload.helpers';
import { fetchUploadLinkData } from './_helpers/publicFinancialUpload.resolvers';
import {
  handleFileUpload,
  clearError,
  clearPublicFinancialSectionFiles, openAttestationModal,
  closeAttestationModal,
  openDebtScheduleWorksheetModal,
  dismissImpactQuestionnairePrompt,
  goToImpactQuestionnaireFromPublicUpload,
} from './_helpers/publicFinancialUpload.events';

const PublicFinancialUpload = () => {
  const { token } = useParams();

  // Fetch upload link data on mount
  useEffect(() => {
    fetchUploadLinkData(token);
  }, [token]);

  const {
    linkData,
    isLoading,
    isSubmitting,
    activeModalKey,
    error,
    success,
    debtScheduleWorksheetSubmitting,
    impactQuestionnairePromptDismissed,
  } = $publicFinancialUploadView.value;
  const attestationText = linkData?.attestationText || DEFAULT_PUBLIC_ATTESTATION_TEXT;
  const requiredPdfSections = getRequiredPdfSectionsForLink(linkData);
  const debtWorksheetForm = $debtScheduleWorksheetForm.value;
  const canRunExtraction = requiredPdfSections.length > 0
    && requiredPdfSections.every(({ sectionId }) => isSectionReadyForSubmit(sectionId, debtWorksheetForm));

  if (isLoading) {
    return (
      <ContentWrapper
        fluid
        className="bg-white min-vh-100 d-flex align-items-center justify-content-center py-20 py-md-24"
      >
        <Container className="py-24 d-flex flex-column align-items-center justify-content-center gap-12">
          <Spinner animation="border" role="status" variant="dark" aria-busy="true">
            <span className="visually-hidden">Loading upload link…</span>
          </Spinner>
          <p className="text-dark-700 fs-6 text-center mb-0">Loading…</p>
        </Container>
      </ContentWrapper>
    );
  }

  if (error && !linkData) {
    return (
      <ContentWrapper fluid className="min-vh-100 bg-white">
        <Container className="py-24">
          <Card className="bg-grey-50 border-grey">
            <Card.Body className="text-center py-32">
              <FontAwesomeIcon icon={faExclamationTriangle} className="text-dark-700 mb-16" size="3x" />
              <h3 className="text-dark-900 mb-16">Upload Link Error</h3>
              <p className="text-dark-800 mb-24">{error}</p>
            </Card.Body>
          </Card>
        </Container>
      </ContentWrapper>
    );
  }

  if (linkData?.hasSubmitted) {
    return (
      <ContentWrapper fluid className="min-vh-100 bg-white">
        <Container className="py-24">
          <Card className="bg-grey-50 border-grey">
            <Card.Body className="text-center py-32">
              <FontAwesomeIcon icon={faCheckCircle} className="text-dark-700 mb-16" size="3x" />
              <h3 className="text-dark-900 mb-16">Submission already received</h3>
              <p className="text-dark-800 mb-24">
                This upload link has already been used to submit financial documents. If you need to send
                updated files, contact your lender for a new link.
              </p>
            </Card.Body>
          </Card>
        </Container>
      </ContentWrapper>
    );
  }

  if (!success) {
    const showImpactOffer = linkData?.impactQuestionnaireUrl
      && !impactQuestionnairePromptDismissed;

    return (
      <ContentWrapper fluid className="min-vh-100 bg-white">
        <Container className="py-24">
          <Card className="bg-grey-50  border-grey">
            <Card.Body className="text-center py-32">
              <FontAwesomeIcon icon={faCheckCircle} className="text-dark-700 mb-16" size="3x" />
              <h3 className="text-dark-900 mb-16">Documents Submitted — Pending Extraction</h3>
              <p className="text-dark-800 mb-8">
                Thank you! Your financial documents have been received.
              </p>
              <p className="text-dark-700 mb-24">
                Our system will extract the financial data from your uploaded PDFs shortly. Your lender will be notified once the extraction is complete.
              </p>
            </Card.Body>
          </Card>
        </Container>

        <Modal
          show={showImpactOffer}
          onHide={dismissImpactQuestionnairePrompt}
          centered
        >
          <Modal.Header closeButton closeVariant="white" className="border-0 bg-grey-50 text-dark">
            <Modal.Title className="h5 fw-bold mb-0">One more thing?</Modal.Title>
          </Modal.Header>
          <Modal.Body className="px-20 py-24">
            <p className="text-dark-800 mb-16 mb-md-20">
              Please take a moment to complete this short questionnaire about your business.
            </p>
            <div className="d-flex flex-column flex-sm-row gap-8 justify-content-end">
              <Button
                type="button"
                variant="white"
                className="order-2 order-sm-1"
                onClick={dismissImpactQuestionnairePrompt}
              >
                Not now
              </Button>
              <Button
                type="button"
                variant="dark"
                className="order-1 order-sm-2"
                onClick={goToImpactQuestionnaireFromPublicUpload}
              >
                Yes, continue
              </Button>
            </div>
          </Modal.Body>
        </Modal>
      </ContentWrapper>
    );
  }

  return (
    <ContentWrapper
      fluid
      className="bg-white min-vh-100 d-flex align-items-center justify-content-center py-20 py-md-24"
    >
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
              <Card.Text className="fs-7 mb-24" style={{ color: '#6b7280' }}>
                {linkData?.lenderInstructions
                  || 'Upload each required PDF below. When every file is attached, certify and submit. Your lender will review your documents after they are received.'}
              </Card.Text>
              <div className="table-secondary overflow-hidden">
                <table className="primary-table table table-hover mb-0 align-middle">
                  <thead>
                    <tr className="border-bottom border-grey-200">
                      <th className=" fw-semibold text-uppercase  px-16" style={{ width: '32%', color: '#71717a', letterSpacing: '0.06em' }}>Document</th>
                      <th className=" fw-semibold text-uppercase  px-16" style={{ width: '18%', color: '#71717a', letterSpacing: '0.06em' }}>Status</th>
                      <th className=" fw-semibold text-uppercase  px-16" style={{ color: '#71717a', letterSpacing: '0.06em' }}>File</th>
                      <th className=" fw-semibold text-uppercase  px-16 text-end text-nowrap" style={{ width: '15%', minWidth: '152px', color: '#71717a', letterSpacing: '0.06em' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {requiredPdfSections.map(({ sectionId, title, inputId }, rowIndex) => {
                      const uploaderSignal = getPublicUploaderSignalForSection(sectionId);
                      const rowReady = isSectionReadyForSubmit(sectionId, debtWorksheetForm);
                      const hasPdf = sectionId === 'debtScheduleWorksheet'
                        ? rowReady
                        : hasPdfStagedForSection(sectionId);
                      let firstFileName;
                      if (sectionId === 'debtScheduleWorksheet') {
                        firstFileName = rowReady ? 'Worksheet complete (PDF generated on submit)' : '—';
                      } else {
                        firstFileName = (uploaderSignal.value.financialDocs || [])[0]?.name;
                      }
                      const isLast = rowIndex === requiredPdfSections.length - 1;
                      return (
                        <tr
                          key={sectionId}
                          className={isLast ? undefined : 'border-bottom border-grey-200'}
                        >
                          <td className="px-16 py-8">
                            <div className="fw-semibold text-dark">{title}</div>
                          </td>
                          <td className="px-16 py-8">
                            {hasPdf ? (
                              <span className="d-inline-flex align-items-center fw-semibold text-success-700">
                                <span className="me-4">
                                  <FontAwesomeIcon icon={faCheck} size="sm" className="text-success-700" />
                                </span>
                                {sectionId === 'debtScheduleWorksheet' ? 'Complete' : 'Uploaded'}
                              </span>
                            ) : (
                              <span className="text-grey-600 fw-normal">
                                {sectionId === 'debtScheduleWorksheet' ? 'Worksheet not complete' : 'Not uploaded'}
                              </span>
                            )}
                          </td>
                          <td className="ps-16 py-8 text- text-truncate" style={{ maxWidth: 400 }}>
                            <div className="fw-semibold text-dark text-truncate">{hasPdf ? firstFileName : '—'}</div>
                          </td>
                          <td className="pe-16 py-8 text-end">
                            {sectionId === 'debtScheduleWorksheet' && (
                            <div className="text-dark d-flex justify-content-end">
                              <Button
                                type="button"
                                variant="dark"
                                size="sm"
                                className="text-nowrap"
                                onClick={() => openDebtScheduleWorksheetModal()}
                              >
                                Open worksheet
                              </Button>
                            </div>
                            )}
                            {sectionId !== 'debtScheduleWorksheet' && (
                            <>
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
                            </>
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
                  onClick={openAttestationModal}
                  disabled={!canRunExtraction || isSubmitting}
                >
                  Submit Financials
                </Button>
              </div>
            </Card>
          </Card.Body>
        </Card>
      </Container>

      <AttestationModal
        show={activeModalKey === 'attestation'}
        attestationText={attestationText}
        isSubmitting={isSubmitting}
        onClose={closeAttestationModal}
        onConfirm={() => {
          closeAttestationModal();
          handleFileUpload();
        }}
      />
      <DebtScheduleWorksheetModal
        show={activeModalKey === 'debtSchedule'}
        isSubmitting={isSubmitting}
        worksheetSubmitting={debtScheduleWorksheetSubmitting}
      />
    </ContentWrapper>
  );
};

export default PublicFinancialUpload;
