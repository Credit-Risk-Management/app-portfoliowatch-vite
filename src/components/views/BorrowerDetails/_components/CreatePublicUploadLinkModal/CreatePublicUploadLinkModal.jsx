import { Alert, Col, Row } from 'react-bootstrap';
import UniversalModal from '@src/components/global/UniversalModal';
import UniversalInput from '@src/components/global/Inputs/UniversalInput';
import { Spinner } from 'react-bootstrap';
import { $borrowerFinancialsView } from '@src/signals';
import * as events from './_helpers/createPublicUploadLinkModal.events';
import {
  $createPublicUploadLinkForm,
  $createPublicUploadLinkState,
  getSelectedTaxYearsFromForm,
  hasAtLeastOneDocumentSelected,
  hasAtLeastOneRequiredForSubmit,
} from './_helpers/createPublicUploadLinkModal.consts';

const CreatePublicUploadLinkModal = () => {
  const { activeModalKey, currentBorrowerId } = $borrowerFinancialsView.value;
  const { isCreating, error, availableTaxYears } = $createPublicUploadLinkState.value;
  const formValue = $createPublicUploadLinkForm.value;

  const selectedTaxYears = getSelectedTaxYearsFromForm(formValue, availableTaxYears);
  const mostRecentAvailableYear = availableTaxYears.length > 0
    ? Math.max(...availableTaxYears)
    : null;
  const showExtensionOption = selectedTaxYears.includes(mostRecentAvailableYear);
  const canCreate = hasAtLeastOneDocumentSelected(formValue, availableTaxYears)
    && hasAtLeastOneRequiredForSubmit(formValue, availableTaxYears)
    && !isCreating;

  return (
    <UniversalModal
      show={activeModalKey === 'createPublicUploadLink'}
      onHide={events.closeCreatePublicUploadLinkModal}
      headerText="Create public upload link"
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
      rightBtnOnClick={() => events.handleCreatePublicUploadLink(currentBorrowerId)}
      closeButton
    >
      {error && (
        <Alert
          variant="danger"
          dismissible
          onClose={() => $createPublicUploadLinkState.update({ error: null })}
          className="mb-16"
        >
          {error}
        </Alert>
      )}

      <p className="text-info-100 mb-16">
        Choose which documents appear on the public page. Mark at least one as
        {' '}
        <span className="fw-600">required to submit</span>
        {' '}
        so the package can complete after a single upload.
      </p>

      <Row className="gy-12">
        <Col xs={12}>
          <p className="text-info-100 fw-600 mb-8">Business tax returns</p>
          <div className="d-flex flex-column gap-12 ps-8">
            {availableTaxYears.map((year) => {
              const included = Boolean(formValue[`taxYear_${year}`]);
              return (
                <div
                  key={year}
                  className="d-flex flex-wrap align-items-center justify-content-between gap-12"
                >
                  <UniversalInput
                    type="checkbox"
                    name={`taxYear_${year}`}
                    label={`FY ${year} business tax return`}
                    labelClassName="text-info-100"
                    signal={$createPublicUploadLinkForm}
                    className="mb-0"
                    customOnChange={() => events.handleTaxYearIncludeChange(year, !included)}
                  />
                  {included && (
                    <UniversalInput
                      type="checkbox"
                      name={`taxYearRequired_${year}`}
                      label="Required to submit"
                      labelClassName="text-info-100"
                      signal={$createPublicUploadLinkForm}
                      className="mb-0"
                    />
                  )}
                </div>
              );
            })}
          </div>
        </Col>

        <Col xs={12}>
          <p className="text-info-100 fw-600 mb-8">Other documents</p>
          <div className="d-flex flex-column gap-12 ps-8">
            <div className="d-flex flex-wrap align-items-center justify-content-between gap-12">
              <UniversalInput
                type="checkbox"
                name="includeDebtSchedule"
                label="Debt schedule"
                labelClassName="text-info-100"
                signal={$createPublicUploadLinkForm}
                className="mb-0"
                customOnChange={() => events.handleDebtScheduleIncludeChange(
                  !formValue.includeDebtSchedule,
                )}
              />
              {formValue.includeDebtSchedule && (
                <UniversalInput
                  type="checkbox"
                  name="debtScheduleRequiredForSubmit"
                  label="Required to submit"
                  labelClassName="text-info-100"
                  signal={$createPublicUploadLinkForm}
                  className="mb-0"
                />
              )}
            </div>

            {showExtensionOption && (
              <UniversalInput
                type="checkbox"
                name="includeTaxReturnExtension"
                label="Tax return extension (Form 7004) — optional"
                labelClassName="text-info-100"
                signal={$createPublicUploadLinkForm}
                className="mb-0"
              />
            )}
          </div>
        </Col>

        <Col xs={12}>
          <UniversalInput
            type="textarea"
            name="lenderInstructions"
            label="Lender instructions (optional)"
            labelClassName="text-info-100"
            placeholder="Custom message shown on the public upload page"
            signal={$createPublicUploadLinkForm}
            rows={3}
          />
        </Col>
      </Row>
    </UniversalModal>
  );
};

export default CreatePublicUploadLinkModal;
