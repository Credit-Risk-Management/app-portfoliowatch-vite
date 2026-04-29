import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container, Button, Alert, Card,
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
<<<<<<<< HEAD:src/components/views/PublicFinacialUpload/PublicFinancialUpload.jsx
import { $publicFinancialUploadView, DEFAULT_PUBLIC_ATTESTATION_TEXT } from './_helpers/publicFinancialUpload.consts';
import AttestationModal from './_components/AttestationModal';
========
import AttestationModal from '@src/components/views/PublicFinacialUpload/_components/AttestationModal';
>>>>>>>> develop:src/components/views/PublicGuarantorFinancialUpload/PublicGuarantorFinancialUpload.jsx
import {
  $publicGuarantorUploadView,
  DEFAULT_GUARANTOR_PUBLIC_ATTESTATION_TEXT,
} from './_helpers/publicGuarantorFinancialUpload.consts';
import {
<<<<<<<< HEAD:src/components/views/PublicFinacialUpload/PublicFinancialUpload.jsx
  handleFileUpload,
  clearError,
  clearPublicFinancialSectionFiles,
  handleOpenPriorDebtSchedulePdf,
  handleOpenDebtScheduleTemplatePdf,
  openAttestationModal,
  closeAttestationModal,
} from './_helpers/publicFinancialUpload.events';
========
  getRequiredPdfSectionsForGuarantorLink,
  hasGuarantorPdfStagedForKey,
  getGuarantorUploaderForDocKey,
} from './_helpers/publicGuarantorFinancialUpload.helpers';
import { fetchGuarantorUploadLinkData } from './_helpers/publicGuarantorFinancialUpload.resolvers';
import {
  handleGuarantorFileUpload,
  clearGuarantorError,
  clearGuarantorSectionFiles, handleOpenPfsTemplatePdf,
  openGuarantorAttestationModal,
  closeGuarantorAttestationModal,
} from './_helpers/publicGuarantorFinancialUpload.events';
>>>>>>>> develop:src/components/views/PublicGuarantorFinancialUpload/PublicGuarantorFinancialUpload.jsx

const PublicGuarantorFinancialUpload = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    fetchGuarantorUploadLinkData(token);
  }, [token]);
  const {
    linkData,
    isLoading,
    isSubmitting,
    activeModalKey,
    error,
    success,
  } = $publicGuarantorUploadView.value;

<<<<<<<< HEAD:src/components/views/PublicFinacialUpload/PublicFinancialUpload.jsx
  const attestationText = linkData?.attestationText || DEFAULT_PUBLIC_ATTESTATION_TEXT;
========
  const attestationText = linkData?.attestationText || DEFAULT_GUARANTOR_PUBLIC_ATTESTATION_TEXT;
>>>>>>>> develop:src/components/views/PublicGuarantorFinancialUpload/PublicGuarantorFinancialUpload.jsx

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

  if (linkData?.hasSubmitted) {
<<<<<<<< HEAD:src/components/views/PublicFinacialUpload/PublicFinancialUpload.jsx
    return (
      <ContentWrapper fluid className="min-vh-100 bg-info-900">
        <Container className="py-24">
          <Card className="bg-info-800 border-secondary">
            <Card.Body className="text-center py-32">
              <FontAwesomeIcon icon={faCheckCircle} className="text-info-200 mb-16" size="3x" />
              <h3 className="text-info-100 mb-16">Submission already received</h3>
              <p className="text-info-200 mb-24">
                This upload link has already been used to submit financial documents. If you need to send
                updated files, contact your lender for a new link.
              </p>
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
========
>>>>>>>> develop:src/components/views/PublicGuarantorFinancialUpload/PublicGuarantorFinancialUpload.jsx
    return (
      <ContentWrapper fluid className="min-vh-100 bg-info-900">
        <Container className="py-24">
          <Card className="bg-info-800 border-secondary">
            <Card.Body className="text-center py-32">
<<<<<<<< HEAD:src/components/views/PublicFinacialUpload/PublicFinancialUpload.jsx
              <FontAwesomeIcon icon={faCheckCircle} className="text-success mb-16" size="3x" />
              <h3 className="text-info-100 mb-16">Documents Submitted — Pending Extraction</h3>
              <p className="text-info-200 mb-8">
                Thank you! Your financial documents have been received.
              </p>
              <p className="text-info-300 mb-24">
                Our system will extract the financial data from your uploaded PDFs shortly. Your lender will be notified once the extraction is complete.
========
              <FontAwesomeIcon icon={faCheckCircle} className="text-info-200 mb-16" size="3x" />
              <h3 className="text-info-100 mb-16">Submission already received</h3>
              <p className="text-info-200 mb-24">
                This upload link has already been used. If you need to send updated files, contact your lender
                for a new link.
>>>>>>>> develop:src/components/views/PublicGuarantorFinancialUpload/PublicGuarantorFinancialUpload.jsx
              </p>
              <Button variant="primary-100" onClick={() => navigate('/')}>
                Go to Home
              </Button>
            </Card.Body>
          </Card>
        </Container>
      </ContentWrapper>
    );
  }

<<<<<<<< HEAD:src/components/views/PublicFinacialUpload/PublicFinancialUpload.jsx
  const requiredPdfSections = getRequiredPdfSectionsForLink(linkData);
  const canRunExtraction = requiredPdfSections.length > 0
    && requiredPdfSections.every(({ sectionId }) => hasPdfStagedForSection(sectionId));
========
  if (success) {
    return (
      <ContentWrapper fluid className="min-vh-100 bg-info-900">
        <Container className="py-24">
          <Card className="bg-info-800 ">
            <Card.Body className="text-center py-32">
              <FontAwesomeIcon icon={faCheckCircle} className="text-success mb-16" size="3x" />
              <h3 className="text-info-100 mb-16">Documents Submitted</h3>
              <p className="text-info-200 mb-8">
                Thank you! Your guarantor financial documents have been received.
              </p>
              <p className="text-info-300 mb-24">
                Your lender will review your files. If you have questions, contact your loan officer.
              </p>
              <Button variant="primary-100" onClick={() => navigate('/')}>
                Go to Home
              </Button>
            </Card.Body>
          </Card>
        </Container>
      </ContentWrapper>
    );
  }

  const requiredPdfSections = getRequiredPdfSectionsForGuarantorLink(linkData);
  const canSubmit = requiredPdfSections.length > 0
    && requiredPdfSections.every((row) => hasGuarantorPdfStagedForKey(row.apiDocumentKey));

>>>>>>>> develop:src/components/views/PublicGuarantorFinancialUpload/PublicGuarantorFinancialUpload.jsx
  return (
    <ContentWrapper fluid className="min-vh-100 bg-info-900">
      <Container className="py-16 py-md-24">
        <Card className="shadow-sm">
          <Card.Header className=" border-0 border-bottom border-grey-200 px-16 px-md-24 py-20" style={{ backgroundColor: '#f5f5f5' }}>
            <div className="d-flex justify-content-between align-items-start gap-24">
              <div className="flex-grow-1 min-w-0">
                <h1 className="h4 fw-bold text-dark mb-8 lh-sm">Guarantor financial documents</h1>
                {linkData && (
                  <div className="d-flex flex-column gap-4">
                    <div className="d-flex gap-8 fs-6">
<<<<<<<< HEAD:src/components/views/PublicFinacialUpload/PublicFinancialUpload.jsx
                      <span className="fw-semibold text-dark text-nowrap">Borrower</span>
                      <span className="text-grey-600">{linkData.borrower.name}</span>
========
                      <span className="fw-semibold text-dark text-nowrap">Guarantor</span>
                      <span className="text-grey-600">{linkData.guarantor.name}</span>
>>>>>>>> develop:src/components/views/PublicGuarantorFinancialUpload/PublicGuarantorFinancialUpload.jsx
                    </div>
                    <div className="d-flex gap-8 fs-6">
                      <span className="fw-semibold text-dark text-nowrap">Organization</span>
                      <span className="text-grey-600">{linkData.organization.name}</span>
                    </div>
                    <div className="d-flex gap-8 fs-6">
<<<<<<<< HEAD:src/components/views/PublicFinacialUpload/PublicFinancialUpload.jsx
                      <span className="fw-semibold text-dark text-nowrap">Financial period</span>
                      <span className="text-grey-600">
                        {linkData.reportingPeriodEndDate
                          ? formatDate(new Date(linkData.reportingPeriodEndDate))
                          : 'N/A'}
========
                      <span className="fw-semibold text-dark text-nowrap">Period</span>
                      <span className="text-grey-600">
                        {linkData.reportingPeriodEndDate
                          ? formatDate(new Date(linkData.reportingPeriodEndDate))
                          : (linkData.periodLabel || 'Annual')}
>>>>>>>> develop:src/components/views/PublicGuarantorFinancialUpload/PublicGuarantorFinancialUpload.jsx
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
<<<<<<<< HEAD:src/components/views/PublicFinacialUpload/PublicFinancialUpload.jsx
              <Alert variant="danger" dismissible onClose={clearError} className="mb-24">
========
              <Alert variant="danger" dismissible onClose={clearGuarantorError} className="mb-24">
>>>>>>>> develop:src/components/views/PublicGuarantorFinancialUpload/PublicGuarantorFinancialUpload.jsx
                {error}
              </Alert>
            )}
            <Card className="rounded p-16">
              <Card.Title className="h4 fw-bold text-dark mb-8 d-flex align-items-center gap-8">
                <FontAwesomeIcon icon={faFileAlt} style={{ color: '#6b7280' }} />
                Required PDFs
              </Card.Title>
              <Card.Text className="fs-7 mb-24" style={{ color: '#6b7280' }}>
                {linkData?.lenderInstructions
<<<<<<<< HEAD:src/components/views/PublicFinacialUpload/PublicFinancialUpload.jsx
                  || 'Upload each required PDF below. When every file is attached, certify and submit. Your lender will review your documents after they are received.'}
========
                  || 'Upload each required annual document below, then certify and submit. For debt schedule and PFS, you may use the templates or your prior year file to update.'}
>>>>>>>> develop:src/components/views/PublicGuarantorFinancialUpload/PublicGuarantorFinancialUpload.jsx
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
                    {requiredPdfSections.map(({
                      sectionId, title, inputId, apiDocumentKey, helperText,
                    }, rowIndex) => {
                      const uploaderSignal = getGuarantorUploaderForDocKey(apiDocumentKey);
                      const hasPdf = hasGuarantorPdfStagedForKey(apiDocumentKey);
                      const firstFileName = (uploaderSignal?.value?.financialDocs || [])[0]?.name;
                      const isLast = rowIndex === requiredPdfSections.length - 1;
                      const isPfs = apiDocumentKey === 'personalFinancialStatement';
                      return (
                        <tr
                          key={sectionId}
                          className={isLast ? undefined : 'border-bottom border-grey-200'}
                        >
                          <td className="px-16 py-8">
                            <div className="fw-semibold text-dark">{title}</div>
<<<<<<<< HEAD:src/components/views/PublicFinacialUpload/PublicFinancialUpload.jsx
                            {sectionId === 'debtScheduleWorksheet' && (
                              <div className="mt-8 small text-dark">
                                {linkData?.priorDebtSchedule ? (
                                  <>
                                    <div className="mb-4 fw-semibold">
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
                                  </>
                                ) : (
                                  <>
                                    <div className="mb-4 fw-semibold text-grey-600">
                                      No prior debt schedule on file. Open the template to see the format we need,
                                      then upload your completed PDF.
                                    </div>
                                    <Button
                                      type="button"
                                      variant="dark"
                                      size="sm"
                                      className="px-12"
                                      onClick={() => handleOpenDebtScheduleTemplatePdf()}
                                    >
                                      Open template PDF
                                    </Button>
                                  </>
                                )}
========
                            {helperText && (
                              <div className="small text-grey-600 mt-4">{helperText}</div>
                            )}
                            {isPfs && (
                              <div className="mt-8 small text-dark">
                                <div className="mb-4 fw-semibold text-grey-600">
                                  Use your standard PFS format or our template as a starting point.
                                </div>
                                <Button
                                  type="button"
                                  variant="dark"
                                  size="sm"
                                  className="px-12"
                                  onClick={() => handleOpenPfsTemplatePdf()}
                                >
                                  Open PFS template PDF
                                </Button>
>>>>>>>> develop:src/components/views/PublicGuarantorFinancialUpload/PublicGuarantorFinancialUpload.jsx
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
                          <td className="px-16 py-8 text- text-truncate" style={{ maxWidth: 0 }}>
                            <div className="fw-semibold text-dark text-truncate">{hasPdf ? firstFileName : '—'}</div>
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
                                onClick={() => clearGuarantorSectionFiles(apiDocumentKey)}
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
<<<<<<<< HEAD:src/components/views/PublicFinacialUpload/PublicFinancialUpload.jsx
                  onClick={openAttestationModal}
                  disabled={!canRunExtraction || isSubmitting}
                >
                  Submit Financials
========
                  onClick={openGuarantorAttestationModal}
                  disabled={!canSubmit || isSubmitting}
                >
                  Certify and submit
>>>>>>>> develop:src/components/views/PublicGuarantorFinancialUpload/PublicGuarantorFinancialUpload.jsx
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
<<<<<<<< HEAD:src/components/views/PublicFinacialUpload/PublicFinancialUpload.jsx
        onClose={closeAttestationModal}
        onConfirm={() => {
          closeAttestationModal();
          handleFileUpload();
========
        onClose={closeGuarantorAttestationModal}
        onConfirm={() => {
          closeGuarantorAttestationModal();
          handleGuarantorFileUpload();
>>>>>>>> develop:src/components/views/PublicGuarantorFinancialUpload/PublicGuarantorFinancialUpload.jsx
        }}
      />
    </ContentWrapper>
  );
};

export default PublicGuarantorFinancialUpload;
