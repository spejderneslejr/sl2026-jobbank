/**
 * Organization name overrides
 *
 * This file allows you to override organization names for specific organization IDs.
 * Useful for adding context like "(underlejr)" for subcamps.
 *
 * Format:
 * {
 *   'organization_id': 'New Name',
 *   '5532': 'GRAS (underlejr)'
 * }
 */

export const ORG_NAME_OVERRIDES = {
  // Subcamps (underlejre)
  'Havet': 'Havet (underlejr)',
  'Skoven': 'Skoven (underlejr)',
  'Byen': 'Byen (underlejr)',
  'Landet': 'Landet (underlejr)',
}

/**
 * Apply organization name overrides
 * @param {string} orgName - Original organization name
 * @returns {string} - Overridden name if exists, otherwise original name
 */
export function applyOrgNameOverride(orgName) {
  if (!orgName) return orgName

  // Check if there's a direct override for this name
  if (ORG_NAME_OVERRIDES[orgName]) {
    return ORG_NAME_OVERRIDES[orgName]
  }

  return orgName
}
