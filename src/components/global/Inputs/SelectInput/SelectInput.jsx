import Select from 'react-select';
import { $form } from '@src/signals';

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
      className={`bg-info-800 rounded-pill ${className}`}
      value={isMulti
        ? options.filter((option) => value?.includes(option.value))
        : options.find((option) => option.value === value)}
      options={options}
      onChange={(selectedOption) => {
        const selectedValue = isMulti
          ? (selectedOption?.map((option) => option.value) || [])
          : (selectedOption?.value || '');
        signal.update({ [name]: selectedValue });
        onChange();
      }}
      disabled={disabled}
      isMulti={isMulti}
      isClearable={!notClearable}
      placeholder={placeholder}
      styles={{
        control: (base) => ({
          ...base,
          backgroundColor: 'transparent',
          boxShadow: 'none',
          border: 'none',
          color: '#D0F5FA',
          paddingRight: '16px',
        }),
        valueContainer: (base) => ({
          ...base,
          paddingLeft: '0',
          paddingTop: '0',
          paddingBottom: '0',
          marginLeft: '1rem',
          color: '#5498A3',
        }),
        placeholder: (base) => ({
          ...base,
          color: '#68C0CA',
        }),
        singleValue: (base) => ({
          ...base,
          color: '#D0F5FA',
        }),
        multiValue: (base) => ({
          ...base,
          backgroundColor: '#68C0CA',
          color: '#2D5256',
          borderRadius: '10px',
          margin: '0',
          marginRight: '4px',
          height: '21px',
        }),
        multiValueLabel: (base) => ({
          ...base,
          color: 'dark',
          paddingLeft: '10px',
        }),
        multiValueRemove: (base) => ({
          ...base,
          color: 'dark',
          borderRadius: '10px',
          ':hover': {
            backgroundColor: '#EDEDED',
            color: 'dark',
          },
        }),
        input: (base) => ({
          ...base,
          color: '#D0F5FA',
        }),
        clearIndicator: (base) => ({
          ...base,
          color: '#D0F5FA',
          ':hover': { color: '#A6EDF5' },
        }),
        dropdownIndicator: (base) => ({
          ...base,
          paddingTop: '0',
          paddingBottom: '0',
          paddingRight: '0',
          color: 'dark',
          ':hover': { color: 'dark' },
        }),
        indicatorSeparator: (base) => ({
          ...base,
          display: 'none',
        }),
        option: (base, state) => ({
          ...base,
          backgroundColor: state.isSelected ? '#01738F' : '',
          ':hover': { backgroundColor: state.isSelected ? '' : '#B8E7F2' },
        }),
      }}
    />
  );
};

export default SelectInput;
