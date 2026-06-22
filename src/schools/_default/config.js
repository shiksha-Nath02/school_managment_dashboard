// =============================================================================
// DEFAULT (TEMPLATE) SCHOOL CONFIG
// =============================================================================
// This is the content shape EVERY layout reads. A school's own config (in
// src/schools/<hostname>/config.js) spreads this and overrides what it needs:
//
//   import DEFAULT from '../_default/config';
//   export default { ...DEFAULT, name: 'Real School', palette: 'blue', ... };
//
// Three per-school dials live alongside the content:
//   - layout:  which landing-page design renders   (see src/components/landing/layouts)
//   - palette: which color set applies              (see src/schools/_palettes.js)
//   - content: every other field below
//
// Images (logo / gallery) are S3 URLs so the shared build stays small. Until a
// real URL is set, the logo falls back to `logoLetter` and gallery tiles render
// as labelled placeholders.
// =============================================================================

const DEFAULT = {
  // ---- Dials -------------------------------------------------------------
  layout: 'classic', // one of the prebuilt layouts
  palette: 'green', // one of src/schools/_palettes.js (or an inline palette object)

  // ---- Identity ----------------------------------------------------------
  name: 'Your School Name',
  shortName: 'Your School',
  logoLetter: 'Y', // shown in the logo box until `logo` (an image URL) is set
  logo: '', // e.g. 'https://school-management-uploads-2026.s3.ap-south-1.amazonaws.com/<school>/logo.png'
  tagline: 'Your school tagline goes here',
  established: 'YYYY',

  // ---- Top navigation (anchors to section ids) ---------------------------
  nav: [
    { label: 'Home', href: '#home' },
    { label: 'About', href: '#about' },
    { label: 'Academics', href: '#academics' },
    { label: 'Facilities', href: '#facilities' },
    { label: 'Notices', href: '#notices' },
    { label: 'Contact', href: '#contact' },
  ],

  // ---- Hero (top banner) -------------------------------------------------
  hero: {
    heading: 'Welcome to Your School Name',
    highlight: 'Your School Name', // this word gets the accent colour
    subheading:
      'A short, welcoming sentence about your school goes here — what you stand for and what makes you special. Replace this placeholder text later.',
    primaryCta: { label: 'Apply for Admission', href: '#contact' },
    secondaryCta: { label: 'Explore Academics', href: '#academics' },
    image: '', // optional S3 URL — used as the full-bleed banner by image-rich layouts (e.g. 'heritage')
  },

  // ---- Quick stats strip -------------------------------------------------
  stats: [
    { value: '0000+', label: 'Students' },
    { value: '00+', label: 'Teachers' },
    { value: '00+', label: 'Years of Service' },
    { value: '00%', label: 'Results' },
  ],

  // ---- About section -----------------------------------------------------
  about: {
    title: 'About Our School',
    lead: 'A short headline about your school’s mission goes here.',
    paragraphs: [
      'First paragraph of placeholder text about the school — its history, vision, and values. Replace this with your real description.',
      'Second paragraph — talk about your teaching approach, community, or achievements. This is just placeholder copy.',
    ],
    points: [
      'Affiliation / board (e.g. CBSE / ICSE / State) — placeholder',
      'Experienced and caring teaching staff — placeholder',
      'Safe, modern, well-equipped campus — placeholder',
      'Focus on academics, sports, and values — placeholder',
    ],
    image: '', // optional S3 URL — framed campus photo beside the text in image-rich layouts
  },

  // ---- Academics / programs offered --------------------------------------
  programs: [
    { icon: '🧸', title: 'Pre-Primary', age: 'Ages 3–5', desc: 'Placeholder description of the early-years programme.' },
    { icon: '✏️', title: 'Primary', age: 'Classes 1–5', desc: 'Placeholder description of the primary-school programme.' },
    { icon: '📐', title: 'Middle School', age: 'Classes 6–8', desc: 'Placeholder description of the middle-school programme.' },
    { icon: '🎓', title: 'Secondary', age: 'Classes 9–12', desc: 'Placeholder description of the secondary-school programme.' },
  ],

  // ---- Facilities --------------------------------------------------------
  // `image` is an optional S3 URL; image-rich layouts show it as the tile photo
  // and fall back to the `icon` when it is empty.
  facilities: [
    { icon: '📚', title: 'Library', desc: 'Placeholder text about the library facility.', image: '' },
    { icon: '🔬', title: 'Science Labs', desc: 'Placeholder text about the science laboratories.', image: '' },
    { icon: '💻', title: 'Computer Lab', desc: 'Placeholder text about the computer lab.', image: '' },
    { icon: '⚽', title: 'Sports Ground', desc: 'Placeholder text about sports and play areas.', image: '' },
    { icon: '🚌', title: 'Transport', desc: 'Placeholder text about the school bus service.', image: '' },
    { icon: '🎨', title: 'Arts & Music', desc: 'Placeholder text about arts and music facilities.', image: '' },
  ],

  // ---- Ticker headlines (scrolling news strip in heritage/campus layouts) -
  // If empty, the ticker falls back to the notice titles below.
  announcements: [
    'Admissions open for the new academic session — apply today!',
    'Congratulations to our students on outstanding board results.',
    'Annual Sports Day and Cultural Fest coming soon.',
  ],

  // ---- Notices / announcements -------------------------------------------
  notices: [
    { date: 'DD MMM', title: 'Admissions open for the new session — placeholder notice.', tag: 'Admissions' },
    { date: 'DD MMM', title: 'Annual sports day announcement — placeholder notice.', tag: 'Events' },
    { date: 'DD MMM', title: 'Parent–teacher meeting schedule — placeholder notice.', tag: 'Notice' },
  ],

  // ---- Gallery — `src` is an S3 image URL; without it a placeholder shows -
  gallery: [
    { label: 'Campus' },
    { label: 'Classroom' },
    { label: 'Sports' },
    { label: 'Events' },
    { label: 'Library' },
    { label: 'Activities' },
  ],

  // ---- Contact details ---------------------------------------------------
  contact: {
    address: 'Your school address goes here, City, State – PIN',
    phone: '+91 00000 00000',
    email: 'info@yourschool.com',
    hours: 'Mon–Sat, 8:00 AM – 2:00 PM',
  },

  // ---- Social links (empty hides the icon) -------------------------------
  social: {
    facebook: '',
    instagram: '',
    youtube: '',
  },
};

export default DEFAULT;
