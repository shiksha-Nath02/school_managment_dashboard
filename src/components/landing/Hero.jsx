import { Link } from 'react-router-dom';

export default function Hero() {
  return (
    <section className="pt-40 pb-20 px-6 md:px-12 max-w-7xl mx-auto grid md:grid-cols-2 gap-16 items-center min-h-[90vh]">
      {/* Left — Text */}
      <div>
        <h1 className="font-display text-5xl md:text-6xl font-extrabold leading-[1.08] tracking-tight text-gray-900 mb-5 animate-fade-up animate-start">
          Manage your{' '}
          <span className="bg-gradient-to-r from-brand-500 to-teacher-500 bg-clip-text text-transparent">
            school
          </span>{' '}
          with ease
        </h1>
        <p className="text-lg text-gray-500 leading-relaxed mb-9 max-w-md animate-fade-up animate-start delay-200">
          A complete platform for admins, teachers, and students. Track attendance,
          manage fees, upload results, and more — all in one place.
        </p>
        <div className="flex gap-3.5 animate-fade-up animate-start delay-300">
          <Link
            to="/login"
            className="bg-brand-500 text-white px-8 py-3.5 rounded-full font-semibold hover:shadow-card transition-all hover:-translate-y-0.5 flex items-center gap-2"
          >
            Get Started →
          </Link>
          <a
            href="#features"
            className="border-2 border-gray-200 text-gray-900 px-8 py-3.5 rounded-full font-semibold hover:border-gray-400 transition-all"
          >
            Learn More
          </a>
        </div>
      </div>

      {/* Right — Floating Card */}
      <div className="relative hidden md:flex justify-center animate-fade-up animate-start delay-400">
        <div className="w-96 bg-white rounded-2xl p-8 shadow-elevated border border-gray-100 animate-float">
          {/* Student Preview Card */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-full bg-student-50 flex items-center justify-center font-bold text-student-500">
              RS
            </div>
            <div>
              <h4 className="font-semibold text-sm">Rahul Sharma</h4>
              <p className="text-xs text-gray-400">Class 10-A · Roll No. 14</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { val: '92%', label: 'Attendance' },
              { val: 'A+', label: 'Last Grade' },
              { val: '₹0', label: 'Dues' },
              { val: '6', label: 'Subjects' },
            ].map((s) => (
              <div key={s.label} className="bg-surface-alt rounded-xl p-4 text-center">
                <div className="font-display text-2xl font-bold text-brand-500">{s.val}</div>
                <div className="text-xs text-gray-400 mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Mini floating badge */}
        <div className="absolute -top-5 -right-10 w-48 bg-white rounded-xl p-4 shadow-card border border-gray-100 animate-float" style={{ animationDelay: '1s' }}>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-gold-light text-gold flex items-center justify-center text-sm">
              📊
            </div>
            <div>
              <div className="font-bold text-sm">1,240</div>
              <div className="text-[11px] text-gray-400">Students Enrolled</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
