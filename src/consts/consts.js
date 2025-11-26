/* eslint-disable import/prefer-default-export */
import { Signal } from '@fyclabs/tools-fyc-react/signals';

export const WATCH_SCORE_OPTIONS = {
  null: {
    value: null,
    label: 'N/A',
    color: 'secondary',
  },
  1: {
    value: 1,
    label: '1 - Winning',
    color: 'success',
  },
  2: {
    value: 2,
    label: '2 - Anchor',
    color: 'info',
  },
  3: {
    value: 3,
    label: '3 - Typical',
    color: 'primary',
  },
  4: {
    value: 4,
    label: '4 - Concerning',
    color: 'warning',
  },
  5: {
    value: 5,
    label: '5 - High Risk',
    color: 'danger',
  },
};

export const $loan = Signal({
  loan: null,
  isLoading: false,
});

export const $borrower = Signal({
  borrower: null,
  isLoading: false,
});

export const $watchScoreBreakdown = Signal({
  breakdown: null,
  isLoading: false,
});
