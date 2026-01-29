import { useEffect, useMemo, useRef, useState } from 'react';
import { Collapse, Offcanvas, Button } from 'react-bootstrap';
import { useSearchParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown, faChevronRight, faBars } from '@fortawesome/free-solid-svg-icons';

/**
 * @param {Object} props
 * @param {import('@fyclabs/tools-fyc-react/signals').Signal} props.$view - Signal with { activeKey: string, expandedKeys?: string[] }
 * @param {{ key: string, title: string, icon?: import('@fortawesome/fontawesome-svg-core').IconDefinition, children?: any[] }[]} props.navItems
 * @param {string} [props.queryParamKey='tab']
 * @param {React.ReactNode} [props.footerContent]
 * @param {React.ReactNode} [props.headerContent]
 * @param {string} [props.headerText='Sections']
 * @param {boolean} [props.toggleable=false]
 * @param {string} [props.toggleBreakpoint='md']
 * @param {string} [props.toggleButtonText='Menu']
 */
const SignalSideNav = ({
  $view,
  navItems = [],
  queryParamKey = 'tab',
  footerContent,
  headerContent,
  headerText = 'Sections',
  toggleable = false,
  toggleBreakpoint = 'md',
  toggleButtonText = 'Menu',
}) => {
  const viewState = $view?.value ?? {};
  const { activeKey, expandedKeys = [] } = viewState;
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
      .filter((item) => item.children?.length)
      .map((item) => findItemByKey(item.children, key))
      .find((item) => item !== null);
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
        $view?.update?.({ activeKey: urlParamValue, expandedKeys });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- URL is source of truth for initial sync
  }, [urlParamValue]);

  useEffect(() => {
    if (isUpdatingFromUrlRef.current) {
      isUpdatingFromUrlRef.current = false;
      return;
    }
    const effectiveKey = activeKey ?? navItems[0]?.key;
    if (effectiveKey && urlParamValue !== effectiveKey) {
      isUpdatingUrlRef.current = true;
      const next = new URLSearchParams(searchParams);
      next.set(queryParamKey, effectiveKey);
      setSearchParams(next, { replace: true });
    }
  }, [activeKey, urlParamValue, queryParamKey, searchParams, setSearchParams, navItems]);

  const handleItemClick = (key, hasChildren, parentKey) => {
    if (hasChildren) {
      const newExpandedKeys = expandedKeys.includes(key) ? [] : [key];
      $view?.update?.({ activeKey, expandedKeys: newExpandedKeys });
    } else {
      const newExpandedKeys = parentKey ? [parentKey] : [];
      $view?.update?.({ activeKey: key, expandedKeys: newExpandedKeys });
      if (toggleable) setShowOffcanvas(false);
    }
  };

  const renderNavItem = (item, parentKey, level = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedKeys.includes(item.key);
    const isActive = activeKey === item.key;
    const isTopLevel = level === 0;

    return (
      <div key={item.key} className={isTopLevel ? 'position-relative pe-12' : ''}>
        <div
          role="button"
          tabIndex={0}
          onClick={() => handleItemClick(item.key, !!hasChildren, parentKey)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              handleItemClick(item.key, !!hasChildren, parentKey);
            }
          }}
          className={`d-flex align-items-center p-8 mb-8 rounded cursor-pointer ${
            isActive && !hasChildren ? 'bg-info-100 text-info-900 fw-bold' : 'text-info-100 hover-bg-info-700'
          } ${!isTopLevel ? 'ps-20 child-nav-item' : ''}`}
          style={{ transition: 'background-color 0.2s ease' }}
        >
          {item.icon && <FontAwesomeIcon icon={item.icon} className="me-12" />}
          <span className={hasChildren && isExpanded ? 'text-info-50' : ''}>{item.title}</span>
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
              {item.children.map((child) => renderNavItem(child, item.key, level + 1))}
            </div>
          </Collapse>
        )}
      </div>
    );
  };

  const navContent = (
    <div className="bg-info-800 border border-info-400 rounded p-16" style={{ minHeight: '500px' }}>
      {headerContent && <div className="mb-16">{headerContent}</div>}
      {!headerContent && headerText && <div className="lead text-light mb-16">{headerText}</div>}
      <div className="d-flex flex-column gap-0">
        {navItems.map((item) => renderNavItem(item))}
      </div>
      {footerContent && (
        <div className="d-flex justify-content-start mt-56 pt-16 border-top border-info-600">
          {footerContent}
        </div>
      )}
    </div>
  );

  if (!toggleable) {
    return navContent;
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
          {navContent}
        </Offcanvas.Body>
      </Offcanvas>
    </>
  );
};

export default SignalSideNav;
