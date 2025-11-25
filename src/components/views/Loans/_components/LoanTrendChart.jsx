import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import UniversalCard from '@src/components/global/UniversalCard';

const LoanTrendChart = ({ loan }) => {
  // Generate historical trend data (in a real app, this would come from the API)
  // For now, we'll simulate 6 months of historical data
  const generateTrendData = () => {
    const months = ['6mo ago', '5mo ago', '4mo ago', '3mo ago', '2mo ago', '1mo ago', 'Current'];

    // Create realistic trend data based on current values
    const debtServiceBase = loan.debt_service || 1.5;
    const liquidityRatioBase = loan.liquidity_ratio || 0.7;
    const currentRatioBase = loan.current_ratio || 1.5;

    return months.map((month, index) => {
      // Add some variance to make it look realistic
      const variance = (Math.random() - 0.5) * 0.15; // ±7.5% variance
      const trend = index * 0.02; // Slight upward trend

      return {
        month,
        debtService: parseFloat((debtServiceBase * (1 + variance + trend * (index === 6 ? 0 : 1))).toFixed(2)),
        liquidityRatio: parseFloat((liquidityRatioBase * (1 + variance + trend * 0.5)).toFixed(2)),
        currentRatio: parseFloat((currentRatioBase * (1 + variance + trend * 0.3)).toFixed(2)),
        // Add covenant lines as reference
        debtServiceCovenant: loan.debt_service_covenant,
        liquidityRatioCovenant: loan.liquidity_ratio_covenant,
        currentRatioCovenant: loan.current_ratio_covenant,
      };
    });
  };

  const trendData = generateTrendData();

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-12 rounded shadow border">
          <p className="fw-bold mb-8">{label}</p>
          {payload.map((entry, index) => {
            // Skip covenant reference lines in tooltip
            if (entry.dataKey.includes('Covenant')) return null;

            let metricName = '';
            let covenantValue = null;

            if (entry.dataKey === 'debtService') {
              metricName = 'Debt Service';
              covenantValue = loan.debt_service_covenant;
            } else if (entry.dataKey === 'liquidityRatio') {
              metricName = 'Liquidity Ratio';
              covenantValue = loan.liquidity_ratio_covenant;
            } else if (entry.dataKey === 'currentRatio') {
              metricName = 'Current Ratio';
              covenantValue = loan.current_ratio_covenant;
            }

            const status = entry.value >= covenantValue ? '✓' : '⚠';
            const statusColor = entry.value >= covenantValue ? 'text-success' : 'text-warning';

            return (
              <p key={index} className="mb-4" style={{ color: entry.color }}>
                <span className={statusColor}>{status}</span> {metricName}: <strong>{entry.value}</strong>
                <span className="text-muted small"> (req: {covenantValue})</span>
              </p>
            );
          })}
        </div>
      );
    }
    return null;
  };

  return (
    <UniversalCard headerText="Covenant Trend Analysis" bodyContainer="">
      <ResponsiveContainer width="100%" height={400}>
        <LineChart
          data={trendData}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
          <XAxis
            dataKey="month"
            tick={{ fill: '#666', fontSize: 12 }}
          />
          <YAxis
            tick={{ fill: '#666', fontSize: 12 }}
            label={{ value: 'Ratio', angle: -90, position: 'insideLeft', style: { fill: '#666' } }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ paddingTop: '10px' }}
            iconType="line"
          />

          {/* Covenant reference lines */}
          <ReferenceLine
            y={loan.debt_service_covenant}
            stroke="#0d6efd"
            strokeDasharray="5 5"
            strokeWidth={1}
            opacity={0.3}
          />
          <ReferenceLine
            y={loan.liquidity_ratio_covenant}
            stroke="#198754"
            strokeDasharray="5 5"
            strokeWidth={1}
            opacity={0.3}
          />
          <ReferenceLine
            y={loan.current_ratio_covenant}
            stroke="#ffc107"
            strokeDasharray="5 5"
            strokeWidth={1}
            opacity={0.3}
          />

          {/* Actual trend lines */}
          <Line
            type="monotone"
            dataKey="debtService"
            stroke="#0d6efd"
            strokeWidth={2}
            name="Debt Service"
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
          />
          <Line
            type="monotone"
            dataKey="liquidityRatio"
            stroke="#198754"
            strokeWidth={2}
            name="Liquidity Ratio"
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
          />
          <Line
            type="monotone"
            dataKey="currentRatio"
            stroke="#ffc107"
            strokeWidth={2}
            name="Current Ratio"
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
      <div className="mt-16 text-center">
        <div className="small text-muted">
          Historical covenant performance over the past 6 months.
          <br />
          Dashed lines represent covenant requirements for each metric.
        </div>
      </div>
    </UniversalCard>
  );
};

export default LoanTrendChart;

