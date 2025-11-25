import { useEffect } from 'react';
import { Form, Row, Col } from 'react-bootstrap';
import UniversalModal from '@src/components/global/UniversalModal';
import UniversalInput from '@src/components/global/Inputs/UniversalInput';
import SelectInput from '@src/components/global/Inputs/SelectInput';
import { $relationshipManagersView, $relationshipManagersForm, $relationshipManagers } from '@src/signals';
import { handleEditManager } from '../_helpers/managers.events';
import * as consts from '../_helpers/managers.consts';
import * as helpers from '../_helpers/managers.helpers';

const EditManagerModal = () => {
  useEffect(() => {
    if ($relationshipManagersView.value.showEditModal && $relationshipManagers.value.selectedManager) {
      $relationshipManagersForm.update($relationshipManagers.value.selectedManager);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [$relationshipManagersView.value.showEditModal]);

  const managers = $relationshipManagers.value?.list || [];
  const managerOptionsWithNone = helpers.getManagerOptionsWithNone(managers, $relationshipManagersForm.value.id);

  return (
    <UniversalModal
      show={$relationshipManagersView.value.showEditModal}
      onHide={() => {
        $relationshipManagersView.update({ showEditModal: false });
        $relationshipManagersForm.reset();
      }}
      headerText="Edit Manager"
      leftBtnText="Cancel"
      rightBtnText="Save Changes"
      rightBtnOnClick={handleEditManager}
    >
      <Form>
        <Row>
          <Col md={12} className="mb-16">
            <UniversalInput
              label="Name"
              type="text"
              value={$relationshipManagersForm.value.name}
              onChange={(e) => $relationshipManagersForm.update({ name: e.target.value })}
            />
          </Col>
        </Row>
        <Row>
          <Col md={6} className="mb-16">
            <UniversalInput
              label="Email"
              type="email"
              value={$relationshipManagersForm.value.email}
              onChange={(e) => $relationshipManagersForm.update({ email: e.target.value })}
            />
          </Col>
          <Col md={6} className="mb-16">
            <UniversalInput
              label="Phone"
              type="text"
              value={$relationshipManagersForm.value.phone}
              onChange={(e) => $relationshipManagersForm.update({ phone: e.target.value })}
            />
          </Col>
        </Row>
        <Row>
          <Col md={12} className="mb-16">
            <UniversalInput
              label="Position Title"
              type="text"
              value={$relationshipManagersForm.value.positionTitle}
              onChange={(e) => $relationshipManagersForm.update({ positionTitle: e.target.value })}
            />
          </Col>
        </Row>
        <Row>
          <Col md={12} className="mb-16">
            <UniversalInput
              label="Office Location"
              type="text"
              value={$relationshipManagersForm.value.officeLocation}
              onChange={(e) => $relationshipManagersForm.update({ officeLocation: e.target.value })}
            />
          </Col>
        </Row>
        <Row>
          <Col md={6} className="mb-16">
            <Form.Label>Reports To</Form.Label>
            <SelectInput
              name="managerId"
              signal={$relationshipManagersForm}
              options={managerOptionsWithNone}
              value={managerOptionsWithNone.find((opt) => opt.value === $relationshipManagersForm.value.managerId || (opt.value === '' && !$relationshipManagersForm.value.managerId))?.value}
              onChange={(option) => $relationshipManagersForm.update({ managerId: option?.value || null })}
            />
          </Col>
          <Col md={6} className="mb-16">
            <Form.Label>Status</Form.Label>
            <SelectInput
              name="isActive"
              signal={$relationshipManagersForm}
              options={consts.STATUS_OPTIONS}
              value={consts.STATUS_OPTIONS.find((opt) => opt.value === $relationshipManagersForm.value.isActive)?.value}
              onChange={(option) => $relationshipManagersForm.update({ isActive: option?.value })}
            />
          </Col>
        </Row>
      </Form>
    </UniversalModal>
  );
};

export default EditManagerModal;
