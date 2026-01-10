export const isEmailValid = (email) => {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return email?.length && emailRegex.test(email);
};

export const formatPhone = (phone) => {
  if (!phone?.length) return '';

  const cleaned = phone?.replace(/\D/g, '');
  const length = cleaned?.length;

  if (length < 4) return cleaned;
  if (length < 7) return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3)}`;
  return `(${cleaned?.slice(0, 3)}) ${cleaned?.slice(3, 6)}-${cleaned?.slice(6, 10)}`;
};

export const formatDate = (dateTime) => {
  if (!dateTime) return '';
  const date = new Date(dateTime);
  if (Number.isNaN(date.getTime())) return '';
  return date.toISOString().slice(0, 10);
};
export const formatTime = (dateTime) => {
  if (!dateTime) return '';
  const date = new Date(dateTime);
  if (Number.isNaN(date.getTime())) return '';
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
};

// Normalize user input for currency fields:
// - Strip non-digits (no decimal points allowed)
// - Round any decimal values to whole numbers
// - Avoid leading zeros where possible
export const normalizeCurrencyValue = (value) => {
  if (value === null || value === undefined) return '';

  const stringValue = `${value}`;
  
  // If the value contains a decimal point, parse it as a number and round to nearest integer
  if (stringValue.includes('.')) {
    const numValue = parseFloat(stringValue);
    if (!Number.isNaN(numValue)) {
      return Math.round(numValue).toString();
    }
  }
  
  // Remove all non-digit characters
  const cleaned = stringValue.replace(/\D/g, '');

  if (!cleaned) return '';

  // Remove leading zeros but keep at least one zero if that's all there is
  const normalized = cleaned.replace(/^0+(?=\d)/, '') || '0';
  
  return normalized;
};

// Normalize user input for currency fields without cents (whole numbers only):
// - Strip non-digits (no decimal points allowed)
// - Round any decimal values to whole numbers
// - Avoid leading zeros where possible
export const normalizeCurrencyValueNoCents = (value) => {
  if (value === null || value === undefined) return '';

  const stringValue = `${value}`;
  
  // If the value contains a decimal point, parse it as a number and round to nearest integer
  if (stringValue.includes('.')) {
    const numValue = parseFloat(stringValue);
    if (!Number.isNaN(numValue)) {
      return Math.round(numValue).toString();
    }
  }
  
  // Remove all non-digit characters
  const cleaned = stringValue.replace(/\D/g, '');

  if (!cleaned) return '';

  // Remove leading zeros but keep at least one zero if that's all there is
  const normalized = cleaned.replace(/^0+(?=\d)/, '') || '0';
  
  return normalized;
};

// Format a normalized numeric string for display as currency (whole numbers only, no cents)
export const formatCurrencyDisplay = (value, currency = '$') => {
  if (value === null || value === undefined || value === '') return '';

  const stringValue = `${value}`;
  
  // Remove any decimal portion if present
  const intValue = stringValue.includes('.') 
    ? Math.round(parseFloat(stringValue)).toString()
    : stringValue;
  
  const intNumber = Number(intValue);

  if (Number.isNaN(intNumber)) return '';

  const intFormatted = intNumber.toLocaleString();
  return `${currency}${intFormatted}`;
};
