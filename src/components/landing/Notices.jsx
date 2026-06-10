import { Bell, ArrowRight } from 'lucide-react';
import { getSiteConfig } from '../../config/siteConfig';

export default function Notices() {
  const { notices } = getSiteConfig();

  return (
    <section id="notices" className="py-20 px-6 md:px-12 bg-surface-alt/60">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-10 animate-fade-up animate-start">
          <div className="w-11 h-11 rounded-xl bg-brand-500 text-white flex items-center justify-center">
            <Bell size={20} />
          </div>
          <div>
            <h2 className="font-display text-3xl font-bold tracking-tight">Notices & News</h2>
            <p className="text-gray-500 text-sm">Latest announcements from the school.</p>
          </div>
        </div>

        <div className="space-y-3">
          {notices.map((n, i) => (
            <div
              key={i}
              className="group flex items-center gap-5 bg-white border border-gray-200/80 rounded-2xl p-5 hover:shadow-card transition-all animate-fade-up animate-start"
              style={{ animationDelay: `${(i + 1) * 100}ms` }}
            >
              <div className="flex flex-col items-center justify-center w-16 h-16 rounded-xl bg-brand-50 text-brand-600 flex-shrink-0">
                <span className="font-display font-bold text-sm leading-tight text-center">{n.date}</span>
              </div>
              <div className="flex-1">
                <span className="inline-block text-[11px] font-semibold uppercase tracking-wide text-brand-500 bg-brand-50 px-2.5 py-0.5 rounded-full mb-1.5">
                  {n.tag}
                </span>
                <p className="text-sm text-gray-700 leading-snug">{n.title}</p>
              </div>
              <ArrowRight
                size={18}
                className="text-gray-300 group-hover:text-brand-500 group-hover:translate-x-1 transition-all flex-shrink-0"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
