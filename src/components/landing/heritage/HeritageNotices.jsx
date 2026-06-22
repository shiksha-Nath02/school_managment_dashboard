// =============================================================================
// HERITAGE LAYOUT — Notices (a formal "notice board" list)
// =============================================================================
// Pulls live circulars from circularService; falls back to config notices.
// =============================================================================

import { useState, useEffect } from 'react';
import { ArrowRight } from 'lucide-react';
import { getSiteConfig } from '../../../config/siteConfig';
import circularService from '../../../services/circularService';
import HeritageHeading from './HeritageHeading';

// "2026-06-16T..." -> { d: "16", m: "JUN" } for the date chip.
const fmtDate = (iso) => {
  const dt = new Date(iso);
  if (isNaN(dt)) return { d: '', m: '' };
  return {
    d: String(dt.getDate()),
    m: dt.toLocaleString('en-US', { month: 'short' }).toUpperCase(),
  };
};

export default function HeritageNotices() {
  const { notices: configNotices } = getSiteConfig();
  const [notices, setNotices] = useState(configNotices);

  useEffect(() => {
    circularService.list()
      .then((r) => {
        const items = r.data.circulars || [];
        if (items.length) {
          setNotices(items.map((c) => {
            const { d, m } = fmtDate(c.createdAt);
            return { date: `${d}\n${m}`, tag: c.category || 'Notice', title: c.title, url: c.url };
          }));
        }
      })
      .catch(() => {}); // keep config notices on failure
  }, []);

  return (
    <section id="notices" className="py-24 px-6 md:px-12 bg-surface-alt/50">
      <div className="max-w-4xl mx-auto">
        <HeritageHeading kicker="Stay Informed" title="Notice Board" />

        <div className="mt-12 bg-white border border-gray-200 rounded-md shadow-soft divide-y divide-gray-100 overflow-hidden">
          {notices.map((n, i) => {
            const Wrapper = n.url ? 'a' : 'div';
            const wrapperProps = n.url
              ? { href: n.url, target: '_blank', rel: 'noopener noreferrer' }
              : {};
            return (
              <Wrapper
                key={i}
                {...wrapperProps}
                className="group flex items-center gap-5 p-5 hover:bg-surface-bg transition-colors animate-fade-up animate-start"
                style={{ animationDelay: `${(i + 1) * 90}ms` }}
              >
                <div className="flex flex-col items-center justify-center w-16 h-16 rounded-sm bg-brand-700 text-white flex-shrink-0">
                  <span className="font-display font-bold text-sm leading-tight text-center whitespace-pre-line">
                    {n.date}
                  </span>
                </div>
                <div className="flex-1">
                  <span className="inline-block text-[11px] font-bold uppercase tracking-wide text-gold mb-1">
                    {n.tag}
                  </span>
                  <p className="text-sm text-gray-700 leading-snug">{n.title}</p>
                </div>
                <ArrowRight
                  size={18}
                  className="text-gray-300 group-hover:text-brand-600 group-hover:translate-x-1 transition-all flex-shrink-0"
                />
              </Wrapper>
            );
          })}
        </div>
      </div>
    </section>
  );
}
