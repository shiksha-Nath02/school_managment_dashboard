import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { getSiteConfig } from '../../config/siteConfig';

export default function Navbar() {
  const site = getSiteConfig();
  const [open, setOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-surface-bg/85 backdrop-blur-xl border-b border-gray-200/60 animate-fade-in">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 md:px-12 py-4">
        {/* Brand */}
        <a href="#home" className="flex items-center gap-2.5 no-underline">
          <div className="w-9 h-9 bg-brand-500 rounded-[10px] flex items-center justify-center text-white font-bold">
            {site.logoLetter}
          </div>
          <span className="font-display font-extrabold text-lg md:text-xl text-gray-900 tracking-tight">
            {site.name}
          </span>
        </a>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-8">
          {site.nav.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-gray-500 hover:text-brand-500 transition-colors"
            >
              {item.label}
            </a>
          ))}
          <Link
            to="/login"
            className="bg-brand-500 text-white px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-brand-600 transition-all hover:-translate-y-0.5"
          >
            Portal Login →
          </Link>
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden text-gray-700"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-surface-bg border-t border-gray-200/60 px-6 py-4 flex flex-col gap-4">
          {site.nav.map((item) => (
            <a
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="text-sm font-medium text-gray-600 hover:text-brand-500"
            >
              {item.label}
            </a>
          ))}
          <Link
            to="/login"
            onClick={() => setOpen(false)}
            className="bg-brand-500 text-white px-6 py-2.5 rounded-full text-sm font-semibold text-center"
          >
            Portal Login →
          </Link>
        </div>
      )}
    </nav>
  );
}
