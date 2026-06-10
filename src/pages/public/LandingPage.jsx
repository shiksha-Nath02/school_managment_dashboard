import Navbar from '../../components/landing/Navbar';
import Hero from '../../components/landing/Hero';
import About from '../../components/landing/About';
import Programs from '../../components/landing/Programs';
import Facilities from '../../components/landing/Facilities';
import Notices from '../../components/landing/Notices';
import Gallery from '../../components/landing/Gallery';
import Contact from '../../components/landing/Contact';
import Footer from '../../components/landing/Footer';

export default function LandingPage() {
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
