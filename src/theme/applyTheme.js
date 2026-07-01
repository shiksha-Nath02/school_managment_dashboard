// =============================================================================
// THEME APPLIER — sets per-school colors as CSS variables on <html>
// =============================================================================
// Tailwind's `brand-*` and `gold` tokens read these variables (see
// tailwind.config.js + index.css defaults). Setting them here on load re-paints
// the whole app in the active school's palette. Run once at startup (main.jsx).
// =============================================================================

import { getSiteConfig, getPalette } from '../config/siteConfig';

export function applyTheme() {
  if (typeof document === 'undefined') return;

  const config = getSiteConfig();
  const palette = getPalette(config);
  const root = document.documentElement;

  // brand scale (50–900)
  Object.entries(palette.brand).forEach(([shade, rgb]) => {
    root.style.setProperty(`--brand-${shade}`, rgb);
  });

  // gold accent
  if (palette.gold) {
    root.style.setProperty('--gold', palette.gold.DEFAULT);
    root.style.setProperty('--gold-light', palette.gold.light);
  }

  // surface colours (background / alt / pure white)
  if (palette.surface) {
    root.style.setProperty('--surface',     palette.surface.DEFAULT || '255 255 255');
    root.style.setProperty('--surface-alt', palette.surface.alt     || '243 241 237');
    root.style.setProperty('--surface-bg',  palette.surface.bg      || '250 250 248');
  }

  // browser tab title
  if (config.name) document.title = config.name;
}

export default applyTheme;
