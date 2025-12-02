import { useEffectAsync } from '@fyclabs/tools-fyc-react/utils';
import { Card, Table, Badge, Button } from 'react-bootstrap';
import { faPlus, faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { $users, $settingsView } from '@src/signals';
import { fetchUsers, handleRevokeInvitation } from '@src/components/views/Users/_helpers/users.events';
import * as consts from '@src/components/views/Users/_helpers/users.consts';
import * as helpers from '@src/components/views/Users/_helpers/users.helpers';
import Loader from '@src/components/global/Loader';
import UniversalCard from '@src/components/global/UniversalCard';

const UsersInvitationsTab = () => {
  useEffectAsync(async () => {
    await fetchUsers();
  }, []);

  const members = $users.value.list || [];
  const invitations = $users.value.invitations || [];
  const { isLoading } = $users.value;

  if (isLoading) {
    return <Loader />;
  }

  return (
    <>
      <UniversalCard headerText="Organization Members" className="mb-24">
        <div className="d-flex justify-content-end align-items-center mb-24">
          <Button
            variant="primary-400"
            size="sm"
            onClick={() => $settingsView.update({ showInviteModal: true })}
            className="align-self-end"
          >
            <FontAwesomeIcon icon={faPlus} className="me-8" />
            Invite User
          </Button>
        </div>
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              {consts.TABLE_HEADERS.map((header) => (
                <th key={header.key}>{header.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {members.length === 0 ? (
              <tr>
                <td colSpan={consts.TABLE_HEADERS.length} className="text-center">
                  No members found
                </td>
              </tr>
            ) : (
              members.map((member) => (
                <tr key={member.id}>
                  <td>{member.user?.name || '-'}</td>
                  <td>{member.user?.email || '-'}</td>
                  <td>
                    <Badge bg={member.role === 'ADMIN' ? 'primary' : 'secondary'}>
                      {helpers.getRoleLabel(member.role)}
                    </Badge>
                  </td>
                  <td>{helpers.formatDate(member.createdAt)}</td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
      </UniversalCard>

      <UniversalCard headerText="Pending Invitations">
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              {consts.INVITATION_TABLE_HEADERS.map((header) => (
                <th key={header.key}>{header.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {invitations.length === 0 ? (
              <tr>
                <td colSpan={consts.INVITATION_TABLE_HEADERS.length} className="text-center">
                  No pending invitations
                </td>
              </tr>
            ) : (
              invitations
                .filter((inv) => !inv.acceptedAt)
                .map((invitation) => {
                  const status = helpers.getInvitationStatus(invitation);
                  return (
                    <tr key={invitation.id}>
                      <td>{invitation.email}</td>
                      <td>
                        <Badge bg={invitation.role === 'ADMIN' ? 'primary' : 'secondary'}>
                          {helpers.getRoleLabel(invitation.role)}
                        </Badge>
                      </td>
                      <td>{helpers.formatDate(invitation.createdAt)}</td>
                      <td>
                        <Badge bg={status.variant}>{status.label}</Badge>
                      </td>
                      <td>
                        {status.label === 'Pending' && (
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => handleRevokeInvitation(invitation.id)}
                          >
                            <FontAwesomeIcon icon={faTimes} /> Revoke
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
            )}
          </tbody>
        </Table>
      </UniversalCard>
    </>
  );
};

export default UsersInvitationsTab;
