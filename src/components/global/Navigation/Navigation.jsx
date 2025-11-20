import { Nav, Navbar, Container, NavDropdown } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';
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
} from '@fortawesome/free-solid-svg-icons';

const Navigation = () => {
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <Navbar variant="light" expand="lg" className="bg-gradient-secondary-primary-50 mb-0 position-sticky top-0 py-8 px-16 z-index-9999">
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
              className="px-24 text-dark"
            >
              <FontAwesomeIcon icon={faHome} className="me-16 d-none" />
              Dashboard
            </Nav.Link>
            <Nav.Link
              as={Link}
              to="/borrowers"
              active={isActive('/borrowers')}
              className="px-24 text-dark"
            >
              <FontAwesomeIcon icon={faUsers} className="me-16 d-none" />
              Borrowers
            </Nav.Link>
            <Nav.Link
              as={Link}
              to="/loans"
              active={isActive('/loans')}
              className="px-24 text-dark"
            >
              <FontAwesomeIcon icon={faMoneyBillWave} className="me-16 d-none" />
              Loans
            </Nav.Link>
            <Nav.Link
              as={Link}
              to="/documents"
              active={isActive('/documents')}
              className="px-24 text-dark"
            >
              <FontAwesomeIcon icon={faFileAlt} className="me-16 d-none" />
              Documents
            </Nav.Link>
            <Nav.Link
              as={Link}
              to="/reports"
              active={isActive('/reports')}
              className="px-24 text-dark"
            >
              <FontAwesomeIcon icon={faChartLine} className="me-16 d-none" />
              Reports
            </Nav.Link>
            <Nav.Link
              as={Link}
              to="/relationship-managers"
              active={isActive('/relationship-managers')}
              className="px-24 text-dark"
            >
              <FontAwesomeIcon icon={faUserTie} className="me-16 d-none" />
              Managers
            </Nav.Link>
          </Nav>
          <Nav>
            <NavDropdown
              title={(
                <FontAwesomeIcon icon={faUser} className="me-8 text-dark" />
              )}
              id="user-dropdown"
              align="end"
              className="text-dark"
            >
              <NavDropdown.Item as={Link} to="/profile">
                <FontAwesomeIcon icon={faUser} className="me-16 d-none" />
                My Profile
              </NavDropdown.Item>
              <NavDropdown.Item as={Link} to="/settings">
                <FontAwesomeIcon icon={faCog} className="me-16 d-none" />
                Settings
              </NavDropdown.Item>
              <NavDropdown.Divider />
              <NavDropdown.Item as={Link} to="/logout">
                <FontAwesomeIcon icon={faSignOutAlt} className="me-16 d-none" />
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
