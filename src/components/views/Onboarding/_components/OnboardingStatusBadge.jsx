import { Badge } from 'react-bootstrap';
import { ONBOARDING_BADGE_CLASS } from '../_helpers/onboarding.consts';

const OnboardingStatusBadge = ({ badgeMap, statusKey, children }) => {
  const badgeClass = badgeMap?.[statusKey] || ONBOARDING_BADGE_CLASS;
  return (
    <Badge className={badgeClass}>
      {children ?? statusKey}
    </Badge>
  );
};

export default OnboardingStatusBadge;
