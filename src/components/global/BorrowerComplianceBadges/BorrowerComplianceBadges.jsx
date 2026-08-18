import { Badge, OverlayTrigger, Tooltip } from 'react-bootstrap';
import {
  quarterlyPackageBadgeShortLabel,
  quarterlyPackageBadgeTooltip,
} from '@src/components/views/Borrowers/_helpers/borrowers.helpers';

const BorrowerComplianceBadges = ({ entity, idPrefix }) => (
  <span className="d-inline-flex align-items-center flex-wrap gap-4">
    {(entity.quarterlyPackagesOnFile || []).map((periodLabel) => (
      <OverlayTrigger
        key={`${idPrefix}-quarterly-${periodLabel}`}
        placement="top"
        trigger={['hover', 'focus']}
        overlay={(
          <Tooltip id={`${idPrefix}-quarterly-badge-${periodLabel}`}>
            {quarterlyPackageBadgeTooltip(periodLabel)}
          </Tooltip>
        )}
      >
        <Badge bg="success-600" pill className="text-dark">
          {quarterlyPackageBadgeShortLabel(periodLabel)}
        </Badge>
      </OverlayTrigger>
    ))}
    {entity.impactQuestionnaireComplete ? (
      <OverlayTrigger
        placement="top"
        trigger={['hover', 'focus']}
        overlay={(
          <Tooltip id={`${idPrefix}-impact-badge`}>
            Borrower impact questionnaire has been submitted.
          </Tooltip>
        )}
      >
        <Badge bg="info-600" pill className="text-dark">
          I-Q
        </Badge>
      </OverlayTrigger>
    ) : null}
    {entity.taxReturn2025Complete ? (
      <OverlayTrigger
        placement="top"
        trigger={['hover', 'focus']}
        overlay={(
          <Tooltip id={`${idPrefix}-tax-return-2025-badge`}>
            FY 2025 business tax return is on file.
          </Tooltip>
        )}
      >
        <Badge bg="warning-600" pill className="text-dark">
          2025 TR
        </Badge>
      </OverlayTrigger>
    ) : null}
  </span>
);

export default BorrowerComplianceBadges;
