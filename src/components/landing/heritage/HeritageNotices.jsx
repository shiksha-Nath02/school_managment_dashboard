// Compact notices strip — just the list + a "download circular" action per item.
// The hero already shows the scrolling notice board; this anchored section (#notices)
// is the destination of the "See All Notices" link and the nav link.
import { useState, useEffect } from 'react';
import { ArrowRight, Download } from 'lucide-react';
import { getSiteConfig } from '../../../config/siteConfig';
import circularService from '../../../services/circularService';

const fmtDate = (iso) => {
  const dt = new Date(iso);
  if (isNaN(dt)) return { d: '', m: '' };
  return {
    d: String(dt.getDate()).padStart(2, '0'),
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
            return { date: `${d} ${m}`, tag: c.category || 'Notice', title: c.title, url: c.url };
          }));
        }
      })
      .catch(() => {});
  }, []);

  return (
    <section id="notices" className="py-12 px-6 md:px-12 bg-white border-y border-gray-100">
      <div className="max-w-5xl mx-auto">
        {/* Compact heading row */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-1 h-7 bg-gold rounded-full" />
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[3px] text-gold">Stay Informed</p>
              <h2 className="font-display font-extrabold text-lg text-brand-800 leading-tight">Notice Board</h2>
            </div>
          </div>
        </div>

        {/* Compact notice list */}
        <div className="divide-y divide-gray-100 rounded-md border border-gray-100 overflow-hidden bg-surface-bg">
          {notices.map((n, i) => {
            const Wrapper = n.url ? 'a' : 'div';
            const props = n.url ? { href: n.url, target: '_blank', rel: 'noopener noreferrer' } : {};
            return (
              <Wrapper
                key={i}
                {...props}
                className="group flex items-center gap-4 px-5 py-3 hover:bg-brand-50 transition-colors"
              >
                {/* Date chip */}
                <div className="flex-shrink-0 w-12 h-12 rounded-sm bg-brand-700 text-white flex flex-col items-center justify-center text-center">
                  <span className="text-sm font-extrabold leading-tight">{n.date?.split(' ')[0]}</span>
                  <span className="text-[9px] font-bold uppercase leading-tight">{n.date?.split(' ')[1]}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] font-bold uppercase tracking-wide text-gold">{n.tag}</span>
                  <p className="text-sm text-gray-700 leading-snug truncate">{n.title}</p>
                </div>
                {n.url ? (
                  <Download size={15} className="text-gray-300 group-hover:text-brand-600 transition-colors flex-shrink-0" />
                ) : (
                  <ArrowRight size={15} className="text-gray-300 group-hover:text-brand-600 transition-colors flex-shrink-0" />
                )}
              </Wrapper>
            );
          })}
        </div>
      </div>
    </section>
  );
}
