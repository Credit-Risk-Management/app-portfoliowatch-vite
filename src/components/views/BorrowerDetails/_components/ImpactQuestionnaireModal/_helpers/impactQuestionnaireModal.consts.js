import { Signal } from '@fyclabs/tools-fyc-react/signals';

export const $impactQuestionnaireForm = Signal({
  currentEmployees: '',
  averageMonthlyFte: '',
  averageEmployeeWage: '',
});

export const $impactQuestionnaireState = Signal({
  isSubmitting: false,
  error: null,
});
