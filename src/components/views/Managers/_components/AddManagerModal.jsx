import { Form, Row, Col } from 'react-bootstrap';
import UniversalModal from '@src/components/global/UniversalModal';
import UniversalInput from '@src/components/global/Inputs/UniversalInput';
import SelectInput from '@src/components/global/Inputs/SelectInput';
import { $relationshipManagersView, $relationshipManagersForm, $relationshipManagers } from '@src/signals';
import { handleAddManager } from '../_helpers/managers.events';
import * as consts from '../_helpers/managers.consts';
import * as helpers from '../_helpers/managers.helpers';

const AddManagerModal = () => (
  <UniversalModal
    show={$relationshipManagersView.value.showAddModal}
    onHide={() => {
      $relationshipManagersView.update({ showAddModal: false });
      $relationshipManagersForm.reset();
    }}
    headerText="Add New Manager"
    leftBtnText="Cancel"
    rightBtnText="Add Manager"
    rightBtnOnClick={handleAddManager}
  >
    <Form>
      <Row>
        <Col md={12} className="mb-16">
          <UniversalInput
            label="Name"
            type="text"
            value={$relationshipManagersForm.value.name || ''}
            onChange={(e) => $relationshipManagersForm.update({ name: e.target.value })}
            placeholder="Enter manager name"
          />
        </Col>
      </Row>
      <Row>
        <Col md={6} className="mb-16">
          <UniversalInput
            label="Email"
            type="email"
            value={$relationshipManagersForm.value.email || ''}
            onChange={(e) => $relationshipManagersForm.update({ email: e.target.value })}
            placeholder="manager@lendingbank.com"
          />
        </Col>
        <Col md={6} className="mb-16">
          <UniversalInput
            label="Phone"
            type="text"
            value={$relationshipManagersForm.value.phone || ''}
            onChange={(e) => $relationshipManagersForm.update({ phone: e.target.value })}
            placeholder="555-100-0000"
          />
        </Col>
      </Row>
      <Row>
        <Col md={12} className="mb-16">
          <UniversalInput
            label="Position Title"
            type="text"
            value={$relationshipManagersForm.value.positionTitle || ''}
            onChange={(e) => $relationshipManagersForm.update({ positionTitle: e.target.value })}
            placeholder="e.g., Senior Relationship Manager"
          />
        </Col>
      </Row>
      <Row>
        <Col md={12} className="mb-16">
          <UniversalInput
            label="Office Location"
            type="text"
            value={$relationshipManagersForm.value.officeLocation || ''}
            onChange={(e) => $relationshipManagersForm.update({ officeLocation: e.target.value })}
            placeholder="e.g., New York Office"
          />
        </Col>
      </Row>
      <Row>
        <Col md={6} className="mb-16">
          <Form.Label>Reports To</Form.Label>
          <SelectInput
            name="managerId"
            signal={$relationshipManagersForm}
            options={helpers.getManagerOptionsWithNone($relationshipManagers.value?.list || [])}
            value={(helpers.getManagerOptionsWithNone($relationshipManagers.value?.list || []).find((opt) => opt.value === $relationshipManagersForm.value.managerId) || helpers.getManagerOptionsWithNone($relationshipManagers.value?.list || [])[0])?.value}
            onChange={(option) => $relationshipManagersForm.update({ managerId: option?.value || '' })}
          />
        </Col>
        <Col md={6} className="mb-16">
          <Form.Label>Status</Form.Label>
          <SelectInput
            name="isActive"
            signal={$relationshipManagersForm}
            options={consts.STATUS_OPTIONS}
            value={(consts.STATUS_OPTIONS.find((opt) => opt.value === $relationshipManagersForm.value.isActive) || consts.STATUS_OPTIONS[0])?.value}
            onChange={(option) => $relationshipManagersForm.update({ isActive: option?.value !== undefined ? option.value : true })}
          />
        </Col>
      </Row>
    </Form>
  </UniversalModal>
);

export default AddManagerModal;
