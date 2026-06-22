// =============================================================================
// HERITAGE LAYOUT — Header (utility bar + sticky main nav)
// =============================================================================
// A formal, institutional header: a thin brand-coloured utility strip with
// contact details, and a white sticky navigation bar with a crest-style logo.
// Reads everything from getSiteConfig() so it stays content-agnostic.
// =============================================================================

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, Phone, Mail, Clock } from 'lucide-react';
import { getSiteConfig } from '../../../config/siteConfig';
import Ticker from '../shared/Ticker';

export default function HeritageHeader() {
  const site = getSiteConfig();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      {/* Announcement ticker */}
      <Ticker />

      {/* Utility strip */}
      <div className="hidden md:block bg-brand-800 text-white/80 text-xs">
        <div className="max-w-7xl mx-auto px-6 md:px-12 h-9 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <a href={`tel:${site.contact.phone}`} className="flex items-center gap-1.5 hover:text-white transition-colors">
              <Phone size={13} /> {site.contact.phone}
            </a>
            <a href={`mailto:${site.contact.email}`} className="flex items-center gap-1.5 hover:text-white transition-colors">
              <Mail size={13} /> {site.contact.email}
            </a>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock size={13} /> {site.contact.hours}
          </div>
        </div>
      </div>

      {/* Main nav */}
      <nav
        className={`bg-white border-b transition-all duration-300 ${
          scrolled ? 'border-gray-200 shadow-soft' : 'border-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 md:px-12 py-3">
          {/* Crest + name */}
          <a href="#home" className="flex items-center gap-3 no-underline">
            {site.logo ? (
              <img
                src={site.logo}
                alt={site.name}
                className="w-12 h-12 rounded-full object-cover ring-2 ring-gold/40"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-brand-700 flex items-center justify-center text-white font-display font-extrabold text-xl ring-2 ring-gold/50">
                {site.logoLetter}
              </div>
            )}
            <div className="leading-tight">
              <span className="block font-display font-extrabold text-base md:text-lg text-brand-800 tracking-tight">
                {site.name}
              </span>
              <span className="block text-[10px] md:text-[11px] uppercase tracking-[2px] text-gold font-semibold">
                {site.tagline}
              </span>
            </div>
          </a>

          {/* Desktop links */}
          <div className="hidden lg:flex items-center gap-7">
            {site.nav.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="text-[13px] font-semibold uppercase tracking-wide text-gray-600 hover:text-brand-600 transition-colors"
              >
                {item.label}
              </a>
            ))}
            <Link
              to="/login"
              className="bg-gold text-brand-900 px-5 py-2.5 rounded-sm text-[13px] font-bold uppercase tracking-wide hover:bg-gold/90 transition-all"
            >
              Portal Login
            </Link>
          </div>

          {/* Mobile toggle */}
          <button
            className="lg:hidden text-brand-800"
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {open ? <X size={26} /> : <Menu size={26} />}
          </button>
        </div>

        {/* Mobile menu */}
        {open && (
          <div className="lg:hidden bg-white border-t border-gray-100 px-6 py-4 flex flex-col gap-3">
            {site.nav.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="text-sm font-semibold uppercase tracking-wide text-gray-600 hover:text-brand-600"
              >
                {item.label}
              </a>
            ))}
            <Link
              to="/login"
              onClick={() => setOpen(false)}
              className="bg-gold text-brand-900 px-5 py-2.5 rounded-sm text-sm font-bold uppercase tracking-wide text-center mt-1"
            >
              Portal Login
            </Link>
          </div>
        )}
      </nav>
    </header>
  );
}
