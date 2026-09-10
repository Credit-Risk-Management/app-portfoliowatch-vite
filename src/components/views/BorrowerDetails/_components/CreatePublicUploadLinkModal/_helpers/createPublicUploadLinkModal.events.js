import { $borrowerFinancialsView } from '@src/signals';
import {
  resetCreatePublicUploadLinkForm,
  $createPublicUploadLinkForm,
  $createPublicUploadLinkState,
} from './createPublicUploadLinkModal.consts';
import * as resolvers from './createPublicUploadLinkModal.resolvers';

export const openCreatePublicUploadLinkModal = (borrowerId) => {
  resetCreatePublicUploadLinkForm();
  $borrowerFinancialsView.update({
    activeModalKey: 'createPublicUploadLink',
    currentBorrowerId: borrowerId,
  });
};

export const closeCreatePublicUploadLinkModal = () => {
  if ($createPublicUploadLinkState.value.isCreating) return;
  $borrowerFinancialsView.update({
    activeModalKey: null,
  });
  resetCreatePublicUploadLinkForm();
};

export const handleTaxYearIncludeChange = (year, included) => {
  $createPublicUploadLinkForm.update({
    [`taxYear_${year}`]: included,
    ...(included ? {} : { [`taxYearRequired_${year}`]: false }),
  });
};

export const handleDebtScheduleIncludeChange = (included) => {
  $createPublicUploadLinkForm.update({
    includeDebtSchedule: included,
    ...(included ? {} : { debtScheduleRequiredForSubmit: false }),
  });
};

export const handleCreatePublicUploadLink = async (borrowerId) => {
  await resolvers.createAndCopyPublicUploadLink(borrowerId);
};
