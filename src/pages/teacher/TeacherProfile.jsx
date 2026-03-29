export default function TeacherProfile() {
  return (
    <div className="animate-fade-up animate-start">
      <h1 className="font-display text-2xl font-bold tracking-tight mb-6">My Profile</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { icon: '📚', val: 'Mathematics', label: 'Subject', bg: 'bg-teacher-50 text-teacher-500' },
          { icon: '👥', val: '120', label: 'Students', bg: 'bg-gold-light text-gold' },
          { icon: '📅', val: '4', label: 'Classes Today', bg: 'bg-brand-50 text-brand-500' },
          { icon: '✅', val: '98%', label: 'My Attendance', bg: 'bg-green-50 text-green-600' },
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

      <div className="bg-white border border-gray-200/80 rounded-xl p-7">
        <h3 className="font-display font-bold text-base mb-5">Personal Information</h3>
        <div className="divide-y divide-gray-100">
          {[
            ['Full Name', 'Mrs. Priya Gupta'],
            ['Employee ID', 'TCH-042'],
            ['Department', 'Mathematics'],
            ['Class Teacher', '10-A'],
            ['Contact', '+91 87654 32109'],
            ['Joining Date', '1 April 2019'],
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
