import { useState, useEffect } from 'react';
import { ArrowRight, Download, Bell } from 'lucide-react';
import { getSiteConfig } from '../../../config/siteConfig';
import circularService from '../../../services/circularService';
import CountUp from '../shared/CountUp';

const fmtDate = (iso) => {
  const dt = new Date(iso);
  if (isNaN(dt)) return { d: '', m: '' };
  return {
    d: String(dt.getDate()).padStart(2, '0'),
    m: dt.toLocaleString('en-US', { month: 'short' }).toUpperCase(),
  };
};

export default function HeritageHero() {
  const site = getSiteConfig();
  const { hero, stats, notices: configNotices } = site;

  // ── Slideshow ──────────────────────────────────────────────────────────────
  const images = hero.images?.length ? hero.images : (hero.image ? [hero.image] : []);
  const [slide, setSlide] = useState(0);

  // ── Notices ────────────────────────────────────────────────────────────────
  const [notices, setNotices] = useState(configNotices || []);

  useEffect(() => {
    if (images.length <= 1) return;
    const t = setInterval(() => setSlide((i) => (i + 1) % images.length), 5000);
    return () => clearInterval(t);
  }, [images.length]);

  useEffect(() => {
    circularService.list()
      .then((r) => {
        const items = r.data?.circulars || [];
        if (items.length) {
          setNotices(items.map((c) => {
            const { d, m } = fmtDate(c.createdAt);
            return { date: `${d} ${m}`, tag: c.category || 'Notice', title: c.title, url: c.url };
          }));
        }
      })
      .catch(() => {});
  }, []);

  return (
    <section id="home" className="relative">
      {/* ── Background ─────────────────────────────────────────────────────── */}
      <div className="relative min-h-[88vh] flex items-center overflow-hidden">
        {/* Slideshow images */}
        {images.length > 0 ? (
          images.map((src, i) => (
            <img
              key={src}
              src={src}
              alt={site.name}
              className="absolute inset-0 w-full h-full object-cover transition-opacity duration-1000"
              style={{ opacity: i === slide ? 1 : 0 }}
            />
          ))
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-gray-800 via-gray-900 to-black" />
        )}

        {/* Dark overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-black/10" />

        {/* ── Content grid ─────────────────────────────────────────────────── */}
        <div className="relative z-10 w-full max-w-7xl mx-auto px-6 md:px-12 pt-32 pb-20 flex items-center gap-8">

          {/* Left — hero text */}
          <div className="flex-1 min-w-0">
            {/* Crest */}
            <div className="mb-6 animate-fade-up animate-start">
              {site.logo ? (
                <img src={site.logo} alt={site.name}
                  className="w-16 h-16 rounded-full object-cover ring-4 ring-gold/60" />
              ) : (
                <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur border-2 border-gold/60 flex items-center justify-center text-white font-display font-extrabold text-2xl">
                  {site.logoLetter}
                </div>
              )}
            </div>

            <span className="inline-block text-gold text-xs font-bold uppercase tracking-[3px] mb-4 animate-fade-up animate-start delay-100">
              Established {site.established}
            </span>

            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-extrabold leading-[1.1] tracking-tight text-white mb-4 animate-fade-up animate-start delay-200">
              {hero.heading}
            </h1>

            <div className="w-16 h-[3px] bg-gold mb-5 animate-fade-up animate-start delay-200" />

            <p className="text-base md:text-lg text-white/85 leading-relaxed mb-8 max-w-xl animate-fade-up animate-start delay-300">
              {hero.subheading}
            </p>

            <div className="flex flex-wrap gap-4 mb-8 animate-fade-up animate-start delay-400">
              <a href={hero.primaryCta.href}
                className="bg-gold text-brand-900 px-7 py-3 rounded-sm font-bold uppercase tracking-wide text-sm hover:bg-gold/90 transition-all">
                {hero.primaryCta.label}
              </a>
              <a href={hero.secondaryCta.href}
                className="border-2 border-white/60 text-white px-7 py-3 rounded-sm font-bold uppercase tracking-wide text-sm hover:bg-white/10 transition-all">
                {hero.secondaryCta.label}
              </a>
            </div>

            {/* Slide dots */}
            {images.length > 1 && (
              <div className="flex gap-2 animate-fade-up animate-start delay-400">
                {images.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setSlide(i)}
                    className={`w-2.5 h-2.5 rounded-full transition-all ${
                      i === slide ? 'bg-gold scale-125' : 'bg-white/40 hover:bg-white/60'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Right — Notice board box */}
          <div className="hidden lg:flex flex-col w-80 flex-shrink-0 bg-white rounded-xl shadow-elevated overflow-hidden">
            {/* Box header */}
            <div className="flex items-center gap-2.5 px-4 py-3 bg-brand-700">
              <Bell size={15} className="text-white/80" />
              <span className="font-display font-extrabold text-sm uppercase tracking-widest text-white">
                Notice Board
              </span>
            </div>

            {/* Notice list */}
            <div className="flex-1 divide-y divide-gray-100 max-h-72 overflow-y-auto">
              {notices.length === 0 && (
                <p className="text-xs text-gray-400 text-center py-8">No notices at this time.</p>
              )}
              {notices.map((n, i) => {
                const Wrapper = n.url ? 'a' : 'div';
                const linkProps = n.url
                  ? { href: n.url, target: '_blank', rel: 'noopener noreferrer' }
                  : {};
                return (
                  <Wrapper
                    key={i}
                    {...linkProps}
                    className="group flex items-start gap-3 px-4 py-3 hover:bg-brand-50 transition-colors"
                  >
                    {/* Date chip */}
                    <div className="flex-shrink-0 w-10 h-10 rounded-md bg-brand-700 text-white flex flex-col items-center justify-center text-center">
                      <span className="text-xs font-extrabold leading-tight">{n.date?.split(' ')[0]}</span>
                      <span className="text-[8px] font-bold uppercase leading-tight">{n.date?.split(' ')[1]}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-[9px] font-bold uppercase tracking-wide text-gold">{n.tag}</span>
                      <p className="text-xs text-gray-700 leading-snug mt-0.5 line-clamp-2">{n.title}</p>
                    </div>
                    {n.url ? (
                      <Download size={12} className="flex-shrink-0 mt-1 text-gray-300 group-hover:text-brand-600 transition-colors" />
                    ) : (
                      <ArrowRight size={12} className="flex-shrink-0 mt-1 text-gray-300 group-hover:text-brand-600 transition-colors" />
                    )}
                  </Wrapper>
                );
              })}
            </div>

            {/* See All footer */}
            <a
              href="#notices"
              className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-brand-50 border-t border-gray-100
                         text-xs font-bold uppercase tracking-wide text-brand-700 hover:bg-brand-100 transition-colors"
            >
              See All Notices <ArrowRight size={12} />
            </a>
          </div>

        </div>
      </div>

      {/* ── Stats band ────────────────────────────────────────────────────── */}
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
