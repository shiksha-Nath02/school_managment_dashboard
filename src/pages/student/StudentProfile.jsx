export default function StudentProfile() {
  return (
    <div className="animate-fade-up animate-start">
      <h1 className="font-display text-2xl font-bold tracking-tight mb-6">My Profile</h1>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { icon: '🎓', val: '10-A', label: 'Class & Section', bg: 'bg-student-50 text-student-500' },
          { icon: '📊', val: '92%', label: 'Attendance', bg: 'bg-gold-light text-gold' },
          { icon: '📝', val: '87%', label: 'Last Exam', bg: 'bg-brand-50 text-brand-500' },
          { icon: '💰', val: '₹0', label: 'Fee Dues', bg: 'bg-green-50 text-green-600' },
        ].map((s) => (
          <div key={s.label} className="bg-white border border-gray-200/80 rounded-xl p-6 hover:-translate-y-0.5 hover:shadow-soft transition-all">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-lg mb-4 ${s.bg}`}>
              {s.icon}
            </div>
            <h3 className="font-display text-2xl font-bold">{s.val}</h3>
            <p className="text-xs text-gray-400 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Info Table */}
      <div className="bg-white border border-gray-200/80 rounded-xl p-7">
        <h3 className="font-display font-bold text-base mb-5">Personal Information</h3>
        <div className="divide-y divide-gray-100">
          {[
            ['Full Name', 'Rahul Sharma'],
            ['Roll Number', '14'],
            ['Class', '10-A'],
            ['Date of Birth', '15 March 2011'],
            ['Parent/Guardian', 'Mr. Vijay Sharma'],
            ['Contact', '+91 98765 43210'],
            ['Address', '12, Sector 5, Dwarka, New Delhi'],
          ].map(([key, val]) => (
            <div key={key} className="flex py-3.5 text-sm">
              <span className="w-44 text-gray-400 flex-shrink-0">{key}</span>
              <span className="font-medium text-gray-800">{val}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
