export const handleBrowse = (id) => {
  const fileInput = document.getElementById(id);
  fileInput.click();
};

export const handleDrop = (e, signal, signalName, onUpload) => {
  e.preventDefault();
  const tempArray = signal.value?.[signalName] || [];
  const droppedFiles = Array.from(e.dataTransfer.files);
  const filesToUpload = signal.value?.[`${signalName}ToUpload`] || [];
  signal.update({
    [signalName]: tempArray.concat(...droppedFiles),
    [`${signalName}ToUpload`]: filesToUpload.concat(...droppedFiles),
  });

  // Auto-upload if callback is provided
  if (onUpload && droppedFiles.length > 0) {
    onUpload();
  }
};

export const handleFileSelection = (e, signal, signalName, onUpload) => {
  const tempArray = signal.value?.[signalName] || [];
  const fileList = Array.from(e.target.files);
  const filesToUpload = signal.value?.[`${signalName}ToUpload`] || [];
  signal.update({
    [signalName]: [...tempArray, ...fileList],
    [`${signalName}ToUpload`]: [...filesToUpload, ...fileList],
  });

  // Auto-upload if callback is provided
  if (onUpload && fileList.length > 0) {
    onUpload();
  }
};

export const handleDownloadFile = async (file) => {
  window.open(file.url);
};
