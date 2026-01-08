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
            name="name"
            signal={$relationshipManagersForm}
            placeholder="Enter manager name"
          />
        </Col>
      </Row>
      <Row>
        <Col md={6} className="mb-16">
          <UniversalInput
            label="Email"
            type="email"
            name="email"
            signal={$relationshipManagersForm}
            placeholder="manager@lendingbank.com"
          />
        </Col>
        <Col md={6} className="mb-16">
          <UniversalInput
            label="Phone"
            type="phone"
            name="phone"
            signal={$relationshipManagersForm}
            placeholder="555-100-0000"
          />
        </Col>
      </Row>
      <Row>
        <Col md={12} className="mb-16">
          <UniversalInput
            label="Position Title"
            type="text"
            name="position_title"
            signal={$relationshipManagersForm}
            placeholder="e.g., Senior Relationship Manager"
          />
        </Col>
      </Row>
      <Row>
        <Col md={12} className="mb-16">
          <UniversalInput
            label="Office Location"
            type="text"
            name="office_location"
            signal={$relationshipManagersForm}
            placeholder="e.g., New York Office"
          />
        </Col>
      </Row>
      <Row>
        <Col md={6} className="mb-16">
          <Form.Label>Reports To</Form.Label>
          <SelectInput
            name="manager_id"
            signal={$relationshipManagersForm}
            options={helpers.getManagerOptionsWithNone($relationshipManagers.value?.list || [])}
            value={(helpers.getManagerOptionsWithNone($relationshipManagers.value?.list || []).find((opt) => opt.value === $relationshipManagersForm.value.manager_id) || helpers.getManagerOptionsWithNone($relationshipManagers.value?.list || [])[0])?.value}
            onChange={(option) => $relationshipManagersForm.update({ manager_id: option?.value || '' })}
          />
        </Col>
        <Col md={6} className="mb-16">
          <Form.Label>Status</Form.Label>
          <SelectInput
            name="is_active"
            signal={$relationshipManagersForm}
            options={consts.STATUS_OPTIONS}
            value={(consts.STATUS_OPTIONS.find((opt) => opt.value === $relationshipManagersForm.value.is_active) || consts.STATUS_OPTIONS[0])?.value}
            onChange={(option) => $relationshipManagersForm.update({ is_active: option?.value !== undefined ? option.value : true })}
          />
        </Col>
      </Row>
    </Form>
  </UniversalModal>
);

export default AddManagerModal;
