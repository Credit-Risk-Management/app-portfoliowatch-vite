import { Form } from 'react-bootstrap';
import { $form } from '@src/signals';

const DatePicker = ({
  name,
  signal = $form,
  value,
}) => {
  if (!signal || !name) {
    return new Error(`ZipInput has no signal or name (Name: ${name})`);
  }

  const val = value || signal.value?.[name];

  return (
    <Form.Control
      className="bg-info-800 border-0 text-info-100"
      type="date"
      value={val ?? ''}
      onChange={(e) => signal.update({ [name]: e.target.value })}
    />
  );
};

export default DatePicker;
