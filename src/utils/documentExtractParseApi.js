/* eslint-disable import/exports-last */
import { getVal, parseApiNumber } from './sensibleExtractPrimitives';
import { parseSingleDocResponse } from './sensibleParseApi';

/**
 * @typedef {object} GeminiExtractedField
 * @property {unknown|null} [value]
 * @property {number} [confidence]
 * @property {string|null} [evidence]
 */

/**
 * @typedef {object} GeminiExtractEnvelope
 * @property {'GEMINI'} _extractionProvider
 * @property {string} segment
 * @property {Record<string, unknown>} fields
 */

/** @typedef {Record<string, unknown>} FlatExtractDocument */

/**
 * @param {unknown} raw
 * @returns {raw is GeminiExtractEnvelope}
 */
function isGeminiEnvelope(raw) {
  if (raw == null || typeof raw !== 'object') return false;
  const envelope = /** @type {Record<string, unknown>} */ (raw);
  return envelope._extractionProvider === 'GEMINI'
    && envelope.fields != null
    && typeof envelope.fields === 'object';
}

/**
 * @param {unknown} field
 * @returns {field is GeminiExtractedField}
 */
function isGeminiExtractedField(field) {
  return field != null
    && typeof field === 'object'
    && 'value' in field;
}

/**
 * @param {unknown} field
 * @returns {unknown|undefined}
 */
function geminiFieldValue(field) {
  if (!isGeminiExtractedField(field)) return undefined;
  return field.value ?? undefined;
}

/**
 * @param {Record<string, unknown>|null|undefined} fields
 * @returns {FlatExtractDocument}
 */
function flattenGeminiFields(fields) {
  if (fields == null || typeof fields !== 'object') return {};
  return Object.fromEntries(
    Object.entries(fields).map(([key, field]) => [key, geminiFieldValue(field)]),
  );
}

/**
 * @param {unknown} extractResponse
 * @returns {FlatExtractDocument|null}
 */
export function unwrapExtractResponseDocument(extractResponse) {
  if (extractResponse == null) return null;
  const body = /** @type {Record<string, unknown>} */ (
    /** @type {{ data?: unknown }} */ (extractResponse).data ?? extractResponse
  );
  if (isGeminiEnvelope(body)) {
    return flattenGeminiFields(body.fields);
  }
  const parsed = body.parsed_document ?? body.parsedDocument;
  if (parsed != null && typeof parsed === 'object' && !Array.isArray(parsed)) {
    return /** @type {FlatExtractDocument} */ (parsed);
  }
  return null;
}

/**
 * Parse sync extract API response into guarantor form fields.
 * @param {unknown} extractResponse
 * @param {'personalFinancialStatement'|'personalTaxReturn'} docType
 * @param {object} [options]
 */
export function parseExtractApiResponse(extractResponse, docType, options) {
  const parsed = unwrapExtractResponseDocument(extractResponse);
  if (!parsed) return null;
  return parseSingleDocResponse(parsed, docType, options);
}

export { getVal, parseApiNumber };
