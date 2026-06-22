import { getSiteConfig } from '../../config/siteConfig';

export default function Facilities() {
  const { facilities } = getSiteConfig();

  return (
    <section id="facilities" className="py-20 px-6 md:px-12 max-w-7xl mx-auto">
      <div className="text-center mb-12 animate-fade-up animate-start">
        <h2 className="font-display text-3xl md:text-4xl font-bold tracking-tight mb-3">
          Our Facilities
        </h2>
        <p className="text-gray-500 text-lg max-w-md mx-auto">
          A safe, modern campus built for learning and growth.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {facilities.map((f, i) => (
          <div
            key={f.title}
            className="flex items-start gap-4 bg-white border border-gray-200/80 rounded-2xl p-6 hover:shadow-card transition-all animate-fade-up animate-start"
            style={{ animationDelay: `${(i + 1) * 80}ms` }}
          >
            <div className="w-12 h-12 rounded-xl bg-brand-50 flex items-center justify-center text-xl flex-shrink-0">
              {f.icon}
            </div>
            <div>
              <h3 className="font-display font-bold text-base mb-1">{f.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
