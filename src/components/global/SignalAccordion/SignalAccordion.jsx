/* eslint-disable no-nested-ternary */
import React from 'react';
import { Collapse } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import * as consts from './_helpers/consts';
import './signalAccordion.scss';

/**
 * Global Signal Accordion – theme-aligned accordion that can wrap SignalTable or any content.
 * Embed SignalTable (or any table) in item.content; embedded tables get light row styling per theme.
 *
 * @param {string} title - Main header label (e.g. "Collateral Values")
 * @param {Array<{ id: string, label: string, value?: string, trendText?: string, content: React.ReactNode }>} items - Accordion items; content is shown when expanded
 * @param {Object} footer - Optional: { netValueLabel, netValue, coverageLabel, coverageValue }
 * @param {string|null} expandedId - Controlled expanded id; if undefined, uses $expandedId or internal signal
 * @param {function(string|null)} onExpandedChange - Called when expanded item changes (controlled mode)
 * @param {Object} $expandedId - Optional signal for expanded id (uncontrolled); use for multiple accordions or default open
 * @param {string|null} defaultExpandedId - Initial expanded id when using internal signal (e.g. items[0]?.id)
 */
const SignalAccordion = ({
  title = '',
  items = [],
  footer = null,
  expandedId: controlledExpandedId,
  onExpandedChange,
  $expandedId,
  defaultExpandedId = null,
}) => {
  const isControlled = controlledExpandedId !== undefined;
  const effectiveSignal = $expandedId || consts.expandedId;
  const expandedId = isControlled
    ? controlledExpandedId
    : (effectiveSignal.value !== undefined ? effectiveSignal.value : defaultExpandedId);

  const handleToggle = (itemId) => {
    const next = expandedId === itemId ? null : itemId;
    if (typeof onExpandedChange === 'function') {
      onExpandedChange(next);
    } else {
      effectiveSignal.value = next;
    }
  };

  const hasFooter = footer && (footer.netValue != null || footer.coverageValue != null);

  return (
    <div
      className={`signal-accordion rounded overflow-hidden border border-info-500 bg-white shadow-sm ${!hasFooter ? 'signal-accordion--no-footer' : ''}`}
    >
      {title && (
        <div className="signal-accordion__header text-white fw-bold text-center py-12 px-16">
          {title}
        </div>
      )}
      <div className="signal-accordion__items">
        {items.map((item) => {
          const isOpen = expandedId === item.id;
          return (
            <div key={item.id} className="signal-accordion__item">
              <button
                type="button"
                className={`signal-accordion__item-header ${isOpen ? 'signal-accordion__item-header--open' : ''}`}
                onClick={() => handleToggle(item.id)}
                aria-expanded={isOpen}
                aria-controls={`signal-accordion-body-${item.id}`}
                id={`signal-accordion-toggle-${item.id}`}
              >
                <span className="d-flex align-items-center">
                  <FontAwesomeIcon
                    icon={isOpen ? faChevronDown : faChevronRight}
                    className="signal-accordion__item-icon me-8"
                  />
                  <span className="signal-accordion__item-label">{item.label}</span>
                </span>
                <span className="d-flex align-items-center">
                  {item.value && (
                    <span className="signal-accordion__item-value text-success fw-bold me-8">
                      {item.value}
                    </span>
                  )}
                  {item.trendText && (
                    <span className="signal-accordion__item-trend text-success small">
                      {item.trendText}
                    </span>
                  )}
                </span>
              </button>
              <Collapse in={isOpen}>
                <div
                  id={`signal-accordion-body-${item.id}`}
                  className="signal-accordion__item-body"
                  role="region"
                  aria-labelledby={`signal-accordion-toggle-${item.id}`}
                >
                  {item.content}
                </div>
              </Collapse>
            </div>
          );
        })}
      </div>
      {hasFooter && (
        <div className="signal-accordion__footer d-flex flex-column gap-8 py-12 px-16">
          {footer.netValue != null && (
            <div className="d-flex justify-content-between align-items-center">
              <span className="text-info-100 fw-bold">{footer.netValueLabel ?? 'Net Value'}</span>
              <span className="text-success fw-bold fs-5">{footer.netValue}</span>
            </div>
          )}
          {footer.coverageValue != null && (
            <div className="d-flex justify-content-between align-items-center">
              <span className="text-info-100 fw-bold">{footer.coverageLabel ?? 'Coverage Ratio'}</span>
              <span className="text-success small">{footer.coverageValue}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SignalAccordion;
