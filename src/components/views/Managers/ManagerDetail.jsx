import { useParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Button } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import UniversalCard from '@src/components/global/UniversalCard';
import MetricCard from '@src/components/global/MetricCard';
import {
  faArrowLeft,
  faEdit,
} from '@fortawesome/free-solid-svg-icons';
import { useEffectAsync } from '@fyclabs/tools-fyc-react/utils';
import PageHeader from '@src/components/global/PageHeader';
import { formatCurrency } from '@src/utils/formatCurrency';
import { $managerDetail } from '@src/signals';
import { RecentLoansList } from '@src/components/views/Dashboard/_components';
import EditManagerModal from './_components/EditManagerModal';
import ManagerDetailsCard from './_components/ManagerDetailsCard';
import { WatchScoreCountChart, WatchScoreAmountChart } from './_components';
import * as events from './_helpers/managerDetail.events';
import * as resolvers from './_helpers/managerDetail.resolvers';

const ManagerDetail = () => {
  const { managerId } = useParams();
  const navigate = useNavigate();

  const { manager, metrics, recentLoans } = $managerDetail.value;

  useEffectAsync(async () => {
    await resolvers.loadManagerDetailData(managerId);
  }, [managerId]);

  if (!manager) {
    return (
      <Container fluid className="py-24 text-center">
        <h4 className="text-info-100 fw-400">Manager Not Found</h4>
        <p className="text-light">The manager you are looking for does not exist.</p>
        <Button
          onClick={() => navigate('/relationship-managers')}
          className="btn-sm border-dark text-dark-800 bg-grey-50 mb-12 mb-md-16"
        >
          <FontAwesomeIcon icon={faArrowLeft} className="me-8" />
          Back to Managers
        </Button>
      </Container>
    );
  }

  return (
    <>
      <Container className="py-16 py-md-24">
        <Button
          onClick={() => navigate('/relationship-managers')}
          className="btn-sm border-dark text-dark-800 bg-grey-50 mb-12 mb-md-16"
        >
          <FontAwesomeIcon icon={faArrowLeft} className="me-8" />
          Back to Managers
        </Button>

        <PageHeader
          title={manager.name}
          subtitle={manager.position_title}
          actionButton
          actionButtonText="Edit Manager"
          actionButtonIcon={faEdit}
          onActionClick={() => events.handleEditClick(manager)}
        />

        <Row>
          <Col xs={12} md={4} lg={4} className="mb-12 mb-md-16">
            <MetricCard
              title="Portfolio Value"
              value={formatCurrency(metrics.portfolioValue)}
              onClick={() => events.handleMetricCardClick('/loans')}
              variant="secondary"
            />
          </Col>

          <Col xs={12} md={4} lg={4} className="mb-12 mb-md-16">
            <MetricCard
              title="Total Borrowers"
              value={metrics.totalBorrowers}
              onClick={() => events.handleMetricCardClick('/borrowers')}
              variant="primary"
            />
          </Col>

          <Col xs={12} md={4} lg={4} className="mb-12 mb-md-16">
            <MetricCard
              title="Active Loans"
              value={metrics.activeLoans}
              onClick={() => events.handleMetricCardClick('/loans')}
              variant="info"
            />
          </Col>
        </Row>

        <Row style={{ display: 'flex', alignItems: 'stretch' }}>
          <Col
            xs={12}
            md={6}
            lg={3}
            className="mb-12 mb-md-16"
          >
            <UniversalCard headerText="Recent Loan Activity">
              <RecentLoansList loans={recentLoans} />
            </UniversalCard>
          </Col>

          <Col xs={12} md={6} lg={9}>
            <Row>
              <Col xs={12} md={6} lg={6} className="d-flex flex-column mb-12 mb-md-16">
                <WatchScoreCountChart />
              </Col>

              <Col xs={12} md={6} lg={6} className="d-flex flex-column mb-12 mb-md-16">
                <WatchScoreAmountChart />
              </Col>
            </Row>
            <ManagerDetailsCard />
          </Col>
        </Row>
      </Container>

      <EditManagerModal onEditSuccess={events.handleEditSuccess} />
    </>
  );
};

export default ManagerDetail;
