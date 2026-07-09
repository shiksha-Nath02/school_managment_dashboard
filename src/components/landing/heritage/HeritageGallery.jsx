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

// "sports" -> "Sports"
const titleCase = (s) => (s || '').replace(/\b\w/g, (c) => c.toUpperCase());

export default function HeritageGallery() {
  const { gallery: configGallery } = getSiteConfig();
  const [items, setItems] = useState(configGallery); // flat placeholders (fallback)
  const [folders, setFolders] = useState(null);      // real images grouped by folder
  const [lightbox, setLightbox] = useState(null);    // index into `allPhotos` or null

  useEffect(() => {
    galleryService.list()
      .then((r) => {
        const imgs = r.data.images || [];
        if (imgs.length) {
          const map = {};
          for (const g of imgs) {
            (map[g.category] = map[g.category] || []).push({ src: g.url, label: g.caption || g.category });
          }
          setFolders(
            Object.entries(map)
              .sort((a, b) => a[0].localeCompare(b[0]))
              .map(([folder, images]) => ({ folder, images }))
          );
        }
      })
      .catch(() => {}); // keep config placeholders on failure
  }, []);

  // Flat list of real photos for the lightbox (across all folders, in display order).
  const allPhotos = folders ? folders.flatMap((f) => f.images) : items.filter((g) => g.src);
  const openLightbox = (item) => {
    const idx = allPhotos.findIndex((g) => g === item);
    if (idx !== -1) setLightbox(idx);
  };
  const navLightbox = (dir) =>
    setLightbox((i) => (i + dir + allPhotos.length) % allPhotos.length);

  const tile = (g, i, big) => (
    <div
      key={i}
      onClick={() => openLightbox(g)}
      className={`group relative overflow-hidden rounded-md bg-gradient-to-br from-brand-600 to-brand-700 flex items-center justify-center animate-fade-up animate-start ${
        g.src ? 'cursor-pointer' : ''
      } ${big ? 'col-span-2 row-span-2 aspect-square md:aspect-auto' : 'aspect-[4/3]'}`}
      style={{ animationDelay: `${(i + 1) * 70}ms` }}
    >
      {g.src ? (
        <img src={g.src} alt={g.label} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
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
  );

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

        {folders ? (
          <div className="space-y-12">
            {folders.map(({ folder, images }) => (
              <div key={folder}>
                <h3 className="font-display text-xl md:text-2xl font-semibold text-white mb-5 flex items-center gap-2">
                  <span className="w-1.5 h-6 rounded bg-gold inline-block" />
                  {titleCase(folder)}
                  <span className="text-sm font-normal text-white/50">({images.length})</span>
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {images.map((g, i) => tile(g, i, i === 0))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {items.map((g, i) => tile(g, i, i === 0))}
          </div>
        )}
      </div>

      <Lightbox
        images={allPhotos}
        index={lightbox}
        onClose={() => setLightbox(null)}
        onNav={navLightbox}
      />
    </section>
  );
}
