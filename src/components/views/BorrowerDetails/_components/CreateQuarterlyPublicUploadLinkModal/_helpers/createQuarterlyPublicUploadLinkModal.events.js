import { $borrowerFinancialsView } from '@src/signals';
import {
  resetCreateQuarterlyPublicUploadLinkForm,
  $createQuarterlyPublicUploadLinkForm,
  $createQuarterlyPublicUploadLinkState,
  QUARTERLY_DOC_CONFIG,
} from './createQuarterlyPublicUploadLinkModal.consts';
import * as resolvers from './createQuarterlyPublicUploadLinkModal.resolvers';

export const openCreateQuarterlyPublicUploadLinkModal = (borrowerId) => {
  resetCreateQuarterlyPublicUploadLinkForm();
  $borrowerFinancialsView.update({
    activeModalKey: 'createQuarterlyPublicUploadLink',
    currentBorrowerId: borrowerId,
  });
};

export const closeCreateQuarterlyPublicUploadLinkModal = () => {
  if ($createQuarterlyPublicUploadLinkState.value.isCreating) return;
  $borrowerFinancialsView.update({
    activeModalKey: null,
  });
  resetCreateQuarterlyPublicUploadLinkForm();
};

export const handleQuarterlyDocumentIncludeChange = (includeKey, included) => {
  const doc = QUARTERLY_DOC_CONFIG.find((d) => d.includeKey === includeKey);
  const patch = {
    [includeKey]: included,
    ...(included ? {} : { [doc?.requiredKey]: false }),
  };

  if (included && doc?.exclusiveIncomeKey) {
    const exclusive = QUARTERLY_DOC_CONFIG.find((d) => d.includeKey === doc.exclusiveIncomeKey);
    if (exclusive) {
      patch[doc.exclusiveIncomeKey] = false;
      patch[exclusive.requiredKey] = false;
    }
  }

  $createQuarterlyPublicUploadLinkForm.update(patch);
};

export const handleCreateQuarterlyPublicUploadLink = async (borrowerId) => {
  await resolvers.createAndCopyQuarterlyPublicUploadLink(borrowerId);
};
