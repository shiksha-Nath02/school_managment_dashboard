// =============================================================================
// PUBLIC LANDING PAGE — picks the active school's layout
// =============================================================================
// The hostname → config lookup (getSiteConfig) decides `layout`, and we render
// the matching layout component. Add a new design to LAYOUTS to make it
// selectable by any school via `layout: '<key>'` in its config.
// =============================================================================

import { getSiteConfig } from '../../config/siteConfig';
import Classic from '../../components/landing/layouts/Classic';

const LAYOUTS = {
  classic: Classic,
  // modern: Modern,   ← add layouts 2–5 here as we build them
};

export default function LandingPage() {
  const { layout } = getSiteConfig();
  const Layout = LAYOUTS[layout] || Classic;
  return <Layout />;
}
