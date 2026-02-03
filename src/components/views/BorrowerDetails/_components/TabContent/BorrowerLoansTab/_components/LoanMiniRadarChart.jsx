import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts';
import { getWatchScoreColor } from '@src/components/views/Dashboard/_helpers/dashboard.consts';

const LoanMiniRadarChart = ({ breakdown }) => {
  const hasData = breakdown && (breakdown.categories || breakdown.components);
  const isNewFormat = breakdown.categories !== undefined;

  const getScoreValue = (score) => {
    if (!score) return 0;
    return score;
  };

  let chartData = [];

  if (isNewFormat) {
    // New format with W.A.T.C.H. categories
    const categories = breakdown.categories || {};

    // Build chart data from categories - includes ALL categories (W, A, T, C, H including Headwinds)
    // Use Object.entries directly to preserve the API order (matches LoanRadarChart)
    chartData = Object.entries(categories).map(([, categoryData]) => ({
      shortMetric: categoryData.letter,
      performance: getScoreValue(categoryData.score),
      score: categoryData.score,
      fullMark: 8,
      hasData: categoryData.score !== null,
    }));
  } else {
    const components = breakdown.components || {};
    chartData = [
      {
        shortMetric: 'DSCR',
        performance: getScoreValue(components.dscr?.score),
        score: components.dscr?.score,
        fullMark: 8,
      },
      {
        shortMetric: 'RE/EBITDA',
        performance: getScoreValue(components.reEbitda?.score),
        score: components.reEbitda?.score,
        fullMark: 8,
      },
      {
        shortMetric: 'Current',
        performance: getScoreValue(components.currentRatio?.score),
        score: components.currentRatio?.score,
        fullMark: 8,
      },
      {
        shortMetric: 'Cash',
        performance: getScoreValue(components.changeInCash?.score),
        score: components.changeInCash?.score,
        fullMark: 8,
      },
      {
        shortMetric: 'Liquid',
        performance: getScoreValue(components.liquidity?.score),
        score: components.liquidity?.score,
        fullMark: 8,
      },
      {
        shortMetric: 'EBITDA',
        performance: getScoreValue(components.changeInEbitda?.score),
        score: components.changeInEbitda?.score,
        fullMark: 8,
      },
    ];
  }

  // Get the overall WATCH score color for the radar chart
  const finalScore = breakdown.finalScore || breakdown.watchScore;
  const radarColor = getWatchScoreColor(finalScore);

  if (!hasData || chartData.length === 0) {
    return (
      <div className="d-flex align-items-center justify-content-center" style={{ height: '200px', width: '100%' }}>
        <p className="text-info-300 small mb-0">No WATCH Score data</p>
      </div>
    );
  }

  return (
    <div style={{ height: '200px', width: '250px', margin: '0 auto' }}>
      <RadarChart width={250} height={200} cx={125} cy={100} outerRadius={65} data={chartData}>
        <PolarGrid
          strokeDasharray="3 3"
          stroke="#68C0CA"
          strokeOpacity={0.5}
        />
        <PolarAngleAxis
          dataKey="shortMetric"
          tick={{ fill: '#D0F5FA', fontSize: 10, fontWeight: 600 }}
          strokeWidth={1}
          stroke="#D0F5FA"
        />
        <PolarRadiusAxis
          angle={90}
          domain={[0, 8]}
          tick={false}
          stroke="#ffffff"
          strokeOpacity={0.2}
          strokeWidth={1}
        />
        <Radar
          name="Performance"
          dataKey="performance"
          stroke={radarColor}
          fill={radarColor}
          fillOpacity={0.6}
          strokeWidth={2}
        />
      </RadarChart>
    </div>
  );
};

export default LoanMiniRadarChart;
