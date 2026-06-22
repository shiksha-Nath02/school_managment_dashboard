// =============================================================================
// HERITAGE LAYOUT — Academics (formal programme cards with a brand header band)
// =============================================================================

import { getSiteConfig } from '../../../config/siteConfig';
import HeritageHeading from './HeritageHeading';

export default function HeritagePrograms() {
  const { programs } = getSiteConfig();

  return (
    <section id="academics" className="py-24 px-6 md:px-12 bg-surface-alt/50">
      <div className="max-w-7xl mx-auto">
        <HeritageHeading kicker="Academics" title="Programmes We Offer" />

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-14">
          {programs.map((p, i) => (
            <div
              key={p.title}
              className="bg-white border border-gray-200 rounded-md overflow-hidden hover:shadow-card hover:-translate-y-1 transition-all animate-fade-up animate-start"
              style={{ animationDelay: `${(i + 1) * 100}ms` }}
            >
              {/* Brand header band with the programme icon */}
              <div className="relative h-24 bg-gradient-to-br from-brand-700 to-brand-800 flex items-center justify-center">
                <span className="text-4xl">{p.icon}</span>
                <div className="absolute bottom-0 inset-x-0 h-1 bg-gold" />
              </div>
              <div className="p-6">
                <h3 className="font-display font-extrabold text-base text-brand-800 mb-1">{p.title}</h3>
                <p className="text-xs font-bold uppercase tracking-wide text-gold mb-3">{p.age}</p>
                <p className="text-sm text-gray-500 leading-relaxed">{p.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
