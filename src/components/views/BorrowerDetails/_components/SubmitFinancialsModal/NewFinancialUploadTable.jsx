import { useMemo } from 'react';
import { Button } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck } from '@fortawesome/free-solid-svg-icons';
import SignalTable from '@src/components/global/SignalTable';
import { $modalState } from './_helpers/submitFinancialsModal.consts';
import { NEW_FINANCIAL_SECTION_ROWS, NEW_FINANCIAL_UPLOAD_TABLE_HEADERS } from './_helpers/newFinancialUploadTable.consts';
import * as tableEvents from './_helpers/newFinancialUploadTable.events';
import './NewFinancialUploadTable.scss';

const NewFinancialUploadTable = () => {
  const { documentsByType, isLoading: modalLoading } = $modalState.value;

  const uploadTableRows = useMemo(
    () => NEW_FINANCIAL_SECTION_ROWS.map(({ sectionId, title }) => {
      const docs = documentsByType[sectionId] || [];
      const hasFile = docs.length > 0;
      let nameLabel = '—';
      if (hasFile) {
        nameLabel = docs.length === 1 ? docs[0].fileName : `${docs.length} files`;
      }
      const inputId = `new-financial-upload-${sectionId}`;

      return {
        id: sectionId,
        document: <div className="fw-semibold text-light">{title}</div>,
        status: hasFile ? (
          <span className="d-inline-flex align-items-center gap-4  text-light">
            <FontAwesomeIcon icon={faCheck} size="sm" />
            Uploaded
          </span>
        ) : (
          <span className="text-info-200 ">Not uploaded</span>
        ),
        file: (
          <div
            className="text-light w-100 min-w-0 text-truncate"
            title={hasFile ? nameLabel : undefined}
          >
            {nameLabel}
          </div>
        ),
        action: (
          <div role="presentation" onClick={(e) => e.stopPropagation()}>
            <div className="d-none">
              <input
                type="file"
                id={inputId}
                accept=".pdf,.xlsx,.xls,.doc,.docx,.csv"
                onChange={(e) => tableEvents.handleRowFileChange(e, sectionId)}
              />
            </div>
            {hasFile ? (
              <Button
                type="button"
                size="sm"
                variant="link"
                className="p-0 text-info-200 text-decoration-none"
                onClick={() => tableEvents.clearRow(sectionId)}
                disabled={modalLoading}
              >
                Remove
              </Button>
            ) : (
              <label
                htmlFor={inputId}
                className="text-info-100 small fw-bold mb-0"
                style={{ cursor: 'pointer' }}
              >
                Upload
              </label>
            )}
          </div>
        ),
      };
    }),
    [documentsByType, modalLoading],
  );

  return (
    <div>
      <div className="mb-16">
        <h5 className="text-info-100 fw-600 mb-4">Upload financial documents</h5>
        <p className="text-info-200 small mb-0">
          Add at least one file, set your as of date above, then submit. Extraction will be handled by the system
          after you submit.
        </p>
      </div>

      <div className="new-financial-upload-table">
        <SignalTable
          headers={NEW_FINANCIAL_UPLOAD_TABLE_HEADERS}
          rows={uploadTableRows}
          hasPagination={false}
          totalCount={uploadTableRows.length}
          currentPage={1}
          itemsPerPageAmount={10}
          onRowClick={() => {}}
          rowClassName="new-financial-upload-table__row"
        />
      </div>
    </div>
  );
};

export default NewFinancialUploadTable;
