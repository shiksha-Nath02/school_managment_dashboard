import { useState, useEffect } from 'react';
import { Clock, CheckCircle2, AlertCircle, Loader2, CalendarDays } from 'lucide-react';
import svc from '@/services/teacherAttendanceService';

const STATUS_CONFIG = {
  present:       { label: 'Present',      cls: 'bg-emerald-100 text-emerald-700', dot: 'bg-emerald-500' },
  late:          { label: 'Late',          cls: 'bg-amber-100 text-amber-700',    dot: 'bg-amber-500' },
  absent:        { label: 'Absent',        cls: 'bg-red-100 text-red-600',         dot: 'bg-red-500' },
  half_day:      { label: 'Half Day',      cls: 'bg-orange-100 text-orange-700',   dot: 'bg-orange-500' },
  on_leave:      { label: 'On Leave',      cls: 'bg-blue-100 text-blue-700',       dot: 'bg-blue-500' },
  official_duty: { label: 'Official Duty', cls: 'bg-purple-100 text-purple-700',   dot: 'bg-purple-500' },
};

const LEAVE_LABELS = { casual: 'Casual Leave', sick: 'Sick Leave', earned: 'Earned Leave', unpaid: 'Unpaid Leave' };

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

const formatTime = (t) => {
  if (!t) return null;
  const [h, m] = t.split(':');
  const hr = parseInt(h);
  return `${hr % 12 || 12}:${m} ${hr >= 12 ? 'PM' : 'AM'}`;
};

const formatDate = (d) =>
  new Date(d + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });

export default function TeacherMyAttendance() {
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [clock, setClock] = useState(new Date());

  // Live clock
  useEffect(() => {
    const t = setInterval(() => setClock(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    setLoading(true);
    svc.getMyAttendance(selectedMonth, selectedYear)
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [selectedMonth, selectedYear]);

  const yearOptions = Array.from({ length: 3 }, (_, i) => now.getFullYear() - i);

  const today = data?.todayRecord || null;
  const records = data?.records || [];

  // Monthly summary counts
  const counts = records.reduce((acc, r) => {
    acc[r.status] = (acc[r.status] || 0) + 1;
    return acc;
  }, {});

  const clockStr = clock.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const dateStr = now.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <div className="space-y-6 animate-fade-up animate-start">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-display font-bold text-gray-900">My Attendance</h1>
          <p className="text-sm text-gray-500 mt-0.5">{dateStr}</p>
        </div>
        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-4 py-2 text-sm font-mono font-semibold text-gray-700 self-start">
          <Clock className="w-4 h-4 text-teacher-500" />
          {clockStr}
        </div>
      </div>

      {/* Today's Card */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-4">Today</p>

        {loading ? (
          <div className="flex justify-center py-6">
            <Loader2 className="w-6 h-6 text-teacher-500 animate-spin" />
          </div>
        ) : !today ? (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-gray-50 border border-dashed border-gray-200">
            <AlertCircle className="w-5 h-5 text-gray-300 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-gray-500">Not yet marked</p>
              <p className="text-xs text-gray-400">Your attendance for today hasn't been recorded yet</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Status */}
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${STATUS_CONFIG[today.status]?.cls || 'bg-gray-100 text-gray-600'}`}>
                {STATUS_CONFIG[today.status]?.label || today.status}
              </span>
              {today.leaveType && (
                <span className="text-xs text-gray-400">({LEAVE_LABELS[today.leaveType] || today.leaveType})</span>
              )}
            </div>

            {/* Times */}
            <div className="grid grid-cols-2 gap-4">
              <div className={`rounded-xl px-4 py-3 ${today.checkInTime ? 'bg-emerald-50' : 'bg-gray-50'}`}>
                <p className="text-xs font-medium text-gray-400 mb-1">Check In</p>
                {today.checkInTime ? (
                  <p className="text-xl font-bold font-mono text-emerald-700">{formatTime(today.checkInTime)}</p>
                ) : (
                  <p className="text-sm text-gray-300">—</p>
                )}
              </div>
              <div className={`rounded-xl px-4 py-3 ${today.checkOutTime ? 'bg-amber-50' : 'bg-gray-50'}`}>
                <p className="text-xs font-medium text-gray-400 mb-1">Check Out</p>
                {today.checkOutTime ? (
                  <p className="text-xl font-bold font-mono text-amber-700">{formatTime(today.checkOutTime)}</p>
                ) : (
                  <p className="text-sm text-gray-300">—</p>
                )}
              </div>
            </div>

            {today.remarks && (
              <p className="text-xs text-gray-500 bg-gray-50 rounded-lg px-3 py-2">
                <span className="font-semibold">Remark:</span> {today.remarks}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Monthly summary + history */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        {/* Controls */}
        <div className="px-6 py-4 border-b border-gray-100 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <CalendarDays className="w-4 h-4 text-gray-400" />
            <span className="font-display font-bold text-gray-900">Monthly History</span>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 text-sm font-medium text-gray-700 focus:outline-none focus:border-teacher-500"
            >
              {MONTHS.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
            </select>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 text-sm font-medium text-gray-700 focus:outline-none focus:border-teacher-500"
            >
              {yearOptions.map((y) => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
        </div>

        {/* Summary chips */}
        {!loading && records.length > 0 && (
          <div className="px-6 py-3 bg-gray-50/50 border-b border-gray-100 flex flex-wrap gap-3">
            {Object.entries(STATUS_CONFIG).map(([key, cfg]) =>
              counts[key] ? (
                <div key={key} className="flex items-center gap-1.5 text-xs font-medium text-gray-600">
                  <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                  {cfg.label}: <span className="font-bold text-gray-900">{counts[key]}</span>
                </div>
              ) : null
            )}
            <div className="text-xs text-gray-400 ml-auto">{records.length} working days recorded</div>
          </div>
        )}

        {/* Records list */}
        {loading ? (
          <div className="p-10 flex justify-center">
            <Loader2 className="w-6 h-6 text-teacher-500 animate-spin" />
          </div>
        ) : records.length === 0 ? (
          <div className="p-10 flex flex-col items-center gap-2">
            <CalendarDays className="w-8 h-8 text-gray-200" />
            <p className="text-sm text-gray-400">No records for {MONTHS[selectedMonth - 1]} {selectedYear}</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {records.map((r) => {
              const cfg = STATUS_CONFIG[r.status] || { label: r.status, cls: 'bg-gray-100 text-gray-600', dot: 'bg-gray-400' };
              const isToday = r.date === todayStr;
              return (
                <div key={r.id} className={`flex items-center px-6 py-3.5 gap-4 ${isToday ? 'bg-teacher-50/40' : 'hover:bg-gray-50/50'} transition-colors`}>
                  <div className="w-20 flex-shrink-0">
                    <p className={`text-xs font-semibold ${isToday ? 'text-teacher-500' : 'text-gray-400'}`}>
                      {isToday ? 'Today' : formatDate(r.date)}
                    </p>
                    <p className="text-xs text-gray-300">{r.date}</p>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold flex-shrink-0 ${cfg.cls}`}>
                    {cfg.label}
                  </span>
                  <div className="flex items-center gap-4 text-xs text-gray-500 flex-1">
                    {formatTime(r.checkInTime) && (
                      <span className="flex items-center gap-1">
                        <LogInIcon /> {formatTime(r.checkInTime)}
                      </span>
                    )}
                    {formatTime(r.checkOutTime) && (
                      <span className="flex items-center gap-1">
                        <LogOutIcon /> {formatTime(r.checkOutTime)}
                      </span>
                    )}
                    {r.leaveType && <span className="text-blue-500">{LEAVE_LABELS[r.leaveType] || r.leaveType}</span>}
                  </div>
                  {r.remarks && (
                    <p className="text-xs text-gray-400 truncate max-w-[160px] hidden sm:block">{r.remarks}</p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// Tiny inline icons to avoid adding more imports
function LogInIcon() {
  return <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-500"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>;
}
function LogOutIcon() {
  return <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-amber-500"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>;
}
