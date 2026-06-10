import { getSiteConfig } from '../../config/siteConfig';

export default function Hero() {
  const site = getSiteConfig();
  const { hero, stats } = site;

  // Split the heading so the highlighted word gets the accent colour
  const parts = hero.highlight
    ? hero.heading.split(hero.highlight)
    : [hero.heading];

  return (
    <section
      id="home"
      className="relative pt-36 pb-24 px-6 md:px-12 overflow-hidden bg-gradient-to-b from-brand-50/60 to-surface-bg"
    >
      {/* soft decorative blobs */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-brand-100/50 rounded-full blur-3xl" />
      <div className="absolute top-40 -left-24 w-80 h-80 bg-gold-light/60 rounded-full blur-3xl" />

      <div className="relative max-w-4xl mx-auto text-center">
        <span className="inline-block bg-white border border-brand-100 text-brand-600 text-xs font-semibold px-4 py-1.5 rounded-full mb-6 animate-fade-up animate-start shadow-soft">
          Established {site.established} · {site.tagline}
        </span>

        <h1 className="font-display text-4xl md:text-6xl font-extrabold leading-[1.1] tracking-tight text-gray-900 mb-5 animate-fade-up animate-start delay-100">
          {parts[0]}
          {hero.highlight && (
            <span className="bg-gradient-to-r from-brand-500 to-brand-400 bg-clip-text text-transparent">
              {hero.highlight}
            </span>
          )}
          {parts[1]}
        </h1>

        <p className="text-lg text-gray-500 leading-relaxed mb-9 max-w-xl mx-auto animate-fade-up animate-start delay-200">
          {hero.subheading}
        </p>

        <div className="flex flex-wrap gap-3.5 justify-center animate-fade-up animate-start delay-300">
          <a
            href={hero.primaryCta.href}
            className="bg-brand-500 text-white px-8 py-3.5 rounded-full font-semibold hover:shadow-card hover:bg-brand-600 transition-all hover:-translate-y-0.5"
          >
            {hero.primaryCta.label}
          </a>
          <a
            href={hero.secondaryCta.href}
            className="bg-white border-2 border-gray-200 text-gray-900 px-8 py-3.5 rounded-full font-semibold hover:border-brand-300 transition-all"
          >
            {hero.secondaryCta.label}
          </a>
        </div>
      </div>

      {/* Stats strip */}
      <div className="relative max-w-4xl mx-auto mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 animate-fade-up animate-start delay-400">
        {stats.map((s) => (
          <div
            key={s.label}
            className="bg-white rounded-2xl p-6 text-center shadow-soft border border-gray-100"
          >
            <div className="font-display text-3xl font-extrabold text-brand-500">{s.value}</div>
            <div className="text-sm text-gray-400 mt-1">{s.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
