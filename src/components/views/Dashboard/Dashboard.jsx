/* eslint-disable no-unused-vars */
import { useEffectAsync } from '@fyclabs/tools-fyc-react/utils';
import { Container, Row, Col } from 'react-bootstrap';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { $dashboard, $comments } from '@src/signals';
import { formatCurrency } from '@src/utils/formatCurrency';
import MetricCard from '@src/components/global/MetricCard';
import UniversalCard from '@src/components/global/UniversalCard';
import ChartTooltip from '@src/components/global/ChartTooltip';
import { RecentCommentsList, RecentLoansList, WatchScoreLegend } from './_components';
import * as consts from './_helpers/dashboard.consts';
import * as events from './_helpers/dashboard.events';
import * as resolvers from './_helpers/dashboard.resolvers';

const Dashboard = () => {
  useEffectAsync(async () => {
    await resolvers.loadDashboardData();
  }, []);

  return (
    <Container className="py-24">
      <Row>
        <Col lg={4} md={4} className="mb-16">
          <MetricCard
            title="Portfolio Value"
            value={formatCurrency($dashboard.value?.metrics?.portfolioValue)}
            onClick={() => events.handleMetricCardClick('/borrowers')}
            variant="secondary"
          />
        </Col>

        <Col lg={4} md={4} className="mb-16">
          <MetricCard
            title="Total Borrowers"
            value={$dashboard.value?.metrics?.totalBorrowers}
            onClick={() => events.handleMetricCardClick('/loans')}
            variant="primary"
          />
        </Col>
        <Col lg={4} md={4} className="mb-16">
          <MetricCard
            title="Active Loans"
            value={$dashboard.value?.metrics?.activeLoans}
            onClick={() => events.handleMetricCardClick('/loans')}
            variant="info"
          />
        </Col>
      </Row>
      <Row style={{ display: 'flex', alignItems: 'stretch' }}>
        <Col
          md={6}
          lg={3}
        >
          <UniversalCard headerText="Recent Loan Activity">
            <RecentLoansList loans={$dashboard.value?.recentLoans} />
          </UniversalCard>
        </Col>
        <Col md={6} lg={9}>
          <Row>
            <Col md={6} lg={6} className="d-flex flex-column">
              <UniversalCard headerText="Loans by WATCH Score (Count)">
                <ResponsiveContainer width="100%" height={240}>
                  <PieChart>
                    <Pie
                      data={$dashboard.value?.metrics?.watchScoreCountData || []}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      fill="#8884d8"
                      dataKey="value"
                      onClick={(data) => events.handlePieClick(data)}
                      style={{ cursor: 'pointer' }}
                      stroke="#000"
                      strokeWidth={1}
                      label={false}
                    >
                      {($dashboard.value?.metrics?.watchScoreCountData || []).map((entry, index) => (
                        <Cell key={`cell-${entry.rating || index}`} fill={consts.getWatchScoreColor(entry.rating)} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <WatchScoreLegend data={$dashboard.value?.metrics?.watchScoreCountData || []} metric="count" />
              </UniversalCard>
            </Col>
            <Col md={6} lg={6} className="d-flex flex-column">
              <UniversalCard headerText="Loans by WATCH Score (Principal Amount)" bodyContainer="">
                <ResponsiveContainer width="100%" height={240}>
                  <PieChart>
                    <Pie
                      data={$dashboard.value?.metrics?.watchScoreAmountData || []}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      fill="#8884d8"
                      dataKey="value"
                      onClick={(data) => events.handlePieClick(data)}
                      style={{ cursor: 'pointer' }}
                      stroke="#000"
                      strokeWidth={1}
                      label={false}
                    >
                      {($dashboard.value?.metrics?.watchScoreAmountData || []).map((entry, index) => (
                        <Cell key={`cell-${entry.rating || index}`} fill={consts.getWatchScoreColor(entry.rating)} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <WatchScoreLegend data={$dashboard.value?.metrics?.watchScoreAmountData || []} />
              </UniversalCard>
            </Col>
          </Row>
          <Row className="mt-16">
            <Col>
              <UniversalCard headerText="Recent Comments" bodyContainer="">
                <RecentCommentsList comments={$comments.value?.list} />
              </UniversalCard>
            </Col>
          </Row>
        </Col>
      </Row>
    </Container>
  );
};

const Dashboard2 = () => {
  useEffectAsync(async () => {
    await resolvers.loadDashboardData();
  }, []);

  const { metrics, recentLoans = [] } = $dashboard.value;
  const { list: comments } = $comments.value;

  return (
    <Container className="py-24">
      <Row>
        <Col lg={4} md={4} className="mb-16">
          <MetricCard
            title="Portfolio Value"
            value={formatCurrency(metrics.portfolioValue)}
            onClick={() => events.handleMetricCardClick('/borrowers')}
            variant="secondary"
          />
        </Col>

        <Col lg={4} md={4} className="mb-16">
          <MetricCard
            title="Total Borrowers"
            value={metrics.totalBorrowers}
            onClick={() => events.handleMetricCardClick('/loans')}
            variant="primary"
          />
        </Col>
        <Col lg={4} md={4} className="mb-16">
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
          md={6}
          lg={3}
          className="d-flex flex-column"
          style={{ display: 'flex', flexDirection: 'column', flexGrow: 1, height: '100%' }}
        >
          <UniversalCard
            headerText="Recent Loan Activity"
            bodyContainer=""
            className="flex-grow-1 d-flex flex-column h-100"
          >
            <RecentLoansList loans={recentLoans} />
          </UniversalCard>
        </Col>
        <Col
          md={6}
          lg={9}
          className="d-flex flex-column flex-grow-1 h-100"
          style={{ display: 'flex', flexDirection: 'column' }}
        >
          <Row>
            <Col md={6} lg={6} className="d-flex flex-column">
              <UniversalCard headerText="Loans by Risk Rating (Count)" bodyContainer="" className="flex-grow-1 d-flex flex-column h-100">
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
                      onClick={(data) => events.handlePieClick(data)}
                      style={{ cursor: 'pointer' }}
                    >
                      {(metrics.riskRatingCountData || []).map((entry) => (
                        <Cell key={`cell-${entry.rating}`} fill={consts.RISK_RATING_COLORS[entry.rating]} />
                      ))}
                    </Pie>
                    <Tooltip content={<ChartTooltip />} />
                    <Legend onClick={(data) => events.handlePieClick(data.payload)} wrapperStyle={{ cursor: 'pointer' }} />
                  </PieChart>
                </ResponsiveContainer>
              </UniversalCard>
            </Col>
            <Col md={6} lg={6} className="d-flex flex-column">
              <UniversalCard headerText="Loans by Risk Rating (Principal Amount)" bodyContainer="" className="flex-grow-1 d-flex flex-column h-100">
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
                      onClick={(data) => events.handlePieClick(data)}
                      style={{ cursor: 'pointer' }}
                    >
                      {(metrics.riskRatingAmountData || []).map((entry) => (
                        <Cell key={`cell-${entry.rating}`} fill={consts.RISK_RATING_COLORS[entry.rating]} />
                      ))}
                    </Pie>
                    <Tooltip content={<ChartTooltip />} />
                    <Legend onClick={(data) => events.handlePieClick(data.payload)} wrapperStyle={{ cursor: 'pointer' }} />
                  </PieChart>
                </ResponsiveContainer>
              </UniversalCard>
            </Col>
          </Row>
          <Row className="mt-16">
            <Col>
              <UniversalCard headerText="Recent Comments" bodyContainer="">
                <RecentCommentsList comments={comments} />
              </UniversalCard>
            </Col>
          </Row>
        </Col>
      </Row>
    </Container>
  );
};

export default Dashboard;
