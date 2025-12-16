import { Nav, Navbar, Container, NavDropdown } from 'react-bootstrap';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faHome,
  faUsers,
  faMoneyBillWave,
  faFileAlt,
  faChartLine,
  faUserTie,
  faUser,
  faCog,
  faSignOutAlt,
  faBuilding,
} from '@fortawesome/free-solid-svg-icons';
import { $global, $user, $organization } from '@src/signals';
import { logoutUser } from '@src/utils/auth.utils';

const Navigation = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path) => location.pathname === path;
  const activeClass = 'fw-700 text-dark';

  // Don't show navigation if not signed in
  if (!$global.value.isSignedIn) {
    return null;
  }

  const handleLogout = async () => {
    const result = await logoutUser();
    if (result.success) {
      navigate('/login');
    }
  };

  return (
    <Navbar variant="light" expand="lg" className="bg-gradient-secondary-primary-50 mb-0 position-sticky top-0 py-8 px-16 z-index-9999 shadow-sm w-100">
      <Container fluid>
        <Navbar.Brand as={Link} to="/dashboard" className="me-64">
          <img
            src="/logo_dark.svg"
            alt="Logo"
            height="30"
            className="d-inline-block align-top"
          />
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto">
            <Nav.Link
              as={Link}
              to="/dashboard"
              active={isActive('/dashboard')}
              className={`px-16 ${isActive('/dashboard') ? activeClass : 'text-dark'}`}
            >
              <FontAwesomeIcon icon={faHome} className="me-16 d-none" />
              Dashboard
            </Nav.Link>
            <Nav.Link
              as={Link}
              to="/borrowers"
              active={isActive('/borrowers')}
              className={`px-16 text-info-50 ${isActive('/borrowers') ? activeClass : 'text-dark'}`}
            >
              <FontAwesomeIcon icon={faUsers} className="me-16 d-none" />
              Borrowers
            </Nav.Link>
            <Nav.Link
              as={Link}
              to="/loans"
              active={isActive('/loans')}
              className={`px-16 text-info-50 ${isActive('/loans') ? activeClass : 'text-dark'}`}
            >
              <FontAwesomeIcon icon={faMoneyBillWave} className="me-16 d-none" />
              Loans
            </Nav.Link>
            <Nav.Link
              as={Link}
              to="/documents"
              active={isActive('/documents')}
              className={`px-16 text-info-50 ${isActive('/documents') ? activeClass : 'text-dark'}`}
            >
              <FontAwesomeIcon icon={faFileAlt} className="me-16 d-none" />
              Documents
            </Nav.Link>
            <Nav.Link
              as={Link}
              to="/reports"
              active={isActive('/reports')}
              className={`px-16 text-info-50 ${isActive('/reports') ? activeClass : 'text-dark'}`}
            >
              <FontAwesomeIcon icon={faChartLine} className="me-16 d-none" />
              Reports
            </Nav.Link>
            <Nav.Link
              as={Link}
              to="/relationship-managers"
              active={isActive('/relationship-managers')}
              className={`px-16 text-info-50 ${isActive('/relationship-managers') ? activeClass : 'text-dark'}`}
            >
              <FontAwesomeIcon icon={faUserTie} className="me-16 d-none" />
              Managers
            </Nav.Link>
          </Nav>
          <Nav>
            <NavDropdown
              title={(
                <span className="text-dark">
                  <FontAwesomeIcon icon={faUser} className="me-8" />
                  {$user.value.name || 'User'}
                </span>
              )}
              id="user-dropdown"
              align="end"
              className="text-dark"
            >
              <NavDropdown.Header>
                <div className="fw-bold">{$user.value.name}</div>
                <div className="text-muted small">{$user.value.email}</div>
                {$organization.value.name && (
                  <div className="text-muted small mt-1">
                    <FontAwesomeIcon icon={faBuilding} className="me-1" />
                    {$organization.value.name}
                  </div>
                )}
              </NavDropdown.Header>
              <NavDropdown.Divider />
              <NavDropdown.Item as={Link} to="/profile">
                <FontAwesomeIcon icon={faUser} className="me-2" />
                My Profile
              </NavDropdown.Item>
              <NavDropdown.Item as={Link} to="/settings">
                <FontAwesomeIcon icon={faCog} className="me-2" />
                Settings
              </NavDropdown.Item>
              <NavDropdown.Divider />
              <NavDropdown.Item onClick={handleLogout}>
                <FontAwesomeIcon icon={faSignOutAlt} className="me-2" />
                Logout
              </NavDropdown.Item>
            </NavDropdown>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Navigation;
