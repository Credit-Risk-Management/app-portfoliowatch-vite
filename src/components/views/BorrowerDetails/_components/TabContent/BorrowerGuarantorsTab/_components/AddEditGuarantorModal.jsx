import { useState } from 'react';
import { Form, Row, Col } from 'react-bootstrap';
import UniversalModal from '@src/components/global/UniversalModal';
import UniversalInput from '@src/components/global/Inputs/UniversalInput';
import AsyncSelectInput from '@src/components/global/Inputs/AsyncSelectInput';
import { $borrower } from '@src/consts/consts';
import {
  $borrowerGuarantorModal,
  $borrowerGuarantorModalForm,
} from '../../../../_helpers/borrowerDetail.consts';
import * as guarantorModalEvents from '../_helpers/guarantorModal.events';
import * as guarantorModalResolvers from '../_helpers/guarantorModal.resolvers';
import {
  loadGuarantorModalLoanOptions,
  getGuarantorModalLoanLabel,
} from '../_helpers/guarantorModal.loanPicker';

const AddEditGuarantorModal = () => {
  const [, setFormVersion] = useState(0);
  const bumpForm = () => setFormVersion((v) => v + 1);

  const {
    show,
    editingGuarantorId,
    isSubmitting,
    loanPickerBorrowerId,
    requireLoanSelection,
  } = $borrowerGuarantorModal.value;
  const form = $borrowerGuarantorModalForm.value;
  const headerText = editingGuarantorId ? 'Edit guarantor' : 'Add guarantor';
  const nameVal = form.name?.trim() || '';
  const loanIdsArr = Array.isArray(form.loanIds) ? form.loanIds : [];
  const selectedLoanCount = loanIdsArr.length;
  const loanPickInvalid = requireLoanSelection && selectedLoanCount === 0;

  const loanAsyncValue = loanIdsArr.map((id) => ({
    value: id,
    label: getGuarantorModalLoanLabel(id),
  }));

  const makeChangeHandler = (field) => (e) => {
    $borrowerGuarantorModalForm.update({ [field]: e.target.value });
    bumpForm();
  };

  const handleLoanAsyncChange = (opts) => {
    const ids = opts?.map((o) => o.value).filter(Boolean) || [];
    $borrowerGuarantorModalForm.update({ loanIds: ids });
    bumpForm();
  };

  return (
    <UniversalModal
      show={show}
      onHide={guarantorModalEvents.closeBorrowerGuarantorModal}
      closeButton
      headerText={headerText}
      leftBtnText="Cancel"
      leftBtnOnClick={guarantorModalEvents.closeBorrowerGuarantorModal}
      rightBtnText={editingGuarantorId ? 'Save changes' : 'Add guarantor'}
      rightBtnOnClick={() => guarantorModalResolvers.submitBorrowerGuarantorModal()}
      rightButtonDisabled={isSubmitting || !nameVal || loanPickInvalid}
      size="lg"
    >
      <Form className="text-white align-items-start mt-8">
        <Row>
          <Col md={12} className="mb-16">
            <UniversalInput
              label="Name"
              type="text"
              name="name"
              signal={$borrowerGuarantorModalForm}
              placeholder="Full name"
              customOnChange={makeChangeHandler('name')}
            />
          </Col>
        </Row>
        <Row>
          <Col md={6} className="mb-16">
            <UniversalInput
              label="Email"
              type="email"
              name="email"
              signal={$borrowerGuarantorModalForm}
              placeholder="email@example.com"
              customOnChange={makeChangeHandler('email')}
            />
          </Col>
          <Col md={6} className="mb-16">
            <UniversalInput
              label="Phone"
              type="text"
              name="phone"
              signal={$borrowerGuarantorModalForm}
              placeholder="Phone number"
              customOnChange={makeChangeHandler('phone')}
            />
          </Col>
        </Row>
        {loanPickerBorrowerId ? (
          <Row>
            <Col md={12} className="mb-16">
              <Form.Label>Loans</Form.Label>
              <AsyncSelectInput
                inputId="guarantor-form-loans"
                classNamePrefix="guarantor-loan-picker"
                loadOptions={loadGuarantorModalLoanOptions}
                value={loanAsyncValue}
                onChange={handleLoanAsyncChange}
                isMulti
                notClearable={requireLoanSelection}
                isPortal
                placeholder="Search loans by ID, number, or name…"
                defaultOptions
                noOptionsMessage={({ inputValue }) => (
                  inputValue?.trim()
                    ? 'No loans match this search.'
                    : 'No loans found for this borrower.'
                )}
              />
              <div className="text-info-500 small mt-8">
                {$borrower.value?.borrower?.name
                  ? `Loans for ${$borrower.value.borrower.name}`
                  : 'Choose which loan(s) this guarantor applies to.'}
              </div>
            </Col>
          </Row>
        ) : null}
      </Form>
    </UniversalModal>
  );
};

export default AddEditGuarantorModal;
