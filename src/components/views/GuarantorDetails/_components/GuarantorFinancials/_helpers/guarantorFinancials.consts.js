import { Signal } from '@fyclabs/tools-fyc-react/signals';

/** True when "Annual" one-off copy was just used */
export const $copiedAnnualLink = Signal(false);

/** True while Excel export is in progress */
export const $isExportingExcel = Signal(false);

/** Permanent upload link: { token: string | null } */
export const $permanentUploadLink = Signal({ token: null });
