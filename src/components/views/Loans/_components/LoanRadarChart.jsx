import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import UniversalCard from '@src/components/global/UniversalCard';
import { $watchScoreBreakdown } from '@src/consts/consts';
import { Col, Row } from 'react-bootstrap';

const LoanRadarChart = () => {
  const breakdown = $watchScoreBreakdown.value?.breakdown;

  // If no breakdown data is available, show loading or empty state
  if (!breakdown || !breakdown.components) {
    return (
      <UniversalCard headerText="WATCH Score Performance Overview" bodyContainer="">
        <div className="text-center py-48">
          <p className="text-muted">
            {$watchScoreBreakdown.value?.isLoading ? 'Loading WATCH Score data...' : 'WATCH Score data not available'}
          </p>
        </div>
      </UniversalCard>
    );
  }

  // Prepare data for the radar chart
  // We'll invert the scores so lower scores (better performance) show larger on the radar
  // Score range: 1 (best) to 8 (worst), we'll display as 9 - score so 1 becomes 8 and 8 becomes 1
  const invertScore = (score) => {
    if (!score) return 0; // Return 0 for null scores (no data available)
    return 9 - score; // Invert so higher is better on the chart
  };

  const chartData = [
    {
      metric: breakdown.components.dscr.label,
      performance: invertScore(breakdown.components.dscr.score),
      score: breakdown.components.dscr.score,
      value: breakdown.components.dscr.value,
      description: breakdown.components.dscr.description,
      fullMark: 8,
      hasData: breakdown.components.dscr.score !== null,
    },
    {
      metric: breakdown.components.reEbitda.label,
      performance: invertScore(breakdown.components.reEbitda.score),
      score: breakdown.components.reEbitda.score,
      value: breakdown.components.reEbitda.value,
      description: breakdown.components.reEbitda.description,
      fullMark: 8,
      hasData: breakdown.components.reEbitda.score !== null,
    },
    {
      metric: breakdown.components.currentRatio.label,
      performance: invertScore(breakdown.components.currentRatio.score),
      score: breakdown.components.currentRatio.score,
      value: breakdown.components.currentRatio.value,
      description: breakdown.components.currentRatio.description,
      fullMark: 8,
      hasData: breakdown.components.currentRatio.score !== null,
    },
    {
      metric: breakdown.components.changeInCash.label,
      performance: invertScore(breakdown.components.changeInCash.score),
      score: breakdown.components.changeInCash.score,
      value: breakdown.components.changeInCash.value,
      description: breakdown.components.changeInCash.description,
      fullMark: 8,
      hasData: breakdown.components.changeInCash.score !== null,
    },
    {
      metric: breakdown.components.liquidity.label,
      performance: invertScore(breakdown.components.liquidity.score),
      score: breakdown.components.liquidity.score,
      value: breakdown.components.liquidity.value,
      description: breakdown.components.liquidity.description,
      fullMark: 8,
      hasData: breakdown.components.liquidity.score !== null,
    },
    {
      metric: breakdown.components.changeInEbitda.label,
      performance: invertScore(breakdown.components.changeInEbitda.score),
      score: breakdown.components.changeInEbitda.score,
      value: breakdown.components.changeInEbitda.value,
      description: breakdown.components.changeInEbitda.description,
      fullMark: 8,
      hasData: breakdown.components.changeInEbitda.score !== null,
    },
  ]; // Show all 6 metrics, even if some don't have data

  return (
    <UniversalCard headerText="WATCH Score Performance Overview">
      <div style={{ height: '1000px' }}>
        <ResponsiveContainer width="100%" height={400}>
          <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
            <PolarGrid strokeDasharray="5 5" stroke="#68C0CA" strokeOpacity={1} />
            <PolarAngleAxis
              dataKey="metric"
              tick={{ fill: '#ffffff', fontSize: 12, fontWeight: 500 }}
              strokeWidth={2}
              stroke="#D0F5FA"
            />
            <PolarRadiusAxis
              angle={90}
              domain={[0, 8]}
              tick={{ fill: '#ffffff', fontSize: 10 }}
              stroke="#ffffff"
              strokeOpacity={0.3}
              strokeWidth={2}
            />
            <Radar
              name="Performance"
              dataKey="performance"
              stroke="#7EEF86"
              fill="#7EEF86"
              fillOpacity={0.5}
              strokeWidth={2}
            />
          </RadarChart>
        </ResponsiveContainer>
        <div className="text-white">
          <Row className="mb-16">
            <Col md={12} className="text-center mb-12">
              <div className="small" style={{ opacity: 0.9 }}>
                WATCH Score (Lower scores indicate better performance)
              </div>
            </Col>
          </Row>

          <Row className="g-3">
            {chartData.map((metric) => {
              const getScoreColor = (score) => {
                if (!score) return 'bg-secondary-200 text-secondary-800';
                if (score <= 2) return 'bg-success-200 text-success-800';
                if (score <= 3) return 'bg-info-200 text-info-800';
                if (score <= 4) return 'bg-warning-200 text-warning-800';
                return 'bg-danger-200 text-danger-800';
              };

              const getScoreLabel = (score) => {
                if (!score) return 'No Data';
                if (score <= 2) return 'Excellent';
                if (score <= 3) return 'Good';
                if (score <= 4) return 'Satisfactory';
                return 'Poor';
              };

              const formatValue = (value, metricName) => {
                if (value === null || value === undefined) return 'N/A';
                if (metricName.includes('Change')) {
                  return `${value.toFixed(2)}%`;
                }
                if (metricName === 'Liquidity') {
                  return `$${value.toLocaleString()}`;
                }
                return value.toFixed(2);
              };

              return (
                <Col key={metric.metric} md={12} lg={6} className="mb-16">
                  <div className="p-8 rounded bg-info-900" style={{ minHeight: '130px' }}>
                    <div className="d-flex justify-content-between align-items-center mb-8">
                      <div className="fw-bold me-4">{metric.description}</div>
                      <span className={`badge ${getScoreColor(metric.score)}`} style={{ fontSize: '12px' }}>
                        {metric.score || 'N/A'}
                      </span>
                    </div>
                    <div>
                      <div className="mb-4">
                        <span style={{ opacity: 0.7 }}>Value: </span>
                        <strong>{formatValue(metric.value, metric.metric)}</strong>
                      </div>
                      <div>
                        <span style={{ opacity: 0.7 }}>Rating: </span>
                        <span>{getScoreLabel(metric.score)}</span>
                      </div>
                    </div>
                  </div>
                </Col>
              );
            })}
          </Row>
          <Row className="mt-16">
            <Col md={12} className="text-center">
              <div className="small" style={{ opacity: 0.7 }}>
                <em>Note: Metrics without data require historical data and are marked as &ldquo;No Data&rdquo;</em>
              </div>
            </Col>
          </Row>
        </div>
      </div>
    </UniversalCard>
  );
};

export default LoanRadarChart;
