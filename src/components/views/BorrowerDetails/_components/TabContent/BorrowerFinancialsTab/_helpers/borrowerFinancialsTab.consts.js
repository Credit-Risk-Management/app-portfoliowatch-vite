import { Signal } from '@fyclabs/tools-fyc-react/signals';

/** True when "Copy Borrower Link" was just used (show "Copied!") */
export const $copiedLink = Signal(false);

/** True when "Copy Annual Link" was just used (show "Copied!") */
export const $copiedAnnualLink = Signal(false);

/** True while Excel export is in progress */
export const $isExportingExcel = Signal(false);

/** True while creating a one-off Q1 test upload link */
export const $isCreatingQ1TestLink = Signal(false);

/** Permanent upload link: { token: string | null } */
export const $permanentUploadLink = Signal({ token: null });
