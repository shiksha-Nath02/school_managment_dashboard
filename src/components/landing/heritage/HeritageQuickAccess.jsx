import { Link } from 'react-router-dom';
import { getSiteConfig } from '../../../config/siteConfig';
import HeritageHeading from './HeritageHeading';

// Returns true if the hex color is light enough to need dark text/icons.
function isLight(hex) {
  if (!hex || hex.length < 7) return false;
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return 0.299 * r + 0.587 * g + 0.114 * b > 150;
}

export default function HeritageQuickAccess() {
  const { quickAccess } = getSiteConfig();
  if (!quickAccess || quickAccess.length === 0) return null;

  return (
    <section className="py-20 px-6 md:px-12 bg-surface-alt">
      <div className="max-w-7xl mx-auto">
        <HeritageHeading kicker="Quick Links" title="Explore Our School" />

        <div className="mt-12 flex flex-wrap justify-center gap-4">
          {quickAccess.map((item, i) => {
            const light = isLight(item.color);
            const textCls   = light ? 'text-gray-800'    : 'text-white';
            const circleCls = light ? 'bg-black/10 group-hover:bg-black/15' : 'bg-white/20 group-hover:bg-white/30';

            const inner = (
              <div
                className={`group flex flex-col items-center justify-center gap-3 w-40 h-40 rounded-xl shadow-card cursor-pointer transition-all duration-300 hover:-translate-y-2 hover:shadow-elevated animate-fade-up animate-start`}
                style={{
                  backgroundColor: item.color,
                  animationDelay: `${i * 80}ms`,
                }}
              >
                <div className={`w-14 h-14 rounded-full flex items-center justify-center text-3xl transition-colors ${circleCls}`}>
                  {item.icon}
                </div>
                <span className={`font-bold text-sm text-center leading-tight px-2 ${textCls}`}>
                  {item.label}
                </span>
              </div>
            );

            const isInternal = item.href && item.href.startsWith('/');
            return isInternal ? (
              <Link key={i} to={item.href} className="no-underline">
                {inner}
              </Link>
            ) : (
              <a key={i} href={item.href || '#'} className="no-underline">
                {inner}
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
}
