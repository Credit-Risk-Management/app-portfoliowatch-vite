import borrowersApi from '@src/api/borrowers.api';
import { $borrower } from '@src/consts/consts';
import { $impactQuestionnaireForm } from './impactQuestionnaireModal.consts';

export async function submitImpactQuestionnaireModal() {
  const borrowerId = $borrower.value?.borrower?.id;
  if (!borrowerId) {
    throw new Error('Borrower not loaded.');
  }

  const form = $impactQuestionnaireForm.value;
  const ce = parseInt(String(form.currentEmployees).trim(), 10);
  const fte = parseFloat(String(form.averageMonthlyFte).trim());
  const wageRaw = String(form.averageEmployeeWage ?? '').replace(/[$,]/g, '').trim();
  const wage = parseFloat(wageRaw);

  if (
    !Number.isFinite(ce)
    || ce <= 0
    || !Number.isFinite(fte)
    || fte <= 0
    || !Number.isFinite(wage)
    || wage <= 0
  ) {
    throw new Error('Please enter valid positive numbers for all fields.');
  }

  await borrowersApi.update(borrowerId, {
    currentEmployees: ce,
    averageMonthlyFte: fte,
    averageEmployeeWage: wage,
  });
}

export default submitImpactQuestionnaireModal;
