import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import UniversalCard from '@src/components/global/UniversalCard';
import { $watchScoreBreakdown } from '@src/consts/consts';
import { Col, Row } from 'react-bootstrap';

const LoanRadarChart = () => {
  const breakdown = $watchScoreBreakdown.value?.breakdown;

  // If no breakdown data is available, show loading or empty state
  if (!breakdown || !breakdown.components) {
    return (
      <UniversalCard headerText="Watch Score Performance Overview" bodyContainer="">
        <div className="text-center py-48">
          <p className="text-muted">
            {$watchScoreBreakdown.value?.isLoading ? 'Loading Watch Score data...' : 'Watch Score data not available'}
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

  // Custom tooltip to show more detailed information
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;

      // Check if data is available
      if (!data.hasData) {
        return (
          <div className="bg-white p-12 rounded shadow border">
            <p className="fw-bold mb-8">{data.description}</p>
            <p className="mb-0 text-muted">
              <em>Data not available</em>
            </p>
            <p className="mb-0 text-muted small mt-4">
              Requires historical data
            </p>
          </div>
        );
      }

      // Format the value based on the metric type
      const formatValue = (value, metric) => {
        if (value === null || value === undefined) return 'N/A';

        if (metric.includes('Change')) {
          return `${value.toFixed(2)}%`;
        }
        if (metric === 'Liquidity') {
          return `$${value.toLocaleString()}`;
        }
        return value.toFixed(2);
      };

      // Get color based on score (1 = best/green, 8 = worst/red)
      const getScoreColor = (score) => {
        if (score <= 2) return 'text-success';
        if (score <= 3) return 'text-info';
        if (score <= 4) return 'text-warning';
        return 'text-danger';
      };

      // Get score label
      const getScoreLabel = (score) => {
        if (score <= 2) return '(Excellent)';
        if (score <= 3) return '(Good)';
        if (score <= 4) return '(Satisfactory)';
        return '(Poor)';
      };

      return (
        <div className="bg-white p-12 rounded shadow border">
          <p className="fw-bold mb-8">{data.description}</p>
          <p className="mb-4">
            Value: <strong>{formatValue(data.value, data.metric)}</strong>
          </p>
          <p className={`mb-0 ${getScoreColor(data.score)}`}>
            Score: <strong>{data.score}</strong> {getScoreLabel(data.score)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <UniversalCard headerText="Watch Score Performance Overview" bodyContainer="">
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
            stroke="#592525"
            fill="#592525"
            fillOpacity={0.5}
            strokeWidth={2}
          />
          <Legend
            wrapperStyle={{ paddingTop: '20px', color: '#ffffff' }}
            iconType="circle"
          />
          <Tooltip content={<CustomTooltip />} />
        </RadarChart>
      </ResponsiveContainer>
      <div className="text-white">
        <Row className="mb-16">
          <Col md={12} className="text-center mb-12">
            <div className="small" style={{ opacity: 0.9 }}>
              Watch Score (Lower scores indicate better performance)
            </div>
          </Col>
        </Row>

        <div className="row g-3">
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
              <div key={metric.metric} className="col-12 col-md-6 col-lg-4 mb-16">
                <div className="p-8 rounded bg-info-900" style={{ minHeight: '130px' }}>
                  <div className="d-flex justify-content-between align-items-center mb-8">
                    <div className="fw-bold small">{metric.description}</div>
                    <span className={`badge ${getScoreColor(metric.score)}`}>
                      {metric.score || 'N/A'}
                    </span>
                  </div>
                  <div className="small" style={{ opacity: 0.85 }}>
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
              </div>
            );
          })}
        </div>
        <div className="row mt-16">
          <div className="col-12 text-center">
            <div className="small" style={{ opacity: 0.7 }}>
              <em>Note: Metrics without data require historical data and are marked as &ldquo;No Data&rdquo;</em>
            </div>
          </div>
        </div>
      </div>
    </UniversalCard>
  );
};

export default LoanRadarChart;
