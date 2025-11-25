import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button, Breadcrumb } from 'react-bootstrap';

const PageHeader = ({
  title,
  breadcrumbs = [],
  actionButton,
  actionButtonText,
  actionButtonIcon,
  AdditionalComponents = null,
  onActionClick = () => { },
}) => (
  <div className="pb-24">
    {breadcrumbs.length > 0 && (
      <Breadcrumb className="mb-8">
        {breadcrumbs.map((crumb, index) => (
          <Breadcrumb.Item
            key={index}
            href={crumb.href}
            active={index === breadcrumbs.length - 1}
          >
            {crumb.label}
          </Breadcrumb.Item>
        ))}
      </Breadcrumb>
    )}
    <div className="d-flex justify-content-between align-items-center">
      <h4 className="mb-0 text-light">{title}</h4>
      <div className="d-flex align-items-center gap-8">
        {actionButton && (
          <Button variant="outline-primary-100" onClick={onActionClick}>
            {actionButtonIcon && (
              <FontAwesomeIcon icon={actionButtonIcon} className="me-4" />
            )}
            {actionButtonText}
          </Button>
        )}
        {AdditionalComponents && <AdditionalComponents />}
      </div>
    </div>
  </div>
);

export default PageHeader;
