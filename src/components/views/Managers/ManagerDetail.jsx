import { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Button, ListGroup, Badge } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import UniversalCard from '@src/components/global/UniversalCard';
import {
  faEnvelope,
  faPhone,
  faBuilding,
  faUser,
  faArrowLeft,
  faUsers,
  faChartLine,
  faDollarSign,
  faExclamationTriangle,
  faUserTie,
} from '@fortawesome/free-solid-svg-icons';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { useEffectAsync } from '@fyclabs/tools-fyc-react/utils';
import PageHeader from '@src/components/global/PageHeader';
import StatusBadge from '@src/components/global/StatusBadge';
import { formatCurrency } from '@src/utils/formatCurrency';
import relationshipManagersApi from '@src/api/relationshipManagers.api';
import loansApi from '@src/api/loans.api';
import borrowersApi from '@src/api/borrowers.api';
import { signal } from '@preact/signals-react';

const $managers = signal([]);
const $loans = signal([]);
const $borrowers = signal([]);

const RISK_RATING_LABELS = {
  1: '1 - Minimal Risk',
  2: '2 - Low Risk',
  3: '3 - Moderate Risk',
  4: '4 - Elevated Risk',
  5: '5 - High Risk',
};

const RISK_RATING_COLORS = {
  1: '#28a745', // green
  2: '#20c997', // teal
  3: '#ffc107', // yellow
  4: '#fd7e14', // orange
  5: '#dc3545', // red
};

const formatDate = (dateString) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' });
};

const ManagerDetail = () => {
  const { managerId } = useParams();
  const navigate = useNavigate();

  const managers = $managers.value || [];
  const loans = $loans.value || [];
  const borrowers = $borrowers.value || [];

  // Fetch data on mount
  useEffectAsync(async () => {
    const [managersResponse, loansResponse, borrowersResponse] = await Promise.all([
      relationshipManagersApi.getAll(),
      loansApi.getAll(),
      borrowersApi.getAll(),
    ]);
    $managers.value = managersResponse.data || [];
    $loans.value = loansResponse.data || [];
    $borrowers.value = borrowersResponse.data || [];
  }, []);

  const manager = useMemo(() => managers.find((m) => m.id === managerId), [managers, managerId]);

  // Helper function to get direct reports
  const getDirectReports = (id) => managers.filter((m) => m.manager_id === id);

  // Helper function to get all reports recursively
  const getAllReportsRecursive = (id) => {
    const directReports = getDirectReports(id);
    const allReports = [...directReports];
    directReports.forEach((report) => {
      allReports.push(...getAllReportsRecursive(report.id));
    });
    return allReports;
  };

  const directReports = useMemo(() => {
    if (!manager) return [];
    return getDirectReports(manager.id);
  }, [manager, managers]);

  const allTeamMembers = useMemo(() => {
    if (!manager) return [];
    return getAllReportsRecursive(manager.id);
  }, [manager, managers]);

  const supervisorManager = useMemo(() => {
    if (!manager || !manager.manager_id) return null;
    return managers.find((m) => m.id === manager.manager_id);
  }, [manager, managers]);

  // Get all team member IDs (including manager themselves)
  const teamMemberIds = useMemo(() => {
    if (!manager) return [];
    return [manager.id, ...allTeamMembers.map((m) => m.id)];
  }, [manager, allTeamMembers]);

  // Get loans for this manager and their team
  const teamLoans = useMemo(() => loans.filter((loan) => teamMemberIds.includes(loan.loan_officer_id)), [loans, teamMemberIds]);

  // Get clients for this manager
  const managerClients = useMemo(() => borrowers.filter((client) => client.relationship_manager_id === manager?.id), [borrowers, manager]);

  // Calculate team metrics
  const teamMetrics = useMemo(() => {
    const totalPortfolioValue = teamLoans.reduce((sum, loan) => sum + (loan.principal_amount || 0), 0);
    const numberOfLoans = teamLoans.length;
    const averageRiskRating = numberOfLoans > 0
      ? teamLoans.reduce((sum, loan) => sum + (loan.current_risk_rating || 0), 0) / numberOfLoans
      : 0;
    const numberOfClients = managerClients.length;
    const teamSize = allTeamMembers.length;

    // Calculate risk rating distribution by count
    const riskRatingCounts = {};
    const riskRatingAmounts = {};

    teamLoans.forEach((loan) => {
      const rating = loan.current_risk_rating;
      riskRatingCounts[rating] = (riskRatingCounts[rating] || 0) + 1;
      riskRatingAmounts[rating] = (riskRatingAmounts[rating] || 0) + parseFloat(loan.principal_amount);
    });

    // Format data for pie charts
    const riskRatingCountData = Object.keys(riskRatingCounts).map((rating) => ({
      name: RISK_RATING_LABELS[rating],
      value: riskRatingCounts[rating],
      rating: parseInt(rating, 10),
    }));

    const riskRatingAmountData = Object.keys(riskRatingAmounts).map((rating) => ({
      name: RISK_RATING_LABELS[rating],
      value: riskRatingAmounts[rating],
      rating: parseInt(rating, 10),
    }));

    return {
      totalPortfolioValue,
      numberOfLoans,
      averageRiskRating: averageRiskRating.toFixed(2),
      numberOfClients,
      teamSize,
      riskRatingCountData,
      riskRatingAmountData,
    };
  }, [teamLoans, managerClients, allTeamMembers]);

  const handlePieClick = (data) => {
    if (data && data.rating) {
      navigate(`/loans?riskRating=${data.rating}`);
    }
  };

  const renderCustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div
          style={{
            backgroundColor: 'white',
            padding: '10px',
            border: '1px solid #ccc',
            borderRadius: '4px',
          }}
        >
          <p style={{ margin: 0, fontWeight: 'bold' }}>{data.name}</p>
          <p style={{ margin: 0, color: data.payload.fill }}>
            {typeof data.value === 'number' && data.value > 1000
              ? formatCurrency(data.value)
              : `Count: ${data.value}`}
          </p>
        </div>
      );
    }
    return null;
  };

  if (!manager) {
    return (
      <Container fluid className="py-24">
        <PageHeader title="Manager Not Found" />
        <Button variant="link" className="px-0" onClick={() => navigate('/relationship-managers')}>
          Back to Managers
        </Button>
      </Container>
    );
  }

  return (
    <Container fluid className="py-24">
      <Button
        variant="link"
        className="px-0 mb-16"
        onClick={() => navigate('/relationship-managers')}
      >
        <FontAwesomeIcon icon={faArrowLeft} className="me-8" />
        Back to Managers
      </Button>

      <PageHeader title={manager.name} subtitle={manager.position_title} />

      {/* Team Performance Metrics - Top Section */}
      <Row className="mb-24">
        <Col lg={3} md={6} className="mb-16">
          <UniversalCard bodyContainer="">
            <div className="d-flex justify-content-between align-items-start">
              <div>
                <div className="text-muted mb-8">Total Portfolio Value</div>
                <h4 className="mb-0 text-primary">{formatCurrency(teamMetrics.totalPortfolioValue)}</h4>
              </div>
              <FontAwesomeIcon icon={faDollarSign} size="2x" className="text-primary" />
            </div>
          </UniversalCard>
        </Col>

        <Col lg={3} md={6} className="mb-16">
          <UniversalCard bodyContainer="">
            <div className="d-flex justify-content-between align-items-start">
              <div>
                <div className="text-muted mb-8">Active Loans</div>
                <h4 className="mb-0">{teamMetrics.numberOfLoans}</h4>
              </div>
              <FontAwesomeIcon icon={faChartLine} size="2x" className="text-info" />
            </div>
          </UniversalCard>
        </Col>

        <Col lg={3} md={6} className="mb-16">
          <UniversalCard bodyContainer="">
            <div className="d-flex justify-content-between align-items-start">
              <div>
                <div className="text-muted mb-8">Average Risk Rating</div>
                <h4 className="mb-0">{teamMetrics.averageRiskRating}</h4>
              </div>
              <FontAwesomeIcon icon={faExclamationTriangle} size="2x" className="text-warning" />
            </div>
          </UniversalCard>
        </Col>

        <Col lg={3} md={6} className="mb-16">
          <UniversalCard bodyContainer="">
            <div className="d-flex justify-content-between align-items-start">
              <div>
                <div className="text-muted mb-8">Team Size</div>
                <h4 className="mb-0">{teamMetrics.teamSize} member{teamMetrics.teamSize !== 1 ? 's' : ''}</h4>
              </div>
              <FontAwesomeIcon icon={faUserTie} size="2x" className="text-success" />
            </div>
          </UniversalCard>
        </Col>
      </Row>

      {/* Risk Rating Distribution Pie Charts */}
      <Row className="mb-24">
        <Col lg={6} md={12} className="mb-16">
          <UniversalCard headerText="Team Loans by Risk Rating (Count)" bodyContainer="">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={teamMetrics.riskRatingCountData || []}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ value }) => `${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  onClick={(data) => handlePieClick(data)}
                  style={{ cursor: 'pointer' }}
                >
                  {(teamMetrics.riskRatingCountData || []).map((entry) => (
                    <Cell key={`cell-${entry.rating}`} fill={RISK_RATING_COLORS[entry.rating]} />
                  ))}
                </Pie>
                <Tooltip content={renderCustomTooltip} />
                <Legend onClick={(data) => handlePieClick(data.payload)} wrapperStyle={{ cursor: 'pointer' }} />
              </PieChart>
            </ResponsiveContainer>
          </UniversalCard>
        </Col>

        <Col lg={6} md={12} className="mb-16">
          <UniversalCard headerText="Team Loans by Risk Rating (Principal Amount)" bodyContainer="">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={teamMetrics.riskRatingAmountData || []}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ value }) => formatCurrency(value)}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  onClick={(data) => handlePieClick(data)}
                  style={{ cursor: 'pointer' }}
                >
                  {(teamMetrics.riskRatingAmountData || []).map((entry) => (
                    <Cell key={`cell-${entry.rating}`} fill={RISK_RATING_COLORS[entry.rating]} />
                  ))}
                </Pie>
                <Tooltip content={renderCustomTooltip} />
                <Legend onClick={(data) => handlePieClick(data.payload)} wrapperStyle={{ cursor: 'pointer' }} />
              </PieChart>
            </ResponsiveContainer>
          </UniversalCard>
        </Col>
      </Row>

      <Row>
        {/* Left Column - Manager Info & Hierarchy */}
        <Col lg={6} className="mb-24">
          {/* Manager Information Card */}
          <UniversalCard headerText="Manager Information" bodyContainer="container-fluid" className="mb-24">
            <Row className="mb-16">
              <Col sm={4} className="text-muted">
                <FontAwesomeIcon icon={faUser} className="me-8" />
                Name
              </Col>
              <Col sm={8}>
                <strong>{manager.name}</strong>
              </Col>
            </Row>
            <Row className="mb-16">
              <Col sm={4} className="text-muted">Position</Col>
              <Col sm={8}>{manager.position_title}</Col>
            </Row>
            <Row className="mb-16">
              <Col sm={4} className="text-muted">
                <FontAwesomeIcon icon={faEnvelope} className="me-8" />
                Email
              </Col>
              <Col sm={8}>
                <a href={`mailto:${manager.email}`}>{manager.email}</a>
              </Col>
            </Row>
            <Row className="mb-16">
              <Col sm={4} className="text-muted">
                <FontAwesomeIcon icon={faPhone} className="me-8" />
                Phone
              </Col>
              <Col sm={8}>
                <a href={`tel:${manager.phone}`}>{manager.phone}</a>
              </Col>
            </Row>
            <Row className="mb-16">
              <Col sm={4} className="text-muted">
                <FontAwesomeIcon icon={faBuilding} className="me-8" />
                Office
              </Col>
              <Col sm={8}>{manager.office_location}</Col>
            </Row>
            <Row className="mb-16">
              <Col sm={4} className="text-muted">Status</Col>
              <Col sm={8}>
                <Badge bg={manager.is_active ? 'success' : 'secondary'}>
                  {manager.is_active ? 'Active' : 'Inactive'}
                </Badge>
              </Col>
            </Row>
            <Row className="mb-0">
              <Col sm={4} className="text-muted">Member Since</Col>
              <Col sm={8}>{formatDate(manager.created_at)}</Col>
            </Row>
          </UniversalCard>

          {/* Organizational Hierarchy Card */}
          <UniversalCard bodyContainer="container-fluid">
            <div className="lead text-dark mb-16">
              <FontAwesomeIcon icon={faUsers} className="me-8" />
              Organizational Hierarchy
            </div>
            {/* Reports To */}
            {supervisorManager && (
              <div className="mb-24">
                <h6 className="text-muted mb-8">Reports To</h6>
                <UniversalCard borderColor="primary" bodyContainer="">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <strong>{supervisorManager.name}</strong>
                      <div className="text-muted small">{supervisorManager.position_title}</div>
                    </div>
                    <Button
                      variant="link"
                      size="sm"
                      onClick={() => navigate(`/relationship-managers/${supervisorManager.id}`)}
                    >
                      View
                    </Button>
                  </div>
                </UniversalCard>
              </div>
            )}

            {/* Direct Reports */}
            <div>
              <h6 className="text-muted mb-8">
                Direct Reports ({directReports.length})
              </h6>
              {directReports.length === 0 ? (
                <div className="text-muted small">No direct reports</div>
              ) : (
                <ListGroup>
                  {directReports.map((report) => {
                    const reportSubordinates = getDirectReports(report.id);
                    return (
                      <ListGroup.Item
                        key={report.id}
                        className="d-flex justify-content-between align-items-center"
                      >
                        <div>
                          <strong>{report.name}</strong>
                          <div className="text-muted small">
                            {report.position_title}
                            {reportSubordinates.length > 0 && (
                              <span className="ms-8">
                                • {reportSubordinates.length} report{reportSubordinates.length !== 1 ? 's' : ''}
                              </span>
                            )}
                          </div>
                        </div>
                        <Button
                          variant="link"
                          size="sm"
                          onClick={() => navigate(`/relationship-managers/${report.id}`)}
                        >
                          View
                        </Button>
                      </ListGroup.Item>
                    );
                  })}
                </ListGroup>
              )}
            </div>
          </UniversalCard>
        </Col>

      </Row>
    </Container>
  );
};

export default ManagerDetail;
