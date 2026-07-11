import { useEffect, useState } from 'react';
import dashboardService from '../../services/dashboardService';
import { useAuth } from '../../contexts/AuthContext';

// ₹ formatting — compact lakhs for large amounts, plain for small.
function formatCurrency(value) {
  const n = Number(value) || 0;
  if (Math.abs(n) >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
  return `₹${n.toLocaleString('en-IN')}`;
}

const PAYMENT_BADGE = {
  Paid: 'bg-green-50 text-green-600',
  Partial: 'bg-orange-50 text-orange-600',
  Due: 'bg-red-50 text-red-600',
};

const ATTENDANCE_BADGE = {
  present: 'bg-green-50 text-green-600',
  late: 'bg-orange-50 text-orange-600',
  half_day: 'bg-orange-50 text-orange-600',
  absent: 'bg-red-50 text-red-600',
  leave: 'bg-gray-100 text-gray-500',
};

export default function AdminDashboard() {
  const { user } = useAuth();
  // Only superadmin sees money figures; a regular admin sees counts only.
  const showMoney = user?.role === 'superadmin';
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await dashboardService.getAdminDashboard();
        if (active) setData(res);
      } catch (err) {
        if (active) setError(err.response?.data?.message || 'Failed to load dashboard');
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, []);

  const stats = data?.stats;
  const cards = [
    { icon: '🎓', val: stats ? stats.totalStudents.toLocaleString('en-IN') : '—', label: 'Total Students', bg: 'bg-student-50 text-student-500' },
    { icon: '📚', val: stats ? stats.totalTeachers.toLocaleString('en-IN') : '—', label: 'Total Teachers', bg: 'bg-teacher-50 text-teacher-500' },
    // Money cards are superadmin-only.
    ...(showMoney ? [
      { icon: '💰', val: stats ? formatCurrency(stats.feeCollectedMonth) : '—', label: 'Fee Collected (Month)', bg: 'bg-gold-light text-gold' },
      { icon: '📈', val: stats ? formatCurrency(stats.netProfitMonth) : '—', label: 'Net Profit (Month)', bg: 'bg-green-50 text-green-600' },
    ] : []),
  ];

  return (
    <div className="animate-fade-up animate-start">
      <h1 className="font-display text-2xl font-bold tracking-tight mb-6">Dashboard</h1>

      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {cards.map((s) => (
          <div key={s.label} className="bg-white border border-gray-200/80 rounded-xl p-6 hover:-translate-y-0.5 hover:shadow-soft transition-all">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-lg mb-4 ${s.bg}`}>
              {s.icon}
            </div>
            <h3 className="font-display text-2xl font-bold">{loading ? '…' : s.val}</h3>
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
                  {showMoney && <th className="text-left text-[11px] font-bold uppercase tracking-wide text-gray-300 pb-3">Amount</th>}
                  <th className="text-left text-[11px] font-bold uppercase tracking-wide text-gray-300 pb-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loading ? (
                  <tr><td colSpan={showMoney ? 3 : 2} className="py-6 text-center text-sm text-gray-400">Loading…</td></tr>
                ) : !data?.recentPayments?.length ? (
                  <tr><td colSpan={showMoney ? 3 : 2} className="py-6 text-center text-sm text-gray-400">No recent payments</td></tr>
                ) : (
                  data.recentPayments.map((r) => (
                    <tr key={r.id} className="hover:bg-surface-alt/50 transition-colors">
                      <td className="py-3.5 text-sm font-medium">{r.name}</td>
                      {showMoney && <td className="py-3.5 text-sm text-gray-500">{formatCurrency(r.amount)}</td>}
                      <td className="py-3.5">
                        <span className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-semibold ${PAYMENT_BADGE[r.status] || 'bg-gray-100 text-gray-500'}`}>
                          {r.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
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
                  <th className="text-left text-[11px] font-bold uppercase tracking-wide text-gray-300 pb-3">Check-in</th>
                  <th className="text-left text-[11px] font-bold uppercase tracking-wide text-gray-300 pb-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loading ? (
                  <tr><td colSpan={3} className="py-6 text-center text-sm text-gray-400">Loading…</td></tr>
                ) : !data?.teacherAttendanceToday?.length ? (
                  <tr><td colSpan={3} className="py-6 text-center text-sm text-gray-400">No attendance marked today</td></tr>
                ) : (
                  data.teacherAttendanceToday.map((r) => (
                    <tr key={r.id} className="hover:bg-surface-alt/50 transition-colors">
                      <td className="py-3.5 text-sm font-medium">{r.name}</td>
                      <td className="py-3.5 text-sm text-gray-500">{r.checkInTime ? r.checkInTime.slice(0, 5) : '—'}</td>
                      <td className="py-3.5">
                        <span className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-semibold capitalize ${ATTENDANCE_BADGE[r.status] || 'bg-gray-100 text-gray-500'}`}>
                          {r.status?.replace('_', ' ')}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
