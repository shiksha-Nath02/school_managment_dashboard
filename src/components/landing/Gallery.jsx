import { Image as ImageIcon } from 'lucide-react';
import { getSiteConfig } from '../../config/siteConfig';

export default function Gallery() {
  const { gallery } = getSiteConfig();

  return (
    <section id="gallery" className="py-20 px-6 md:px-12 max-w-7xl mx-auto">
      <div className="text-center mb-12 animate-fade-up animate-start">
        <h2 className="font-display text-3xl md:text-4xl font-bold tracking-tight mb-3">Gallery</h2>
        <p className="text-gray-500 text-lg max-w-md mx-auto">
          A glimpse of life at our school.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {gallery.map((g, i) => (
          <div
            key={i}
            className="group relative aspect-[4/3] rounded-2xl overflow-hidden bg-gradient-to-br from-brand-100 to-gold-light border border-gray-100 flex items-center justify-center animate-fade-up animate-start"
            style={{ animationDelay: `${(i + 1) * 80}ms` }}
          >
            {g.src ? (
              <img src={g.src} alt={g.label} className="w-full h-full object-cover" />
            ) : (
              <div className="flex flex-col items-center text-brand-300">
                <ImageIcon size={28} />
                <span className="text-xs font-medium mt-2">{g.label}</span>
              </div>
            )}
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/40 to-transparent p-3 opacity-0 group-hover:opacity-100 transition-opacity">
              <span className="text-white text-xs font-medium">{g.label}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
