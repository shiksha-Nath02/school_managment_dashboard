// =============================================================================
// LAYOUT: Campus
// =============================================================================
// A tabbed, page-per-section design (vs. the single-scroll Classic/Heritage).
// Each tab swaps the content area with a fade; the body reuses the shared
// Heritage sections so content stays consistent across layouts. Selectable via
// `layout: 'campus'` in a school's config.
// =============================================================================

import { useState, useEffect } from 'react';
import CampusHeader from '../campus/CampusHeader';
import CampusHome from '../campus/CampusHome';
import HeritageAbout from '../heritage/HeritageAbout';
import HeritagePrograms from '../heritage/HeritagePrograms';
import HeritageFacilities from '../heritage/HeritageFacilities';
import HeritageGallery from '../heritage/HeritageGallery';
import HeritageContact from '../heritage/HeritageContact';
import HeritageFooter from '../heritage/HeritageFooter';
import useScrollReveal from '../shared/useScrollReveal';

const TABS = [
  { key: 'home', label: 'Home' },
  { key: 'about', label: 'About' },
  { key: 'academics', label: 'Academics' },
  { key: 'facilities', label: 'Facilities' },
  { key: 'gallery', label: 'Gallery' },
  { key: 'contact', label: 'Contact' },
];

export default function Campus() {
  const [tab, setTab] = useState('home');

  // Re-arm scroll reveals and jump to the top whenever the tab changes.
  useScrollReveal([tab]);
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [tab]);

  const PAGES = {
    home: <CampusHome onNavigate={setTab} />,
    about: <HeritageAbout />,
    academics: <HeritagePrograms />,
    facilities: <HeritageFacilities />,
    gallery: <HeritageGallery />,
    contact: <HeritageContact />,
  };

  return (
    <div className="min-h-screen bg-surface-bg font-body flex flex-col">
      <CampusHeader tabs={TABS} activeKey={tab} onSelect={setTab} />

      {/* `key` forces a remount per tab so the fade-in replays */}
      <main key={tab} className="flex-1 animate-fade-in">
        {PAGES[tab]}
      </main>

      <HeritageFooter />
    </div>
  );
}
