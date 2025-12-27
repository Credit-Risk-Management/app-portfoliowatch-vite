import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import UniversalCard from '@src/components/global/UniversalCard';
import { $watchScoreBreakdown } from '@src/consts/consts';
import { Col, Row } from 'react-bootstrap';
import { getWatchScoreColor } from '@src/components/views/Dashboard/_helpers/dashboard.consts';

const LoanRadarChart = () => {
  const breakdown = $watchScoreBreakdown.value?.breakdown;

  // Support both new (categories) and legacy (components) format
  const hasData = breakdown && (breakdown.categories || breakdown.components);

  // If no breakdown data is available, show loading or empty state
  if (!hasData) {
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

  // NEW FORMAT: Use categories for W.A.T.C.H. framework
  const isNewFormat = breakdown.categories !== undefined;

  // Return the score as-is for the radar chart
  // Score range: 1 (best) to 8+ (worst), lower scores will show as smaller areas on the chart
  const getScoreValue = (score) => {
    if (!score) return 0; // Return 0 for null scores (no data available)
    return score; // Use the score directly
  };

  let chartData = [];

  if (isNewFormat) {
    // New format with W.A.T.C.H. categories
    const categories = breakdown.categories || {};

    // Helper function to format category names for display
    const formatCategoryName = (name) => {
      // Convert camelCase to Title Case
      // e.g., "AccountabilityScore" -> "Accountability Score" -> "Accountability"
      // Handle common patterns
      if (name === 'AccountabilityScore') return 'Accountability';
      if (name === 'Weighted Exposure') return 'Weighted Exposure';
      if (name === 'Triggers') return 'Triggers';
      if (name === 'Collateral') return 'Collateral';
      if (name === 'Headwinds') return 'Headwinds';

      // Generic conversion: split camelCase and capitalize
      return name
        .replace(/([A-Z])/g, ' $1')
        .replace(/^./, (str) => str.toUpperCase())
        .trim();
    };

    // Build chart data from categories
    chartData = Object.entries(categories).map(([categoryName, categoryData]) => ({
      metric: `${categoryData.letter} - ${formatCategoryName(categoryName)}`,
      shortMetric: categoryData.letter,
      categoryName: formatCategoryName(categoryName),
      originalCategoryName: categoryName,
      performance: getScoreValue(categoryData.score),
      score: categoryData.score,
      weight: categoryData.weight,
      justification: categoryData.justification,
      fullMark: 8,
      hasData: categoryData.score !== null,
    }));
  } else {
    // Legacy format with individual components
    const components = breakdown.components || {};
    chartData = [
      {
        metric: components.dscr?.label || 'DSCR',
        performance: getScoreValue(components.dscr?.score),
        score: components.dscr?.score,
        value: components.dscr?.value,
        description: components.dscr?.description || 'Debt Service Coverage Ratio',
        fullMark: 8,
        hasData: components.dscr?.score !== null,
      },
      {
        metric: components.reEbitda?.label || 'RE/EBITDA',
        performance: getScoreValue(components.reEbitda?.score),
        score: components.reEbitda?.score,
        value: components.reEbitda?.value,
        description: components.reEbitda?.description || 'Retained Earnings to EBITDA Ratio',
        fullMark: 8,
        hasData: components.reEbitda?.score !== null,
      },
      {
        metric: components.currentRatio?.label || 'Current Ratio',
        performance: getScoreValue(components.currentRatio?.score),
        score: components.currentRatio?.score,
        value: components.currentRatio?.value,
        description: components.currentRatio?.description || 'Current Ratio',
        fullMark: 8,
        hasData: components.currentRatio?.score !== null,
      },
      {
        metric: components.changeInCash?.label || 'Change in Cash',
        performance: getScoreValue(components.changeInCash?.score),
        score: components.changeInCash?.score,
        value: components.changeInCash?.value,
        description: components.changeInCash?.description || 'Change in Cash (%)',
        fullMark: 8,
        hasData: components.changeInCash?.score !== null,
      },
      {
        metric: components.liquidity?.label || 'Liquidity',
        performance: getScoreValue(components.liquidity?.score),
        score: components.liquidity?.score,
        value: components.liquidity?.value,
        description: components.liquidity?.description || 'Liquidity Total',
        fullMark: 8,
        hasData: components.liquidity?.score !== null,
      },
      {
        metric: components.changeInEbitda?.label || 'Change in EBITDA',
        performance: getScoreValue(components.changeInEbitda?.score),
        score: components.changeInEbitda?.score,
        value: components.changeInEbitda?.value,
        description: components.changeInEbitda?.description || 'Change in EBITDA (%)',
        fullMark: 8,
        hasData: components.changeInEbitda?.score !== null,
      },
    ];
  }

  // Get the overall WATCH score color for the radar chart
  const finalScore = breakdown.finalScore || breakdown.watchScore;
  const radarColor = getWatchScoreColor(finalScore);

  return (
    <UniversalCard headerText="WATCH Score Performance Overview">
      <div style={{ height: '1000px' }}>
        {/* Display overall score and label */}
        <ResponsiveContainer width="100%" height={400}>
          <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
            <PolarGrid strokeDasharray="5 5" stroke="#68C0CA" strokeOpacity={1} />
            <PolarAngleAxis
              dataKey={isNewFormat ? 'shortMetric' : 'metric'}
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
              stroke={radarColor}
              fill={radarColor}
              fillOpacity={0.5}
              strokeWidth={2}
            />
          </RadarChart>
        </ResponsiveContainer>
        <div className="text-white">
          <Row className="mb-16">
            <Col md={12} className="text-center mb-12">
              <div className="small" style={{ opacity: 0.9 }}>
                {isNewFormat
                  ? 'WATCH Categories (Weighted by importance - larger areas indicate higher risk)'
                  : 'WATCH Score Metrics (Larger areas indicate higher risk)'}
              </div>
            </Col>
          </Row>

          <Row className="g-3">
            {isNewFormat ? (
              // NEW FORMAT: Display category cards
              // Sort by shortMetric to be W, A, T, C, H
              <Row>
                {chartData.slice().sort((a, b) => {
                  // Define desired order
                  const order = ['W', 'A', 'T', 'C', 'H'];
                  const iA = order.indexOf(a.shortMetric);
                  const iB = order.indexOf(b.shortMetric);
                  // If not found, put at end
                  return (iA === -1 ? 99 : iA) - (iB === -1 ? 99 : iB);
                })
                  .map((category) => {
                    const getScoreColorClass = (score) => {
                      if (!score) return 'bg-secondary-200 text-secondary-800';
                      if (score <= 2) return 'bg-success-200 text-success-800';
                      if (score <= 3) return 'bg-info-200 text-info-800';
                      if (score <= 4) return 'bg-warning-200 text-warning-800';
                      return 'bg-danger-200 text-danger-800';
                    };

                    return (
                      <Col key={category.originalCategoryName || category.categoryName} md={12} lg={12} className="mb-8">
                        <div className="px-12 py-4 rounded bg-info-900">
                          <div className="d-flex justify-content-between align-items-start">
                            <div>
                              <div className="fw-bold fs-5 mb-4 text-success">
                                {category.shortMetric}
                              </div>
                              <h6>{category.categoryName}</h6>
                            </div>
                            <span className={`badge ${getScoreColorClass(category.score)}`} style={{ fontSize: '14px' }}>
                              {category.score != null ? category.score.toFixed(2) : 'N/A'}
                            </span>
                          </div>
                        </div>
                      </Col>
                    );
                  })}
              </Row>
            ) : (
              // LEGACY FORMAT: Display metric cards
              chartData.map((metric) => {
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
                  if (metricName?.includes('Change')) {
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
              })
            )}
          </Row>
          <Row className="mt-16">
            <Col md={12} className="text-center">
              <div className="small" style={{ opacity: 0.7 }}>
                <em>
                  {isNewFormat
                    ? 'Note: W.A.T.C.H. = Weighted Exposure, Accountability, Triggers, Collateral, Headwinds'
                    : 'Note: Metrics without data require historical data and are marked as "No Data"'}
                </em>
              </div>
            </Col>
          </Row>
        </div>
      </div>
    </UniversalCard>
  );
};

export default LoanRadarChart;
