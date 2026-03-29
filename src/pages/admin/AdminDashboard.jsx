export default function AdminDashboard() {
  return (
    <div className="animate-fade-up animate-start">
      <h1 className="font-display text-2xl font-bold tracking-tight mb-6">Dashboard</h1>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { icon: '🎓', val: '1,240', label: 'Total Students', bg: 'bg-student-50 text-student-500' },
          { icon: '📚', val: '68', label: 'Total Teachers', bg: 'bg-teacher-50 text-teacher-500' },
          { icon: '💰', val: '₹24.5L', label: 'Fee Collected (Month)', bg: 'bg-gold-light text-gold' },
          { icon: '📈', val: '₹8.2L', label: 'Net Profit (Month)', bg: 'bg-green-50 text-green-600' },
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

      {/* Two-column tables */}
      <div className="grid lg:grid-cols-2 gap-5">
        {/* Recent Fee Payments */}
        <div className="bg-white border border-gray-200/80 rounded-xl p-7">
          <h3 className="font-display font-bold text-base mb-5">Recent Fee Payments</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left text-[11px] font-bold uppercase tracking-wide text-gray-300 pb-3">Student</th>
                  <th className="text-left text-[11px] font-bold uppercase tracking-wide text-gray-300 pb-3">Amount</th>
                  <th className="text-left text-[11px] font-bold uppercase tracking-wide text-gray-300 pb-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {[
                  { name: 'Ananya Singh', amount: '₹12,500', status: 'Paid', badge: 'bg-green-50 text-green-600' },
                  { name: 'Rohit Kumar', amount: '₹8,000', status: 'Partial', badge: 'bg-orange-50 text-orange-600' },
                  { name: 'Meera Patel', amount: '₹12,500', status: 'Paid', badge: 'bg-green-50 text-green-600' },
                  { name: 'Arjun Rao', amount: '₹0', status: 'Due', badge: 'bg-red-50 text-red-600' },
                ].map((r) => (
                  <tr key={r.name} className="hover:bg-surface-alt/50 transition-colors">
                    <td className="py-3.5 text-sm font-medium">{r.name}</td>
                    <td className="py-3.5 text-sm text-gray-500">{r.amount}</td>
                    <td className="py-3.5">
                      <span className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-semibold ${r.badge}`}>
                        {r.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Teacher Attendance */}
        <div className="bg-white border border-gray-200/80 rounded-xl p-7">
          <h3 className="font-display font-bold text-base mb-5">Teacher Attendance Today</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left text-[11px] font-bold uppercase tracking-wide text-gray-300 pb-3">Teacher</th>
                  <th className="text-left text-[11px] font-bold uppercase tracking-wide text-gray-300 pb-3">Subject</th>
                  <th className="text-left text-[11px] font-bold uppercase tracking-wide text-gray-300 pb-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {[
                  { name: 'Mrs. Priya Gupta', subject: 'Maths', status: 'Present', badge: 'bg-green-50 text-green-600' },
                  { name: 'Mr. Amit Verma', subject: 'Science', status: 'Present', badge: 'bg-green-50 text-green-600' },
                  { name: 'Ms. Neha Singh', subject: 'English', status: 'Absent', badge: 'bg-red-50 text-red-600' },
                  { name: 'Mr. Raj Malhotra', subject: 'Hindi', status: 'Present', badge: 'bg-green-50 text-green-600' },
                ].map((r) => (
                  <tr key={r.name} className="hover:bg-surface-alt/50 transition-colors">
                    <td className="py-3.5 text-sm font-medium">{r.name}</td>
                    <td className="py-3.5 text-sm text-gray-500">{r.subject}</td>
                    <td className="py-3.5">
                      <span className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-semibold ${r.badge}`}>
                        {r.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
