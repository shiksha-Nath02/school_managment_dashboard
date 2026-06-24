// =============================================================================
// IDEAL RADIANT PUBLIC SCHOOL — idealradiantpublicschool.com
// =============================================================================
// Spreads the DEFAULT template and overrides this school's content/colors/layout.
// Content sourced from the school's existing WordPress site (2026-06-22).
//
// ⚠️ Values marked  // TODO: confirm  still need the owner's confirmation
// (exact phone, email, PIN, real student/teacher counts).
// Images: the WordPress-hosted URLs below will DIE after the DNS cutover (they live
// on the same domain we're taking over). Re-host logo/photos on the S3 public bucket
// under an `idealradiant/` prefix and replace these URLs before go-live.
//
// LOOK preview: http://localhost:5173/?site=idealradiantpublicschool.com&layout=campus&palette=maroon
//   (layout: classic | heritage | campus   palette: green | blue | maroon)
// =============================================================================

import DEFAULT from '../_default/config';

const idealradiant = {
  ...DEFAULT,

  // ---- Dials -------------------------------------------------------------
  layout: 'classic',   // TODO: confirm after previewing (classic | heritage | campus)
  palette: 'blue',     // matches the old site's blue Colibri theme (confirm if you prefer another)

  // ---- Identity ----------------------------------------------------------
  name: 'Ideal Radiant Public School',
  shortName: 'Ideal Radiant',
  logoLetter: 'I',
  // Old WordPress logo (re-host on S3 before go-live — this URL dies at cutover):
  // https://idealradiantpublicschool.com/wp-content/uploads/2023/09/cropped-WhatsApp-Image-2023-08-29-at-11.56.12-1.jpg
  logo: '', // TODO: S3 URL of the school logo
  tagline: 'Knowledge for Life', // from the Chairman's vision (confirm if there's an official motto)
  established: '2000',

  // ---- Hero --------------------------------------------------------------
  hero: {
    heading: 'Welcome to Ideal Radiant Public School',
    highlight: 'Ideal Radiant Public School',
    subheading:
      'A nurturing and inclusive learning community in Shiv Vihar, New Delhi — dedicated to high-quality education and the holistic development of every child up to Class 8.',
    primaryCta: { label: 'Admission Enquiry', href: '#contact' },
    secondaryCta: { label: 'Explore Academics', href: '#academics' },
    image: '', // TODO: S3 URL of a wide campus/building photo
  },

  // ---- Quick stats (TODO: confirm the numeric figures with the school) ---
  stats: [
    { value: 'Since 2000', label: 'Serving the community' },
    { value: 'Up to Class 8', label: 'Pre-Primary to Middle' },
    { value: '500+', label: 'Students' },   // TODO: confirm real number
    { value: '25+', label: 'Teachers' },     // TODO: confirm real number
  ],

  // ---- About (real text from the school's site) --------------------------
  about: {
    title: 'About Ideal Radiant Public School',
    lead: 'A nurturing and inclusive environment that inspires a love for learning.',
    paragraphs: [
      'At Ideal Radiant Public School, we believe in creating a nurturing and inclusive environment that inspires a love for learning. Our dedicated team of educators is committed to fostering academic excellence, character development, and the overall well-being of our students.',
      'With a child-centered approach, we strive to empower every student to reach their full potential and become responsible and compassionate global citizens. Founded in 2000, our school provides high-quality education and fosters holistic development for students up to Class 8.',
    ],
    points: [
      'Established in 2000',
      'Education from Pre-Primary up to Class 8',
      'Child-centered, holistic approach',
      'Focus on academics, character, and well-being',
    ],
    image: '', // TODO: S3 URL of a school/students photo
  },

  // ---- Academics / programs (school goes UP TO CLASS 8 — no secondary) ---
  programs: [
    { icon: '🧸', title: 'Pre-Primary', age: 'Nursery – UKG', desc: 'A joyful, play-based start where little ones build language, motor skills, and social confidence.' },
    { icon: '✏️', title: 'Primary', age: 'Classes 1–5', desc: 'Strong foundations in reading, writing, and numeracy through activity-led, child-friendly teaching.' },
    { icon: '📐', title: 'Middle School', age: 'Classes 6–8', desc: 'Curiosity-driven learning across maths, science, language arts, social studies, physical education, and the arts.' },
  ],

  // ---- Facilities --------------------------------------------------------
  facilities: [
    { icon: '📚', title: 'Library', desc: 'A well-stocked library with books and a quiet space to read and research.', image: '' },
    { icon: '🔬', title: 'Science Lab', desc: 'Hands-on experiments that bring classroom concepts to life.', image: '' },
    { icon: '💻', title: 'Computer Lab', desc: 'Modern computers and internet access to build digital skills early.', image: '' },
    { icon: '⚽', title: 'Sports & Games', desc: 'Playgrounds and courts for sports, athletics, and daily play.', image: '' },
    { icon: '🎭', title: 'Extracurriculars', desc: 'Clubs, arts, and cultural activities that build confidence and teamwork.', image: '' },
    { icon: '🎨', title: 'Arts & Music', desc: 'Dedicated spaces to nurture every child’s creativity.', image: '' },
  ],

  // ---- Gallery (re-host real photos on S3, then paste `src` URLs) ---------
  gallery: [
    { label: 'Our Campus', src: '' },
    { label: 'Classrooms', src: '' },
    { label: 'Activities', src: '' },
    { label: 'Sports', src: '' },
    { label: 'Events', src: '' },
    { label: 'Students', src: '' },
  ],

  // ---- Ticker headlines --------------------------------------------------
  announcements: [
    'Admission enquiries open — welcome to Ideal Radiant Public School!',
    'Nurturing holistic development for every child up to Class 8.',
  ],

  // ---- Notices (TODO: replace with real circulars/notifications) ---------
  notices: [
    { date: '01 Apr', title: 'Admission enquiries open for the new academic session.', tag: 'Admissions' },
    { date: '15 Apr', title: 'See the Circulars & Notifications section for updates.', tag: 'Notice' },
  ],

  // ---- Contact (address from the site; CONFIRM phone/email/PIN) ----------
  contact: {
    address: 'Shiv Vihar, New Delhi, Delhi', // TODO: confirm full address + PIN code
    phone: '+91 00000 00000', // TODO: confirm (site listed several numbers)
    email: 'info@idealradiantpublicschool.com', // TODO: confirm real email
    hours: 'Mon–Sat, 8:00 AM – 2:00 PM', // TODO: confirm
  },

  social: {
    facebook: 'https://www.facebook.com/p/Ideal-Radiant-Public-School-100063781460038/',
    instagram: '',
    youtube: '',
  },
};

export default idealradiant;
