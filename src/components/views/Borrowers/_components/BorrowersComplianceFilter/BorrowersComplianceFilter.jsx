import { Dropdown, Form, Button } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown } from '@fortawesome/free-solid-svg-icons';
import { $borrowersFilter } from '@src/signals';
import * as consts from '../../_helpers/borrowers.consts';
import * as helpers from '../../_helpers/borrowers.helpers';
import * as events from '../../_helpers/borrowers.events';
import './BorrowersComplianceFilter.scss';

const BorrowersComplianceFilter = ({ setSearchParams }) => {
  const filterValue = $borrowersFilter.value;
  const hasActiveFilters = helpers.hasActiveComplianceFilters(filterValue);
  const summary = helpers.getComplianceFilterSummary(filterValue);

  return (
    <div className="bg-info-800 rounded-pill borrowers-compliance-filter w-100">
      <Dropdown className="w-100" autoClose="outside">
        <Dropdown.Toggle
          variant="link"
          className="borrowers-compliance-filter__toggle"
          id="borrowers-compliance-filter"
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
          {consts.COMPLIANCE_FILTER_GROUPS.map((group) => (
            <div key={group.key} className="borrowers-compliance-filter__group">
              <div className="borrowers-compliance-filter__group-label">{group.label}</div>
              <div className="borrowers-compliance-filter__options">
                {group.options.map((option) => (
                  <Form.Check
                    key={`${group.key}-${option.value}`}
                    type="checkbox"
                    id={`borrowers-compliance-${group.key}-${option.value}`}
                    label={option.label}
                    className="borrowers-compliance-filter__option custom-checkbox"
                    checked={filterValue?.[group.key] === option.value}
                    onChange={() => events.toggleBorrowersComplianceFilter(
                      setSearchParams,
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
                onClick={() => events.clearBorrowersComplianceFilters(setSearchParams)}
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

export default BorrowersComplianceFilter;
