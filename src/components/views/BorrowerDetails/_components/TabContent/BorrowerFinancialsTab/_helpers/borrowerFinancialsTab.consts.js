import { Signal } from '@fyclabs/tools-fyc-react/signals';

/** True when "Copy Borrower Link" was just used (show "Copied!") */
export const $copiedLink = Signal(false);

/** True when "Copy Annual Link" was just used (show "Copied!") */
export const $copiedAnnualLink = Signal(false);

/** True when Impact Questionnaire public link was just copied */
export const $copiedImpactQuestionnaireLink = Signal(false);

/** True while Excel export is in progress */
export const $isExportingExcel = Signal(false);

/** True while creating a one-off Q1 test upload link */
export const $isCreatingQ1TestLink = Signal(false);

/** Permanent upload link: { token: string | null } */
export const $permanentUploadLink = Signal({ token: null });

/** Tracks in-flight row actions: { financialId: string | null, action: string | null } */
export const $financialRowActionInProgress = Signal({ financialId: null, action: null });

/** Document ids selected in the Run extraction modal */
export const $extractSelectedDocumentIds = Signal([]);
