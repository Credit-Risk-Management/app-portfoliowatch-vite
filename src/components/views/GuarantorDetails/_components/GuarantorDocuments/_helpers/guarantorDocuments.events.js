// TODO: Add events for GuarantorDetail
export const handleDocumentRowClick = (row) => {
  const link = document.createElement('a');
  link.href = row.storageUrl;
  link.download = row.fileName;
  link.target = '_blank';
  link.click();
};

export default handleDocumentRowClick;
