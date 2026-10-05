import { Alert, Col, Row, Spinner } from 'react-bootstrap';
import UniversalModal from '@src/components/global/UniversalModal';
import UniversalInput from '@src/components/global/Inputs/UniversalInput';
import { $borrowerFinancialsView } from '@src/signals';
import * as events from './_helpers/createQuarterlyPublicUploadLinkModal.events';
import {
  $createQuarterlyPublicUploadLinkForm,
  $createQuarterlyPublicUploadLinkState,
  QUARTERLY_DOC_CONFIG,
  QUARTER_SELECT_OPTIONS,
  buildYearSelectOptionsForState,
  hasAtLeastOneQuarterlyDocumentSelected,
  hasAtLeastOneQuarterlyRequiredForSubmit,
  hasExclusiveIncomeConflict,
} from './_helpers/createQuarterlyPublicUploadLinkModal.consts';

const CreateQuarterlyPublicUploadLinkModal = () => {
  const { activeModalKey, currentBorrowerId } = $borrowerFinancialsView.value;
  const { isCreating, error, availableYears } = $createQuarterlyPublicUploadLinkState.value;
  const formValue = $createQuarterlyPublicUploadLinkForm.value;
  const yearSelectOptions = buildYearSelectOptionsForState(availableYears);

  const canCreate = hasAtLeastOneQuarterlyDocumentSelected(formValue)
    && hasAtLeastOneQuarterlyRequiredForSubmit(formValue)
    && !hasExclusiveIncomeConflict(formValue)
    && !isCreating;

  return (
    <UniversalModal
      show={activeModalKey === 'createQuarterlyPublicUploadLink'}
      onHide={events.closeCreateQuarterlyPublicUploadLinkModal}
      headerText="Create quarterly public upload link"
      leftBtnText="Cancel"
      leftButtonDisabled={isCreating}
      keyboard={!isCreating}
      backdrop={isCreating ? 'static' : true}
      rightBtnText={isCreating ? (
        <>
          <Spinner animation="border" size="sm" className="me-2 align-middle" role="status" aria-hidden />
          Creating…
        </>
      ) : 'Create & copy link'}
      rightButtonDisabled={!canCreate}
      rightBtnOnClick={() => events.handleCreateQuarterlyPublicUploadLink(currentBorrowerId)}
      closeButton
    >
      {error && (
        <Alert
          variant="danger"
          dismissible
          onClose={() => $createQuarterlyPublicUploadLinkState.update({ error: null })}
          className="mb-16"
        >
          {error}
        </Alert>
      )}

      <p className="text-info-100 mb-16">
        Choose the reporting period and which documents appear on the public page. Mark at least one as
        {' '}
        <span className="fw-600">required to submit</span>
        . Include either a year-to-date or quarterly income statement, not both.
      </p>

      <Row className="gy-12">
        <Col xs={12} md={6}>
          <UniversalInput
            type="select"
            name="reportingYear"
            label="Reporting year"
            labelClassName="text-info-100"
            signal={$createQuarterlyPublicUploadLinkForm}
            selectOptions={yearSelectOptions}
            notClearable
          />
        </Col>
        <Col xs={12} md={6}>
          <UniversalInput
            type="select"
            name="reportingQuarter"
            label="Quarter"
            labelClassName="text-info-100"
            signal={$createQuarterlyPublicUploadLinkForm}
            selectOptions={QUARTER_SELECT_OPTIONS}
            notClearable
          />
        </Col>

        <Col xs={12}>
          <p className="text-info-100 fw-600 mb-8">Documents</p>
          <div className="d-flex flex-column gap-12 ps-8">
            {QUARTERLY_DOC_CONFIG.map((doc) => {
              const included = Boolean(formValue[doc.includeKey]);
              return (
                <div
                  key={doc.includeKey}
                  className="d-flex flex-wrap align-items-center justify-content-between gap-12"
                >
                  <UniversalInput
                    type="checkbox"
                    name={doc.includeKey}
                    label={doc.label}
                    labelClassName="text-info-100"
                    signal={$createQuarterlyPublicUploadLinkForm}
                    className="mb-0"
                    customOnChange={() => events.handleQuarterlyDocumentIncludeChange(
                      doc.includeKey,
                      !included,
                    )}
                  />
                  {included && (
                    <UniversalInput
                      type="checkbox"
                      name={doc.requiredKey}
                      label="Required to submit"
                      labelClassName="text-info-100"
                      signal={$createQuarterlyPublicUploadLinkForm}
                      className="mb-0"
                    />
                  )}
                </div>
              );
            })}
          </div>
        </Col>

        <Col xs={12}>
          <UniversalInput
            type="textarea"
            name="lenderInstructions"
            label="Lender instructions (optional)"
            labelClassName="text-info-100"
            placeholder="Custom message shown on the public upload page"
            signal={$createQuarterlyPublicUploadLinkForm}
            rows={3}
          />
        </Col>
      </Row>
    </UniversalModal>
  );
};

export default CreateQuarterlyPublicUploadLinkModal;
