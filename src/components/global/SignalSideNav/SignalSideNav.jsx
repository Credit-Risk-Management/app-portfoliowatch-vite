import { useEffect, useMemo, useRef, useState } from 'react';
import { Collapse, Offcanvas, Button } from 'react-bootstrap';
import { useSearchParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown, faChevronRight, faBars } from '@fortawesome/free-solid-svg-icons';

const SignalSideNav = ({
  $view,
  navItems,
  queryParamKey = 'tab',
  footerContent,
  headerContent,
  sectionTitle = 'Sections',
  toggleable = false,
  toggleBreakpoint = 'md',
  toggleButtonText = 'Menu',
}) => {
  const { activeKey, expandedKeys = [] } = $view.value;
  const [searchParams, setSearchParams] = useSearchParams();
  const isUpdatingFromUrlRef = useRef(false);
  const isUpdatingUrlRef = useRef(false);
  const [showOffcanvas, setShowOffcanvas] = useState(false);

  const urlParamValue = useMemo(
    () => searchParams.get(queryParamKey),
    [searchParams, queryParamKey],
  );

  const findItemByKey = (items, key) => {
    const found = items.find((item) => item.key === key);
    if (found) return found;

    const nested = items
      .filter((item) => item.children)
      .map((item) => findItemByKey(item.children, key))
      .find((item) => item !== null) || null;

    return nested || null;
  };

  useEffect(() => {
    if (isUpdatingUrlRef.current) {
      isUpdatingUrlRef.current = false;
      return;
    }

    if (urlParamValue && urlParamValue !== activeKey) {
      const foundItem = findItemByKey(navItems, urlParamValue);
      if (foundItem) {
        isUpdatingFromUrlRef.current = true;
        $view.update({ activeKey: urlParamValue, expandedKeys });
      }
    }
  }, [urlParamValue]);

  useEffect(() => {
    if (isUpdatingFromUrlRef.current) {
      isUpdatingFromUrlRef.current = false;
      return;
    }

    if (urlParamValue !== activeKey) {
      isUpdatingUrlRef.current = true;
      const next = new URLSearchParams(searchParams);
      next.set(queryParamKey, activeKey);
      setSearchParams(next, { replace: true });
    }
  }, [activeKey, urlParamValue, queryParamKey, searchParams, setSearchParams]);

  const handleItemClick = (key, hasChildren, parentKey) => {
    if (hasChildren) {
      const newExpandedKeys = expandedKeys.includes(key)
        ? []
        : [key];
      $view.update({ activeKey, expandedKeys: newExpandedKeys });
    } else {
      const newExpandedKeys = parentKey ? [parentKey] : [];
      $view.update({ activeKey: key, expandedKeys: newExpandedKeys });
      if (toggleable) {
        setShowOffcanvas(false);
      }
    }
  };

  const renderNavItem = (item, parentKey, level = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedKeys.includes(item.key);
    const isActive = activeKey === item.key;
    const isActiveItem = isActive && !hasChildren;

    return (
      <div key={item.key}>
        <div
          role="button"
          tabIndex={0}
          onClick={() => handleItemClick(item.key, !!hasChildren, parentKey)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              handleItemClick(item.key, !!hasChildren, parentKey);
            }
          }}
          className={`d-flex align-items-center p-8 mb-8 rounded cursor-pointer justify-content-between ${isActiveItem
            ? 'bg-info-100 text-info-900 fw-bold'
            : 'text-info-100 hover-bg-info-700'}`}
          style={{
            transition: 'background-color 0.2s ease',
          }}
        >
          <span className="d-flex align-items-center">
            {item.icon && <FontAwesomeIcon icon={item.icon} className="me-12" />}
            <span className={hasChildren && isExpanded ? 'text-info-200' : ''}>{item.title}</span>
          </span>
          {hasChildren && (
            <FontAwesomeIcon
              icon={isExpanded ? faChevronDown : faChevronRight}
              className="ms-2"
              style={{ fontSize: '0.75rem' }}
            />
          )}
        </div>
        {hasChildren && (
          <Collapse in={isExpanded}>
            <div>
              {item.children?.map((child) => renderNavItem(child, item.key, level + 1))}
            </div>
          </Collapse>
        )}
      </div>
    );
  };

  const cardContent = (
    <div className="bg-info-800 border border-info-400 rounded p-16" style={{ minHeight: '500px' }}>
      {headerContent && (
        <div className="d-flex justify-content-start mb-16">
          {headerContent}
        </div>
      )}
      <div className="lead text-light mb-16">{sectionTitle}</div>
      <div className="flex-column">
        {navItems.map((item) => renderNavItem(item))}
      </div>
      {footerContent && (
        <div className="d-flex justify-content-start mt-56 pt-16 border-top border-info-400">
          {footerContent}
        </div>
      )}
    </div>
  );

  if (!toggleable) {
    return cardContent;
  }

  return (
    <>
      <Button
        variant="outline-primary fw-700 py-8 fs-16"
        className={`d-${toggleBreakpoint}-none mb-16 w-100`}
        onClick={() => setShowOffcanvas(true)}
      >
        <FontAwesomeIcon icon={faBars} className="me-8" />
        {toggleButtonText}
      </Button>

      <Offcanvas
        show={showOffcanvas}
        onHide={() => setShowOffcanvas(false)}
        responsive={toggleBreakpoint}
        placement="start"
      >
        <Offcanvas.Header closeButton className={`d-${toggleBreakpoint}-none`}>
          <Offcanvas.Title>Navigation</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body className="p-0">
          {cardContent}
        </Offcanvas.Body>
      </Offcanvas>
    </>
  );
};

export default SignalSideNav;
