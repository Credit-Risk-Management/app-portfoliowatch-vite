import { useMemo } from 'react';
import { Row, Col, Button, ListGroup, Badge } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import UniversalCard from '@src/components/global/UniversalCard';
import { $managerDetail } from '@src/signals';

const formatDate = (dateString) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' });
};

const ManagerDetailsCard = () => {
  const navigate = useNavigate();
  const { manager, allManagers } = $managerDetail.value;

  const getDirectReports = useMemo(
    () => (id) => allManagers.filter((m) => m.manager_id === id),
    [allManagers],
  );

  const directReports = useMemo(() => {
    if (!manager) return [];
    return getDirectReports(manager.id);
  }, [manager, getDirectReports]);

  const supervisorManager = useMemo(() => {
    if (!manager || !manager.manager_id) return null;
    return allManagers.find((m) => m.id === manager.manager_id);
  }, [manager, allManagers]);

  return (
    <Row>
      <Col lg={12} className="mb-24">
        <UniversalCard headerText="Manager Details" bodyContainer="container-fluid">
          <div className="mb-24">
            <h6 className="text-info-100 fw-400 mb-16">Contact Information</h6>
            <Row className="mb-16">
              <Col sm={4} className="text-info-100 fw-200">
                Name
              </Col>
              <Col sm={8} className="text-info-50 lead fw-500">
                {manager.name}
              </Col>
            </Row>
            <Row className="mb-16">
              <Col sm={4} className="text-info-100 fw-200">Position</Col>
              <Col sm={8} className="text-info-50 lead fw-500">{manager.position_title}</Col>
            </Row>
            <Row className="mb-16">
              <Col sm={4} className="text-info-100 fw-200">
                Email
              </Col>
              <Col sm={8} className="text-info-50 lead fw-500">
                {manager.email}
              </Col>
            </Row>
            <Row className="mb-16">
              <Col sm={4} className="text-info-100 fw-200">
                Phone
              </Col>
              <Col sm={8} className="text-info-50 lead fw-500">
                {manager.phone}
              </Col>
            </Row>
            <Row className="mb-16">
              <Col sm={4} className="text-info-100 fw-200">
                Office
              </Col>
              <Col sm={8} className="text-info-50 lead fw-500">{manager.office_location}</Col>
            </Row>
            <Row className="mb-16">
              <Col sm={4} className="text-info-100 fw-200">Status</Col>
              <Col sm={8}>
                <Badge bg={manager.is_active ? 'success' : 'secondary'}>
                  {manager.is_active ? 'Active' : 'Inactive'}
                </Badge>
              </Col>
            </Row>
            <Row className="mb-0">
              <Col sm={4} className="text-info-100 fw-200">Member Since</Col>
              <Col sm={8} className="text-info-50 lead fw-500">{formatDate(manager.created_at)}</Col>
            </Row>
          </div>

          <div className="border-top pt-24">
            <h6 className="text-info-100 fw-400 mb-16">Organizational Hierarchy</h6>
            {supervisorManager && (
              <div className="mb-24">
                <h6 className="text-info-100 fw-200 mb-8">Reports To</h6>
                <UniversalCard borderColor="primary" bodyContainer="">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <div className="text-info-50 lead fw-500">{supervisorManager.name}</div>
                      <div className="text-info-100 fw-200 small">{supervisorManager.position_title}</div>
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

            <div>
              <h6 className="text-info-100 fw-200 mb-8">
                Direct Reports ({directReports.length})
              </h6>
              {directReports.length === 0 ? (
                <div className="text-info-100 fw-200 small">No direct reports</div>
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
                          <div className="text-info-50 lead fw-500">{report.name}</div>
                          <div className="text-info-100 fw-200 small">
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
          </div>
        </UniversalCard>
      </Col>
    </Row>
  );
};

export default ManagerDetailsCard;
