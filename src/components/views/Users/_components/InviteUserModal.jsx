import { Form, Row, Col } from 'react-bootstrap';
import UniversalModal from '@src/components/global/UniversalModal';
import UniversalInput from '@src/components/global/Inputs/UniversalInput';
import SelectInput from '@src/components/global/Inputs/SelectInput';
import { $usersView, $usersForm, $user, $organization } from '@src/signals';
import { handleInviteUser } from '../_helpers/users.events';

const ROLE_OPTIONS = [
  { value: 'USER', label: 'Basic User' },
  { value: 'ADMIN', label: 'Admin' },
];

const InviteUserModal = () => (
  <UniversalModal
    show={$usersView.value.showInviteModal}
    onHide={() => {
      $usersView.update({ showInviteModal: false });
      $usersForm.reset();
    }}
    headerText="Invite User"
    leftBtnText="Cancel"
    rightBtnText="Send Invitation"
    rightBtnOnClick={handleInviteUser}
  >
    <Form>
      <Row>
        <Col md={12} className="mb-16">
          <UniversalInput
            label="Email"
            type="email"
            value={$usersForm.value.email || ''}
            onChange={(e) => $usersForm.update({ email: e.target.value })}
            placeholder="user@example.com"
            required
            name="email"
          />
        </Col>
      </Row>
      <Row>
        <Col md={12} className="mb-16">
          <Form.Label>Role</Form.Label>
          <SelectInput
            name="role"
            signal={$usersForm}
            options={ROLE_OPTIONS}
            value={($usersForm.value.role || 'USER')}
            onChange={(option) => $usersForm.update({ role: option?.value || 'USER' })}
            notClearable
          />
        </Col>
      </Row>
    </Form>
  </UniversalModal>
);

export default InviteUserModal;
