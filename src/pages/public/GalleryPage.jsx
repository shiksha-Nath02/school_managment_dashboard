import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, FolderOpen, X, ChevronLeft, ChevronRight, Image as ImageIcon } from 'lucide-react';
import galleryService from '../../services/galleryService';
import { getSiteConfig } from '../../config/siteConfig';
import applyTheme from '../../theme/applyTheme';

// Group images by category
function groupByCategory(images) {
  return images.reduce((acc, img) => {
    const key = img.category || 'General';
    if (!acc[key]) acc[key] = [];
    acc[key].push(img);
    return acc;
  }, {});
}

export default function GalleryPage() {
  const { name } = getSiteConfig();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [allImages, setAllImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lightbox, setLightbox] = useState(null); // { images: [], index: number }

  const activeCategory = searchParams.get('category') || null;

  // Apply school theme (reads config internally)
  useEffect(() => { applyTheme(); }, []);

  useEffect(() => {
    galleryService.list()
      .then((r) => setAllImages(r.data.images || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const grouped = groupByCategory(allImages);
  const categories = Object.keys(grouped);

  // Images shown in main grid: filtered by active category or all
  const displayImages = activeCategory && grouped[activeCategory]
    ? grouped[activeCategory]
    : allImages;

  function openLightbox(images, index) {
    setLightbox({ images, index });
  }
  function navLightbox(dir) {
    setLightbox((lb) => ({
      ...lb,
      index: (lb.index + dir + lb.images.length) % lb.images.length,
    }));
  }

  return (
    <div className="min-h-screen bg-surface-bg font-body">
      {/* Header */}
      <div className="bg-brand-800 text-white px-6 md:px-12 py-6 sticky top-0 z-30 shadow-elevated">
        <div className="max-w-7xl mx-auto flex items-center gap-4">
          <button onClick={() => navigate('/')}
            className="flex items-center gap-2 text-white/70 hover:text-white transition-colors text-sm font-medium">
            <ArrowLeft size={18} /> Back to Home
          </button>
          <div className="w-px h-5 bg-white/20" />
          <div>
            <h1 className="font-display font-extrabold text-lg leading-tight">{name}</h1>
            <p className="text-gold text-xs uppercase tracking-widest">Photo Gallery</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-12 py-10">
        {/* Category tabs */}
        {categories.length > 1 && (
          <div className="flex flex-wrap gap-2 mb-10">
            <button
              onClick={() => setSearchParams({})}
              className={`px-4 py-2 rounded-sm text-sm font-bold uppercase tracking-wide border-2 transition-all ${
                !activeCategory ? 'bg-brand-700 border-brand-700 text-white' : 'border-gray-200 text-gray-500 hover:border-brand-400'
              }`}
            >
              All Photos
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSearchParams({ category: cat })}
                className={`flex items-center gap-2 px-4 py-2 rounded-sm text-sm font-bold uppercase tracking-wide border-2 transition-all ${
                  activeCategory === cat ? 'bg-brand-700 border-brand-700 text-white' : 'border-gray-200 text-gray-500 hover:border-brand-400'
                }`}
              >
                <FolderOpen size={14} /> {cat}
                <span className="font-normal text-xs">({grouped[cat].length})</span>
              </button>
            ))}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="aspect-square bg-gray-100 rounded-md animate-pulse" />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && displayImages.length === 0 && (
          <div className="text-center py-24 text-gray-400">
            <ImageIcon size={48} className="mx-auto mb-4 opacity-30" />
            <p className="font-medium">No photos yet.</p>
          </div>
        )}

        {/* Image grid */}
        {!loading && displayImages.length > 0 && (
          <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
            {displayImages.map((img, i) => (
              <div key={img.id}
                onClick={() => openLightbox(displayImages, i)}
                className="break-inside-avoid rounded-md overflow-hidden cursor-pointer group relative">
                <img src={img.url} alt={img.caption || img.category}
                  className="w-full object-cover group-hover:scale-105 transition-transform duration-500" />
                {img.caption && (
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-brand-900/70 to-transparent p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-white text-xs font-medium">{img.caption}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
          onClick={() => setLightbox(null)}>
          <button onClick={() => setLightbox(null)}
            className="absolute top-4 right-4 text-white/70 hover:text-white">
            <X size={28} />
          </button>
          <button onClick={(e) => { e.stopPropagation(); navLightbox(-1); }}
            className="absolute left-4 text-white/70 hover:text-white p-2">
            <ChevronLeft size={36} />
          </button>
          <img
            src={lightbox.images[lightbox.index].url}
            alt={lightbox.images[lightbox.index].caption || ''}
            className="max-h-[90vh] max-w-[90vw] object-contain rounded-md shadow-elevated"
            onClick={(e) => e.stopPropagation()}
          />
          <button onClick={(e) => { e.stopPropagation(); navLightbox(1); }}
            className="absolute right-4 text-white/70 hover:text-white p-2">
            <ChevronRight size={36} />
          </button>
          {lightbox.images[lightbox.index].caption && (
            <p className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/80 text-sm bg-black/50 px-4 py-1.5 rounded-full">
              {lightbox.images[lightbox.index].caption}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
