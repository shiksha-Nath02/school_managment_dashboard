import HeritageHeader from '../heritage/HeritageHeader';
import HeritageHero from '../heritage/HeritageHero';
import HeritageAbout from '../heritage/HeritageAbout';
import HeritagePrincipalMessage from '../heritage/HeritagePrincipalMessage';
import HeritagePrograms from '../heritage/HeritagePrograms';
import HeritageFacilities from '../heritage/HeritageFacilities';
import HeritageQuickAccess from '../heritage/HeritageQuickAccess';
import HeritageGallery from '../heritage/HeritageGallery';
import HeritageBirthdayTicker from '../heritage/HeritageBirthdayTicker';
import HeritageContact from '../heritage/HeritageContact';
import HeritageFooter from '../heritage/HeritageFooter';
import useScrollReveal from '../shared/useScrollReveal';
import { getSiteConfig } from '../../../config/siteConfig';

export default function Heritage() {
  useScrollReveal();
  const { showBirthdays } = getSiteConfig();

  return (
    <div className="min-h-screen bg-surface-bg font-body scroll-smooth">
      <HeritageHeader />
      <HeritageHero />
      {showBirthdays && <HeritageBirthdayTicker />}
      <HeritageAbout />
      <HeritagePrincipalMessage />
      <HeritagePrograms />
      <HeritageFacilities />
      <HeritageQuickAccess />
      <HeritageGallery />
      <HeritageContact />
      <HeritageFooter />
    </div>
  );
}
