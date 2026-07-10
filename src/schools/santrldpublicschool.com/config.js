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
  palette: 'vibrant',

  // ---- Identity ----------------------------------------------------------
  name: 'Sant RLD Public School',
  shortName: 'Sant RLD',
  logoLetter: 'S',
  logo: '', // → '/schools/santrldpublicschool.com/logo.png'
  tagline: 'Knowledge · Discipline · Character',
  established: '2005', // TODO: confirm year of establishment

  // ---- Hero --------------------------------------------------------------
  // Drop images into public/schools/santrldpublicschool.com/ and list them here.
  hero: {
    heading: 'Welcome to Sant RLD Public School',
    highlight: 'Sant RLD Public School',
    subheading:
      'Nurturing young minds with quality education, strong values, and a caring environment — preparing every child for a bright and confident future.',
    primaryCta: { label: 'Apply for Admission', href: '#contact' },
    secondaryCta: { label: 'Explore Academics', href: '#academics' },
    image: '',
    images: [
      '/schools/santrldpublicschool.com/hero1.jpg',
      '/schools/santrldpublicschool.com/hero2.jpg',
    ],
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
    image: '/schools/santrldpublicschool.com/about.jpeg',
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

  // ---- Our Story section -------------------------------------------------
  story: {
    kicker: 'Our Story',
    heading: 'Discover Sant RLD',
    subheading: 'Knowledge · Discipline · Character Since 2005',
    body: 'Sant RLD Public School has been shaping young minds since 2005. Affiliated to CBSE, we offer a nurturing environment where every child can discover their potential through quality education and strong values. Our dedicated faculty and well-equipped facilities prepare students not just for exams, but for life.',
    image: '', // drop file → public/schools/santrldpublicschool.com/story.jpg then set '/schools/santrldpublicschool.com/story.jpg'
  },

  // ---- Principal's Message -----------------------------------------------
  principal: {
    name: 'Principal Name', // TODO: confirm real name
    designation: 'Principal, Sant RLD Public School',
    message: 'At Sant RLD Public School, we believe that education is a journey of discovery. We are committed to nurturing every child\'s unique strengths, building character, and inspiring a lifelong love of learning. Together, we are shaping the confident, compassionate leaders of tomorrow.',
    photo: '/schools/santrldpublicschool.com/principal.jpeg',
  },

  // ---- Google Maps embed -------------------------------------------------
  mapEmbed: '', // TODO: paste Maps → Share → Embed src URL here

  // ---- Quick-access boxes (Sant RLD specific) ----------------------------
  quickAccess: [
    { label: 'Photo Gallery',     icon: '🖼️', href: '/gallery', color: '#FF5656' },
    { label: 'Academic Calendar', icon: '📅', href: '#',        color: '#FFA239' },
    { label: 'Syllabus',          icon: '📚', href: '#',        color: '#FEEE91' },
    { label: 'Achievements',      icon: '🏆', href: '#',        color: '#8CE4FF' },
    { label: 'Online Fee',        icon: '💳', href: '#',        color: '#FF5656' },
  ],

  // ---- Birthday ticker ---------------------------------------------------
  showBirthdays: true,
};

export default santrld;
