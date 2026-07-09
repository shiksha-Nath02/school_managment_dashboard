// =============================================================================
// HERITAGE LAYOUT — Gallery preview (homepage)
// =============================================================================
// A compact "Photo Albums" teaser on the homepage. Shows folders (categories)
// grouped, and links to the full /gallery page (GalleryPage) which has the
// category tabs + lightbox. Falls back to config placeholders until photos
// are uploaded.
// =============================================================================

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Image as ImageIcon, ArrowRight } from 'lucide-react';
import { getSiteConfig } from '../../../config/siteConfig';
import galleryService from '../../../services/galleryService';
import HeritageHeading from './HeritageHeading';

// "sports" -> "Sports"
const titleCase = (s) => (s || '').replace(/\b\w/g, (c) => c.toUpperCase());

// How many folders / images to preview on the homepage before "See All".
const MAX_FOLDERS = 3;
const MAX_PER_FOLDER = 3;

export default function HeritageGallery() {
  const { gallery: configGallery } = getSiteConfig();
  const navigate = useNavigate();
  const [items, setItems] = useState(configGallery); // flat placeholders (fallback)
  const [folders, setFolders] = useState(null);      // real images grouped by folder

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

  const goToFolder = (folder) => navigate(`/gallery?category=${encodeURIComponent(folder)}`);

  const tile = (g, i, onClick) => (
    <div
      key={i}
      onClick={onClick}
      className={`group relative aspect-[4/3] overflow-hidden rounded-md bg-gradient-to-br from-brand-600 to-brand-700 flex items-center justify-center animate-fade-up animate-start ${onClick ? 'cursor-pointer' : ''}`}
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
    <section id="gallery" className="py-16 px-6 md:px-12 bg-surface-alt/60">
      <div className="max-w-7xl mx-auto">
        {/* Heading + See All */}
        <div className="flex items-center justify-between mb-8">
          <HeritageHeading kicker="Moments" title="Photo Albums" align="left" />
          <button
            onClick={() => navigate('/gallery')}
            className="flex items-center gap-1.5 text-brand-600 hover:text-brand-800 font-bold text-sm uppercase tracking-wide transition-colors"
          >
            See All <ArrowRight size={15} />
          </button>
        </div>

        {folders ? (
          <div className="space-y-10">
            {folders.slice(0, MAX_FOLDERS).map(({ folder, images }) => (
              <div key={folder}>
                <h3 className="font-display text-lg md:text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <span className="w-1.5 h-5 rounded bg-brand-500 inline-block" />
                  {titleCase(folder)}
                  <span className="text-sm font-normal text-gray-400">({images.length})</span>
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {images.slice(0, MAX_PER_FOLDER).map((g, i) => tile(g, i, () => goToFolder(folder)))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {items.map((g, i) => tile(g, i, g.src ? () => navigate('/gallery') : undefined))}
          </div>
        )}
      </div>
    </section>
  );
}
