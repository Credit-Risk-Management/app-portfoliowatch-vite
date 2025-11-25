export const getLoanNumber = (loanId, loans) => {
  const loan = loans.find((l) => l.id === loanId);
  return loan ? loan.loanNumber || loan.loanId : '-';
};

export const formatFileSize = (bytes) => {
  if (!bytes || bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

export const formatUploadDate = (date) => {
  if (!date) return '-';
  
  const uploadDate = new Date(date);
  return uploadDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

