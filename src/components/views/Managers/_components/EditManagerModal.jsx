import { useEffect } from 'react';
import { Form, Row, Col } from 'react-bootstrap';
import UniversalModal from '@src/components/global/UniversalModal';
import UniversalInput from '@src/components/global/Inputs/UniversalInput';
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
              value={$relationshipManagersForm.value.position_title}
              onChange={(e) => $relationshipManagersForm.update({ position_title: e.target.value })}
            />
          </Col>
        </Row>
        <Row>
          <Col md={12} className="mb-16">
            <UniversalInput
              label="Office Location"
              type="text"
              value={$relationshipManagersForm.value.office_location}
              onChange={(e) => $relationshipManagersForm.update({ office_location: e.target.value })}
            />
          </Col>
        </Row>
        <Row>
          <Col md={6} className="mb-16">
            <Form.Label>Reports To</Form.Label>
            <UniversalInput
              type="select"
              name="manager_id"
              signal={$relationshipManagersForm}
              selectOptions={managerOptionsWithNone}
              value={managerOptionsWithNone.find((opt) => opt.value === $relationshipManagersForm.value.manager_id || (opt.value === '' && !$relationshipManagersForm.value.manager_id))}
              customOnChange={(option) => $relationshipManagersForm.update({ manager_id: option?.value || null })}
            />
          </Col>
          <Col md={6} className="mb-16">
            <Form.Label>Status</Form.Label>
            <UniversalInput
              type="select"
              name="is_active"
              signal={$relationshipManagersForm}
              selectOptions={consts.STATUS_OPTIONS}
              value={consts.STATUS_OPTIONS.find((opt) => opt.value === $relationshipManagersForm.value.is_active)}
              customOnChange={(option) => $relationshipManagersForm.update({ is_active: option?.value })}
            />
          </Col>
        </Row>
      </Form>
    </UniversalModal>
  );
};

export default EditManagerModal;
