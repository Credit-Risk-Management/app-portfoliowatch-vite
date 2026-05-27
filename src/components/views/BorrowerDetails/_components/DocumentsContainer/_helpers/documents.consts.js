import { Signal } from '@fyclabs/tools-fyc-react/signals';

export const $documentsContainerView = Signal({
  pdfNumPages: null,
  pdfPageNumber: 1,
  pdfLoadError: false,
  pdfBlobUrl: null,
  pdfZoomScale: 1,
});

export default $documentsContainerView;
