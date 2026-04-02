import AsyncSelect from 'react-select/async';
import { reactSelectStyles } from '../_helpers/reactSelectStyles';

/**
 * Themed react-select/async wrapper. Use `value` / `onChange` for controlled usage
 * (e.g. composite form fields). Optional `signal` + `name` updates a single scalar field when provided.
 */
const AsyncSelectInput = ({
  inputId,
  classNamePrefix = 'async-select',
  className = '',
  loadOptions,
  value,
  onChange,
  signal,
  name,
  disabled,
  isPortal = false,
  cacheOptions = true,
  defaultOptions = true,
  isClearable,
  notClearable,
  placeholder,
  maxMenuHeight = 280,
  noOptionsMessage,
  loadingMessage,
  isMulti = false,
}) => {
  if (!loadOptions) {
    throw new Error('AsyncSelectInput requires loadOptions');
  }

  const clearable = isClearable !== undefined ? isClearable : !notClearable;

  const handleChange = (selectedOption) => {
    if (signal && name) {
      let selectedValue;
      if (isMulti) {
        selectedValue = selectedOption?.map((option) => option.value) || [];
      } else if (selectedOption == null) {
        selectedValue = '';
      } else {
        selectedValue = selectedOption.value;
      }
      signal.update({ [name]: selectedValue });
    }
    onChange?.(selectedOption);
  };

  return (
    <AsyncSelect
      inputId={inputId}
      classNamePrefix={classNamePrefix}
      className={`bg-info-800 rounded-pill ${className}`.trim()}
      menuPortalTarget={isPortal ? document.body : undefined}
      cacheOptions={cacheOptions}
      defaultOptions={defaultOptions}
      loadOptions={loadOptions}
      value={value}
      onChange={handleChange}
      disabled={disabled}
      isMulti={isMulti}
      isClearable={clearable}
      isSearchable
      maxMenuHeight={maxMenuHeight}
      noOptionsMessage={noOptionsMessage}
      loadingMessage={loadingMessage ?? (() => 'Searching…')}
      placeholder={placeholder}
      styles={reactSelectStyles}
    />
  );
};

export default AsyncSelectInput;
