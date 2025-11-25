export const formatContactName = (contact) => {
  if (!contact) return '-';
  return `${contact.firstName} ${contact.lastName}`.trim() || '-';
};

export const getPrimaryContactBadge = (isPrimary) => {
  if (isPrimary) {
    return { text: 'Primary', variant: 'success' };
  }
  return null;
};

export const formatContactDisplay = (contacts) => {
  if (!contacts || contacts.length === 0) return 'No contacts';
  
  const primaryContact = contacts.find((c) => c.isPrimary);
  if (primaryContact) {
    return formatContactName(primaryContact);
  }
  
  return formatContactName(contacts[0]);
};

