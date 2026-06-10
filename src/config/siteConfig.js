// =============================================================================
// SCHOOL REGISTRY — hostname → that school's config
// =============================================================================
// The ONE switch that decides everything visual is window.location.hostname.
// To onboard a school: create src/schools/<hostname>/config.js, import it here,
// and add one line to SCHOOLS. No component changes, no build-logic changes.
//
// (Later, getSiteConfig() can be swapped to fetch from /api so schools self-edit
//  their content from their own database — components won't need to change.)
// =============================================================================

import DEFAULT from '../schools/_default/config';
import santrld from '../schools/santrldpublicschool.com/config';
import { PALETTES } from '../schools/_palettes';

const SCHOOLS = {
  'santrldpublicschool.com': santrld,
};

// Resolve the active school's config from the current hostname.
export function getSiteConfig() {
  if (typeof window === 'undefined') return DEFAULT;
  const host = window.location.hostname.replace(/^www\./, '');
  return SCHOOLS[host] || DEFAULT;
}

// Resolve a config's palette: a name from _palettes.js, or an inline palette object.
export function getPalette(config = getSiteConfig()) {
  const p = config && config.palette;
  if (p && typeof p === 'object') return p; // inline custom palette
  return PALETTES[p] || PALETTES.green;
}

export { SCHOOLS };
export default DEFAULT;
