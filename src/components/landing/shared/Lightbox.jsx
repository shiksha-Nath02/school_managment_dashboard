// =============================================================================
// Lightbox — full-screen image viewer with keyboard + arrow navigation
// =============================================================================
// Controlled by the parent: pass the image list and the active index (or null
// to hide). Only renders tiles that actually have a `src`.
// =============================================================================

import { useEffect } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

export default function Lightbox({ images, index, onClose, onNav }) {
  const open = index !== null && index !== undefined;

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') onNav(1);
      if (e.key === 'ArrowLeft') onNav(-1);
    };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose, onNav]);

  if (!open) return null;
  const img = images[index];
  if (!img) return null;

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center animate-fade-in"
      onClick={onClose}
    >
      <button
        className="absolute top-5 right-5 text-white/80 hover:text-white"
        onClick={onClose}
        aria-label="Close"
      >
        <X size={30} />
      </button>

      <button
        className="absolute left-4 md:left-8 text-white/70 hover:text-white p-2"
        onClick={(e) => { e.stopPropagation(); onNav(-1); }}
        aria-label="Previous"
      >
        <ChevronLeft size={40} />
      </button>

      <figure className="max-w-5xl max-h-[85vh] px-4" onClick={(e) => e.stopPropagation()}>
        <img
          src={img.src}
          alt={img.label}
          className="max-h-[78vh] w-auto mx-auto rounded-md shadow-elevated object-contain"
        />
        {img.label && (
          <figcaption className="text-center text-white/80 text-sm mt-4">{img.label}</figcaption>
        )}
      </figure>

      <button
        className="absolute right-4 md:right-8 text-white/70 hover:text-white p-2"
        onClick={(e) => { e.stopPropagation(); onNav(1); }}
        aria-label="Next"
      >
        <ChevronRight size={40} />
      </button>
    </div>
  );
}
