import { $financialDocsUploader } from '../../../_helpers/submitFinancialsModal.consts';
import * as resolvers from '../../../_helpers/submitFinancialsModal.resolvers';

export const handleRowFileChange = (e, sectionId) => {
  const files = Array.from(e.target.files || []);
  const { target } = e;
  if (target) {
    // eslint-disable-next-line no-param-reassign
    target.value = '';
  }
  if (files.length === 0) return;
  $financialDocsUploader.update({ financialDocs: files });
  resolvers.stageFinancialDocuments(sectionId);
};

export const clearRow = (sectionId) => {
  resolvers.clearStagedSection(sectionId);
};
