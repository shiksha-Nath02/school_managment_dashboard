// =============================================================================
// SANT RLD PUBLIC SCHOOL — santrldpublicschool.com
// =============================================================================
// Spreads the DEFAULT template and overrides this school's content/colors/layout.
//
// ⚠️ The values below marked  // TODO: confirm  are best-guess placeholders —
// replace them with the school's REAL figures, address, phone, and notices.
// Logo / gallery images: upload to the S3 bucket (school-management-uploads-2026)
// under a `santrld/` prefix and paste the public URLs into `logo` / gallery `src`.
// =============================================================================

import DEFAULT from '../_default/config';

const santrld = {
  ...DEFAULT,

  // ---- Dials -------------------------------------------------------------
  layout: 'heritage',
  palette: 'green',

  // ---- Identity ----------------------------------------------------------
  name: 'Sant RLD Public School',
  shortName: 'Sant RLD',
  logoLetter: 'S',
  logo: '', // TODO: S3 URL of the school logo
  tagline: 'Knowledge · Discipline · Character',
  established: '2005', // TODO: confirm year of establishment

  // ---- Hero --------------------------------------------------------------
  hero: {
    heading: 'Welcome to Sant RLD Public School',
    highlight: 'Sant RLD Public School',
    subheading:
      'Nurturing young minds with quality education, strong values, and a caring environment — preparing every child for a bright and confident future.',
    primaryCta: { label: 'Apply for Admission', href: '#contact' },
    secondaryCta: { label: 'Explore Academics', href: '#academics' },
    image: '', // TODO: S3 URL of a wide campus/building photo — fills the hero banner
  },

  // ---- Quick stats (TODO: confirm real figures) --------------------------
  stats: [
    { value: '1200+', label: 'Students' },
    { value: '60+', label: 'Teachers' },
    { value: '20+', label: 'Years of Service' },
    { value: '98%', label: 'Results' },
  ],

  // ---- About -------------------------------------------------------------
  about: {
    title: 'About Sant RLD Public School',
    lead: 'A nurturing place where every child learns, grows, and shines.',
    paragraphs: [
      'Sant RLD Public School is committed to providing holistic education that balances academic excellence with strong moral values. Our dedicated faculty and supportive environment help every student discover their potential.',
      'From early years through senior classes, we focus on building curiosity, confidence, and character — preparing students not just for exams, but for life.',
    ],
    points: [
      'Affiliated to CBSE', // TODO: confirm board/affiliation
      'Experienced and caring teaching staff',
      'Safe, modern, well-equipped campus',
      'Focus on academics, sports, and values',
    ],
    image: '', // TODO: S3 URL of a school/students photo shown beside this text
  },

  // ---- Academics / programs ----------------------------------------------
  programs: [
    { icon: '🧸', title: 'Pre-Primary', age: 'Nursery – UKG', desc: 'A joyful, play-based start where little ones build language, motor skills, and social confidence.' },
    { icon: '✏️', title: 'Primary', age: 'Classes 1–5', desc: 'Strong foundations in reading, writing, and numeracy through activity-led, child-friendly teaching.' },
    { icon: '📐', title: 'Middle School', age: 'Classes 6–8', desc: 'Curiosity-driven learning across science, maths, languages, and the arts to widen every horizon.' },
    { icon: '🎓', title: 'Secondary', age: 'Classes 9–10', desc: 'Focused academics and mentoring that prepare students for board exams and the road ahead.' },
  ],

  // ---- Facilities (add an `image` S3 URL to each to show real photos) -----
  facilities: [
    { icon: '📚', title: 'Library', desc: 'A well-stocked library with books, periodicals, and a quiet space to read and research.', image: '' },
    { icon: '🔬', title: 'Science Labs', desc: 'Hands-on physics, chemistry, and biology labs that bring classroom concepts to life.', image: '' },
    { icon: '💻', title: 'Computer Lab', desc: 'Modern computers and internet access to build digital skills from an early age.', image: '' },
    { icon: '⚽', title: 'Sports Ground', desc: 'Open playgrounds and courts for cricket, football, athletics, and daily play.', image: '' },
    { icon: '🚌', title: 'Transport', desc: 'A safe, GPS-tracked bus fleet covering routes across the city for easy commuting.', image: '' },
    { icon: '🎨', title: 'Arts & Music', desc: 'Dedicated spaces for drawing, dance, and music to nurture every child’s creativity.', image: '' },
  ],

  // ---- Gallery (add a `src` S3 URL to each tile to show real photos) ------
  gallery: [
    { label: 'Our Campus', src: '' },
    { label: 'Classrooms', src: '' },
    { label: 'Sports Day', src: '' },
    { label: 'Cultural Events', src: '' },
    { label: 'Library', src: '' },
    { label: 'Activities', src: '' },
  ],

  // ---- Ticker headlines (scrolling news strip) ---------------------------
  announcements: [
    'Admissions open for the 2026–27 academic session — enquire now!',
    'Sant RLD students shine with excellent board results.',
    'Annual Sports Day — date to be announced soon.',
  ],

  // ---- Notices (TODO: replace with real announcements) -------------------
  notices: [
    { date: '01 Apr', title: 'Admissions open for the 2026–27 academic session.', tag: 'Admissions' },
    { date: '15 Apr', title: 'Annual Sports Day — date to be announced soon.', tag: 'Events' },
    { date: '20 Apr', title: 'Parent–Teacher Meeting schedule for the new term.', tag: 'Notice' },
  ],

  // ---- Contact (TODO: confirm real address / phone / email) --------------
  contact: {
    address: 'Sant RLD Public School, City, State – PIN', // TODO
    phone: '+91 00000 00000', // TODO
    email: 'info@santrldpublicschool.com', // TODO
    hours: 'Mon–Sat, 8:00 AM – 2:00 PM',
  },

  social: {
    facebook: '',
    instagram: '',
    youtube: '',
  },
};

export default santrld;
