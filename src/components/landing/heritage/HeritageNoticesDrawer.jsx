import { useState, useEffect } from 'react';
import { X, Download, ArrowRight, Bell } from 'lucide-react';
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

export default function HeritageNoticesDrawer() {
  const { notices: configNotices } = getSiteConfig();
  const [open, setOpen] = useState(false);
  const [notices, setNotices] = useState(configNotices || []);

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
    <>
      {/* ── Side tab ───────────────────────────────────────────────────────── */}
      <button
        onClick={() => setOpen(true)}
        className="fixed right-0 top-1/2 -translate-y-1/2 z-40 flex flex-col items-center gap-1.5
                   bg-brand-700 text-white px-2.5 py-4 rounded-l-lg shadow-elevated
                   hover:bg-brand-800 transition-colors"
        aria-label="Open notice board"
      >
        <Bell size={16} />
        <span
          className="text-[11px] font-bold uppercase tracking-widest"
          style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
        >
          Notices
        </span>
      </button>

      {/* ── Backdrop ───────────────────────────────────────────────────────── */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-[2px]"
          onClick={() => setOpen(false)}
        />
      )}

      {/* ── Drawer panel ───────────────────────────────────────────────────── */}
      <div
        className={`fixed top-0 right-0 h-full w-80 max-w-[90vw] z-50 flex flex-col bg-white shadow-elevated
                    transition-transform duration-300 ease-in-out
                    ${open ? 'translate-x-0' : 'translate-x-full'}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-brand-700 text-white flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <Bell size={18} />
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/70">Stay Informed</p>
              <h2 className="font-display font-extrabold text-base leading-tight">Notice Board</h2>
            </div>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center transition-colors"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        {/* Notice list */}
        <div className="flex-1 overflow-y-auto divide-y divide-gray-100">
          {notices.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-10">No notices at this time.</p>
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
                className="group flex items-start gap-3 px-4 py-3.5 hover:bg-brand-50 transition-colors"
              >
                {/* Date chip */}
                <div className="flex-shrink-0 w-11 h-11 rounded-md bg-brand-700 text-white flex flex-col items-center justify-center text-center">
                  <span className="text-sm font-extrabold leading-tight">{n.date?.split(' ')[0]}</span>
                  <span className="text-[9px] font-bold uppercase leading-tight">{n.date?.split(' ')[1]}</span>
                </div>
                <div className="flex-1 min-w-0 pt-0.5">
                  <span className="text-[10px] font-bold uppercase tracking-wide text-gold">{n.tag}</span>
                  <p className="text-sm text-gray-700 leading-snug mt-0.5">{n.title}</p>
                </div>
                {n.url ? (
                  <Download size={14} className="flex-shrink-0 mt-1 text-gray-300 group-hover:text-brand-600 transition-colors" />
                ) : (
                  <ArrowRight size={14} className="flex-shrink-0 mt-1 text-gray-300 group-hover:text-brand-600 transition-colors" />
                )}
              </Wrapper>
            );
          })}
        </div>

        {/* Footer — See All */}
        <div className="flex-shrink-0 border-t border-gray-100 p-4">
          <a
            href="#notices"
            onClick={() => setOpen(false)}
            className="flex items-center justify-center gap-2 w-full bg-brand-700 text-white py-2.5 rounded-md
                       font-bold text-sm uppercase tracking-wide hover:bg-brand-800 transition-colors"
          >
            See All Notices <ArrowRight size={15} />
          </a>
        </div>
      </div>
    </>
  );
}
