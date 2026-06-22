// =============================================================================
// DEV-ONLY UI SWITCHER — try every layout × colour combination on a school
// =============================================================================
// Renders ONLY on localhost (the live site never shows it). It drives the same
// `?layout=` / `?palette=` preview overrides that getSiteConfig() reads, so the
// "real" config dials and this panel select from the exact same options.
//
// Selecting an option updates the URL and reloads — the cleanest way to re-run
// the startup theme paint (applyTheme) and re-render the chosen layout.
// =============================================================================

import { useState } from 'react';
import { Palette, X, Check } from 'lucide-react';
import { getSiteConfig } from '../../config/siteConfig';

const LAYOUTS = [
  { key: 'classic', label: 'Classic', hint: 'Soft · single-scroll' },
  { key: 'heritage', label: 'Heritage', hint: 'Formal · animated' },
  { key: 'campus', label: 'Campus', hint: 'Tabbed · page-per-section' },
];

const PALETTES = [
  { key: 'green', label: 'Forest + Gold', dot: 'rgb(45 90 39)' },
  { key: 'blue', label: 'Royal Blue + Amber', dot: 'rgb(37 99 235)' },
  { key: 'maroon', label: 'Maroon + Gold', dot: 'rgb(140 29 43)' },
];

export default function UiSwitcher() {
  const host = typeof window !== 'undefined' ? window.location.hostname : '';
  const isLocal = host === 'localhost' || host === '127.0.0.1';
  const [open, setOpen] = useState(false);

  if (!isLocal) return null;

  // getSiteConfig() already folds in any ?layout=/?palette= override, so these
  // reflect what's actually on screen right now.
  const cfg = getSiteConfig();
  const curLayout = cfg.layout;
  const curPalette = typeof cfg.palette === 'string' ? cfg.palette : '';

  const apply = (key, val) => {
    const params = new URLSearchParams(window.location.search);
    params.set(key, val);
    window.location.search = params.toString(); // reload with the new selection
  };

  const Row = ({ active, onClick, children }) => (
    <button
      onClick={onClick}
      className={`w-full flex items-center justify-between gap-3 px-3 py-2 rounded-lg text-sm text-left transition-colors ${
        active ? 'bg-gray-900 text-white' : 'text-gray-700 hover:bg-gray-100'
      }`}
    >
      {children}
      {active && <Check size={15} className="flex-shrink-0" />}
    </button>
  );

  return (
    <div className="fixed bottom-5 right-5 z-[200] font-body">
      {open ? (
        <div className="w-72 bg-white rounded-2xl shadow-elevated border border-gray-200 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 bg-gray-900 text-white">
            <span className="text-sm font-semibold flex items-center gap-2">
              <Palette size={16} /> Preview UI
            </span>
            <button onClick={() => setOpen(false)} aria-label="Close">
              <X size={18} />
            </button>
          </div>

          <div className="p-3">
            <p className="text-[11px] font-bold uppercase tracking-wide text-gray-400 px-1 mb-1.5">Layout</p>
            <div className="space-y-0.5 mb-3">
              {LAYOUTS.map((l) => (
                <Row key={l.key} active={curLayout === l.key} onClick={() => apply('layout', l.key)}>
                  <span>
                    <span className="font-medium">{l.label}</span>
                    <span className={`block text-[11px] ${curLayout === l.key ? 'text-white/60' : 'text-gray-400'}`}>
                      {l.hint}
                    </span>
                  </span>
                </Row>
              ))}
            </div>

            <p className="text-[11px] font-bold uppercase tracking-wide text-gray-400 px-1 mb-1.5">Colour</p>
            <div className="space-y-0.5">
              {PALETTES.map((p) => (
                <Row key={p.key} active={curPalette === p.key} onClick={() => apply('palette', p.key)}>
                  <span className="flex items-center gap-2.5">
                    <span className="w-4 h-4 rounded-full border border-black/10" style={{ background: p.dot }} />
                    {p.label}
                  </span>
                </Row>
              ))}
            </div>
          </div>

          <p className="px-4 py-2.5 text-[10px] text-gray-400 border-t border-gray-100 bg-gray-50">
            Localhost preview only · not shown on the live site
          </p>
        </div>
      ) : (
        <button
          onClick={() => setOpen(true)}
          className="flex items-center gap-2 bg-gray-900 text-white px-4 py-3 rounded-full shadow-elevated hover:bg-gray-800 transition-colors text-sm font-semibold"
        >
          <Palette size={16} /> Preview UI
        </button>
      )}
    </div>
  );
}
