import { Form } from 'react-bootstrap';
import Select from 'react-select';
import Signal from '@fyclabs/tools-fyc-react/signals/Signal';
import { $form } from '@src/signals';
import InputBoxGroup from '@src/components/global/Inputs/UniversalInput/components/InputBoxGroup';
import CheckBoxInput from '@src/components/global/Inputs/UniversalInput/components/CheckBoxInput';
import { formatDate, formatPhone, formatTime, isEmailValid } from './_helpers/universalinput.events';

const $select = Signal({});

const UniversalInput = ({
  type,
  name,
  signal = $form,
  variant = 'form-control', // || form-control-border
  className,
  placeholder,
  inputFormatCallback,
  value,
  customOnChange, // ONLY USE IF NEEDED
  autoComplete,
  isValid,
  isInvalid,
  inputBoxGroupOptions = {},
  selectOptions, // For select type: array of {value, label}
  notClearable, // For select type
  isMulti = false, // For select type
  disabled,
  ...props
}) => {
  if ((!signal || !name) && !customOnChange && type !== 'select') {
    throw new Error(`Universal Input has no signal or name (Name: ${name})`);
  }

  if (type === 'inputBoxGroup') {
    return (
      <InputBoxGroup
        name={name}
        signal={signal}
        variant={variant}
        className={className}
        isValid={isValid}
        isInvalid={isInvalid}
        options={inputBoxGroupOptions}
        {...props}
      />
    );
  }

  if (type === 'checkbox') {
    return (
      <CheckBoxInput
        name={name}
        signal={signal}
        className={className}
        {...props}
      />
    );
  }

  if (type === 'select') {
    const { [name]: isHovered } = $select.value;
    const selectValue = value !== undefined ? value : (signal?.value?.[name]);

    return (
      <div
        onMouseEnter={() => $select.update({ [name]: true })}
        onMouseLeave={() => $select.update({ [name]: false })}
      >
        <Select
          id={name}
          className={`${variant || ''} ${className || ''} ps-0 py-8`}
          value={selectValue}
          options={selectOptions || []}
          onChange={customOnChange || ((e) => signal.update({ [name]: e }))}
          disabled={disabled}
          isMulti={isMulti}
          isClearable={!notClearable}
          placeholder={placeholder}
          styles={{
            control: (base) => ({
              ...base,
              boxShadow: 'none',
              border: 'none',
              minHeight: '21px',
            }),
            placeholder: (base) => ({
              ...base,
              color: isHovered ? '#373636' : '#777676',
            }),
            valueContainer: (base) => ({
              ...base,
              paddingLeft: '0',
              paddingTop: '0',
              paddingBottom: '0',
              marginLeft: '1rem',
            }),
            singleValue: (base) => ({
              ...base,
              color: 'dark',
            }),
            multiValue: (base) => ({
              ...base,
              backgroundColor: '#EDEDED',
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
              paddingTop: '0',
              paddingBottom: '0',
              marginTop: '0',
              marginBottom: '0',
            }),
            clearIndicator: (base) => ({
              ...base,
              paddingTop: '0',
              paddingBottom: '0',
              paddingRight: '0',
              color: 'dark',
              ':hover': { color: 'dark' },
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
      </div>
    );
  }

  const { [name]: val } = signal.value;

  const validation = {
    email: { valid: isEmailValid(val), invalid: !isEmailValid(val) },
    phone: { valid: val?.length === 14, invalid: val?.length < 14 },
  };

  const formatValue = () => {
    if (type === 'phone') {
      return formatPhone(val);
    }
    if (type === 'date') {
      return formatDate(val);
    }
    if (type === 'time') {
      if (val instanceof Date) {
        return formatTime(val);
      }
      return val || value || '';
    }
    return val || value || '';
  };

  return (
    <Form.Control
      type={type || 'text'}
      value={formatValue()}
      placeholder={placeholder}
      className={`w-100 ${variant} ${className || ''} ${disabled ? 'text-dark-300' : ''} shadow-none py-8 ps-16`}
      name={name}
      autoComplete={autoComplete}
      onChange={customOnChange || ((e) => signal.update({
        [name]: inputFormatCallback ? inputFormatCallback(e.target.value) : e.target.value,
      }))}
      isValid={validation[type] ? validation[type].valid : isValid}
      isInvalid={validation[type] ? val && validation[type].invalid : isInvalid}
      disabled={disabled}
      maxLength={type === 'phone' ? 14 : ''}
      {...props}
    />
  );
};

export default UniversalInput;
