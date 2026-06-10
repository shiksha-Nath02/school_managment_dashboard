import { Link } from 'react-router-dom';
import { getSiteConfig } from '../../config/siteConfig';

export default function Footer() {
  const site = getSiteConfig();
  const { contact } = site;

  return (
    <footer className="bg-brand-700 text-white/80">
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-14 grid gap-10 md:grid-cols-3">
        {/* Brand */}
        <div>
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-9 h-9 bg-white rounded-[10px] flex items-center justify-center text-brand-600 font-bold">
              {site.logoLetter}
            </div>
            <span className="font-display font-extrabold text-lg text-white">{site.name}</span>
          </div>
          <p className="text-sm leading-relaxed text-white/60 max-w-xs">{site.tagline}</p>
        </div>

        {/* Quick links */}
        <div>
          <h4 className="font-display font-semibold text-white mb-4">Quick Links</h4>
          <ul className="space-y-2.5 text-sm">
            {site.nav.map((item) => (
              <li key={item.href}>
                <a href={item.href} className="hover:text-white transition-colors">
                  {item.label}
                </a>
              </li>
            ))}
            <li>
              <Link to="/login" className="hover:text-white transition-colors">
                Portal Login
              </Link>
            </li>
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h4 className="font-display font-semibold text-white mb-4">Contact</h4>
          <ul className="space-y-2.5 text-sm text-white/70">
            <li>{contact.address}</li>
            <li>
              <a href={`tel:${contact.phone}`} className="hover:text-white">{contact.phone}</a>
            </li>
            <li>
              <a href={`mailto:${contact.email}`} className="hover:text-white">{contact.email}</a>
            </li>
            <li>{contact.hours}</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10 py-5 px-6 text-center text-xs text-white/50">
        © {new Date().getFullYear()} {site.name}. All rights reserved.
      </div>
    </footer>
  );
}
