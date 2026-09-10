import { Form } from 'react-bootstrap';
import { $form } from '@src/signals';

const CheckBoxInput = ({
  name,
  signal = $form,
  label,
  labelClassName,
  className,
  customOnChange,
  ...rest
}) => (
  <Form.Group>
    <Form.Check
      type="checkbox"
      label={labelClassName ? <span className={labelClassName}>{label}</span> : label}
      name={name}
      className={[className, 'custom-checkbox'].filter(Boolean).join(' ')}
      checked={signal.value?.[name] ?? false}
      onChange={() => {
        if (customOnChange) {
          customOnChange();
          return;
        }
        signal.update({ [name]: !signal.value?.[name] });
      }}
      {...rest}
    />
  </Form.Group>
);

export default CheckBoxInput;
