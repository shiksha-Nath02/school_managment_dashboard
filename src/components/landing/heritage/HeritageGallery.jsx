// =============================================================================
// HERITAGE LAYOUT — Gallery (image grid on a deep brand band)
// =============================================================================
// Pulls live images from galleryService; falls back to the config placeholders
// (labelled tiles) until photos are uploaded. The first tile spans larger to
// give the grid a more editorial, magazine-like feel.
// =============================================================================

import { useState, useEffect } from 'react';
import { Image as ImageIcon } from 'lucide-react';
import { getSiteConfig } from '../../../config/siteConfig';
import galleryService from '../../../services/galleryService';
import Lightbox from '../shared/Lightbox';

export default function HeritageGallery() {
  const { gallery: configGallery } = getSiteConfig();
  const [items, setItems] = useState(configGallery);
  const [lightbox, setLightbox] = useState(null); // index into `withSrc` or null

  useEffect(() => {
    galleryService.list()
      .then((r) => {
        const imgs = r.data.images || [];
        if (imgs.length) {
          setItems(imgs.map((g) => ({ src: g.url, label: g.caption || g.category })));
        }
      })
      .catch(() => {}); // keep config placeholders on failure
  }, []);

  // Only real photos are clickable / shown in the lightbox.
  const withSrc = items.filter((g) => g.src);
  const openLightbox = (item) => {
    const idx = withSrc.findIndex((g) => g === item);
    if (idx !== -1) setLightbox(idx);
  };
  const navLightbox = (dir) =>
    setLightbox((i) => (i + dir + withSrc.length) % withSrc.length);

  return (
    <section id="gallery" className="py-24 px-6 md:px-12 bg-brand-800">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-14 animate-fade-up animate-start">
          <span className="block text-gold text-xs font-bold uppercase tracking-[3px] mb-2">
            Moments
          </span>
          <h2 className="font-display text-3xl md:text-4xl font-extrabold tracking-tight text-white">
            Life at Our School
          </h2>
          <div className="w-16 h-[3px] bg-gold mt-4 mx-auto" />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {items.map((g, i) => (
            <div
              key={i}
              onClick={() => openLightbox(g)}
              className={`group relative overflow-hidden rounded-md bg-gradient-to-br from-brand-600 to-brand-700 flex items-center justify-center animate-fade-up animate-start ${
                g.src ? 'cursor-pointer' : ''
              } ${
                i === 0 ? 'col-span-2 row-span-2 aspect-square md:aspect-auto' : 'aspect-[4/3]'
              }`}
              style={{ animationDelay: `${(i + 1) * 70}ms` }}
            >
              {g.src ? (
                <img
                  src={g.src}
                  alt={g.label}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              ) : (
                <div className="flex flex-col items-center text-white/40">
                  <ImageIcon size={28} />
                  <span className="text-xs font-medium mt-2">{g.label}</span>
                </div>
              )}
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-brand-900/70 to-transparent p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-white text-xs font-semibold">{g.label}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Lightbox
        images={withSrc}
        index={lightbox}
        onClose={() => setLightbox(null)}
        onNav={navLightbox}
      />
    </section>
  );
}
