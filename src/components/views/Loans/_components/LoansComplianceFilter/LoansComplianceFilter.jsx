import { Dropdown, Form, Button } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown } from '@fortawesome/free-solid-svg-icons';
import { $loansFilter } from '@src/signals';
import { COMPLIANCE_FILTER_GROUPS } from '@src/components/views/Borrowers/_helpers/borrowers.consts';
import {
  hasActiveComplianceFilters,
  getComplianceFilterSummary,
} from '@src/components/views/Borrowers/_helpers/borrowers.helpers';
import * as events from '../../_helpers/loans.events';
import '@src/components/views/Borrowers/_components/BorrowersComplianceFilter/BorrowersComplianceFilter.scss';

const LoansComplianceFilter = () => {
  const filterValue = $loansFilter.value;
  const hasActiveFilters = hasActiveComplianceFilters(filterValue);
  const summary = getComplianceFilterSummary(filterValue);

  return (
    <div className="bg-info-800 rounded-pill borrowers-compliance-filter w-100">
      <Dropdown className="w-100" autoClose="outside">
        <Dropdown.Toggle
          variant="link"
          className="borrowers-compliance-filter__toggle"
          id="loans-compliance-filter"
        >
          <span
            className={`borrowers-compliance-filter__label ${
              hasActiveFilters
                ? 'borrowers-compliance-filter__label--value'
                : 'borrowers-compliance-filter__label--placeholder'
            }`}
          >
            {summary}
          </span>
          <FontAwesomeIcon
            icon={faChevronDown}
            className="borrowers-compliance-filter__indicator"
            aria-hidden
          />
        </Dropdown.Toggle>

        <Dropdown.Menu className="borrowers-compliance-filter__menu shadow-sm">
          {COMPLIANCE_FILTER_GROUPS.map((group) => (
            <div key={group.key} className="borrowers-compliance-filter__group">
              <div className="borrowers-compliance-filter__group-label">{group.label}</div>
              <div className="borrowers-compliance-filter__options">
                {group.options.map((option) => (
                  <Form.Check
                    key={`${group.key}-${option.value}`}
                    type="checkbox"
                    id={`loans-compliance-${group.key}-${option.value}`}
                    label={option.label}
                    className="borrowers-compliance-filter__option custom-checkbox"
                    checked={filterValue?.[group.key] === option.value}
                    onChange={() => events.toggleLoansComplianceFilter(
                      group.key,
                      option.value,
                    )}
                  />
                ))}
              </div>
            </div>
          ))}

          {hasActiveFilters ? (
            <div className="borrowers-compliance-filter__clear-wrap">
              <Button
                variant="link"
                size="sm"
                className="borrowers-compliance-filter__clear"
                onClick={events.clearLoansComplianceFilters}
              >
                Clear compliance filters
              </Button>
            </div>
          ) : null}
        </Dropdown.Menu>
      </Dropdown>
    </div>
  );
};

export default LoansComplianceFilter;
