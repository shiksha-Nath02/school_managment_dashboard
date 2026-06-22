// =============================================================================
// HERITAGE LAYOUT — shared section heading
// =============================================================================
// The formal heading motif reused across sections: a small gold uppercase
// kicker, the title, and a short gold underline. `align` controls centring.
// =============================================================================

export default function HeritageHeading({ kicker, title, align = 'center', light = false }) {
  const isCenter = align === 'center';
  return (
    <div className={`${isCenter ? 'text-center' : 'text-left'} animate-fade-up animate-start`}>
      {kicker && (
        <span className="block text-gold text-xs font-bold uppercase tracking-[3px] mb-2">
          {kicker}
        </span>
      )}
      <h2
        className={`font-display text-3xl md:text-4xl font-extrabold tracking-tight ${
          light ? 'text-white' : 'text-brand-800'
        }`}
      >
        {title}
      </h2>
      <div className={`w-16 h-[3px] bg-gold mt-4 ${isCenter ? 'mx-auto' : ''}`} />
    </div>
  );
}
