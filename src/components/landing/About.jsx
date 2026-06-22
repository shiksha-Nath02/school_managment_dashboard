import { Check } from 'lucide-react';
import { getSiteConfig } from '../../config/siteConfig';

export default function About() {
  const { about } = getSiteConfig();

  return (
    <section id="about" className="py-20 px-6 md:px-12 max-w-7xl mx-auto">
      <div className="grid md:grid-cols-2 gap-12 items-center">
        {/* Image placeholder */}
        <div className="animate-fade-up animate-start">
          <div className="aspect-[4/3] rounded-2xl bg-gradient-to-br from-brand-100 to-brand-50 border border-brand-100 flex items-center justify-center shadow-soft">
            <span className="text-brand-300 text-sm font-medium">School photo here</span>
          </div>
        </div>

        {/* Text */}
        <div className="animate-fade-up animate-start delay-200">
          <h2 className="font-display text-3xl md:text-4xl font-bold tracking-tight mb-3">
            {about.title}
          </h2>
          <p className="text-lg text-brand-600 font-medium mb-5">{about.lead}</p>
          {about.paragraphs.map((p, i) => (
            <p key={i} className="text-gray-500 leading-relaxed mb-4">
              {p}
            </p>
          ))}
          <ul className="grid sm:grid-cols-2 gap-3 mt-6">
            {about.points.map((point) => (
              <li key={point} className="flex items-start gap-2.5 text-sm text-gray-700">
                <span className="mt-0.5 w-5 h-5 rounded-full bg-brand-50 text-brand-500 flex items-center justify-center flex-shrink-0">
                  <Check size={13} />
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
