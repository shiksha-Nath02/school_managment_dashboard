import { useState, useEffect } from 'react';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  XCircle,
  Loader2,
  TrendingUp,
  CalendarDays,
  UserCheck,
  UserX,
  BarChart3,
} from 'lucide-react';
import { getMyAttendance, getAttendanceSummary } from '@/services/attendanceService';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function StudentAttendance() {
  const now = new Date();
  const [currentMonth, setCurrentMonth] = useState(now.getMonth() + 1); // 1-indexed
  const [currentYear, setCurrentYear] = useState(now.getFullYear());
  const [records, setRecords] = useState([]);
  const [stats, setStats] = useState(null);
  const [summary, setSummary] = useState(null);
  const [studentInfo, setStudentInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('calendar'); // 'calendar' | 'summary'

  useEffect(() => {
    fetchAttendance();
  }, [currentMonth, currentYear]);

  useEffect(() => {
    fetchSummary();
  }, [currentYear]);

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      const res = await getMyAttendance(currentMonth, currentYear);
      setRecords(res.data.records || []);
      setStats(res.data.stats || null);
      setStudentInfo(res.data.student || null);
    } catch (err) {
      console.error('Failed to fetch attendance:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSummary = async () => {
    try {
      const res = await getAttendanceSummary(currentYear);
      setSummary(res.data);
    } catch (err) {
      console.error('Failed to fetch summary:', err);
    }
  };

  const goToPrevMonth = () => {
    if (currentMonth === 1) {
      setCurrentMonth(12);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const goToNextMonth = () => {
    const isCurrentMonth =
      currentMonth === now.getMonth() + 1 && currentYear === now.getFullYear();
    if (isCurrentMonth) return; // can't go to future

    if (currentMonth === 12) {
      setCurrentMonth(1);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  // Build calendar grid
  const buildCalendarDays = () => {
    const firstDay = new Date(currentYear, currentMonth - 1, 1).getDay();
    const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();

    // Map records by date for quick lookup
    const recordMap = {};
    records.forEach((r) => {
      const day = new Date(r.date).getDate();
      recordMap[day] = r.status;
    });

    const cells = [];

    // Empty cells before first day
    for (let i = 0; i < firstDay; i++) {
      cells.push({ day: null, status: null });
    }

    // Day cells
    for (let d = 1; d <= daysInMonth; d++) {
      const dateObj = new Date(currentYear, currentMonth - 1, d);
      const isSunday = dateObj.getDay() === 0;
      const isFuture = dateObj > now;
      cells.push({
        day: d,
        status: recordMap[d] || null,
        isSunday,
        isFuture,
      });
    }

    return cells;
  };

  const calendarCells = buildCalendarDays();

  // Attendance percentage color
  const getPercentageColor = (pct) => {
    if (pct >= 90) return 'text-emerald-600';
    if (pct >= 75) return 'text-amber-600';
    return 'text-red-600';
  };

  const getPercentageBg = (pct) => {
    if (pct >= 90) return 'bg-emerald-50 border-emerald-200';
    if (pct >= 75) return 'bg-amber-50 border-amber-200';
    return 'bg-red-50 border-red-200';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-gray-900">
            My Attendance
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {studentInfo
              ? `${studentInfo.name} • ${studentInfo.className} • Roll #${studentInfo.rollNumber}`
              : 'View your attendance record'}
          </p>
        </div>

        {/* View Toggle */}
        <div className="flex items-center bg-gray-100 rounded-xl p-1">
          <button
            onClick={() => setView('calendar')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              view === 'calendar'
                ? 'bg-white text-student-primary shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <CalendarDays className="w-4 h-4" /> Calendar
          </button>
          <button
            onClick={() => setView('summary')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              view === 'summary'
                ? 'bg-white text-student-primary shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <BarChart3 className="w-4 h-4" /> Summary
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            icon={CalendarDays}
            label="Total Days"
            value={stats.totalDays}
            color="bg-student-light text-student-primary"
          />
          <StatCard
            icon={UserCheck}
            label="Present"
            value={stats.presentDays}
            color="bg-emerald-50 text-emerald-600"
          />
          <StatCard
            icon={UserX}
            label="Absent"
            value={stats.absentDays}
            color="bg-red-50 text-red-500"
          />
          <StatCard
            icon={TrendingUp}
            label="Attendance %"
            value={`${stats.percentage}%`}
            color={getPercentageBg(stats.percentage)}
            valueColor={getPercentageColor(stats.percentage)}
          />
        </div>
      )}

      {/* Calendar View */}
      {view === 'calendar' && (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          {/* Month Navigation */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <button
              onClick={goToPrevMonth}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
            <h2 className="text-lg font-display font-bold text-gray-900">
              {MONTH_NAMES[currentMonth - 1]} {currentYear}
            </h2>
            <button
              onClick={goToNextMonth}
              disabled={
                currentMonth === now.getMonth() + 1 &&
                currentYear === now.getFullYear()
              }
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          {loading ? (
            <div className="p-12 flex flex-col items-center gap-3">
              <Loader2 className="w-8 h-8 text-student-primary animate-spin" />
              <p className="text-sm text-gray-400">Loading attendance...</p>
            </div>
          ) : (
            <div className="p-6">
              {/* Day Headers */}
              <div className="grid grid-cols-7 gap-2 mb-2">
                {DAY_LABELS.map((d) => (
                  <div
                    key={d}
                    className="text-center text-xs font-semibold text-gray-400 uppercase tracking-wider py-1"
                  >
                    {d}
                  </div>
                ))}
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-2">
                {calendarCells.map((cell, idx) => (
                  <div
                    key={idx}
                    className={`aspect-square rounded-xl flex flex-col items-center justify-center text-sm transition-all ${
                      !cell.day
                        ? ''
                        : cell.isFuture
                          ? 'bg-gray-50 text-gray-300'
                          : cell.status === 'present'
                            ? 'bg-emerald-50 border border-emerald-200 text-emerald-700'
                            : cell.status === 'absent'
                              ? 'bg-red-50 border border-red-200 text-red-600'
                              : cell.isSunday
                                ? 'bg-gray-50 text-gray-400'
                                : 'bg-gray-50/50 text-gray-400'
                    }`}
                  >
                    {cell.day && (
                      <>
                        <span className="font-semibold text-sm">{cell.day}</span>
                        {cell.status === 'present' && (
                          <CheckCircle2 className="w-3.5 h-3.5 mt-0.5 text-emerald-500" />
                        )}
                        {cell.status === 'absent' && (
                          <XCircle className="w-3.5 h-3.5 mt-0.5 text-red-400" />
                        )}
                        {!cell.status && cell.isSunday && (
                          <span className="text-[10px] text-gray-400 mt-0.5">Off</span>
                        )}
                      </>
                    )}
                  </div>
                ))}
              </div>

              {/* Legend */}
              <div className="flex items-center justify-center gap-6 mt-6 pt-4 border-t border-gray-100">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span className="w-3 h-3 rounded-full bg-emerald-400" /> Present
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span className="w-3 h-3 rounded-full bg-red-400" /> Absent
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span className="w-3 h-3 rounded bg-gray-200" /> No Record
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Summary View */}
      {view === 'summary' && summary && (
        <div className="space-y-4">
          {/* Overall Stats Card */}
          <div
            className={`bg-white rounded-2xl border border-gray-200 p-6 flex items-center justify-between`}
          >
            <div>
              <p className="text-sm text-gray-500 font-medium">
                Overall Attendance — {summary.year}
              </p>
              <p
                className={`text-4xl font-display font-bold mt-1 ${getPercentageColor(
                  summary.overall.percentage
                )}`}
              >
                {summary.overall.percentage}%
              </p>
              <p className="text-xs text-gray-400 mt-1">
                {summary.overall.presentDays} present out of{' '}
                {summary.overall.totalDays} days
              </p>
            </div>
            <div className="hidden sm:block">
              <div
                className={`w-20 h-20 rounded-full border-4 flex items-center justify-center ${
                  summary.overall.percentage >= 75
                    ? 'border-emerald-400'
                    : 'border-red-400'
                }`}
              >
                <span
                  className={`text-lg font-bold ${getPercentageColor(
                    summary.overall.percentage
                  )}`}
                >
                  {summary.overall.percentage}%
                </span>
              </div>
            </div>
          </div>

          {/* Monthly Breakdown */}
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-display font-bold text-gray-900">
                Monthly Breakdown
              </h2>
            </div>

            <div className="divide-y divide-gray-100">
              {Object.values(summary.monthlyBreakdown).length === 0 ? (
                <div className="p-8 text-center text-gray-400 text-sm">
                  No attendance data available for {summary.year}
                </div>
              ) : (
                Object.values(summary.monthlyBreakdown).map((m) => (
                  <div
                    key={m.month}
                    className="px-6 py-4 flex items-center justify-between hover:bg-gray-50/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-student-light flex items-center justify-center">
                        <span className="text-sm font-bold text-student-primary">
                          {MONTH_NAMES[m.month - 1].slice(0, 3)}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">
                          {MONTH_NAMES[m.month - 1]}
                        </p>
                        <p className="text-xs text-gray-400">
                          {m.present}P / {m.absent}A — {m.totalDays} days
                        </p>
                      </div>
                    </div>

                    {/* Percentage Bar */}
                    <div className="flex items-center gap-3">
                      <div className="w-32 h-2 bg-gray-100 rounded-full overflow-hidden hidden sm:block">
                        <div
                          className={`h-full rounded-full transition-all ${
                            m.percentage >= 90
                              ? 'bg-emerald-400'
                              : m.percentage >= 75
                                ? 'bg-amber-400'
                                : 'bg-red-400'
                          }`}
                          style={{ width: `${m.percentage}%` }}
                        />
                      </div>
                      <span
                        className={`text-sm font-bold tabular-nums ${getPercentageColor(
                          m.percentage
                        )}`}
                      >
                        {m.percentage}%
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Reusable stat card component
function StatCard({ icon: Icon, label, value, color, valueColor }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-4">
      <div className={`w-9 h-9 rounded-xl ${color} flex items-center justify-center mb-3`}>
        <Icon className="w-4.5 h-4.5" />
      </div>
      <p className="text-xs text-gray-500 font-medium">{label}</p>
      <p className={`text-xl font-display font-bold mt-0.5 ${valueColor || 'text-gray-900'}`}>
        {value}
      </p>
    </div>
  );
}