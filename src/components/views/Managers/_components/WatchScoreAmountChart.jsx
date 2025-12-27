import { useNavigate } from 'react-router-dom';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import UniversalCard from '@src/components/global/UniversalCard';
import { WatchScoreLegend } from '@src/components/views/Dashboard/_components';
import { $managerDetail } from '@src/signals';
import * as consts from '../_helpers/managerDetail.consts';
import * as events from '../_helpers/managerDetail.events';

const WatchScoreAmountChart = () => {
  const navigate = useNavigate();
  const { metrics } = $managerDetail.value;

  return (
    <UniversalCard headerText="Loans by WATCH Score (Principal Amount)" bodyContainer="">
      <ResponsiveContainer width="100%" height={240}>
        <PieChart>
          <Pie
            data={metrics.watchScoreAmountData || []}
            cx="50%"
            cy="50%"
            labelLine={false}
            fill="#8884d8"
            dataKey="value"
            onClick={(data) => events.handlePieClick(data, navigate)}
            style={{ cursor: 'pointer' }}
            stroke="#000"
            strokeWidth={1}
            label={false}
          >
            {(metrics.watchScoreAmountData || []).map((entry, index) => (
              <Cell key={`cell-${index}`} fill={consts.getWatchScoreColor(entry.rating)} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <WatchScoreLegend data={metrics.watchScoreAmountData || []} />
    </UniversalCard>
  );
};

export default WatchScoreAmountChart;
