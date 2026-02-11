import { Signal } from '@fyclabs/tools-fyc-react/signals';

/** True when "Copy Guarantor Link" was just used (show "Copied!") */
export const $copiedLink = Signal(false);

/** True while Excel export is in progress */
export const $isExportingExcel = Signal(false);

/** Permanent upload link: { token: string | null } */
export const $permanentUploadLink = Signal({ token: null });
