// =============================================================================
// HERITAGE LAYOUT — About (framed campus image beside the school's story)
// =============================================================================

import { Check } from 'lucide-react';
import { getSiteConfig } from '../../../config/siteConfig';
import HeritageHeading from './HeritageHeading';

export default function HeritageAbout() {
  const { about } = getSiteConfig();

  return (
    <section id="about" className="py-24 px-6 md:px-12 bg-surface-bg">
      <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-14 items-center">
        {/* Framed image */}
        <div className="relative animate-fade-up animate-start">
          {/* gold corner frame accent */}
          <div className="absolute -top-4 -left-4 w-24 h-24 border-t-4 border-l-4 border-gold hidden md:block" />
          <div className="absolute -bottom-4 -right-4 w-24 h-24 border-b-4 border-r-4 border-gold hidden md:block" />
          <div className="aspect-[4/3] overflow-hidden bg-gradient-to-br from-brand-100 to-brand-50 border border-brand-100 flex items-center justify-center shadow-card">
            {about.image ? (
              <img src={about.image} alt={about.title} className="w-full h-full object-cover" />
            ) : (
              <span className="text-brand-300 text-sm font-medium">School photo here</span>
            )}
          </div>
        </div>

        {/* Text */}
        <div className="animate-fade-up animate-start delay-200">
          <HeritageHeading kicker="Who We Are" title={about.title} align="left" />
          <p className="text-lg text-brand-700 font-semibold mt-6 mb-5">{about.lead}</p>
          {about.paragraphs.map((p, i) => (
            <p key={i} className="text-gray-500 leading-relaxed mb-4">
              {p}
            </p>
          ))}
          <ul className="grid sm:grid-cols-2 gap-3 mt-7">
            {about.points.map((point) => (
              <li key={point} className="flex items-start gap-2.5 text-sm text-gray-700">
                <span className="mt-0.5 w-5 h-5 rounded-full bg-brand-700 text-white flex items-center justify-center flex-shrink-0">
                  <Check size={12} />
                </span>
                {point}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
