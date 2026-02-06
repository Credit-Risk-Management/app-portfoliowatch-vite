import { Signal } from '@fyclabs/tools-fyc-react/signals';

// Signal for component view state
export const $documentsContainerView = Signal({
  excelData: null,
  isLoadingExcel: false,
  pdfNumPages: null,
  pdfPageNumber: 1,
  pdfLoadError: false,
  pdfBlobUrl: null,
  downloadURL: null,
});

export default $documentsContainerView;
