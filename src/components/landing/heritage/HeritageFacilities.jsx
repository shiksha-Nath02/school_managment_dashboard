// =============================================================================
// HERITAGE LAYOUT — Facilities (image tiles with caption + short description)
// =============================================================================
// Each facility shows a photo (optional `f.image` S3 URL) with an icon-badge
// fallback, so the section stays image-rich even before real photos are added.
// =============================================================================

import { getSiteConfig } from '../../../config/siteConfig';
import HeritageHeading from './HeritageHeading';

export default function HeritageFacilities() {
  const { facilities } = getSiteConfig();

  return (
    <section id="facilities" className="py-24 px-6 md:px-12 bg-surface-bg">
      <div className="max-w-7xl mx-auto">
        <HeritageHeading kicker="Campus Life" title="Our Facilities" />

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-14">
          {facilities.map((f, i) => (
            <div
              key={f.title}
              className="group bg-white border border-gray-200 rounded-md overflow-hidden hover:shadow-card transition-all animate-fade-up animate-start"
              style={{ animationDelay: `${(i + 1) * 80}ms` }}
            >
              {/* Photo / icon fallback */}
              <div className="relative aspect-[16/10] overflow-hidden bg-gradient-to-br from-brand-100 to-gold-light flex items-center justify-center">
                {f.image ? (
                  <img
                    src={f.image}
                    alt={f.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <span className="text-5xl opacity-80">{f.icon}</span>
                )}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-brand-900/80 to-transparent px-5 py-3">
                  <h3 className="font-display font-bold text-white text-base">{f.title}</h3>
                </div>
              </div>
              <p className="text-sm text-gray-500 leading-relaxed p-5">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
