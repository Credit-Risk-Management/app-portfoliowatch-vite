import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Container, Button, Alert, Card, Spinner,
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
import AttestationModal from '@src/components/views/PublicFinacialUpload/_components/AttestationModal';
import {
  $publicGuarantorUploadView,
  DEFAULT_GUARANTOR_PUBLIC_ATTESTATION_TEXT,
} from './_helpers/publicGuarantorFinancialUpload.consts';
import {
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

const PublicGuarantorFinancialUpload = () => {
  const { token } = useParams();

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

  const attestationText = linkData?.attestationText || DEFAULT_GUARANTOR_PUBLIC_ATTESTATION_TEXT;

  if (isLoading) {
    return (
      <ContentWrapper
        fluid
        className="bg-white min-vh-100 d-flex align-items-center justify-content-center py-20 py-md-24"
      >
        <Container className="py-24 d-flex flex-column align-items-center justify-content-center gap-12">
          <Spinner animation="border" role="status" variant="dark" aria-busy="true">
            <span className="visually-hidden">Loading guarantor upload link…</span>
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
                This upload link has already been used. If you need to send updated files, contact your lender
                for a new link.
              </p>
            </Card.Body>
          </Card>
        </Container>
      </ContentWrapper>
    );
  }

  if (success) {
    return (
      <ContentWrapper fluid className="min-vh-100 bg-white">
        <Container className="py-24">
          <Card className="bg-grey-50 border-grey">
            <Card.Body className="text-center py-32">
              <FontAwesomeIcon icon={faCheckCircle} className="text-dark-700 mb-16" size="3x" />
              <h3 className="text-dark-900 mb-16">Documents Submitted</h3>
              <p className="text-dark-800 mb-8">
                Thank you! Your guarantor financial documents have been received.
              </p>
              <p className="text-dark-700 mb-24">
                Your lender will review your files. If you have questions, contact your loan officer.
              </p>
            </Card.Body>
          </Card>
        </Container>
      </ContentWrapper>
    );
  }

  const requiredPdfSections = getRequiredPdfSectionsForGuarantorLink(linkData);
  const canSubmit = requiredPdfSections.length > 0
    && requiredPdfSections.every((row) => hasGuarantorPdfStagedForKey(row.apiDocumentKey));

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
                <h1 className="h4 fw-bold text-dark mb-8 lh-sm">Guarantor financial documents</h1>
                {linkData && (
                  <div className="d-flex flex-column gap-4">
                    <div className="d-flex gap-8 fs-6">
                      <span className="fw-semibold text-dark text-nowrap">Guarantor</span>
                      <span className="text-grey-600">{linkData.guarantor.name}</span>
                    </div>
                    <div className="d-flex gap-8 fs-6">
                      <span className="fw-semibold text-dark text-nowrap">Organization</span>
                      <span className="text-grey-600">{linkData.organization.name}</span>
                    </div>
                    <div className="d-flex gap-8 fs-6">
                      <span className="fw-semibold text-dark text-nowrap">Period</span>
                      <span className="text-grey-600">
                        {linkData.reportingPeriodEndDate
                          ? formatDate(new Date(linkData.reportingPeriodEndDate))
                          : (linkData.periodLabel || 'Annual')}
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
              <Alert variant="danger" dismissible onClose={clearGuarantorError} className="mb-24">
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
                  || 'Upload each required annual document below, then certify and submit. For debt schedule and PFS, you may use the templates or your prior year file to update.'}
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
                          <td className="ps-16 py-8 text- text-truncate" style={{ maxWidth: 400 }}>
                            <div className="fw-semibold text-dark text-truncate">{hasPdf ? firstFileName : '—'}</div>
                          </td>
                          <td className="pe-16 py-8 text-end">
                            <div className="d-none">
                              <FileUploader
                                id={inputId}
                                name="financialDocs"
                                signal={uploaderSignal}
                                acceptedTypes=".pdf,.xlsx,.xls,.doc,.docx,.csv"
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
                  onClick={openGuarantorAttestationModal}
                  disabled={!canSubmit || isSubmitting}
                >
                  Certify and submit
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
        onClose={closeGuarantorAttestationModal}
        onConfirm={() => {
          closeGuarantorAttestationModal();
          handleGuarantorFileUpload();
        }}
      />
    </ContentWrapper>
  );
};

export default PublicGuarantorFinancialUpload;
