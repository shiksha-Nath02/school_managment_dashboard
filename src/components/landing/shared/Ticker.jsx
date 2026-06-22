// =============================================================================
// Ticker — a slim scrolling announcement bar (the classic "school news" strip)
// =============================================================================
// Reads `announcements` from config; if absent, falls back to the notice titles.
// The track is duplicated so the marquee loops seamlessly. Pauses on hover.
// =============================================================================

import { Megaphone } from 'lucide-react';
import { getSiteConfig } from '../../../config/siteConfig';

export default function Ticker() {
  const site = getSiteConfig();
  const items =
    (site.announcements && site.announcements.length
      ? site.announcements
      : (site.notices || []).map((n) => n.title)) || [];

  if (!items.length) return null;

  // Duplicate the list so the loop has no visible seam.
  const track = [...items, ...items];

  return (
    <div className="bg-brand-900 text-white/90 overflow-hidden">
      <div className="max-w-7xl mx-auto flex items-center">
        <span className="hidden sm:flex items-center gap-1.5 bg-gold text-brand-900 text-[11px] font-bold uppercase tracking-wide px-3 py-1.5 flex-shrink-0">
          <Megaphone size={13} /> News
        </span>
        <div className="relative flex-1 overflow-hidden">
          <div className="flex whitespace-nowrap animate-marquee hover:[animation-play-state:paused] py-1.5">
            {track.map((text, i) => (
              <span key={i} className="flex items-center text-xs font-medium px-6">
                <span className="w-1.5 h-1.5 rounded-full bg-gold mr-3 flex-shrink-0" />
                {text}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
