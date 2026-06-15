import { Signal } from '@fyclabs/tools-fyc-react/signals';

/** Per-guarantor contact form signals (created on link load). */
const contactSignalsByGuarantorId = {};

export const getGuarantorContactSignal = (guarantorId) => {
  if (!guarantorId) return null;
  if (!contactSignalsByGuarantorId[guarantorId]) {
    contactSignalsByGuarantorId[guarantorId] = Signal({
      firstName: '',
      lastName: '',
      email: '',
    });
  }
  return contactSignalsByGuarantorId[guarantorId];
};

export const resetGuarantorContactSignals = () => {
  Object.keys(contactSignalsByGuarantorId).forEach((id) => {
    contactSignalsByGuarantorId[id].update({
      firstName: '',
      lastName: '',
      email: '',
    });
  });
};

export const clearGuarantorContactSignalCache = () => {
  Object.keys(contactSignalsByGuarantorId).forEach((id) => {
    delete contactSignalsByGuarantorId[id];
  });
};
