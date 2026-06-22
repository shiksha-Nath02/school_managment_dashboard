// =============================================================================
// PUBLIC LANDING PAGE — picks the active school's layout
// =============================================================================
// The hostname → config lookup (getSiteConfig) decides `layout`, and we render
// the matching layout component. Add a new design to LAYOUTS to make it
// selectable by any school via `layout: '<key>'` in its config.
// =============================================================================

import { getSiteConfig } from '../../config/siteConfig';
import Classic from '../../components/landing/layouts/Classic';
import Heritage from '../../components/landing/layouts/Heritage';
import Campus from '../../components/landing/layouts/Campus';
import UiSwitcher from '../../components/dev/UiSwitcher';

const LAYOUTS = {
  classic: Classic, // soft, modern single-scroll
  heritage: Heritage, // formal, image-rich single-scroll with motion
  campus: Campus, // tabbed, page-per-section
};

export default function LandingPage() {
  const { layout } = getSiteConfig();
  const Layout = LAYOUTS[layout] || Classic;
  return (
    <>
      <Layout />
      <UiSwitcher />
    </>
  );
}
