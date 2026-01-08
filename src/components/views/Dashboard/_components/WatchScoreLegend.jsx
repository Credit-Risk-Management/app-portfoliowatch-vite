import { useNavigate } from 'react-router-dom';
import { formatMoneyShorthand } from '@src/utils/currency';
import { WATCH_SCORE_OPTIONS } from '@src/consts/consts';
import * as consts from '../_helpers/dashboard.consts';

const WatchScoreLegend = ({ data = [], metric = 'totalAmount' }) => {
  const navigate = useNavigate();
  const overallAmount = data.reduce((sum, entry) => sum + entry.value, 0);
  const uniqueRatings = [...new Set(data.map(entry => entry.rating))]
    .sort((a, b) => Number(a) - Number(b));
  const totalCount = data.length;

  return (
    <div className="pt-8 border-top border-info-400 w-100">
      {uniqueRatings.map((rating, idx) => {
        if (idx > 4) return null;

        // Find the data entry that matches this rating to ensure colors align
        const dataEntry = data.find(entry => entry.rating === rating);
        if (!dataEntry) return null;

        const percent = totalCount > 0 ? ((dataEntry.value / overallAmount) * 100).toFixed(0) : '0';

        const labelMap = {
          1: WATCH_SCORE_OPTIONS[1].label,
          2: WATCH_SCORE_OPTIONS[2].label,
          3: WATCH_SCORE_OPTIONS[3].label,
          4: WATCH_SCORE_OPTIONS[4].label,
          5: WATCH_SCORE_OPTIONS[5].label,
        };

        // Use idx+1 for navigation to match the displayed label (1-5)
        const displayRating = idx + 1;
        const handleClick = () => {
          // Navigate using the displayed rating (1-5), not the actual data rating
          if (displayRating >= 1 && displayRating <= 5) {
            navigate(`/loans?watchScore=${displayRating}`);
          }
        };

        return (
          <div
            className="d-flex align-items-center justify-content-between mb-4"
            key={rating || 'null'}
            onClick={handleClick}
            style={{ cursor: 'pointer' }}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleClick();
              }
            }}
          >
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
              <span className="me-8 fw-600">{metric === 'totalAmount' ? formatMoneyShorthand(dataEntry.value) : dataEntry.value}</span> {percent}%
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default WatchScoreLegend;
