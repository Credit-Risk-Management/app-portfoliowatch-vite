/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect } from 'react';
import { Form, Row, Col } from 'react-bootstrap';
import UniversalModal from '@src/components/global/UniversalModal';
import {
  $borrowersView,
  $borrowersForm,
  $borrowers,
  $relationshipManagers,
} from '@src/signals';
import SelectInput from '@src/components/global/Inputs/SelectInput';
import { handleEditBorrower } from '../_helpers/borrowers.events';
import * as helpers from '../_helpers/borrowers.helpers';

const EditBorrowerModal = () => {
  useEffect(() => {
    if ($borrowersView.value.showEditModal && $borrowers.value.selectedClient) {
      const client = $borrowers.value.selectedClient;
      $borrowersForm.update({
        ...client,
        relationship_manager_id: client.relationshipManager?.id || '',
      });
    }
  }, [$borrowersView.value.showEditModal]);

  const managers = $relationshipManagers.value?.list || [];
  const managerOptions = [{ value: '', label: 'Select Manager' }, ...helpers.getManagerOptions(managers)];

  return (
    <UniversalModal
      show={$borrowersView.value.showEditModal}
      onHide={() => {
        $borrowersView.update({ showEditModal: false });
        $borrowersForm.reset();
      }}
      headerText="Edit Borrower"
      leftBtnText="Cancel"
      rightBtnText="Save Changes"
      rightBtnOnClick={handleEditBorrower}
      size="lg"
    >
      <Form>
        <Row>
          <Col md={12} className="mb-24">
            <div className="text-info-100 fw-200 mb-8">Borrower Name</div>
            <div className="text-white lead fw-500">{$borrowersForm.value.name}</div>
          </Col>
        </Row>

        <Row>
          <Col md={12} className="mb-16">
            <Form.Label>Relationship Manager</Form.Label>
            <SelectInput
              name="relationship_manager_id"
              signal={$borrowersForm}
              options={managerOptions}
              value={$borrowersForm.value.relationship_manager_id}
            />
          </Col>
        </Row>

        <Row>
          <Col md={12} className="mb-16">
            <Form.Label>Notes</Form.Label>
            <Form.Control
              as="textarea"
              rows={4}
              value={$borrowersForm.value.notes || ''}
              onChange={(e) => $borrowersForm.update({ notes: e.target.value })}
              className="bg-info-800 border-0 text-info-100"
            />
          </Col>
        </Row>
      </Form>
    </UniversalModal>
  );
};

export default EditBorrowerModal;
