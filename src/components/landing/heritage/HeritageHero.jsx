// =============================================================================
// HERITAGE LAYOUT — Hero (full-bleed campus image + crest + stats band)
// =============================================================================
// Image-forward, formal hero. When `hero.image` (an S3 URL) is set it fills the
// banner behind a dark overlay; otherwise a deep brand gradient stands in.
// =============================================================================

import { getSiteConfig } from '../../../config/siteConfig';
import CountUp from '../shared/CountUp';

export default function HeritageHero() {
  const site = getSiteConfig();
  const { hero, stats } = site;

  return (
    <section id="home" className="relative">
      {/* Banner */}
      <div className="relative min-h-[88vh] flex items-center justify-center overflow-hidden">
        {/* Background image (slow Ken Burns zoom) or gradient fallback */}
        {hero.image ? (
          <img
            src={hero.image}
            alt={site.name}
            className="absolute inset-0 w-full h-full object-cover animate-ken-burns"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-brand-700 via-brand-800 to-brand-900 animate-ken-burns" />
        )}
        {/* Dark overlay for legible text */}
        <div className="absolute inset-0 bg-gradient-to-b from-brand-900/80 via-brand-900/55 to-brand-900/85" />

        {/* Content */}
        <div className="relative z-10 max-w-4xl mx-auto text-center px-6 pt-32 pb-24">
          {/* Crest */}
          <div className="flex justify-center mb-7 animate-fade-up animate-start">
            {site.logo ? (
              <img
                src={site.logo}
                alt={site.name}
                className="w-20 h-20 rounded-full object-cover ring-4 ring-gold/60"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-white/10 backdrop-blur border-2 border-gold/60 flex items-center justify-center text-white font-display font-extrabold text-3xl">
                {site.logoLetter}
              </div>
            )}
          </div>

          <span className="inline-block text-gold text-xs md:text-sm font-bold uppercase tracking-[3px] mb-5 animate-fade-up animate-start delay-100">
            Established {site.established}
          </span>

          <h1 className="font-display text-4xl md:text-6xl font-extrabold leading-[1.1] tracking-tight text-white mb-5 animate-fade-up animate-start delay-200">
            {hero.heading}
          </h1>

          {/* Gold divider */}
          <div className="w-20 h-[3px] bg-gold mx-auto mb-6 animate-fade-up animate-start delay-200" />

          <p className="text-base md:text-lg text-white/85 leading-relaxed mb-9 max-w-2xl mx-auto animate-fade-up animate-start delay-300">
            {hero.subheading}
          </p>

          <div className="flex flex-wrap gap-4 justify-center animate-fade-up animate-start delay-400">
            <a
              href={hero.primaryCta.href}
              className="bg-gold text-brand-900 px-8 py-3.5 rounded-sm font-bold uppercase tracking-wide text-sm hover:bg-gold/90 transition-all"
            >
              {hero.primaryCta.label}
            </a>
            <a
              href={hero.secondaryCta.href}
              className="border-2 border-white/60 text-white px-8 py-3.5 rounded-sm font-bold uppercase tracking-wide text-sm hover:bg-white/10 transition-all"
            >
              {hero.secondaryCta.label}
            </a>
          </div>
        </div>
      </div>

      {/* Stats band — straddles the hero edge */}
      <div className="relative z-20 max-w-6xl mx-auto px-6 md:px-12 -mt-16">
        <div className="grid grid-cols-2 md:grid-cols-4 bg-white shadow-card rounded-md overflow-hidden border border-gray-100">
          {stats.map((s, i) => (
            <div
              key={s.label}
              className={`p-7 text-center ${
                i !== stats.length - 1 ? 'md:border-r border-gray-100' : ''
              } ${i < 2 ? 'border-b md:border-b-0 border-gray-100' : ''}`}
            >
              <CountUp
                value={s.value}
                className="block font-display text-3xl md:text-4xl font-extrabold text-brand-700"
              />
              <div className="text-xs uppercase tracking-wide text-gray-400 mt-1.5 font-semibold">
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
