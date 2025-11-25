import { formatMoneyShorthand } from '@src/utils/currency';
import { WATCH_SCORE_OPTIONS } from '@src/consts/consts';
import * as consts from '../_helpers/dashboard.consts';

const WatchScoreLegend = ({ data = [], metric = 'totalAmount' }) => {
  const overallAmount = data.reduce((sum, entry) => sum + entry.value, 0);
  const uniqueRatings = [...new Set(data.map(entry => entry.rating))]
    .sort((a, b) => Number(a) - Number(b));
  const totalCount = data.length;

  return (
    <div className="pt-8 border-top border-info-400 w-100">
      {uniqueRatings.map((rating, idx) => {
        if (idx > 4) return null;
        const percent = totalCount > 0 ? ((data[idx].value / overallAmount) * 100).toFixed(0) : '0';

        const labelMap = {
          1: WATCH_SCORE_OPTIONS[1].label,
          2: WATCH_SCORE_OPTIONS[2].label,
          3: WATCH_SCORE_OPTIONS[3].label,
          4: WATCH_SCORE_OPTIONS[4].label,
          5: WATCH_SCORE_OPTIONS[5].label,
        };

        return (
          <div className="d-flex align-items-center justify-content-between mb-4" key={rating}>
            <div className="d-flex align-items-center">
              <div
                className="rounded-circle me-4"
                style={{
                  width: '10px',
                  height: '10px',
                  backgroundColor: consts.getWatchScoreColor(rating),
                }}
              />
              {labelMap[idx + 1]} - Risk
            </div>
            <div>
              <span className="me-8 fw-600">{metric === 'totalAmount' ? formatMoneyShorthand(data[idx].value) : data[idx].value}</span> {percent}%
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default WatchScoreLegend;
