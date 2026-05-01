import { Signal } from '@fyclabs/tools-fyc-react/signals';

export const $publicImpactQuestionnaireView = Signal({
  isLoading: true,
  error: null,
  payload: null,
  isSubmitting: false,
  submitSuccess: false,
});

export const $publicImpactQuestionnaireForm = Signal({
  currentEmployees: '',
  averageMonthlyFte: '',
  averageEmployeeWage: '',
});
