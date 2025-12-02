import { Container, Nav } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBuilding, faUsers } from '@fortawesome/free-solid-svg-icons';
import PageHeader from '@src/components/global/PageHeader';
import { $settingsView } from '@src/signals';
import OrganizationInfoTab from './_components/OrganizationInfoTab';
import UsersInvitationsTab from './_components/UsersInvitationsTab';
import InviteUserModal from './_components/InviteUserModal';
import * as consts from './_helpers/settings.consts';
import * as settingsEvents from './_helpers/settings.events';

const Settings = () => {
  const settingsView = $settingsView.value;
  const { activeTab } = settingsView;

  return (
    <>
      <Container className="py-24">
        <PageHeader title="Settings" />

        <Nav variant="tabs" className="mt-24 mb-24">
          <Nav.Item>
            <Nav.Link
              active={activeTab === consts.TABS.ORGANIZATION}
              onClick={() => settingsEvents.setActiveTab(consts.TABS.ORGANIZATION)}
              className="cursor-pointer bg-info-700 text-info-50 border-0"
            >
              <FontAwesomeIcon icon={faBuilding} className="me-8" />
              {consts.TAB_LABELS[consts.TABS.ORGANIZATION]}
            </Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link
              active={activeTab === consts.TABS.USERS}
              onClick={() => settingsEvents.setActiveTab(consts.TABS.USERS)}
              className="cursor-pointer"
            >
              <FontAwesomeIcon icon={faUsers} className="me-8" />
              {consts.TAB_LABELS[consts.TABS.USERS]}
            </Nav.Link>
          </Nav.Item>
        </Nav>

        {activeTab === consts.TABS.ORGANIZATION && <OrganizationInfoTab />}
        {activeTab === consts.TABS.USERS && <UsersInvitationsTab />}
      </Container>

      <InviteUserModal />
    </>
  );
};

export default Settings;
