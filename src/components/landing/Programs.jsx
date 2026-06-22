import { getSiteConfig } from '../../config/siteConfig';

export default function Programs() {
  const { programs } = getSiteConfig();

  return (
    <section id="academics" className="py-20 px-6 md:px-12 bg-surface-alt/60">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12 animate-fade-up animate-start">
          <h2 className="font-display text-3xl md:text-4xl font-bold tracking-tight mb-3">Academics</h2>
          <p className="text-gray-500 text-lg max-w-md mx-auto">
            Programmes designed for every stage of a child’s growth.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {programs.map((p, i) => (
            <div
              key={p.title}
              className="bg-white border border-gray-200/80 rounded-2xl p-7 hover:-translate-y-1 hover:shadow-card transition-all animate-fade-up animate-start"
              style={{ animationDelay: `${(i + 1) * 100}ms` }}
            >
              <div className="w-[52px] h-[52px] rounded-[14px] bg-brand-50 flex items-center justify-center text-2xl mb-5">
                {p.icon}
              </div>
              <h3 className="font-display font-bold text-base mb-1">{p.title}</h3>
              <p className="text-xs font-medium text-brand-500 mb-3">{p.age}</p>
              <p className="text-sm text-gray-500 leading-relaxed">{p.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
