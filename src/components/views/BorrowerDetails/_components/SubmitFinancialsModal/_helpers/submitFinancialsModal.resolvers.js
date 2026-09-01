import { $borrowerFinancialsView, $borrowerFinancialsForm, $user } from '@src/signals';
import borrowerFinancialsApi from '@src/api/borrowerFinancials.api';
import borrowerFinancialDocumentsApi from '@src/api/borrowerFinancialDocuments.api';
import debtServiceHistoryApi from '@src/api/debtServiceHistory.api';
import { successAlert, dangerAlert } from '@src/components/global/Alert/_helpers/alert.events';
import { uploadToFirebase } from '@src/components/views/Loans/_helpers/loans.upload';
import { storage } from '@src/utils/firebase';
import { profitMarginPercentFromNetIncome } from '@src/utils/sensibleExtractPrimitives';
import { formatDateForInput } from '@src/utils/formatDate';
import * as consts from './submitFinancialsModal.consts';
import {
  resetSubmitFinancialsModalSync,
  cleanupSubmitFinancialsModalStorage,
} from './submitFinancialsModal.events';

const isSubmitFinancialFailure = (response) => (
  response?.success === false || response?.data?.success === false
);

const { MODAL_FINANCIAL_DOCUMENT_BUCKET_KEYS, INCOME_STATEMENT_MODAL_KEYS } = consts;

function revokePreviewUrlsForDocs(docs) {
  (docs || []).forEach((doc) => {
    if (doc?.previewUrl) {
      try {
        URL.revokeObjectURL(doc.previewUrl);
      } catch {
        // no-op
      }
    }
  });
}

/**
 * When staging quarterly or YTD income, drop the other income bucket (one or the other).
 */
function clearOppositeIncomeBucket(documentsByType, keepKey) {
  if (!INCOME_STATEMENT_MODAL_KEYS.includes(keepKey)) return documentsByType;
  const otherKey = keepKey === 'incomeStatementQuarterly'
    ? 'incomeStatementYtd'
    : 'incomeStatementQuarterly';
  const toClear = documentsByType[otherKey] || [];
  revokePreviewUrlsForDocs(toClear);
  return {
    ...documentsByType,
    [otherKey]: [],
  };
}

/**
 * Stage files locally (preview). Document text extraction runs asynchronously server-side (EXTRACT_FINANCIALS task)
 * after submit—users are not blocked on OCR in the browser.
 * @param {string} [documentTypeKey] - When set (e.g. from upload list row), use this type; else use form `documentType`.
 */
export const stageFinancialDocuments = async (documentTypeKey) => {
  const { $financialDocsUploader, $modalState } = consts;
  $modalState.update({ error: null });
  const raw = $financialDocsUploader.value.financialDocs || [];
  if (!raw.length) return;

  const documentType = documentTypeKey || $borrowerFinancialsForm.value.documentType;
  $borrowerFinancialsForm.update({ documentType });
  const { documentsByType } = $modalState.value;
  const files = Array.isArray(raw) ? raw : [raw];

  let nextByType = clearOppositeIncomeBucket({ ...documentsByType }, documentType);
  files.forEach((file) => {
    const previewUrl = URL.createObjectURL(file);
    const newDoc = {
      id: `temp-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      file,
      fileName: file.name,
      fileSize: file.size,
      mimeType: file.type,
      documentType,
      previewUrl,
      uploadedAt: new Date(),
      extractionPending: true,
    };
    const list = nextByType[documentType] || [];
    nextByType = {
      ...nextByType,
      [documentType]: [...list, newDoc],
    };
  });

  const newList = nextByType[documentType] || [];
  const newIndex = newList.length - 1;
  const lastDoc = newList[newIndex];
  const indexPatch = { [documentType]: newIndex };
  if (documentType === 'incomeStatementQuarterly') {
    indexPatch.incomeStatementYtd = 0;
  } else if (documentType === 'incomeStatementYtd') {
    indexPatch.incomeStatementQuarterly = 0;
  }
  $modalState.update({
    documentsByType: nextByType,
    currentDocumentIndex: {
      ...$modalState.value.currentDocumentIndex,
      ...indexPatch,
    },
    pdfUrl: lastDoc?.previewUrl ?? null,
  });
  $financialDocsUploader.update({ financialDocs: [] });
};

/** @deprecated use stageFinancialDocuments */
export const handleFileUpload = async () => {
  await stageFinancialDocuments();
};

export const handleRemoveDocument = async (documentId) => {
  const { $modalState } = consts;
  $modalState.update({ isLoading: true });
  try {
    const { documentType } = $borrowerFinancialsForm.value;
    const { documentsByType, currentDocumentIndex } = $modalState.value;
    const docs = documentsByType[documentType] || [];
    const docIndex = docs.findIndex((doc) => doc.id === documentId);
    if (docIndex === -1) return;

    const doc = docs[docIndex];
    if (doc.previewUrl) {
      URL.revokeObjectURL(doc.previewUrl);
    }
    const updatedDocs = docs.filter((_, i) => i !== docIndex);
    let newIndex = currentDocumentIndex[documentType];
    if (newIndex >= updatedDocs.length) {
      newIndex = Math.max(0, updatedDocs.length - 1);
    }
    const newPdfUrl = updatedDocs[newIndex]?.previewUrl
      || updatedDocs[newIndex]?.storageUrl
      || null;
    if (doc.storagePath) {
      const deleteStorageRef = storage.ref(doc.storagePath);
      await deleteStorageRef.delete().catch(() => { });
    }

    const updatedDocumentsByType = {
      ...documentsByType,
      [documentType]: updatedDocs,
    };
    const allEmpty = MODAL_FINANCIAL_DOCUMENT_BUCKET_KEYS.every(
      (k) => !(updatedDocumentsByType[k] || []).length,
    );

    const clearedFields = {};
    const taxStillHasDocs = (updatedDocumentsByType.taxReturn || []).length > 0;
    const incomeStillHasDocs = (
      (updatedDocumentsByType.incomeStatementQuarterly || []).length > 0
      || (updatedDocumentsByType.incomeStatementYtd || []).length > 0
    );
    const isIncomeModalBucket = documentType === 'incomeStatementQuarterly'
      || documentType === 'incomeStatementYtd';
    if (isIncomeModalBucket && updatedDocs.length === 0) {
      clearedFields.debtSchedule = '';
      if (!taxStillHasDocs) {
        clearedFields.grossRevenue = '';
        clearedFields.netIncome = '';
        clearedFields.profitMargin = '';
        clearedFields.ebitda = '';
        clearedFields.rentalExpenses = '';
      }
    }
    if (documentType === 'balanceSheet' && updatedDocs.length === 0) {
      clearedFields.totalCurrentAssets = '';
      clearedFields.totalCurrentLiabilities = '';
      clearedFields.totalAssets = '';
      clearedFields.totalLiabilities = '';
      clearedFields.cash = '';
      clearedFields.cashEquivalents = '';
      clearedFields.equity = '';
      clearedFields.accountsReceivable = '';
      clearedFields.accountsPayable = '';
      clearedFields.inventory = '';
      clearedFields.currentRatio = '';
      clearedFields.liquidity = '';
      clearedFields.liquidityRatio = '';
      clearedFields.retainedEarnings = '';
    }
    if (documentType === 'taxReturn' && updatedDocs.length === 0) {
      if (!incomeStillHasDocs) {
        clearedFields.grossRevenue = '';
        clearedFields.netIncome = '';
        clearedFields.profitMargin = '';
        clearedFields.ebitda = '';
        clearedFields.rentalExpenses = '';
      }
      clearedFields.equity = '';
      clearedFields.cashEquivalents = '';
      clearedFields.accountsReceivable = '';
      clearedFields.inventory = '';
      clearedFields.totalCurrentAssets = '';
      clearedFields.totalAssets = '';
      clearedFields.accountsPayable = '';
      clearedFields.totalCurrentLiabilities = '';
      clearedFields.totalLiabilities = '';
      clearedFields.liquidity = '';
      clearedFields.liquidityRatio = '';
      clearedFields.retainedEarnings = '';
    }
    if (allEmpty) {
      clearedFields.asOfDate = '';
    }

    if (Object.keys(clearedFields).length > 0) {
      $borrowerFinancialsForm.update(clearedFields);
    }

    if (doc.isStored && doc.id && !String(doc.id).startsWith('temp-')) {
      const prevIds = $borrowerFinancialsForm.value.documentIds || [];
      if (prevIds.length > 0) {
        $borrowerFinancialsForm.update({
          documentIds: prevIds.filter((id) => id !== doc.id),
        });
      }
    }

    $modalState.update({
      ...$modalState.value,
      documentsByType: updatedDocumentsByType,
      currentDocumentIndex: {
        ...currentDocumentIndex,
        [documentType]: newIndex,
      },
      pdfUrl: newPdfUrl,
      downloadSensibleUrl: null,
    });

    if (allEmpty) {
      $modalState.update({ ocrApplied: false });
    }
  } catch (error) {
    $modalState.update({ error: error?.message ?? 'Failed to remove document', isLoading: false });
  } finally {
    $modalState.update({ isLoading: false });
  }
};

/**
 * Remove all staged documents for one section (upload list: clear row).
 */
export const clearStagedSection = async (typeKey) => {
  $borrowerFinancialsForm.update({ documentType: typeKey });
  const initialIds = (consts.$modalState.value.documentsByType[typeKey] || []).map((d) => d.id);
  await initialIds.reduce(
    (p, id) => p.then(() => handleRemoveDocument(id)),
    Promise.resolve(),
  );
};

export const handleSwitchDocument = (index) => {
  const { $modalState } = consts;
  const { documentType } = $borrowerFinancialsForm.value;
  const { documentsByType, currentDocumentIndex } = $modalState.value;
  const docs = documentsByType[documentType] || [];
  if (index < 0 || index >= docs.length) return;
  $modalState.update({
    currentDocumentIndex: {
      ...currentDocumentIndex,
      [documentType]: index,
    },
    pdfUrl: docs[index].previewUrl,
  });
};

/** Stored API `document_type` → modal `documentsByType` key (tabs use short names). */
const API_DOCUMENT_TYPE_TO_MODAL_BUCKET = {
  incomeStatementYtd: 'incomeStatementYtd',
  incomeStatementQuarterly: 'incomeStatementQuarterly',
  incomeStatement: 'incomeStatementQuarterly',
  businessTaxReturn: 'taxReturn',
  debtSchedule: 'debtScheduleWorksheet',
};

const modalBucketForStoredDocumentType = (apiDocumentType) => (
  API_DOCUMENT_TYPE_TO_MODAL_BUCKET[apiDocumentType] ?? apiDocumentType
);

const loadDocumentsFromBackend = async (financialId) => {
  try {
    const response = await borrowerFinancialDocumentsApi.getByBorrowerFinancial(financialId);
    const documents = response?.success && response?.data ? response.data : [];
    if (documents?.length > 0) {
      const documentsByType = {
        balanceSheet: [],
        incomeStatementQuarterly: [],
        incomeStatementYtd: [],
        debtScheduleWorksheet: [],
        taxReturn: [],
      };
      documents.forEach((doc) => {
        const bucketKey = modalBucketForStoredDocumentType(doc.documentType);
        if (documentsByType[bucketKey]) {
          documentsByType[bucketKey].push({
            id: doc.id,
            fileName: doc.fileName,
            fileSize: doc.fileSize,
            mimeType: doc.mimeType,
            documentType: doc.documentType,
            uploadedAt: doc.uploadedAt,
            storagePath: doc.storagePath,
            storageUrl: doc.storageUrl,
            isStored: true,
            previewUrl: doc.storageUrl,
            extractionPending: false,
          });
        }
      });
      return documentsByType;
    }
  } catch (error) {
    // no-op
  }
  return {
    balanceSheet: [],
    incomeStatementQuarterly: [],
    incomeStatementYtd: [],
    debtScheduleWorksheet: [],
    taxReturn: [],
  };
};

const collectStoredIdsByType = (documentsByType) => ({
  balanceSheet: (documentsByType.balanceSheet || [])
    .filter((d) => d.isStored && d.id)
    .map((d) => d.id),
  incomeStatementQuarterly: (documentsByType.incomeStatementQuarterly || [])
    .filter((d) => d.isStored && d.id)
    .map((d) => d.id),
  incomeStatementYtd: (documentsByType.incomeStatementYtd || [])
    .filter((d) => d.isStored && d.id)
    .map((d) => d.id),
  debtScheduleWorksheet: (documentsByType.debtScheduleWorksheet || [])
    .filter((d) => d.isStored && d.id)
    .map((d) => d.id),
  taxReturn: (documentsByType.taxReturn || [])
    .filter((d) => d.isStored && d.id)
    .map((d) => d.id),
});

/** Stored PDF rows currently shown in the modal (excludes temp staged uploads). */
const flattenStoredDocumentIds = (documentsByType) => (
  Object.values(collectStoredIdsByType(documentsByType || {})).flat()
);

const toNumberOrNull = (value) => {
  if (value == null || value === '') return null;
  const num = typeof value === 'string' ? parseFloat(value.replace(/[^0-9.-]/g, '')) : Number(value);
  return Number.isNaN(num) ? null : num;
};

/** Single UI field shows cash + cash equivalents (matches liquidity when stored). */
const formatCombinedCashForForm = (financial) => {
  const fromLiquidity = toNumberOrNull(financial.liquidity);
  if (fromLiquidity != null) return fromLiquidity.toString();
  const cash = toNumberOrNull(financial.cash);
  const cashEq = toNumberOrNull(financial.cashEquivalents);
  if (cash == null && cashEq == null) return '';
  return ((cash ?? 0) + (cashEq ?? 0)).toString();
};

export const handleOpenEditMode = async (financial) => {
  const { $modalState } = consts;
  const expectedFinancialId = financial.id;
  const documentsByType = await loadDocumentsFromBackend(financial.id);
  // User may have closed the modal or submitted while documents were loading; do not reopen.
  if ($borrowerFinancialsView.value.editingFinancialId !== expectedFinancialId) {
    return;
  }
  if ($borrowerFinancialsView.value.activeModalKey !== 'submitFinancials') {
    return;
  }
  const firstDocType = Object.keys(documentsByType).find((type) => documentsByType[type].length > 0);
  const firstDoc = firstDocType ? documentsByType[firstDocType][0] : null;

  $borrowerFinancialsForm.update({
    activeTab: 'documents',
    documentType: firstDocType || 'balanceSheet',
    asOfDate: formatDateForInput(financial.asOfDate),
    accountabilityScore: financial.accountabilityScore?.toString() || '',
    grossRevenue: financial.grossRevenue?.toString() || '',
    netIncome: financial.netIncome?.toString() || '',
    ebitda: financial.ebitda?.toString() || '',
    // Stored as decimal (0-1); convert to percentage for the (%) form field
    profitMargin: toDisplayPercentage(financial.profitMargin),
    totalCurrentAssets: financial.totalCurrentAssets?.toString() || '',
    totalCurrentLiabilities: financial.totalCurrentLiabilities?.toString() || '',
    totalAssets: financial.totalAssets?.toString() || '',
    totalLiabilities: financial.totalLiabilities?.toString() || '',
    cash: '',
    cashEquivalents: formatCombinedCashForForm(financial),
    equity: financial.equity?.toString() || '',
    accountsReceivable: financial.accountsReceivable?.toString() || '',
    accountsPayable: financial.accountsPayable?.toString() || '',
    inventory: financial.inventory?.toString() || '',
    debtService: financial.debtService?.toString() || '',
    currentRatio: financial.currentRatio?.toString() || '',
    liquidity: financial.liquidity?.toString() || '',
    liquidityRatio: financial.liquidityRatio?.toString() || '',
    retainedEarnings: financial.retainedEarnings?.toString() || '',
    changeInCash: financial.changeInCash?.toString() || '',
    changeInEbitda: financial.changeInEbitda?.toString() || '',
    changeInAccountsReceivable: financial.changeInAccountsReceivable?.toString() || '',
    changeInProfitMargin: financial.changeInProfitMargin?.toString() || '',
    changeInInventory: financial.changeInInventory?.toString() || '',
    changeInAccountsPayable: financial.changeInAccountsPayable?.toString() || '',
    notes: financial.notes || '',
    documentIds: financial.documentIds || [],
    incomeStatementPackageQuarterly: Boolean(financial.incomeStatementPackageQuarterly),
  });

  $borrowerFinancialsView.update({
    activeModalKey: 'submitFinancials',
    isEditMode: true,
    editingFinancialId: financial.id,
    currentBorrowerId: financial.borrowerId,
  });

  $modalState.update({
    documentsByType,
    initialStoredDocumentIdsByType: collectStoredIdsByType(documentsByType),
    pdfUrl: firstDoc?.previewUrl || firstDoc?.storageUrl || null,
    currentDocumentIndex: {
      balanceSheet: 0,
      incomeStatementQuarterly: 0,
      incomeStatementYtd: 0,
      debtScheduleWorksheet: 0,
      taxReturn: 0,
      ...(firstDocType ? { [firstDocType]: 0 } : {}),
    },
  });
};

const roundTo4 = (value) => parseFloat(value.toFixed(4));

/**
 * Convert a stored profitMargin value to a percentage string for form display.
 * Canonical storage format is percentage (0–100). Legacy records may have been
 * saved as a decimal fraction (0–1); those are multiplied by 100 on load.
 */
const toDisplayPercentage = (value) => {
  if (value == null || value === '') return '';
  const num = parseFloat(value);
  if (Number.isNaN(num)) return '';
  if (num > 0 && num <= 1) return String(parseFloat((num * 100).toFixed(4)));
  return String(num);
};

const computeDebtServiceRatio = (ebitda, totalMonthlyPayment, incomeStatementPackageQuarterly = false) => {
  if (ebitda == null || totalMonthlyPayment == null) return null;
  if (totalMonthlyPayment <= 0) return null;
  const annualDebtService = totalMonthlyPayment * 12;
  if (annualDebtService <= 0) return null;
  const ebitdaForRatio = incomeStatementPackageQuarterly ? ebitda * 4 : ebitda;
  return roundTo4(ebitdaForRatio / annualDebtService);
};

/** True when staged or stored income docs imply a quarterly P&L package (aligns with API / WATCH). */
const inferQuarterlyIncomeForSubmit = (stagedByType) => {
  const quarterly = stagedByType?.incomeStatementQuarterly || [];
  if (quarterly.some((d) => d?.file || d?.isStored)) return true;
  const ytd = [
    ...(stagedByType?.incomeStatementYtd || []),
    ...(stagedByType?.incomeStatement || []),
  ];
  if (ytd.some((d) => d?.file || d?.isStored)) return false;
  return Boolean($borrowerFinancialsForm.value.incomeStatementPackageQuarterly);
};

/** Total current assets / total current liabilities (matches WATCH Weighted Exposure). */
const computeCurrentRatio = (totalCurrentAssets, totalCurrentLiabilities) => {
  if (totalCurrentAssets == null || totalCurrentLiabilities == null) return null;
  if (totalCurrentLiabilities <= 0) return null;
  return roundTo4(totalCurrentAssets / totalCurrentLiabilities);
};

/** Cash + cash equivalents (matches WATCH liquidity field). Either may be omitted; both null => no value. */
const computeLiquidity = (cash, cashEquivalents) => {
  if (cash == null && cashEquivalents == null) return null;
  const sum = (cash ?? 0) + (cashEquivalents ?? 0);
  return parseFloat(sum.toFixed(2));
};

/** Stored doc IDs removed from the modal since load (edit submit → API deletes after queue). */
const computeRemovedStoredDocumentIds = (documentsByType, initialStoredDocumentIdsByType, editingId) => {
  if (!editingId || !initialStoredDocumentIdsByType || !documentsByType) return [];
  const removed = [];
  Object.keys(initialStoredDocumentIdsByType).forEach((docType) => {
    const docs = documentsByType[docType] || [];
    const currentStoredIds = new Set(
      docs.filter((d) => d.isStored && d.id).map((d) => d.id),
    );
    (initialStoredDocumentIdsByType[docType] || []).forEach((id) => {
      if (!currentStoredIds.has(id)) removed.push(id);
    });
  });
  return removed;
};

/** New local files staged in the modal (not yet in Storage). */
const collectStagedNewUploads = (stagedByType) => {
  const items = [];
  Object.keys(stagedByType || {}).forEach((docType) => {
    (stagedByType[docType] || []).forEach((doc) => {
      if (doc?.file && !doc.isStored) {
        items.push({ file: doc.file, documentType: docType });
      }
    });
  });
  return items;
};

/**
 * After modal close: PUT files to signed URLs, confirm uploads, dispatch EXTRACT_FINANCIALS.
 * Same sequence as public upload link flow.
 */
const runBackgroundDocumentUploadAndExtraction = async ({
  financialId,
  stagedNewUploads,
  uploads,
  extractTaskId,
}) => {
  await Promise.all(
    uploads.map(async (slot, index) => {
      const { file } = stagedNewUploads[index];
      const uploaded = await uploadToFirebase(file, slot.uploadUrl);
      if (!uploaded) {
        throw new Error(`Failed to upload ${slot.fileName ?? file.name}`);
      }
    }),
  );

  await borrowerFinancialsApi.confirmDocumentUploads(
    financialId,
    uploads.map((slot) => ({
      documentId: slot.documentId,
      storagePath: slot.storagePath,
    })),
  );

  if (extractTaskId) {
    await borrowerFinancialsApi.notifyExtractReady(financialId, extractTaskId);
  }
};

export const handleSubmit = async () => {
  const { $modalState } = consts;
  try {
    $modalState.update({ isSubmitting: true, error: null });

    const borrowerId = $borrowerFinancialsView.value.currentBorrowerId;
    const { asOfDate } = $borrowerFinancialsForm.value;
    const { organizationId } = $user.value || {};

    if (!borrowerId) {
      $modalState.update({ error: 'Borrower ID is required. Please select a borrower.', isSubmitting: false });
      return;
    }
    if (!asOfDate) {
      $modalState.update({ error: 'As of Date is required. Please select a date.', isSubmitting: false });
      return;
    }
    if (!organizationId) {
      $modalState.update({ error: 'Organization ID is required. Please ensure you are logged in.', isSubmitting: false });
      return;
    }

    const formEbitda = toNumberOrNull($borrowerFinancialsForm.value.ebitda);
    const formGrossRevenue = toNumberOrNull($borrowerFinancialsForm.value.grossRevenue);
    const formNetIncome = toNumberOrNull($borrowerFinancialsForm.value.netIncome);
    const formTca = toNumberOrNull($borrowerFinancialsForm.value.totalCurrentAssets);
    const formTcl = toNumberOrNull($borrowerFinancialsForm.value.totalCurrentLiabilities);
    const combinedCash = toNumberOrNull($borrowerFinancialsForm.value.cashEquivalents);

    const { documentsByType: stagedByType } = $modalState.value;

    let computedDebtServiceRatio = null;
    try {
      const debtServiceResponse = await debtServiceHistoryApi.getLatestByBorrowerId(borrowerId);
      const latestDebtService = debtServiceResponse?.data ?? null;
      const totalMonthlyPayment = toNumberOrNull(latestDebtService?.totalMonthlyPayment);
      const quarterlyForDscr = inferQuarterlyIncomeForSubmit(stagedByType);
      computedDebtServiceRatio = computeDebtServiceRatio(
        formEbitda,
        totalMonthlyPayment,
        quarterlyForDscr,
      );
    } catch (error) {
      computedDebtServiceRatio = null;
    }

    const computedCurrentRatio = computeCurrentRatio(formTca, formTcl);
    const computedLiquidity = combinedCash;

    const explicitProfitMargin = toNumberOrNull($borrowerFinancialsForm.value.profitMargin);
    const resolvedProfitMargin = explicitProfitMargin != null
      ? explicitProfitMargin
      : profitMarginPercentFromNetIncome(formNetIncome, formGrossRevenue);
    const hasStagedNewUploads = stagedByType
      && Object.keys(stagedByType).some((k) => (stagedByType[k] || []).some((d) => d?.file && !d.isStored));

    const fromModalIds = flattenStoredDocumentIds(stagedByType);
    const fromFormIds = Array.isArray($borrowerFinancialsForm.value.documentIds)
      ? $borrowerFinancialsForm.value.documentIds
      : [];
    const documentIds = fromModalIds.length > 0 ? fromModalIds : fromFormIds;

    const financialData = {
      borrowerId,
      asOfDate,
      accountabilityScore: toNumberOrNull($borrowerFinancialsForm.value.accountabilityScore),
      grossRevenue: toNumberOrNull($borrowerFinancialsForm.value.grossRevenue),
      netIncome: toNumberOrNull($borrowerFinancialsForm.value.netIncome),
      ebitda: toNumberOrNull($borrowerFinancialsForm.value.ebitda),
      profitMargin: resolvedProfitMargin,
      totalCurrentAssets: toNumberOrNull($borrowerFinancialsForm.value.totalCurrentAssets),
      totalCurrentLiabilities: toNumberOrNull($borrowerFinancialsForm.value.totalCurrentLiabilities),
      totalAssets: toNumberOrNull($borrowerFinancialsForm.value.totalAssets),
      totalLiabilities: toNumberOrNull($borrowerFinancialsForm.value.totalLiabilities),
      cash: combinedCash,
      cashEquivalents: combinedCash != null ? 0 : null,
      equity: toNumberOrNull($borrowerFinancialsForm.value.equity),
      accountsReceivable: toNumberOrNull($borrowerFinancialsForm.value.accountsReceivable),
      accountsPayable: toNumberOrNull($borrowerFinancialsForm.value.accountsPayable),
      inventory: toNumberOrNull($borrowerFinancialsForm.value.inventory),
      debtService: computedDebtServiceRatio ?? toNumberOrNull($borrowerFinancialsForm.value.debtService),
      currentRatio: computedCurrentRatio ?? toNumberOrNull($borrowerFinancialsForm.value.currentRatio),
      liquidity: computedLiquidity ?? toNumberOrNull($borrowerFinancialsForm.value.liquidity),
      liquidityRatio: toNumberOrNull($borrowerFinancialsForm.value.liquidityRatio),
      retainedEarnings: toNumberOrNull($borrowerFinancialsForm.value.retainedEarnings),
      notes: $borrowerFinancialsForm.value.notes || null,
      submittedBy: $user.value?.email || $user.value?.name || 'Unknown User',
      organizationId,
      documentIds,
      ...(hasStagedNewUploads ? { skipWatchScoreRecomputation: true } : {}),
    };

    const { isEditMode } = $borrowerFinancialsView.value;
    const editingId = $borrowerFinancialsView.value.editingFinancialId;
    const removedDocumentIds = computeRemovedStoredDocumentIds(
      stagedByType,
      $modalState.value.initialStoredDocumentIdsByType,
      editingId,
    );

    let response;
    let didQueueExtraction = false;
    let backgroundUploadPromise = null;

    const stagedNewUploads = hasStagedNewUploads ? collectStagedNewUploads(stagedByType) : [];

    if (isEditMode && editingId) {
      response = await borrowerFinancialsApi.update(editingId, {
        ...financialData,
        ...(removedDocumentIds.length > 0 ? { removedDocumentIds } : {}),
      });
    } else {
      response = await borrowerFinancialsApi.create(financialData);
    }

    if (isSubmitFinancialFailure(response)) {
      $modalState.update({ error: response?.error || response?.message || 'Failed to submit financial data' });
      return;
    }

    const responseData = response?.data ?? response;
    const financialId = isEditMode && editingId ? editingId : responseData?.id;

    if (stagedNewUploads.length > 0 && financialId) {
      const slotResponse = await borrowerFinancialsApi.prepareDocumentUploadSlots(financialId, {
        files: stagedNewUploads.map(({ file, documentType }) => ({
          fileName: file.name,
          contentType: file.type || 'application/pdf',
          fileSize: file.size,
          documentType,
        })),
        uploadedBy: financialData.submittedBy,
      });

      if (isSubmitFinancialFailure(slotResponse)) {
        $modalState.update({
          error: slotResponse?.error || slotResponse?.message || 'Failed to prepare document uploads',
        });
        return;
      }

      const uploadPlan = slotResponse?.data ?? slotResponse;
      didQueueExtraction = Boolean(uploadPlan?.extractTask?.id);
      backgroundUploadPromise = runBackgroundDocumentUploadAndExtraction({
        financialId,
        stagedNewUploads,
        uploads: uploadPlan?.uploads ?? [],
        extractTaskId: uploadPlan?.extractTask?.id,
      });
    }

    const wasEditMode = $borrowerFinancialsView.value.isEditMode;
    const updatedLoans = responseData?.updatedLoans || [];
    const { pdfUrl } = $modalState.value;

    $borrowerFinancialsView.update({
      refreshTrigger: $borrowerFinancialsView.value.refreshTrigger + 1,
    });

    // Same synchronous reset as Cancel/X — updates all signals the modal reads.
    const cleanupContext = resetSubmitFinancialsModalSync(pdfUrl);
    cleanupSubmitFinancialsModalStorage(cleanupContext).catch(() => { });

    if (updatedLoans.length > 0) {
      $modalState.update({
        showWatchScoreResults: true,
        updatedLoans,
      });
    }

    let successMessage;
    if (didQueueExtraction) {
      successMessage = wasEditMode
        ? 'Financials updated. Document extraction is running in the background.'
        : 'Financials submitted. Document extraction is running in the background.';
    } else {
      successMessage = wasEditMode
        ? 'Financial data updated successfully!'
        : 'Submitted new financials!';
    }
    successAlert(successMessage, 'toast');

    backgroundUploadPromise?.catch((err) => {
      const message = err?.error || err?.message || 'Document upload failed';
      dangerAlert(`${message}. Re-open the financial to retry uploading documents.`, 'toast');
    });
  } catch (err) {
    let errorMessage = 'An error occurred while submitting financial data';
    if (err?.error) errorMessage = err.error;
    else if (err?.response?.data?.error) errorMessage = err.response.data.error;
    else if (err?.response?.data?.message) errorMessage = err.response.data.message;
    else if (err?.message) errorMessage = err.message;
    $modalState.update({ error: errorMessage });
  } finally {
    consts.$modalState.update({ isSubmitting: false });
  }
};
