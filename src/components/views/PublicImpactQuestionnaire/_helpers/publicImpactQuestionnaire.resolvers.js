import {
  getImpactQuestionnairePublic,
  submitImpactQuestionnairePublic,
} from '@src/api/publicImpactQuestionnaire.api';
import { dangerAlert } from '@src/components/global/Alert/_helpers/alert.events';
import {
  $publicImpactQuestionnaireForm,
  $publicImpactQuestionnaireView,
} from './publicImpactQuestionnaire.consts';

/**
 * @param {string} token
 * @param {{ suppressDangerAlert?: boolean }} [options]
 */
export const loadImpactQuestionnairePublic = async (token, options = {}) => {
  const { suppressDangerAlert = false } = options;
  if (!token) {
    $publicImpactQuestionnaireView.update({
      isLoading: false,
      error: 'Missing link token',
      payload: null,
    });
    return;
  }

  $publicImpactQuestionnaireView.update({
    isLoading: true,
    error: null,
    payload: null,
    submitSuccess: false,
  });

  try {
    const res = await getImpactQuestionnairePublic(token);
    const payload = res?.data ?? res ?? null;
    $publicImpactQuestionnaireView.update({
      payload,
      isLoading: false,
    });
  } catch (err) {
    const message = err?.message || err?.error || 'Invalid or expired link';
    if (!suppressDangerAlert) {
      dangerAlert(typeof message === 'string' ? message : 'Invalid link');
    }
    $publicImpactQuestionnaireView.update({
      isLoading: false,
      error: typeof message === 'string' ? message : 'Invalid link',
      payload: null,
    });
  }
};

/**
 * @param {string} token
 * @param {{ suppressDangerAlert?: boolean }} [options]
 */
export const submitImpactQuestionnairePublicForm = async (token, options = {}) => {
  const { suppressDangerAlert = false } = options;
  const form = $publicImpactQuestionnaireForm.value;
  const currentEmployees = parseInt(String(form.currentEmployees).trim(), 10);
  const averageMonthlyFte = parseFloat(String(form.averageMonthlyFte).trim());
  const wageRaw = String(form.averageEmployeeWage ?? '').replace(/[$,]/g, '').trim();
  const averageEmployeeWage = parseFloat(wageRaw);

  if (
    !Number.isFinite(currentEmployees)
    || currentEmployees <= 0
    || !Number.isFinite(averageMonthlyFte)
    || averageMonthlyFte <= 0
    || !Number.isFinite(averageEmployeeWage)
    || averageEmployeeWage <= 0
  ) {
    if (!suppressDangerAlert) {
      dangerAlert('Please enter valid positive numbers for all fields.');
    } else {
      $publicImpactQuestionnaireView.update({
        error: 'Please enter valid positive numbers for all fields.',
      });
    }
    return;
  }

  $publicImpactQuestionnaireView.update({ isSubmitting: true, error: null });
  try {
    await submitImpactQuestionnairePublic(token, {
      currentEmployees,
      averageMonthlyFte,
      averageEmployeeWage,
    });
    $publicImpactQuestionnaireView.update({
      isSubmitting: false,
      submitSuccess: true,
      payload: {
        ...($publicImpactQuestionnaireView.value.payload || {}),
        alreadySubmitted: true,
      },
    });
  } catch (err) {
    const message = err?.message || err?.error || 'Submission failed';
    if (!suppressDangerAlert) {
      dangerAlert(typeof message === 'string' ? message : 'Submission failed');
    }
    $publicImpactQuestionnaireView.update({
      isSubmitting: false,
      error: typeof message === 'string' ? message : null,
    });
  }
};
