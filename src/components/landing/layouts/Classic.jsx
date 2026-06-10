// =============================================================================
// LAYOUT: Classic
// =============================================================================
// The original landing-page design. One of the prebuilt layouts a school can
// choose via `layout: 'classic'` in its config. Like every layout, it reads its
// content from getSiteConfig() (inside each section) — so it is content-agnostic
// and a school can switch layouts without touching its content.
// =============================================================================

import Navbar from '../Navbar';
import Hero from '../Hero';
import About from '../About';
import Programs from '../Programs';
import Facilities from '../Facilities';
import Notices from '../Notices';
import Gallery from '../Gallery';
import Contact from '../Contact';
import Footer from '../Footer';

export default function Classic() {
  return (
    <div className="min-h-screen bg-surface-bg font-body scroll-smooth">
      <Navbar />
      <Hero />
      <About />
      <Programs />
      <Facilities />
      <Notices />
      <Gallery />
      <Contact />
      <Footer />
    </div>
  );
}
