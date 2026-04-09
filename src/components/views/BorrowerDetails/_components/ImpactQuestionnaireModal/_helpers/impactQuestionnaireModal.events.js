import { $borrowerFinancialsView } from '@src/signals';
import { $impactQuestionnaireForm, $impactQuestionnaireState } from './impactQuestionnaireModal.consts';

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
    // TODO: wire up API call when endpoint is available
    closeImpactQuestionnaire();
  } catch (err) {
    $impactQuestionnaireState.update({ error: err?.message || 'Failed to submit questionnaire.' });
  } finally {
    $impactQuestionnaireState.update({ isSubmitting: false });
  }
};
