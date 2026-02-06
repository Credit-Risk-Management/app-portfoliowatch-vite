import ExcelJS from 'exceljs';
import { $documentsContainerView } from './documents.consts';

export const parseExcelFile = async (currentDoc) => {
  if (!currentDoc) {
    $documentsContainerView.update({ excelData: null });
    return;
  }

  $documentsContainerView.update({ isLoadingExcel: true });

  try {
    const workbook = new ExcelJS.Workbook();
    let buffer;

    // For stored documents, download directly from Firebase Storage
    if (currentDoc.isStored && currentDoc.storageUrl) {
      const response = await fetch(currentDoc.storageUrl);
      const blob = await response.blob();
      buffer = await blob.arrayBuffer();
    } else if (currentDoc.file) {
      // For newly uploaded files, use the File object
      buffer = await currentDoc.file.arrayBuffer();
    } else {
      $documentsContainerView.update({ excelData: null, isLoadingExcel: false });
      return;
    }

    await workbook.xlsx.load(buffer);

    // Get the first worksheet
    const worksheet = workbook.worksheets[0];
    if (!worksheet) {
      $documentsContainerView.update({ excelData: null, isLoadingExcel: false });
      return;
    }

    // Convert worksheet to array of rows
    const rows = [];
    worksheet.eachRow((row) => {
      const rowData = [];
      row.eachCell({ includeEmpty: true }, (cell) => {
        let { value } = cell;
        // Handle different cell value types
        if (value === null || value === undefined) {
          value = '';
        } else if (typeof value === 'object') {
          // Handle formulas, rich text, etc.
          if (value.text !== undefined) {
            value = value.text;
          } else if (value.result !== undefined) {
            value = value.result;
          } else {
            value = String(value);
          }
        }
        rowData.push(value);
      });
      rows.push(rowData);
    });

    $documentsContainerView.update({
      excelData: {
        worksheetName: worksheet.name,
        rows,
        columnCount: worksheet.columnCount,
      },
      isLoadingExcel: false,
    });
  } catch (error) {
    console.error('Error parsing Excel file:', error);
    $documentsContainerView.update({ excelData: null, isLoadingExcel: false });
  }
};

export const createPdfBlobUrl = (currentDoc) => {
  // Clean up existing blob URL if any
  const existingBlobUrl = $documentsContainerView.value.pdfBlobUrl;
  if (existingBlobUrl) {
    URL.revokeObjectURL(existingBlobUrl);
  }

  // For newly uploaded files with File object, create a blob URL
  if (currentDoc?.file) {
    const blobUrl = URL.createObjectURL(currentDoc.file);
    $documentsContainerView.update({ pdfBlobUrl: blobUrl, pdfLoadError: false });
    return blobUrl;
  }

  // For stored documents, we'll use storageUrl directly (no blob URL needed)
  $documentsContainerView.update({ pdfBlobUrl: null, pdfLoadError: false });
  return null;
};

export const resetPdfState = () => {
  $documentsContainerView.update({
    pdfLoadError: false,
    pdfPageNumber: 1,
    pdfNumPages: null,
  });
};

export const handlePdfLoadSuccess = (numPages) => {
  $documentsContainerView.update({
    pdfNumPages: numPages,
    pdfLoadError: false,
  });
};

export const handlePdfLoadError = (error) => {
  console.error('Error loading PDF:', error);
  $documentsContainerView.update({ pdfLoadError: true });
};
