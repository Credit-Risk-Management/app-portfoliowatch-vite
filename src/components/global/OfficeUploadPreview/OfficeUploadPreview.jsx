import { Button } from 'react-bootstrap';

/**
 * In-browser preview is PDF-only. Office/spreadsheet files are converted server-side on submit.
 */
const OfficeUploadPreview = ({ fileName, downloadUrl, iconClass = 'fa-file-excel' }) => (
  <div
    className="d-flex flex-column align-items-center justify-content-center text-center py-5 border border-secondary rounded bg-white"
    style={{ height: '65vh' }}
  >
    <i className={`fas ${iconClass} fa-4x text-secondary mb-3`} aria-hidden />
    <h5 className="text-dark mb-2">{fileName || 'Document'}</h5>
    <p className="text-muted mb-3 px-4" style={{ maxWidth: '28rem' }}>
      Spreadsheet and Word files are converted to PDF when you submit for extraction.
      Download the original to review in Excel or Word.
    </p>
    {downloadUrl ? (
      <Button
        as="a"
        href={downloadUrl}
        download={fileName}
        variant="outline-dark"
        size="sm"
      >
        Download file
      </Button>
    ) : null}
  </div>
);

export default OfficeUploadPreview;
