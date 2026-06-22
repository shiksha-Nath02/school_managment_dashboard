// =============================================================================
// useScrollReveal — turn on-load fade animations into scroll-triggered ones
// =============================================================================
// The landing sections already mark animated elements with `.animate-start`
// (opacity:0) + an `animate-fade-*` class that runs on mount. This hook pauses
// those animations and only plays each element as it scrolls into view — giving
// the page a lively, progressive-reveal feel without editing every section.
//
// Pass deps (e.g. the active tab) to re-arm reveals when the DOM swaps.
// =============================================================================

import { useEffect } from 'react';

export function useScrollReveal(deps = []) {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const els = Array.from(document.querySelectorAll('.animate-start'));
    if (!els.length) return;

    // No IntersectionObserver (very old browser) → leave the on-load animation.
    if (!('IntersectionObserver' in window)) return;

    // Pause each animation at its first frame (kept hidden) until revealed.
    els.forEach((el) => {
      el.style.animationPlayState = 'paused';
    });

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.style.animationPlayState = 'running';
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );

    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

export default useScrollReveal;
