import {
  PFS_SCHEDULE_DEFINITIONS,
  PFS_WORKSHEET_ROW_COUNT,
  pfsWorksheetField,
} from './pfsWorksheetModal.consts';
import { parsePfsNumeric } from './pfsWorksheetModal.helpers';

const ASSET_COLUMN_SPECS = [
  { scheduleId: 'A', columnKey: 'balance' },
  { scheduleId: 'B', columnKey: 'marketValue' },
  { scheduleId: 'C', columnKey: 'marketValue' },
  { scheduleId: 'D', columnKey: 'currentValue' },
];

const LIABILITY_BALANCE_SPECS = [
  { scheduleId: 'D', columnKey: 'amountOwed' },
  { scheduleId: 'G', columnKey: 'currentBal' },
  { scheduleId: 'H', columnKey: 'currentBal' },
  { scheduleId: 'I', columnKey: 'currentBal' },
];

const parseMoney = (s) => {
  const n = parsePfsNumeric(s);
  return Number.isFinite(n) ? n : 0;
};

const sumScheduleColumn = (payload, scheduleId, columnKey) => {
  let sum = 0;
  for (let r = 0; r < PFS_WORKSHEET_ROW_COUNT; r += 1) {
    sum += parseMoney(payload[pfsWorksheetField(scheduleId, r, columnKey)]);
  }
  return sum;
};

const estimatedAnnualFromRateAndBalance = (payload, scheduleId) => {
  let sum = 0;
  for (let r = 0; r < PFS_WORKSHEET_ROW_COUNT; r += 1) {
    const bal = parseMoney(payload[pfsWorksheetField(scheduleId, r, 'currentBal')]);
    const rate = parseMoney(payload[pfsWorksheetField(scheduleId, r, 'rate')]);
    if (bal > 0 && rate > 0) {
      sum += bal * (rate / 100);
    }
  }
  return sum;
};

export const formatPfsRollupMoney = (n) => {
  if (!Number.isFinite(n) || n === 0) return '0';
  return String(Math.round(n * 100) / 100);
};

export const computePfsWorksheetRollup = (payload) => {
  const totalAssets = ASSET_COLUMN_SPECS.reduce(
    (sum, { scheduleId, columnKey }) => sum + sumScheduleColumn(payload, scheduleId, columnKey),
    0,
  );
  const totalLiabilities = LIABILITY_BALANCE_SPECS.reduce(
    (sum, { scheduleId, columnKey }) => sum + sumScheduleColumn(payload, scheduleId, columnKey),
    0,
  );
  const revolvingAnnual = sumScheduleColumn(payload, 'I', 'minMonthlyPmt') * 12;
  const mortgageInstallmentAnnual = estimatedAnnualFromRateAndBalance(payload, 'G')
    + estimatedAnnualFromRateAndBalance(payload, 'H');

  return {
    totalAssets,
    totalLiabilities,
    netWorth: totalAssets - totalLiabilities,
    annualPayments: revolvingAnnual + mortgageInstallmentAnnual,
  };
};

export const hasPfsScheduleNumericData = (payload) => {
  const rollup = computePfsWorksheetRollup(payload);
  if (rollup.totalAssets > 0 || rollup.totalLiabilities > 0 || rollup.annualPayments > 0) {
    return true;
  }
  return PFS_SCHEDULE_DEFINITIONS.some((sch) => {
    for (let r = 0; r < PFS_WORKSHEET_ROW_COUNT; r += 1) {
      const hasMoney = sch.columns.some((col) => {
        if (col.inputMode !== 'decimal') return false;
        return parseMoney(payload[pfsWorksheetField(sch.id, r, col.key)]) > 0;
      });
      if (hasMoney) return true;
    }
    return false;
  });
};

export const applyPfsWorksheetRollup = (payload) => {
  if (!hasPfsScheduleNumericData(payload)) {
    return payload;
  }
  const rollup = computePfsWorksheetRollup(payload);
  return {
    ...payload,
    summary_totalAssets: formatPfsRollupMoney(rollup.totalAssets),
    summary_totalLiabilities: formatPfsRollupMoney(rollup.totalLiabilities),
    summary_netWorth: formatPfsRollupMoney(rollup.netWorth),
    summary_annualPayments: formatPfsRollupMoney(rollup.annualPayments),
  };
};
