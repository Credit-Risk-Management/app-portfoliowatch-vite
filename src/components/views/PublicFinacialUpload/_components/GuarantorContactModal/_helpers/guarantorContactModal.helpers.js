import { isEmailValid } from '@src/components/global/Inputs/UniversalInput/_helpers/universalinput.events';
import { getGuarantorContactSignal } from './guarantorContactModal.consts';

/** @param {string|undefined|null} name */
export const splitGuarantorName = (name) => {
  const trimmed = String(name ?? '').trim();
  if (!trimmed) {
    return { firstName: '', lastName: '' };
  }
  const parts = trimmed.split(/\s+/);
  if (parts.length === 1) {
    return { firstName: parts[0], lastName: '' };
  }
  return {
    firstName: parts[0],
    lastName: parts.slice(1).join(' '),
  };
};

/**
 * @param {Array<{ id: string, name: string }>|undefined|null} guarantorsNeedingContact
 */
export const hydrateGuarantorContactForms = (guarantorsNeedingContact) => {
  const list = Array.isArray(guarantorsNeedingContact) ? guarantorsNeedingContact : [];
  list.forEach(({ id, name }) => {
    const signal = getGuarantorContactSignal(id);
    if (!signal) return;
    const { firstName, lastName } = splitGuarantorName(name);
    signal.update({ firstName, lastName, email: '', phone: '' });
  });
};

/**
 * @param {Array<{ id: string, name: string }>|undefined|null} guarantorsNeedingContact
 * @returns {{ valid: boolean, errors: Record<string, { firstName?: string, lastName?: string, email?: string, phone?: string }> }}
 */
export const validateGuarantorContactForms = (guarantorsNeedingContact) => {
  const list = Array.isArray(guarantorsNeedingContact) ? guarantorsNeedingContact : [];
  const errors = {};
  let valid = true;

  list.forEach(({ id, name }) => {
    const form = getGuarantorContactSignal(id)?.value ?? {};
    const rowErrors = {};
    if (!String(form.firstName ?? '').trim()) {
      rowErrors.firstName = 'First name is required.';
      valid = false;
    }
    if (!String(form.lastName ?? '').trim()) {
      rowErrors.lastName = 'Last name is required.';
      valid = false;
    }
    const email = String(form.email ?? '').trim();
    if (!email || !isEmailValid(email)) {
      rowErrors.email = 'A valid email address is required.';
      valid = false;
    }
    const phone = String(form.phone ?? '').trim();
    if (!phone || phone.length !== 14) {
      rowErrors.phone = 'A valid phone number is required.';
      valid = false;
    }
    if (Object.keys(rowErrors).length > 0) {
      errors[id] = { ...rowErrors, guarantorName: name };
    }
  });

  return { valid, errors };
};

/**
 * @param {Array<{ id: string, name: string }>|undefined|null} guarantorsNeedingContact
 * @returns {Array<{ guarantorId: string, firstName: string, lastName: string, email: string, phone: string }>}
 */
export const buildGuarantorContactsPayload = (guarantorsNeedingContact) => {
  const list = Array.isArray(guarantorsNeedingContact) ? guarantorsNeedingContact : [];
  return list.map(({ id }) => {
    const form = getGuarantorContactSignal(id)?.value ?? {};
    return {
      guarantorId: id,
      firstName: String(form.firstName ?? '').trim(),
      lastName: String(form.lastName ?? '').trim(),
      email: String(form.email ?? '').trim(),
      phone: String(form.phone ?? '').trim(),
    };
  });
};
