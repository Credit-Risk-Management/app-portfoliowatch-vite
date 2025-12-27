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
// - Strip non-digits (except a single decimal point)
// - Limit to 2 decimal places
// - Avoid leading zeros where possible
export const normalizeCurrencyValue = (value) => {
  if (value === null || value === undefined) return '';

  const stringValue = `${value}`;
  const cleaned = stringValue.replace(/[^\d.]/g, '');

  if (!cleaned) return '';

  const hasDot = cleaned.includes('.');
  const [rawInt = '', rawDecimal = ''] = cleaned.split('.');

  const intPart = rawInt.replace(/^0+(?=\d)/, '') || (rawDecimal ? '0' : '');

  // If user has typed the decimal point but no decimals yet, preserve the trailing dot
  if (hasDot && rawDecimal === '') {
    return `${intPart || '0'}.`;
  }

  // No decimal point present – just return the normalized integer portion
  if (!hasDot) {
    return intPart || '';
  }

  const decimalPart = rawDecimal.slice(0, 2);
  return `${intPart || '0'}.${decimalPart}`;
};

// Format a normalized numeric string for display as currency
export const formatCurrencyDisplay = (value, currency = '$') => {
  if (value === null || value === undefined || value === '') return '';

  const stringValue = `${value}`;
  const hasTrailingDot = stringValue.endsWith('.');
  const [rawInt = '0', rawDecimal = ''] = stringValue.split('.');
  const intNumber = Number(rawInt || '0');

  if (Number.isNaN(intNumber)) return '';

  const intFormatted = intNumber.toLocaleString();

  // While the user is in the middle of typing the decimal point,
  // preserve the trailing dot so they can continue entering cents.
  if (hasTrailingDot) {
    return `${currency}${intFormatted}.`;
  }

  if (rawDecimal === '') {
    return `${currency}${intFormatted}`;
  }

  // Show up to two decimal places exactly as typed
  const decimalRaw = rawDecimal.slice(0, 2);
  return `${currency}${intFormatted}.${decimalRaw}`;
};
