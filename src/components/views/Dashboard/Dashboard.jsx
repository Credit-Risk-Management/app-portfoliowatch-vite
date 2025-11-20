import { useEffectAsync } from '@fyclabs/tools-fyc-react/utils';
import { Container, Row, Col } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { $dashboard } from '@src/signals';
import { formatCurrency } from '@src/utils/formatCurrency';
import MetricCard from '@src/components/global/MetricCard';
import UniversalCard from '@src/components/global/UniversalCard';
import ChartTooltip from '@src/components/global/ChartTooltip';
import * as consts from './_helpers/dashboard.consts';
import * as events from './_helpers/dashboard.events';
import * as resolvers from './_helpers/dashboard.resolvers';

const Dashboard = () => {
  const navigate = useNavigate();

  useEffectAsync(async () => {
    await resolvers.loadDashboardData();
  }, []);

  const { metrics } = $dashboard.value;

  return (
    <Container className="py-24">
      <Row className="mb-32">
        <Col lg={4} md={4} className="mb-16">
          <MetricCard
            title="Total Borrowers"
            value={metrics.totalClients}
            onClick={() => events.handleMetricCardClick('/borrowers', navigate)}
            variant="secondary"
          />
        </Col>

        <Col lg={4} md={4} className="mb-16">
          <MetricCard
            title="Portfolio Value"
            value={formatCurrency(metrics.portfolioValue)}
            onClick={() => events.handleMetricCardClick('/loans', navigate)}
            variant="primary"
          />
        </Col>
        <Col lg={4} md={4} className="mb-16">
          <MetricCard
            title="Portfolio Value"
            value={formatCurrency(metrics.portfolioValue)}
            onClick={() => events.handleMetricCardClick('/loans', navigate)}
            variant="info"
          />
        </Col>
      </Row>

      <Row className="mb-32">
        <Col lg={6} md={12} className="mb-16">
          <UniversalCard headerText="Loans by Risk Rating (Count)" bodyContainer="">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={metrics.riskRatingCountData || []}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ value }) => `${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  onClick={(data) => events.handlePieClick(data, navigate)}
                  style={{ cursor: 'pointer' }}
                >
                  {(metrics.riskRatingCountData || []).map((entry) => (
                    <Cell key={`cell-${entry.rating}`} fill={consts.RISK_RATING_COLORS[entry.rating]} />
                  ))}
                </Pie>
                <Tooltip content={<ChartTooltip />} />
                <Legend onClick={(data) => events.handlePieClick(data.payload, navigate)} wrapperStyle={{ cursor: 'pointer' }} />
              </PieChart>
            </ResponsiveContainer>
          </UniversalCard>
        </Col>

        <Col lg={6} md={12} className="mb-16">
          <UniversalCard headerText="Loans by Risk Rating (Principal Amount)" bodyContainer="">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={metrics.riskRatingAmountData || []}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ value }) => formatCurrency(value)}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  onClick={(data) => events.handlePieClick(data, navigate)}
                  style={{ cursor: 'pointer' }}
                >
                  {(metrics.riskRatingAmountData || []).map((entry) => (
                    <Cell key={`cell-${entry.rating}`} fill={consts.RISK_RATING_COLORS[entry.rating]} />
                  ))}
                </Pie>
                <Tooltip content={<ChartTooltip />} />
                <Legend onClick={(data) => events.handlePieClick(data.payload, navigate)} wrapperStyle={{ cursor: 'pointer' }} />
              </PieChart>
            </ResponsiveContainer>
          </UniversalCard>
        </Col>
      </Row>
    </Container>
  );
};

export default Dashboard;
