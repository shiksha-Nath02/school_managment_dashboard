// =============================================================================
// CAMPUS LAYOUT — Header with tab navigation (controlled by the layout)
// =============================================================================
// Unlike the scroll-and-anchor layouts, Campus is page-per-section: each tab
// swaps the content area. This header owns the tab bar and reports selections
// up via onSelect. Includes the announcement ticker for a lively, school feel.
// =============================================================================

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { getSiteConfig } from '../../../config/siteConfig';
import Ticker from '../shared/Ticker';

export default function CampusHeader({ tabs, activeKey, onSelect }) {
  const site = getSiteConfig();
  const [open, setOpen] = useState(false);

  const tabClass = (key) =>
    `relative px-1 py-4 text-[13px] font-semibold uppercase tracking-wide transition-colors ${
      activeKey === key ? 'text-brand-700' : 'text-gray-500 hover:text-brand-600'
    }`;

  const select = (key) => {
    onSelect(key);
    setOpen(false);
  };

  return (
    <header className="sticky top-0 z-50">
      <Ticker />

      <div className="bg-white border-b border-gray-200 shadow-soft">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 md:px-12">
          {/* Crest + name */}
          <button onClick={() => select(tabs[0].key)} className="flex items-center gap-3 py-3">
            {site.logo ? (
              <img src={site.logo} alt={site.name} className="w-11 h-11 rounded-full object-cover ring-2 ring-gold/40" />
            ) : (
              <div className="w-11 h-11 rounded-full bg-brand-700 flex items-center justify-center text-white font-display font-extrabold text-lg ring-2 ring-gold/50">
                {site.logoLetter}
              </div>
            )}
            <span className="font-display font-extrabold text-base md:text-lg text-brand-800 tracking-tight text-left leading-tight">
              {site.name}
            </span>
          </button>

          {/* Desktop tabs */}
          <nav className="hidden lg:flex items-center gap-7">
            {tabs.map((t) => (
              <button key={t.key} onClick={() => select(t.key)} className={tabClass(t.key)}>
                {t.label}
                {activeKey === t.key && (
                  <span className="absolute left-0 right-0 -bottom-px h-[3px] bg-gold rounded-full" />
                )}
              </button>
            ))}
            <Link
              to="/login"
              className="bg-gold text-brand-900 px-5 py-2.5 rounded-sm text-[13px] font-bold uppercase tracking-wide hover:bg-gold/90 transition-all"
            >
              Portal Login
            </Link>
          </nav>

          {/* Mobile toggle */}
          <button className="lg:hidden text-brand-800 py-3" onClick={() => setOpen((v) => !v)} aria-label="Toggle menu">
            {open ? <X size={26} /> : <Menu size={26} />}
          </button>
        </div>

        {/* Mobile tabs */}
        {open && (
          <div className="lg:hidden bg-white border-t border-gray-100 px-6 py-3 flex flex-col">
            {tabs.map((t) => (
              <button
                key={t.key}
                onClick={() => select(t.key)}
                className={`text-left py-2.5 text-sm font-semibold uppercase tracking-wide ${
                  activeKey === t.key ? 'text-brand-700' : 'text-gray-500'
                }`}
              >
                {t.label}
              </button>
            ))}
            <Link
              to="/login"
              onClick={() => setOpen(false)}
              className="bg-gold text-brand-900 px-5 py-2.5 rounded-sm text-sm font-bold uppercase tracking-wide text-center mt-2"
            >
              Portal Login
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
