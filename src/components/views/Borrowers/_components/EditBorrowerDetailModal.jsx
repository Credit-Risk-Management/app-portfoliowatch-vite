/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect } from 'react';
import { Form, Row, Col } from 'react-bootstrap';
import UniversalModal from '@src/components/global/UniversalModal';
import SelectInput from '@src/components/global/Inputs/SelectInput';
import { $borrower } from '@src/consts/consts';
import { $borrowersForm, $relationshipManagers } from '@src/signals';
import { $borrowerDetailView } from './TabsContent/BorrowerDetailsContainer/_helpers/borrowerDetail.consts';
import { handleEditBorrowerDetail } from './TabsContent/BorrowerDetailsContainer/_helpers/borrowerDetail.events';
import * as helpers from '../_helpers/borrowers.helpers';

const EditBorrowerDetailModal = () => {
  useEffect(() => {
    if ($borrowerDetailView.value.showEditBorrowerModal && $borrower.value?.borrower) {
      const { borrower } = $borrower.value;

      // Map borrower data to form structure
      $borrowersForm.update({
        id: borrower.id || '',
        name: borrower.name || '',
        relationship_manager_id: borrower.relationshipManager?.id || '',
        notes: borrower.notes || '',
      });
    }
  }, [$borrowerDetailView.value.showEditBorrowerModal]);

  const managers = $relationshipManagers.value?.list || [];
  const managerOptions = helpers.getManagerOptions(managers);

  const handleClose = () => {
    $borrowerDetailView.update({ showEditBorrowerModal: false });
    $borrowersForm.reset();
  };

  return (
    <UniversalModal
      show={$borrowerDetailView.value.showEditBorrowerModal}
      onHide={handleClose}
      headerText="Edit Borrower"
      leftBtnText="Cancel"
      rightBtnText="Save Changes"
      rightBtnOnClick={handleEditBorrowerDetail}
      size="lg"
      closeButton
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
              options={[{ value: '', label: 'Select Manager' }, ...managerOptions]}
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

export default EditBorrowerDetailModal;
