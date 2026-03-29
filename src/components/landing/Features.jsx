const FEATURES = [
  {
    icon: '🎓',
    bg: 'bg-brand-50 text-brand-500',
    title: 'Student Management',
    desc: 'Track profiles, attendance, results, and fee payments. Students can view everything from their own portal.',
  },
  {
    icon: '📚',
    bg: 'bg-teacher-50 text-teacher-500',
    title: 'Teacher Portal',
    desc: 'Manage timetables, upload attendance and marks, and view class data — all from one dashboard.',
  },
  {
    icon: '⚙️',
    bg: 'bg-student-50 text-student-500',
    title: 'Admin Control',
    desc: 'Complete oversight of fees, salaries, inventory, and profits. Add or remove students and staff with ease.',
  },
  {
    icon: '💰',
    bg: 'bg-gold-light text-gold',
    title: 'Fee Management',
    desc: 'Individual fees, dues tracking, discounts, class-wise reports, and online payment support.',
  },
  {
    icon: '📦',
    bg: 'bg-purple-50 text-purple-600',
    title: 'Inventory Tracking',
    desc: 'Monitor uniforms, books, stationery, and pantry supplies. Know your stock at all times.',
  },
  {
    icon: '📈',
    bg: 'bg-blue-50 text-blue-600',
    title: 'Profit & Reports',
    desc: 'Real-time profit tracking across all revenue and expense categories. Export detailed reports.',
  },
];

export default function Features() {
  return (
    <section id="features" className="py-20 px-6 md:px-12 max-w-7xl mx-auto">
      <div className="text-center mb-12 animate-fade-up animate-start">
        <h2 className="font-display text-4xl font-bold tracking-tight mb-3">
          Everything you need
        </h2>
        <p className="text-gray-500 text-lg max-w-md mx-auto">
          Built for schools of all sizes. Powerful, yet simple.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {FEATURES.map((f, i) => (
          <div
            key={f.title}
            className={`bg-white border border-gray-200/80 rounded-2xl p-8 hover:-translate-y-1 hover:shadow-card transition-all cursor-default animate-fade-up animate-start`}
            style={{ animationDelay: `${(i + 1) * 100}ms` }}
          >
            <div className={`w-13 h-13 w-[52px] h-[52px] rounded-[14px] flex items-center justify-center text-2xl mb-5 ${f.bg}`}>
              {f.icon}
            </div>
            <h3 className="font-display font-bold text-base mb-2">{f.title}</h3>
            <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
