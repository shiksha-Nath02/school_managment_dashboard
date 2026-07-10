import { useState, useEffect } from 'react';
import api from '../../../services/api';

// Below this many birthdays we show a static, centered row (no marquee) so a
// single celebrant isn't duplicated. At/above it we scroll a seamless marquee,
// which needs the list doubled to loop without a visible gap.
const MARQUEE_THRESHOLD = 5;

export default function HeritageBirthdayTicker() {
  const [people, setPeople] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/public/birthdays')
      .then((r) => {
        const d = r.data;
        const all = [
          ...(d.students || []).map((s) => ({ name: s.name, sub: s.className, type: 'student' })),
          ...(d.teachers || []).map((t) => ({ name: t.name, sub: t.subject, type: 'teacher' })),
        ];
        setPeople(all);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading || people.length === 0) return null;

  const card = (p, i) => (
    <div
      key={i}
      className="flex-shrink-0 w-44 bg-white border border-brand-100 rounded-xl shadow-soft p-4 flex flex-col items-center text-center"
    >
      {/* Birthday card header */}
      <div className="w-full rounded-lg bg-brand-700 py-2 mb-3 flex items-center justify-center">
        <span className="text-2xl">🎂</span>
      </div>
      <p className="font-display font-bold text-brand-800 text-sm leading-tight">{p.name}</p>
      {p.sub && <p className="text-xs text-gray-400 mt-1">{p.sub}</p>}
      <span
        className={`mt-2 text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full ${
          p.type === 'teacher' ? 'bg-gold/20 text-brand-700' : 'bg-brand-100 text-brand-700'
        }`}
      >
        {p.type === 'teacher' ? 'Teacher' : 'Student'}
      </span>
    </div>
  );

  const useMarquee = people.length >= MARQUEE_THRESHOLD;

  return (
    <section className="py-14 px-6 md:px-12 bg-brand-50 border-y border-brand-100 overflow-hidden">
      <div className="max-w-7xl mx-auto mb-8 text-center animate-fade-up animate-start">
        <span className="text-gold text-xs font-bold uppercase tracking-[3px]">Today's Celebrations</span>
        <h2 className="font-display text-2xl font-extrabold text-brand-800 mt-1">
          🎂 Birthday Wishes
        </h2>
        <div className="w-12 h-[3px] bg-gold mx-auto mt-3" />
      </div>

      {useMarquee ? (
        // Seamless infinite marquee — list doubled so it loops without a gap.
        <div className="relative overflow-hidden">
          <div className="flex gap-4 animate-marquee w-max hover:[animation-play-state:paused]">
            {[...people, ...people].map((p, i) => card(p, i))}
          </div>
        </div>
      ) : (
        // Few celebrants — show each once, centered, no scrolling.
        <div className="flex flex-wrap justify-center gap-4">
          {people.map((p, i) => card(p, i))}
        </div>
      )}
    </section>
  );
}
