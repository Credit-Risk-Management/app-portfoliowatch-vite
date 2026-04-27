import { getUploadLinkByToken } from '@src/api/borrowerFinancialUploadLink.api';
import { dangerAlert } from '@src/components/global/Alert/_helpers/alert.events';
import { $publicFinancialUploadView, DEBT_SCHEDULE_TEMPLATE_PDF_URL } from './publicFinancialUpload.consts';
import {
  formatDebtScheduleCurrency,
  parseDebtScheduleNumeric,
} from './publicFinancialUpload.helpers';

/**
 * Fetch upload link data by token
 * @param {string} token - The upload link token from URL params
 */
export const fetchUploadLinkData = async (token) => {
  if (!token) {
    $publicFinancialUploadView.update({
      error: 'No token provided',
      isLoading: false,
    });
    return;
  }

  try {
    $publicFinancialUploadView.update({
      isLoading: true,
      error: null,
    });

    const response = await getUploadLinkByToken(token);

    $publicFinancialUploadView.update({
      linkData: response?.data ?? null,
      token,
    });
  } catch (err) {
    dangerAlert(err.message || 'Invalid or expired upload link');
    $publicFinancialUploadView.update({
      linkData: null,
      isLoading: false,
      error: err.message || 'Invalid or expired upload link',
    });
  } finally {
    $publicFinancialUploadView.update({
      isLoading: false,
    });
  }
};

const DEBT_SCHEDULE_DATA_ROWS = 8;

/**
 * Open the public debt schedule template: fetch PDF, sum `row1..8` Current Balance
 * and Monthly Payment into the totals fields, and open a blob in a new tab
 * (fields remain editable; blank rows → blank totals).
 */
export const openDebtScheduleTemplateWithSummedTotals = async () => {
  let PDFDocument;
  let StandardFonts;
  let TextAlignment;
  try {
    const lib = await import('pdf-lib');
    PDFDocument = lib.PDFDocument;
    StandardFonts = lib.StandardFonts;
    TextAlignment = lib.TextAlignment;
  } catch {
    dangerAlert('Could not load PDF tools. Please try again or download the file directly.');
    return;
  }

  const templateRef = new URL(DEBT_SCHEDULE_TEMPLATE_PDF_URL, window.location.origin);
  let bytes;
  try {
    const res = await fetch(templateRef.href, { credentials: 'same-origin' });
    if (!res.ok) throw new Error('Failed to download template');
    bytes = await res.arrayBuffer();
  } catch (err) {
    dangerAlert(err?.message || 'Could not load the debt schedule template.');
    return;
  }

  let doc;
  try {
    doc = await PDFDocument.load(bytes);
  } catch {
    dangerAlert('The debt schedule file could not be read.');
    return;
  }

  const form = doc.getForm();
  const helv = await doc.embedFont(StandardFonts.Helvetica);
  let sumBalance = 0;
  let sumPayment = 0;
  for (let i = 1; i <= DEBT_SCHEDULE_DATA_ROWS; i += 1) {
    const balName = `row${i}_Current_Balance`;
    const payName = `row${i}_Monthly_Payment`;
    if (form.getFieldMaybe(balName)) {
      const text = form.getTextField(balName).getText() || '';
      sumBalance += parseDebtScheduleNumeric(text);
    }
    if (form.getFieldMaybe(payName)) {
      const text = form.getTextField(payName).getText() || '';
      sumPayment += parseDebtScheduleNumeric(text);
    }
  }

  const totalBal = form.getTextField('totals_Current_Balance');
  const totalPay = form.getTextField('totals_Monthly_Payment');
  totalBal.setText(formatDebtScheduleCurrency(sumBalance));
  totalPay.setText(formatDebtScheduleCurrency(sumPayment));
  totalBal.setAlignment(TextAlignment.Right);
  totalPay.setAlignment(TextAlignment.Right);
  totalBal.defaultUpdateAppearances(helv);
  totalPay.defaultUpdateAppearances(helv);

  let out;
  try {
    out = await doc.save();
  } catch (err) {
    dangerAlert(err?.message || 'Could not build the debt schedule PDF.');
    return;
  }
  const blob = new Blob([out], { type: 'application/pdf' });
  const objectUrl = URL.createObjectURL(blob);
  const win = window.open(objectUrl, '_blank', 'noopener,noreferrer');
  if (!win) {
    URL.revokeObjectURL(objectUrl);
    dangerAlert('Please allow pop-ups to open the debt schedule template.');
    return;
  }
  setTimeout(() => URL.revokeObjectURL(objectUrl), 60_000);
};
