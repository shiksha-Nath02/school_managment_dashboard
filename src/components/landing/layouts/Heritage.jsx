// =============================================================================
// LAYOUT: Heritage
// =============================================================================
// A formal, image-rich institutional design — full-bleed photo hero, gold
// accents, framed imagery, and a notice board. One of the prebuilt layouts a
// school can choose via `layout: 'heritage'` in its config. Like every layout,
// it reads its content from getSiteConfig() inside each section, so it is
// content-agnostic and a school can switch layouts without touching content.
// =============================================================================

import HeritageHeader from '../heritage/HeritageHeader';
import HeritageHero from '../heritage/HeritageHero';
import HeritageAbout from '../heritage/HeritageAbout';
import HeritagePrograms from '../heritage/HeritagePrograms';
import HeritageFacilities from '../heritage/HeritageFacilities';
import HeritageGallery from '../heritage/HeritageGallery';
import HeritageNotices from '../heritage/HeritageNotices';
import HeritageContact from '../heritage/HeritageContact';
import HeritageFooter from '../heritage/HeritageFooter';
import useScrollReveal from '../shared/useScrollReveal';

export default function Heritage() {
  useScrollReveal(); // reveal sections progressively as they scroll into view

  return (
    <div className="min-h-screen bg-surface-bg font-body scroll-smooth">
      <HeritageHeader />
      <HeritageHero />
      <HeritageAbout />
      <HeritagePrograms />
      <HeritageFacilities />
      <HeritageGallery />
      <HeritageNotices />
      <HeritageContact />
      <HeritageFooter />
    </div>
  );
}
