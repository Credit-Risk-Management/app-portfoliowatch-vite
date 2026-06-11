/**
 * Maps an organization display name to a stable Sensible configuration name prefix segment.
 * Keep in sync with api-portfoliowatch-express `src/utils/sensibleOrganizationConfig.ts`.
 * Example: "Sabre Finance" → `sabre_finance`
 */
const MAX_SLUG_LEN = 64;

export function organizationNameToSensibleSlug(name) {
  if (name == null || String(name).trim() === '') return '';
  const ascii = String(name)
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .toLowerCase();
  return ascii.slice(0, MAX_SLUG_LEN);
}

/** Tenant-specific Sensible `configurationName`: `{slug}_{segment}` or legacy bare `segment`. */
export function sensibleConfigurationNameForSegment(organizationName, segment) {
  const slug = organizationNameToSensibleSlug(organizationName);
  return slug ? `${slug}_${segment}` : segment;
}
