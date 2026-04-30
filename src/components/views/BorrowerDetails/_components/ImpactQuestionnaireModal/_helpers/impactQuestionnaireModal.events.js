import { $borrower } from '@src/consts/consts';
import { $borrowerFinancialsView } from '@src/signals';
import { successAlert } from '@src/components/global/Alert/_helpers/alert.events';
import { fetchBorrowerDetail } from '../../../_helpers/borrowerDetail.resolvers';
import { $impactQuestionnaireForm, $impactQuestionnaireState } from './impactQuestionnaireModal.consts';
import * as resolvers from './impactQuestionnaireModal.resolvers';

export const openImpactQuestionnaire = () => {
  $borrowerFinancialsView.update({ activeModalKey: 'impactQuaestionnaire' });
};

export const closeImpactQuestionnaire = () => {
  $borrowerFinancialsView.update({ activeModalKey: null });
  $impactQuestionnaireForm.update({
    currentEmployees: '',
    averageMonthlyFte: '',
    averageEmployeeWage: '',
  });
  $impactQuestionnaireState.update({ isSubmitting: false, error: null });
};

export const handleSubmit = async () => {
  const { currentEmployees, averageMonthlyFte, averageEmployeeWage } = $impactQuestionnaireForm.value;

  if (!currentEmployees || !averageMonthlyFte || !averageEmployeeWage) {
    $impactQuestionnaireState.update({ error: 'All fields are required.' });
    return;
  }

  $impactQuestionnaireState.update({ isSubmitting: true, error: null });
  try {
    await resolvers.submitImpactQuestionnaireModal();
    const borrowerId = $borrower.value?.borrower?.id;
    if (borrowerId) {
      await fetchBorrowerDetail(borrowerId);
    }
    closeImpactQuestionnaire();
    successAlert('Impact questionnaire saved.', 'toast');
  } catch (err) {
    $impactQuestionnaireState.update({ error: err?.message || 'Failed to submit questionnaire.' });
  } finally {
    $impactQuestionnaireState.update({ isSubmitting: false });
  }
};
