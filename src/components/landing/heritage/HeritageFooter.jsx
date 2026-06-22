// =============================================================================
// HERITAGE LAYOUT — Footer (deep brand, crest + quick links + contact)
// =============================================================================

import { Link } from 'react-router-dom';
import { getSiteConfig } from '../../../config/siteConfig';

export default function HeritageFooter() {
  const site = getSiteConfig();
  const { contact } = site;

  return (
    <footer className="bg-brand-900 text-white/75">
      {/* gold rule on top */}
      <div className="h-1 bg-gold" />

      <div className="max-w-7xl mx-auto px-6 md:px-12 py-16 grid gap-10 md:grid-cols-3">
        {/* Brand */}
        <div>
          <div className="flex items-center gap-3 mb-4">
            {site.logo ? (
              <img src={site.logo} alt={site.name} className="w-12 h-12 rounded-full object-cover ring-2 ring-gold/40" />
            ) : (
              <div className="w-12 h-12 rounded-full bg-white/10 border border-gold/50 flex items-center justify-center text-white font-display font-extrabold text-lg">
                {site.logoLetter}
              </div>
            )}
            <span className="font-display font-extrabold text-lg text-white">{site.name}</span>
          </div>
          <p className="text-sm leading-relaxed text-white/55 max-w-xs">{site.tagline}</p>
          <p className="text-xs text-white/40 mt-3">Established {site.established}</p>
        </div>

        {/* Quick links */}
        <div>
          <h4 className="font-display font-semibold text-white mb-4 uppercase tracking-wide text-sm">Quick Links</h4>
          <ul className="space-y-2.5 text-sm">
            {site.nav.map((item) => (
              <li key={item.href}>
                <a href={item.href} className="hover:text-gold transition-colors">
                  {item.label}
                </a>
              </li>
            ))}
            <li>
              <Link to="/login" className="hover:text-gold transition-colors">
                Portal Login
              </Link>
            </li>
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h4 className="font-display font-semibold text-white mb-4 uppercase tracking-wide text-sm">Contact</h4>
          <ul className="space-y-2.5 text-sm text-white/65">
            <li>{contact.address}</li>
            <li>
              <a href={`tel:${contact.phone}`} className="hover:text-gold">{contact.phone}</a>
            </li>
            <li>
              <a href={`mailto:${contact.email}`} className="hover:text-gold">{contact.email}</a>
            </li>
            <li>{contact.hours}</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10 py-5 px-6 text-center text-xs text-white/45">
        © {new Date().getFullYear()} {site.name}. All rights reserved.
      </div>
    </footer>
  );
}
