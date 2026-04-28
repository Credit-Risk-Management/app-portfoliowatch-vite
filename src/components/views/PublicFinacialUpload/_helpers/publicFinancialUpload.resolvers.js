import { getUploadLinkByToken } from '@src/api/borrowerFinancialUploadLink.api';
import { dangerAlert } from '@src/components/global/Alert/_helpers/alert.events';
import {
  $publicFinancialUploadView,
  DEBT_SCHEDULE_TEMPLATE_PDF_URL,
  DEBT_SCHEDULE_XLSX_DATA_ROW_COUNT,
  DEBT_SCHEDULE_FORM_COLUMN_KEYS,
  debtScheduleFormField,
} from './publicFinancialUpload.consts';
import {
  computeDebtWorksheetTotals,
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
      debtScheduleWorksheetHydratedFromPrior: false,
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

const PDF_MARGIN = 48;
const PDF_LINE = 12;
const PDF_BODY = 9;
const PDF_BOTTOM = 56;

const DEBT_SCHEDULE_PDF_COLUMN_LABELS = [
  'Creditor',
  'Orig. financed',
  'LOC limit',
  'Orig. year',
  'Curr. balance',
  'Interest %',
  'Maturity',
  'Monthly pmt.',
  'Collateral',
  'Status',
];

function wrapTextByFontWidth(text, font, fontSize, maxWidth) {
  const words = String(text).split(/\s+/).filter(Boolean);
  const lines = [];
  let line = '';
  const flush = () => {
    if (line) lines.push(line);
    line = '';
  };
  words.forEach((w) => {
    const next = line ? `${line} ${w}` : w;
    if (font.widthOfTextAtSize(next, fontSize) <= maxWidth) {
      line = next;
    } else {
      flush();
      if (font.widthOfTextAtSize(w, fontSize) <= maxWidth) {
        line = w;
      } else {
        let rest = w;
        while (rest.length > 0) {
          let len = rest.length;
          while (len > 1 && font.widthOfTextAtSize(rest.slice(0, len), fontSize) > maxWidth) {
            len -= 1;
          }
          lines.push(rest.slice(0, len));
          rest = rest.slice(len);
        }
      }
    }
  });
  flush();
  return lines.length > 0 ? lines : [''];
}

/**
 * Build a printable debt schedule PDF from the worksheet form (for public upload).
 * @param {Record<string, string>} form — `$debtScheduleWorksheetForm` value
 * @returns {Promise<Uint8Array>}
 */
export const buildDebtScheduleWorksheetPdfBytes = async (form) => {
  const {
    PDFDocument,
    StandardFonts,
    rgb,
  } = await import('pdf-lib');

  const pdfDoc = await PDFDocument.create();
  let page = pdfDoc.addPage();
  let pageHeight = page.getSize().height;
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const black = rgb(0, 0, 0);

  const draw = (txt, x, yPos, size, f = font) => {
    page.drawText(txt, { x, y: yPos, size, font: f, color: black });
  };

  let y = pageHeight - PDF_MARGIN;

  const ensureSpace = (needed) => {
    if (y - needed < PDF_BOTTOM) {
      page = pdfDoc.addPage();
      pageHeight = page.getSize().height;
      y = pageHeight - PDF_MARGIN;
    }
  };

  draw('Business debt schedule', PDF_MARGIN, y, 16, fontBold);
  y -= PDF_LINE + 8;

  const biz = String(form.businessName ?? '').trim() || '—';
  const asOf = String(form.asOfDate ?? '').trim() || '—';
  draw(`Business: ${biz}`, PDF_MARGIN, y, PDF_BODY, fontBold);
  y -= PDF_LINE;
  draw(`As of date: ${asOf}`, PDF_MARGIN, y, PDF_BODY, fontBold);
  y -= PDF_LINE + 6;

  for (let r = 0; r < DEBT_SCHEDULE_XLSX_DATA_ROW_COUNT; r += 1) {
    const cells = DEBT_SCHEDULE_FORM_COLUMN_KEYS.map((k) => String(form[debtScheduleFormField(r, k)] ?? '').trim());
    if (!cells.some((c) => c !== '')) continue;

    ensureSpace(28 + DEBT_SCHEDULE_FORM_COLUMN_KEYS.length * (PDF_LINE - 1));
    draw(`Debt line ${r + 1}`, PDF_MARGIN, y, PDF_BODY, fontBold);
    y -= PDF_LINE + 2;

    DEBT_SCHEDULE_FORM_COLUMN_KEYS.forEach((key, idx) => {
      const val = String(form[debtScheduleFormField(r, key)] ?? '').trim() || '—';
      const label = DEBT_SCHEDULE_PDF_COLUMN_LABELS[idx] || key;
      const size = PDF_BODY - 0.5;
      if (key === 'collateral') {
        const pageW = page.getSize().width;
        const maxW = pageW - 2 * PDF_MARGIN;
        const prefix = `  ${label}: `;
        const prefixW = font.widthOfTextAtSize(prefix, size);
        const lines = wrapTextByFontWidth(val, font, size, Math.max(36, maxW - prefixW));
        lines.forEach((line, li) => {
          draw(li === 0 ? prefix + line : line, li === 0 ? PDF_MARGIN : PDF_MARGIN + prefixW, y, size);
          y -= PDF_LINE - 1;
        });
      } else {
        draw(`  ${label}: ${val}`, PDF_MARGIN, y, size);
        y -= PDF_LINE - 1;
      }
    });
    y -= 4;
  }

  const { totalBalance, totalMonthly } = computeDebtWorksheetTotals(form);
  ensureSpace(36);
  draw(
    `Totals — Current balance: ${formatDebtScheduleCurrency(totalBalance) || '—'}; Monthly payment: ${formatDebtScheduleCurrency(totalMonthly) || '—'}`,
    PDF_MARGIN,
    y,
    PDF_BODY,
    fontBold,
  );
  y -= PDF_LINE + 8;

  ensureSpace(48);
  draw('Authorization', PDF_MARGIN, y, PDF_BODY, fontBold);
  y -= PDF_LINE + 2;
  draw(`Printed name: ${String(form.signatoryName ?? '').trim()}`, PDF_MARGIN, y, PDF_BODY);
  y -= PDF_LINE;
  draw(`Title: ${String(form.signatoryTitle ?? '').trim()}`, PDF_MARGIN, y, PDF_BODY);
  y -= PDF_LINE;
  const sigDate = String(form.signDate ?? '').trim();
  if (sigDate) {
    draw(`Date: ${sigDate}`, PDF_MARGIN, y, PDF_BODY);
    y -= PDF_LINE;
  }

  return pdfDoc.save();
};
