import { Button, Breadcrumb } from 'react-bootstrap';

const PageHeader = ({
  title,
  breadcrumbs = [],
  actionButton,
  actionButtonText,
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
      {actionButton && (
        <Button variant="primary" onClick={onActionClick}>
          {actionButtonText}
        </Button>
      )}
    </div>
  </div>
);

export default PageHeader;
