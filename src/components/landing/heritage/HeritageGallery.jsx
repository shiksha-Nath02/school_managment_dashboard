// =============================================================================
// HERITAGE LAYOUT — Gallery preview (homepage)
// =============================================================================
// A compact "Photo Albums" teaser on the homepage. Shows one cover card per
// folder (album/event) — NOT individual photos — and links to the full
// /gallery page (GalleryPage) which opens the selected album. Falls back to
// config placeholders until photos are uploaded.
// =============================================================================

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FolderOpen, ArrowRight } from 'lucide-react';
import { getSiteConfig } from '../../../config/siteConfig';
import galleryService from '../../../services/galleryService';
import HeritageHeading from './HeritageHeading';

// "sports" -> "Sports"
const titleCase = (s) => (s || '').replace(/\b\w/g, (c) => c.toUpperCase());

// How many albums to preview on the homepage before "See All".
const MAX_FOLDERS = 6;

export default function HeritageGallery() {
  const { gallery: configGallery } = getSiteConfig();
  const navigate = useNavigate();
  const [folders, setFolders] = useState(null); // real images grouped by folder

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

  // One album cover card. `cover` is the folder's first image (or empty →
  // placeholder). `count` is hidden for config placeholders.
  const albumCard = (key, label, cover, count, onClick, i) => (
    <div
      key={key}
      onClick={onClick}
      className={`group relative aspect-[4/3] overflow-hidden rounded-lg bg-gradient-to-br from-brand-600 to-brand-700 animate-fade-up animate-start ${onClick ? 'cursor-pointer' : ''}`}
      style={{ animationDelay: `${(i + 1) * 70}ms` }}
    >
      {cover ? (
        <img src={cover} alt={label} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <FolderOpen size={34} className="text-white/40" />
        </div>
      )}
      {/* Dark gradient so the label is always legible over the photo */}
      <div className="absolute inset-0 bg-gradient-to-t from-brand-900/85 via-brand-900/25 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 p-4 flex items-center gap-2.5">
        <span className="w-9 h-9 rounded-full bg-gold/90 text-brand-900 flex items-center justify-center flex-shrink-0">
          <FolderOpen size={17} />
        </span>
        <div className="min-w-0">
          <p className="text-white font-display font-semibold text-sm leading-tight truncate">{titleCase(label)}</p>
          {count != null && (
            <p className="text-white/70 text-xs mt-0.5">{count} photo{count === 1 ? '' : 's'}</p>
          )}
        </div>
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

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {folders
            ? folders.slice(0, MAX_FOLDERS).map(({ folder, images }, i) =>
                albumCard(folder, folder, images[0]?.src, images.length, () => goToFolder(folder), i))
            : configGallery.map((g, i) =>
                albumCard(i, g.label, g.src, null, g.src ? () => navigate('/gallery') : undefined, i))}
        </div>
      </div>
    </section>
  );
}
