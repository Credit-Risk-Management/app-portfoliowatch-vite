import { useLayoutEffect, useRef } from 'react';
import { Form, InputGroup } from 'react-bootstrap';
import Select from 'react-select';
import Signal from '@fyclabs/tools-fyc-react/signals/Signal';
import { $form } from '@src/signals';
import InputBoxGroup from '@src/components/global/Inputs/UniversalInput/components/InputBoxGroup';
import CheckBoxInput from '@src/components/global/Inputs/UniversalInput/components/CheckBoxInput';
import {
  formatDate,
  formatPhone,
  formatTime,
  isEmailValid,
  formatCurrencyDisplay,
  formatPercentageInputValue,
  canonicalizePercentageToPoints,
} from './_helpers/universalinput.events';

const $select = Signal({});

function UniversalTextareaField({
  label,
  labelClassName,
  className,
  name,
  signal,
  textVal,
  placeholder,
  autoComplete,
  customOnChange,
  inputFormatCallback,
  isValid,
  isInvalid,
  disabled,
  controlStyle,
  textareaRest,
  rows,
  autoSize,
  onBlurProp,
}) {
  const ref = useRef(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || !autoSize) return;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  }, [textVal, autoSize]);

  const handleChange = (e) => {
    if (customOnChange) {
      customOnChange(e);
    } else {
      signal.update({
        [name]: inputFormatCallback ? inputFormatCallback(e.target.value) : e.target.value,
      });
    }
    if (autoSize) {
      const el = e.target;
      requestAnimationFrame(() => {
        el.style.height = 'auto';
        el.style.height = `${el.scrollHeight}px`;
      });
    }
  };

  return (
    <div>
      {label && <Form.Label className={labelClassName}>{label}</Form.Label>}
      <Form.Control
        ref={ref}
        as="textarea"
        rows={autoSize ? 1 : (rows ?? 3)}
        value={textVal}
        placeholder={placeholder}
        className={`bg-info-800 border-0 text-info-100 ${className || ''}`}
        name={name}
        autoComplete={autoComplete}
        onChange={handleChange}
        onBlur={onBlurProp}
        isValid={isValid}
        isInvalid={isInvalid}
        disabled={disabled}
        {...textareaRest}
        style={{
          whiteSpace: 'pre-wrap',
          overflowWrap: 'anywhere',
          wordBreak: 'break-word',
          ...(autoSize
            ? {
              minHeight: '2.75rem',
              maxHeight: 'none',
              resize: 'vertical',
              overflow: 'hidden',
            }
            : {
              resize: 'vertical',
              minHeight: '2.75rem',
            }),
          ...controlStyle,
        }}
      />
    </div>
  );
}

const UniversalInput = ({
  label,
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
  labelClassName,
  onBlur: onBlurProp,
  rows,
  /** When true with type textarea, height grows with content (no fixed row cap). */
  autoSize = false,
  ...props
}) => {
  if ((!signal || !name) && !customOnChange && type !== 'select') {
    throw new Error(`Universal Input has no signal or name (Name: ${name})`);
  }

  if (type === 'textarea') {
    const { style: controlStyle, ...textareaRest } = props;
    const { [name]: val } = signal.value;
    const textVal = val || value || '';
    return (
      <UniversalTextareaField
        label={label}
        labelClassName={labelClassName}
        className={className}
        name={name}
        signal={signal}
        textVal={textVal}
        placeholder={placeholder}
        autoComplete={autoComplete}
        customOnChange={customOnChange}
        inputFormatCallback={inputFormatCallback}
        isValid={isValid}
        isInvalid={isInvalid}
        disabled={disabled}
        controlStyle={controlStyle}
        textareaRest={textareaRest}
        rows={rows}
        autoSize={autoSize}
        onBlurProp={onBlurProp}
      />
    );
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
    if (type === 'currency') {
      return formatCurrencyDisplay(val || value || '');
    }
    if (type === 'percentage') {
      return formatPercentageInputValue(val || value || '');
    }
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

  const allowedNativeTypes = ['text', 'email', 'number', 'password', 'tel', 'date', 'time'];
  const inputType = allowedNativeTypes.includes(type) ? type : 'text';

  const handleBlur = (e) => {
    if (type === 'percentage' && signal && name) {
      const raw = signal.value?.[name];
      const canonical = canonicalizePercentageToPoints(raw ?? '');
      if (canonical !== raw) {
        signal.update({ [name]: canonical });
      }
    }
    onBlurProp?.(e);
  };

  const controlShared = {
    type: inputType,
    value: formatValue(),
    placeholder,
    className: `bg-info-800 border-0 text-info-100 ${className || ''}`,
    name,
    autoComplete,
    onChange: customOnChange || ((e) => signal.update({
      [name]: inputFormatCallback ? inputFormatCallback(e.target.value) : e.target.value,
    })),
    isValid: validation[type] ? validation[type].valid : isValid,
    isInvalid: validation[type] ? val && validation[type].invalid : isInvalid,
    disabled,
    maxLength: type === 'phone' ? 14 : '',
  };

  return (
    <div>
      {label && <Form.Label className={labelClassName}>{label}</Form.Label>}
      {type === 'percentage' ? (
        <InputGroup>
          <Form.Control
            {...controlShared}
            {...props}
            onBlur={handleBlur}
          />
          <InputGroup.Text className="bg-info-800 border-0 text-info-100">%</InputGroup.Text>
        </InputGroup>
      ) : (
        <Form.Control
          {...controlShared}
          {...props}
          onBlur={handleBlur}
        />
      )}
    </div>
  );
};

export default UniversalInput;
