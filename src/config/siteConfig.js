// =============================================================================
// PUBLIC SCHOOL WEBSITE — CONTENT CONFIG
// =============================================================================
// This is the ONE file you edit to customise the public website per school.
// Per the locked architecture (see server repo AWSreadme.md), the same frontend
// build serves every school; it reads window.location.hostname and loads that
// school's content from the SCHOOLS map below. To onboard a new school you only
// add an entry here — NO rebuild logic changes needed.
//
// For now everything is GENERIC PLACEHOLDER text. Replace the values (and later
// the logo/images/colors) with each school's real details.
// =============================================================================

// ---- DEFAULT (template) content -------------------------------------------
const DEFAULT = {
  // Identity
  name: 'Your School Name',
  shortName: 'Your School',
  logoLetter: 'Y', // first letter shown in the logo box until a real logo image is added
  tagline: 'Your school tagline goes here',
  established: 'YYYY',

  // Top navigation links (anchor to section ids below)
  nav: [
    { label: 'Home', href: '#home' },
    { label: 'About', href: '#about' },
    { label: 'Academics', href: '#academics' },
    { label: 'Facilities', href: '#facilities' },
    { label: 'Notices', href: '#notices' },
    { label: 'Contact', href: '#contact' },
  ],

  // Hero (top banner)
  hero: {
    heading: 'Welcome to Your School Name',
    highlight: 'Your School Name', // this word gets the accent colour
    subheading:
      'A short, welcoming sentence about your school goes here — what you stand for and what makes you special. Replace this placeholder text later.',
    primaryCta: { label: 'Apply for Admission', href: '#contact' },
    secondaryCta: { label: 'Explore Academics', href: '#academics' },
  },

  // Quick stats strip
  stats: [
    { value: '0000+', label: 'Students' },
    { value: '00+', label: 'Teachers' },
    { value: '00+', label: 'Years of Service' },
    { value: '00%', label: 'Results' },
  ],

  // About section
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
  },

  // Academics / programs offered
  programs: [
    { icon: '🧸', title: 'Pre-Primary', age: 'Ages 3–5', desc: 'Placeholder description of the early-years programme.' },
    { icon: '✏️', title: 'Primary', age: 'Classes 1–5', desc: 'Placeholder description of the primary-school programme.' },
    { icon: '📐', title: 'Middle School', age: 'Classes 6–8', desc: 'Placeholder description of the middle-school programme.' },
    { icon: '🎓', title: 'Secondary', age: 'Classes 9–12', desc: 'Placeholder description of the secondary-school programme.' },
  ],

  // Facilities
  facilities: [
    { icon: '📚', title: 'Library', desc: 'Placeholder text about the library facility.' },
    { icon: '🔬', title: 'Science Labs', desc: 'Placeholder text about the science laboratories.' },
    { icon: '💻', title: 'Computer Lab', desc: 'Placeholder text about the computer lab.' },
    { icon: '⚽', title: 'Sports Ground', desc: 'Placeholder text about sports and play areas.' },
    { icon: '🚌', title: 'Transport', desc: 'Placeholder text about the school bus service.' },
    { icon: '🎨', title: 'Arts & Music', desc: 'Placeholder text about arts and music facilities.' },
  ],

  // Notices / announcements
  notices: [
    { date: 'DD MMM', title: 'Admissions open for the new session — placeholder notice.', tag: 'Admissions' },
    { date: 'DD MMM', title: 'Annual sports day announcement — placeholder notice.', tag: 'Events' },
    { date: 'DD MMM', title: 'Parent–teacher meeting schedule — placeholder notice.', tag: 'Notice' },
  ],

  // Gallery — image src added later; for now these render as labelled placeholders
  gallery: [
    { label: 'Campus' },
    { label: 'Classroom' },
    { label: 'Sports' },
    { label: 'Events' },
    { label: 'Library' },
    { label: 'Activities' },
  ],

  // Contact details
  contact: {
    address: 'Your school address goes here, City, State – PIN',
    phone: '+91 00000 00000',
    email: 'info@yourschool.com',
    hours: 'Mon–Sat, 8:00 AM – 2:00 PM',
  },

  // Social links (empty for now)
  social: {
    facebook: '',
    instagram: '',
    youtube: '',
  },
};

// ---- PER-SCHOOL OVERRIDES ---------------------------------------------------
// Add a school by mapping its (www-stripped) hostname to a config object.
// Until a school has its own entry, it falls back to DEFAULT above.
//
// Example for later:
// 'santrldpublicschool.com': { ...DEFAULT, name: 'Sant RLD Public School', ... }
export const SCHOOLS = {
  // 'santrldpublicschool.com': { ...DEFAULT, name: 'Sant RLD Public School' },
};

// ---- LOOKUP -----------------------------------------------------------------
export function getSiteConfig() {
  if (typeof window === 'undefined') return DEFAULT;
  const host = window.location.hostname.replace(/^www\./, '');
  return SCHOOLS[host] || DEFAULT;
}

export default DEFAULT;
