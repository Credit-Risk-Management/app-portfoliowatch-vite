import { useEffectAsync } from '@fyclabs/tools-fyc-react/utils';
import { Table, Badge, Button, Dropdown, ButtonGroup } from 'react-bootstrap';
import { faPlus, faTimes, faEllipsisV, faPaperPlane } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { $users, $settingsView, $user } from '@src/signals';
import {
  fetchUsers,
  handleResendInvitation,
  handleRevokeInvitation,
  handleSuspendUser,
  handleUnsuspendUser,
  handleDeleteUser,
} from '@src/components/views/Users/_helpers/users.events';
import * as consts from '@src/components/views/Users/_helpers/users.consts';
import * as helpers from '@src/components/views/Users/_helpers/users.helpers';
import Loader from '@src/components/global/Loader';
import UniversalCard from '@src/components/global/UniversalCard';
import UniversalModal from '@src/components/global/UniversalModal';

const UsersInvitationsTab = () => {
  useEffectAsync(async () => {
    await fetchUsers();
  }, []);

  const members = $users.value.list || [];
  const invitations = $users.value.invitations || [];
  const { isLoading } = $users.value;
  const currentUserId = $user.value?.id;
  const confirmModal = $settingsView.value.confirmModal || {
    show: false,
    type: null,
    userId: null,
    userName: '',
  };

  if (isLoading) {
    return <Loader />;
  }

  const handleSuspendClick = (userId, userName) => {
    $settingsView.update({
      confirmModal: {
        show: true,
        type: 'suspend',
        userId,
        userName,
      },
    });
  };

  const handleUnsuspendClick = (userId, userName) => {
    $settingsView.update({
      confirmModal: {
        show: true,
        type: 'unsuspend',
        userId,
        userName,
      },
    });
  };

  const handleDeleteClick = (userId, userName) => {
    $settingsView.update({
      confirmModal: {
        show: true,
        type: 'delete',
        userId,
        userName,
      },
    });
  };

  const handleConfirmAction = async () => {
    const { type, userId } = confirmModal;

    if (type === 'suspend') {
      await handleSuspendUser(userId);
    } else if (type === 'unsuspend') {
      await handleUnsuspendUser(userId);
    } else if (type === 'delete') {
      await handleDeleteUser(userId);
    }

    $settingsView.update({
      confirmModal: {
        show: false,
        type: null,
        userId: null,
        userName: '',
      },
    });
  };

  const handleCloseModal = () => {
    $settingsView.update({
      confirmModal: {
        show: false,
        type: null,
        userId: null,
        userName: '',
      },
    });
  };

  const getModalContent = () => {
    const { type, userName } = confirmModal;

    switch (type) {
      case 'suspend':
        return {
          title: 'Suspend User',
          message: `Are you sure you want to suspend ${userName}? They will no longer be able to access the application.`,
          btnClass: 'bg-warning-200 border-warning-900 text-warning-900',
          btnText: 'Suspend',
        };
      case 'unsuspend':
        return {
          title: 'Unsuspend User',
          message: `Are you sure you want to unsuspend ${userName}? They will regain access to the application.`,
          btnClass: 'bg-success-200 border-success-900 text-success-900',
          btnText: 'Unsuspend',
        };
      case 'delete':
        return {
          title: 'Delete User',
          message: `Are you sure you want to delete ${userName}? This action cannot be undone and will permanently remove all their data.`,
          btnClass: 'bg-danger-200 border-danger-900 text-danger-900',
          btnText: 'Delete',
        };
      default:
        return { title: '', message: '', btnClass: '', btnText: '' };
    }
  };

  const modalContent = getModalContent();

  return (
    <>
      <UniversalCard headerText="Organization Users" className="mb-24">
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
        <Table hover responsive>
          <thead>
            <tr>
              {consts.TABLE_HEADERS.map((header) => (
                <th key={header.key} className="bg-info-700 text-light">{header.label}</th>
              ))}
              <th className="bg-info-700 text-light">Status</th>
              <th className="bg-info-700 text-light">Actions</th>
            </tr>
          </thead>
          <tbody>
            {members.length === 0 ? (
              <tr>
                <td colSpan={consts.TABLE_HEADERS.length + 2} className="text-center">
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
                  <td>
                    {member.isSuspended ? (
                      <Badge bg="danger">Suspended</Badge>
                    ) : (
                      <Badge bg="success">Active</Badge>
                    )}
                  </td>
                  <td>
                    {member.userId !== currentUserId && (
                      <Dropdown>
                        <Dropdown.Toggle variant="outline-secondary" size="sm" id={`dropdown-${member.id}`}>
                          <FontAwesomeIcon icon={faEllipsisV} />
                        </Dropdown.Toggle>

                        <Dropdown.Menu>
                          {member.isSuspended ? (
                            <Dropdown.Item
                              onClick={() => handleUnsuspendClick(member.userId, member.user?.name)}
                            >
                              Unsuspend
                            </Dropdown.Item>
                          ) : (
                            <Dropdown.Item
                              onClick={() => handleSuspendClick(member.userId, member.user?.name)}
                            >
                              Suspend
                            </Dropdown.Item>
                          )}
                          <Dropdown.Divider />
                          <Dropdown.Item
                            onClick={() => handleDeleteClick(member.userId, member.user?.name)}
                            className="text-danger"
                          >
                            Delete User
                          </Dropdown.Item>
                        </Dropdown.Menu>
                      </Dropdown>
                    )}
                  </td>
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
                <th key={header.key} className="bg-info-700 text-light">{header.label}</th>
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
                          <ButtonGroup size="sm">
                            <Button
                              variant="outline-primary"
                              onClick={() => handleResendInvitation(invitation.id)}
                              title="Resend invitation email"
                            >
                              <FontAwesomeIcon icon={faPaperPlane} /> Resend
                            </Button>
                            <Button
                              variant="outline-danger"
                              onClick={() => handleRevokeInvitation(invitation.id)}
                              title="Revoke invitation"
                            >
                              <FontAwesomeIcon icon={faTimes} /> Revoke
                            </Button>
                          </ButtonGroup>
                        )}
                      </td>
                    </tr>
                  );
                })
            )}
          </tbody>
        </Table>
      </UniversalCard>

      <UniversalModal
        show={confirmModal.show}
        onHide={handleCloseModal}
        headerText={modalContent.title}
        size="md"
        leftBtnText="Cancel"
        leftBtnOnClick={handleCloseModal}
        rightBtnText={modalContent.btnText}
        rightBtnClass={modalContent.btnClass}
        rightBtnOnClick={handleConfirmAction}
      >
        <p className="mb-0">{modalContent.message}</p>
      </UniversalModal>
    </>
  );
};

export default UsersInvitationsTab;
