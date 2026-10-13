import { Badge } from 'react-bootstrap';
import { ONBOARDING_BADGE_CLASS } from '../_helpers/onboarding.consts';

const OnboardingStatusBadge = ({
  badgeMap,
  statusKey,
  children,
  onClick,
  title,
  className = '',
}) => {
  const badgeClass = badgeMap?.[statusKey] || ONBOARDING_BADGE_CLASS;
  const interactive = typeof onClick === 'function';
  return (
    <Badge
      className={`${badgeClass}${interactive ? ' cursor-pointer' : ''} ${className}`.trim()}
      onClick={interactive ? (event) => {
        event.stopPropagation();
        onClick(event);
      } : undefined}
      onKeyDown={interactive ? (event) => {
        if (event.key !== 'Enter' && event.key !== ' ') return;
        event.preventDefault();
        event.stopPropagation();
        onClick(event);
      } : undefined}
      role={interactive ? 'button' : undefined}
      tabIndex={interactive ? 0 : undefined}
      title={title}
    >
      {children ?? statusKey}
    </Badge>
  );
};

export default OnboardingStatusBadge;
