// =============================================================================
// CountUp — animates a stat from 0 to its value when it scrolls into view
// =============================================================================
// Accepts strings like "1200+", "98%", "20+" — it counts the numeric part and
// keeps any prefix/suffix (e.g. "+", "%"). Falls back to the raw value if it
// can't find a number.
// =============================================================================

import { useEffect, useRef, useState } from 'react';

export default function CountUp({ value, duration = 1400, className = '' }) {
  const ref = useRef(null);
  const [display, setDisplay] = useState(value);

  useEffect(() => {
    const raw = String(value);
    const match = raw.match(/([^\d]*)(\d[\d,]*)(.*)/);
    if (!match || typeof window === 'undefined') {
      setDisplay(raw);
      return;
    }

    const [, prefix, numStr, suffix] = match;
    const target = parseInt(numStr.replace(/,/g, ''), 10);
    const node = ref.current;
    if (!node || !('IntersectionObserver' in window)) {
      setDisplay(raw);
      return;
    }

    setDisplay(`${prefix}0${suffix}`);
    let rafId;
    let started = false;

    const run = (startTime) => {
      const step = (now) => {
        const progress = Math.min((now - startTime) / duration, 1);
        // easeOutCubic for a snappy finish
        const eased = 1 - Math.pow(1 - progress, 3);
        const current = Math.round(target * eased);
        setDisplay(`${prefix}${current.toLocaleString()}${suffix}`);
        if (progress < 1) rafId = requestAnimationFrame(step);
      };
      rafId = requestAnimationFrame(step);
    };

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !started) {
            started = true;
            run(performance.now());
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.4 }
    );

    io.observe(node);
    return () => {
      io.disconnect();
      cancelAnimationFrame(rafId);
    };
  }, [value, duration]);

  return (
    <span ref={ref} className={className}>
      {display}
    </span>
  );
}
