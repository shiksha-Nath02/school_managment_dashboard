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
  const att = data?.classAttendanceToday;
  const attPct = att && att.totalClasses ? Math.round((att.doneCount / att.totalClasses) * 100) : 0;
  const cards = [
    { icon: '🎓', val: stats ? stats.totalStudents.toLocaleString('en-IN') : '—', label: 'Total Students', bg: 'bg-student-50 text-student-500' },
    { icon: '📚', val: stats ? stats.totalTeachers.toLocaleString('en-IN') : '—', label: 'Total Teachers', bg: 'bg-teacher-50 text-teacher-500' },
    { icon: '📋', val: att ? (att.isHoliday ? 'Holiday' : `${att.doneCount}/${att.totalClasses}`) : '—', label: 'Attendance Done Today', bg: 'bg-brand-50 text-brand-500' },
    // Money cards are superadmin-only.
    ...(showMoney ? [
      { icon: '💰', val: stats ? formatCurrency(stats.feeCollectedMonth) : '—', label: 'Fee Collected (Month)', bg: 'bg-gold-light text-gold' },
      { icon: '📈', val: stats ? formatCurrency(stats.netProfitMonth) : '—', label: 'Net Profit (Month)', bg: 'bg-green-50 text-green-600' },
    ] : []),
  ];

  // Fit all stat cards on one row: 5 for superadmin, 3 for a regular admin.
  // (Static class strings so Tailwind's JIT keeps them.)
  const gridCols = cards.length >= 5 ? 'lg:grid-cols-5'
    : cards.length === 4 ? 'lg:grid-cols-4'
    : 'lg:grid-cols-3';

  return (
    <div className="animate-fade-up animate-start">
      <h1 className="font-display text-2xl font-bold tracking-tight mb-6">Dashboard</h1>

      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Stats row */}
      <div className={`grid grid-cols-2 ${gridCols} gap-3 mb-6`}>
        {cards.map((s) => (
          <div key={s.label} className="bg-white border border-gray-200/80 rounded-xl p-5 hover:-translate-y-0.5 hover:shadow-soft transition-all">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg mb-3 ${s.bg}`}>
              {s.icon}
            </div>
            <h3 className="font-display text-xl font-bold">{loading ? '…' : s.val}</h3>
            <p className="text-xs text-gray-400 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Student attendance progress today */}
      <div className="bg-white border border-gray-200/80 rounded-xl p-7 mb-6">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
          <h3 className="font-display font-bold text-base">Student Attendance Today</h3>
          {att && (
            <span className="text-sm text-gray-500">
              <span className="font-semibold text-green-600">{att.doneCount}</span> of {att.totalClasses} classes done
              {att.pendingCount > 0 && (
                <> · <span className="font-semibold text-red-500">{att.pendingCount}</span> left</>
              )}
            </span>
          )}
        </div>

        {loading ? (
          <p className="text-sm text-gray-400">Loading…</p>
        ) : !att ? (
          <p className="text-sm text-gray-400">No attendance data.</p>
        ) : att.isHoliday ? (
          <div className="rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-700">
            🎉 <span className="font-semibold">Holiday{att.holidayReason ? ` — ${att.holidayReason}` : ''}.</span>{' '}
            No attendance required today.
            {att.doneCount > 0 && ` (${att.doneCount} class${att.doneCount === 1 ? '' : 'es'} marked anyway.)`}
          </div>
        ) : (
          <>
            {/* Progress bar */}
            <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden mb-5">
              <div
                className="h-2 bg-green-500 rounded-full transition-all"
                style={{ width: `${attPct}%` }}
              />
            </div>

            <div className="space-y-4">
              {/* Done classes */}
              {att.doneCount > 0 && (
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-gray-300 mb-2">
                    ✓ Attendance done ({att.doneCount})
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {att.done.map((c) => (
                      <span
                        key={c.id}
                        className="inline-block px-2.5 py-1 rounded-lg text-[13px] font-medium bg-green-50 text-green-600"
                      >
                        {c.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Pending classes */}
              {att.pendingCount === 0 ? (
                <p className="text-sm text-green-600 font-medium">🎉 All classes have marked attendance today.</p>
              ) : (
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-gray-300 mb-2">
                    Pending ({att.pendingCount})
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {att.pending.map((c) => (
                      <span
                        key={c.id}
                        className="inline-block px-2.5 py-1 rounded-lg text-[13px] font-medium bg-red-50 text-red-600"
                      >
                        {c.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </>
        )}
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
