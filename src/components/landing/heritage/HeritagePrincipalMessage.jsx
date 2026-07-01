import { getSiteConfig } from '../../../config/siteConfig';
import HeritageHeading from './HeritageHeading';
import { User } from 'lucide-react';

export default function HeritagePrincipalMessage() {
  const { principal } = getSiteConfig();
  if (!principal?.message) return null;

  return (
    <section className="py-24 px-6 md:px-12 bg-brand-900 relative overflow-hidden">
      {/* Decorative background pattern */}
      <div className="absolute inset-0 opacity-5 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }}
      />

      {/* Large decorative quote mark */}
      <div className="absolute top-8 left-8 text-white/5 font-display font-extrabold leading-none select-none"
        style={{ fontSize: '20rem', lineHeight: 1 }}>
        "
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        <HeritageHeading kicker="Leadership" title="Principal's Message" light />

        <div className="mt-14 grid md:grid-cols-3 gap-12 items-center">
          {/* Message — takes 2 columns */}
          <div className="md:col-span-2 animate-fade-up animate-start">
            <div className="text-gold text-5xl font-display leading-none mb-4 select-none">"</div>
            <p className="text-white/90 text-lg md:text-xl leading-relaxed font-body italic mb-8">
              {principal.message}
            </p>
            <div className="flex items-center gap-4">
              <div className="w-12 h-[2px] bg-gold" />
              <div>
                <p className="text-white font-display font-bold text-base">
                  {principal.name}
                </p>
                <p className="text-gold/80 text-xs uppercase tracking-widest mt-0.5">
                  {principal.designation}
                </p>
              </div>
            </div>
          </div>

          {/* Principal photo */}
          <div className="flex justify-center animate-fade-up animate-start delay-200">
            <div className="relative">
              {/* Outer gold ring */}
              <div className="w-52 h-52 rounded-full ring-4 ring-gold/40 ring-offset-4 ring-offset-brand-900 overflow-hidden shadow-elevated">
                {principal.photo ? (
                  <img
                    src={principal.photo}
                    alt={principal.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-brand-700 flex items-center justify-center">
                    <User size={72} className="text-white/40" />
                  </div>
                )}
              </div>
              {/* Gold accent dot */}
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-gold flex items-center justify-center">
                <span className="text-brand-900 text-xs font-bold">✦</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
