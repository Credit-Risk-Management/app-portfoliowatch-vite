import { useNavigate } from 'react-router-dom';
import { formatMoneyShorthand } from '@src/utils/currency';
import { WATCH_SCORE_OPTIONS } from '@src/consts/consts';
import * as consts from '../_helpers/dashboard.consts';

const WatchScoreLegend = ({ data = [], metric = 'totalAmount' }) => {
  const navigate = useNavigate();
  const overallAmount = data.reduce((sum, entry) => sum + (entry.value || 0), 0);
  
  // Always show all 5 scores (1-5) in order
  const ratings = [1, 2, 3, 4, 5];

  return (
    <div className="pt-8 border-top border-info-400 w-100">
      {ratings.map((rating) => {
        // Find the data entry that matches this rating
        const dataEntry = data.find(entry => entry.rating === rating);
        const value = dataEntry?.value || 0;
        
        // Calculate percentage, handling division by zero
        const percent = overallAmount > 0 ? ((value / overallAmount) * 100).toFixed(0) : '0';

        const label = WATCH_SCORE_OPTIONS[rating]?.label || `${rating} - Unknown`;
        
        const handleClick = () => {
          if (rating >= 1 && rating <= 5) {
            navigate(`/loans?watchScore=${rating}`);
          }
        };

        return (
          <div
            className="d-flex align-items-center justify-content-between mb-4"
            key={rating}
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
              {label}
            </div>
            <div className="d-flex align-items-center" style={{ minWidth: '120px', justifyContent: 'flex-end' }}>
              <span className="fw-600" style={{ textAlign: 'right', minWidth: '60px', display: 'inline-block' }}>
                {metric === 'totalAmount' ? formatMoneyShorthand(value) : value}
              </span>
              <span style={{ textAlign: 'right', minWidth: '45px', display: 'inline-block', marginLeft: '8px' }}>
                {percent}%
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default WatchScoreLegend;
