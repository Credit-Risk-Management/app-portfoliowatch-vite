import Select from 'react-select';
import { $form } from '@src/signals';
import { reactSelectStyles } from '../_helpers/reactSelectStyles';

const SelectInput = ({
  name,
  signal = $form,
  disabled,
  value,
  className,
  options,
  onChange,
  notClearable,
  isMulti = false,
  placeholder,
  isPortal = false,
  isSearchable = true,
  filterOption,
  menuMaxHeight = 280,
  noOptionsMessage,
  styles: stylesProp,
  ...rest
}) => {
  if (!name) {
    throw new Error('SelectInput has no name');
  }
  if (!signal) {
    throw new Error(`SelectInput has no signal (Name: ${name})`);
  }

  return (
    <Select
      id={name}
      className={className ?? 'bg-info-800 rounded-pill'}
      menuPortalTarget={isPortal ? document.body : undefined}
      value={isMulti
        ? options.filter((option) => value?.includes(option.value))
        : options.find((option) => option.value === value)}
      options={options}
      onChange={(selectedOption) => {
        let selectedValue;
        if (isMulti) {
          selectedValue = selectedOption?.map((option) => option.value) || [];
        } else if (selectedOption == null) {
          selectedValue = '';
        } else {
          selectedValue = selectedOption.value;
        }
        signal.update({ [name]: selectedValue });
        onChange?.(selectedOption);
      }}
      disabled={disabled}
      isMulti={isMulti}
      isClearable={!notClearable}
      isSearchable={isSearchable}
      filterOption={filterOption}
      maxMenuHeight={menuMaxHeight}
      noOptionsMessage={noOptionsMessage}
      placeholder={placeholder}
      styles={stylesProp ?? reactSelectStyles}
      {...rest}
    />
  );
};

export default SelectInput;
