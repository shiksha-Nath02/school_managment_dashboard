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
  layout: 'classic',
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
  },

  // Programs, facilities, gallery layout inherited from DEFAULT — refine later.

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
