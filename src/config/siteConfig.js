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
import idealradiant from '../schools/idealradiantpublicschool.com/config';
import { PALETTES } from '../schools/_palettes';

const SCHOOLS = {
  'santrldpublicschool.com': santrld,
  'idealradiantpublicschool.com': idealradiant,
};

// Resolve the active school's config from the current hostname.
//
// Dev preview (localhost only — real domains ignore all of this):
//   ?site=<hostname>   selects a school and is remembered (localStorage), so you
//                      can preview any school without DNS.
//   ?layout=<key>      override the layout (classic | heritage | campus)
//   ?palette=<name>    override the colour combination (green | blue | maroon)
// e.g.  http://localhost:5173/?site=santrldpublicschool.com&layout=campus&palette=maroon
// Layout/palette overrides let you compare every template × colour combination
// live (reload after changing the URL — the theme is painted once at startup).
export function getSiteConfig() {
  if (typeof window === 'undefined') return DEFAULT;

  let host = window.location.hostname.replace(/^www\./, '');
  const isLocal = host === 'localhost' || host === '127.0.0.1';

  if (!isLocal) return SCHOOLS[host] || DEFAULT;

  // --- localhost preview overrides ---
  let layout, palette;
  try {
    const params = new URLSearchParams(window.location.search);
    const site = params.get('site');
    if (site) localStorage.setItem('previewSite', site);
    const preview = site || localStorage.getItem('previewSite');
    if (preview) host = preview.replace(/^www\./, '');
    layout = params.get('layout');
    palette = params.get('palette');
  } catch {
    /* localStorage/URL unavailable — fall back to the real hostname */
  }

  const base = SCHOOLS[host] || DEFAULT;
  if (!layout && !palette) return base;
  return { ...base, ...(layout && { layout }), ...(palette && { palette }) };
}

// Resolve a config's palette: a name from _palettes.js, or an inline palette object.
export function getPalette(config = getSiteConfig()) {
  const p = config && config.palette;
  if (p && typeof p === 'object') return p; // inline custom palette
  return PALETTES[p] || PALETTES.green;
}

export { SCHOOLS };
export default DEFAULT;
