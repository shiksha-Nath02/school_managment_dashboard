import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FolderOpen, Image as ImageIcon, ArrowRight } from 'lucide-react';
import { getSiteConfig } from '../../../config/siteConfig';
import galleryService from '../../../services/galleryService';
import HeritageHeading from './HeritageHeading';

function groupByCategory(images) {
  return images.reduce((acc, img) => {
    const key = img.category || 'General';
    if (!acc[key]) acc[key] = [];
    acc[key].push(img);
    return acc;
  }, {});
}

export default function HeritageGallery() {
  const { gallery: configGallery } = getSiteConfig();
  const navigate = useNavigate();
  const [folders, setFolders] = useState(null);

  useEffect(() => {
    galleryService.list()
      .then((r) => {
        const imgs = r.data.images || [];
        setFolders(imgs.length ? groupByCategory(imgs) : {});
      })
      .catch(() => setFolders({}));
  }, []);

  const folderEntries = folders && Object.keys(folders).length > 0
    ? Object.entries(folders).slice(0, 8).map(([name, imgs]) => ({
        name, cover: imgs[0]?.url || null, count: imgs.length,
      }))
    : configGallery.slice(0, 8).map((g) => ({
        name: g.label, cover: g.src || null, count: null,
      }));

  return (
    <section id="gallery" className="py-16 px-6 md:px-12 bg-surface-alt/60">
      <div className="max-w-7xl mx-auto">
        {/* Compact heading row */}
        <div className="flex items-center justify-between mb-8">
          <HeritageHeading kicker="Moments" title="Photo Albums" align="left" />
          <button
            onClick={() => navigate('/gallery')}
            className="flex items-center gap-1.5 text-brand-600 hover:text-brand-800 font-bold text-sm uppercase tracking-wide transition-colors"
          >
            See All <ArrowRight size={15} />
          </button>
        </div>

        {/* Compact folder grid — 4 columns, uniform small cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {folderEntries.map((folder, i) => (
            <div
              key={folder.name}
              onClick={() => navigate(`/gallery?category=${encodeURIComponent(folder.name)}`)}
              className="group cursor-pointer bg-white border border-gray-200 rounded-lg overflow-hidden shadow-soft hover:shadow-card hover:-translate-y-1 transition-all duration-200 animate-fade-up animate-start"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              {/* Thumbnail — fixed compact height */}
              <div className="h-28 relative overflow-hidden bg-brand-50">
                {folder.cover ? (
                  <img
                    src={folder.cover}
                    alt={folder.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <FolderOpen size={32} className="text-brand-200" />
                  </div>
                )}
                {/* Hover tint */}
                <div className="absolute inset-0 bg-brand-700/0 group-hover:bg-brand-700/20 transition-colors" />
              </div>

              {/* Label */}
              <div className="px-3 py-2.5">
                <p className="font-semibold text-sm text-brand-800 truncate leading-tight">
                  {folder.name}
                </p>
                {folder.count !== null && (
                  <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                    <ImageIcon size={10} /> {folder.count} photo{folder.count !== 1 ? 's' : ''}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Mobile see-all button */}
        <div className="mt-6 text-center sm:hidden">
          <button
            onClick={() => navigate('/gallery')}
            className="inline-flex items-center gap-2 border border-brand-600 text-brand-600 px-6 py-2.5 rounded-sm font-bold uppercase tracking-wide text-sm hover:bg-brand-50 transition-all"
          >
            See All Albums <ArrowRight size={15} />
          </button>
        </div>
      </div>
    </section>
  );
}
