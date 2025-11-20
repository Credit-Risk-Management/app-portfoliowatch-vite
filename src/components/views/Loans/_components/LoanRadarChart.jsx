import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import UniversalCard from '@src/components/global/UniversalCard';

const LoanRadarChart = ({ loan }) => {
  // Prepare data for the radar chart
  // We'll normalize the covenant metrics to show percentage of covenant requirement met
  const calculatePercentage = (actual, covenant) => {
    if (!actual || !covenant) return 0;
    return Math.min((actual / covenant) * 100, 150); // Cap at 150% for better visualization
  };

  const chartData = [
    {
      metric: 'Debt Service',
      actual: calculatePercentage(loan.debt_service, loan.debt_service_covenant),
      target: 100,
      fullMark: 150,
    },
    {
      metric: 'Liquidity Ratio',
      actual: calculatePercentage(loan.liquidity_ratio, loan.liquidity_ratio_covenant),
      target: 100,
      fullMark: 150,
    },
    {
      metric: 'Current Ratio',
      actual: calculatePercentage(loan.current_ratio, loan.current_ratio_covenant),
      target: 100,
      fullMark: 150,
    },
    {
      metric: 'Liquidity Total',
      actual: calculatePercentage(loan.liquidity, loan.liquidity_covenant),
      target: 100,
      fullMark: 150,
    },
  ];

  // Custom tooltip to show more detailed information
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-12 rounded shadow border">
          <p className="fw-bold mb-8">{data.metric}</p>
          <p className="mb-4 text-primary">
            Performance: <strong>{data.actual.toFixed(1)}%</strong>
          </p>
          <p className="mb-0 text-muted small">
            Target: {data.target}%
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <UniversalCard headerText="Covenant Performance Overview" bodyContainer="">
      <ResponsiveContainer width="100%" height={400}>
        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
          <PolarGrid strokeDasharray="3 3" />
          <PolarAngleAxis
            dataKey="metric"
            tick={{ fill: '#666', fontSize: 12 }}
          />
          <PolarRadiusAxis
            angle={90}
            domain={[0, 150]}
            tick={{ fill: '#666', fontSize: 10 }}
            tickFormatter={(value) => `${value}%`}
          />
          <Radar
            name="Target (100%)"
            dataKey="target"
            stroke="#28a745"
            fill="#28a745"
            fillOpacity={0.1}
            strokeWidth={2}
            strokeDasharray="5 5"
          />
          <Radar
            name="Actual Performance"
            dataKey="actual"
            stroke="#0d6efd"
            fill="#0d6efd"
            fillOpacity={0.5}
            strokeWidth={2}
          />
          <Legend
            wrapperStyle={{ paddingTop: '20px' }}
            iconType="circle"
          />
          <Tooltip content={<CustomTooltip />} />
        </RadarChart>
      </ResponsiveContainer>
      <div className="mt-16 text-center">
        <div className="small text-muted">
          Values represent performance as a percentage of covenant requirements.
          <br />
          100% = Meeting Covenant | &gt;100% = Exceeding | &lt;100% = Below Target
        </div>
      </div>
    </UniversalCard>
  );
};

export default LoanRadarChart;
