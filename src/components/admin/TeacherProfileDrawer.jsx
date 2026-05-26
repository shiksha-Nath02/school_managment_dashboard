import { useState, useEffect } from 'react';
import {
  X, User, Calendar, BookOpen, IndianRupee,
  Loader2, AlertCircle, GraduationCap, Users,
} from 'lucide-react';
import teacherService from '../../services/teacherService';

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAY_ORDER = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const TABS = [
  { key: 'info',       label: 'Info',       Icon: User },
  { key: 'attendance', label: 'Attendance', Icon: Calendar },
  { key: 'classes',    label: 'Classes',    Icon: BookOpen },
  { key: 'salary',     label: 'Salary',     Icon: IndianRupee },
];

const STATUS_STYLE = {
  present:      'bg-emerald-100 text-emerald-700',
  late:         'bg-amber-100  text-amber-700',
  half_day:     'bg-yellow-100 text-yellow-700',
  absent:       'bg-red-100    text-red-600',
  on_leave:     'bg-blue-100   text-blue-700',
  official_duty:'bg-purple-100 text-purple-700',
};

function money(n) { return `₹${Number(n || 0).toLocaleString('en-IN')}`; }

// ── Info tab ─────────────────────────────────────────────────────────────────

function InfoTab({ teacher }) {
  const u = teacher.user || {};
  const rows = [
    ['Full name',    u.name],
    ['Email',        u.email],
    ['Phone',        u.phone || '—'],
    ['Subject',      teacher.subject || '—'],
    ['Monthly salary', teacher.salary ? money(teacher.salary) : '—'],
    ['Joining date', teacher.joining_date
      ? new Date(teacher.joining_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
      : '—'],
    ['Status', teacher.user?.is_active !== false ? 'Active' : 'Inactive'],
  ];
  return (
    <dl className="divide-y divide-gray-100">
      {rows.map(([label, val]) => (
        <div key={label} className="flex items-start gap-4 py-3">
          <dt className="w-36 shrink-0 text-xs font-semibold text-gray-400 uppercase tracking-wide">{label}</dt>
          <dd className="text-sm text-gray-800 font-medium">{val ?? '—'}</dd>
        </div>
      ))}
    </dl>
  );
}

// ── Attendance tab ────────────────────────────────────────────────────────────

function AttendanceTab({ teacherId }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [year, setYear] = useState(new Date().getFullYear());

  useEffect(() => {
    setLoading(true);
    teacherService.getTeacherAttendance(teacherId, { year })
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [teacherId, year]);

  if (loading) return <Spinner />;
  if (!data) return <ErrorMsg msg="Failed to load attendance" />;

  const { counts = {}, monthlyBreakdown = {}, totalDays, percentage } = data;

  const summaryItems = [
    { label: 'Present',       val: counts.present       || 0, cls: 'bg-emerald-50 text-emerald-700' },
    { label: 'Late',          val: counts.late          || 0, cls: 'bg-amber-50  text-amber-700' },
    { label: 'Half day',      val: counts.half_day      || 0, cls: 'bg-yellow-50 text-yellow-700' },
    { label: 'Absent',        val: counts.absent        || 0, cls: 'bg-red-50    text-red-600' },
    { label: 'On leave',      val: counts.on_leave      || 0, cls: 'bg-blue-50   text-blue-700' },
    { label: 'Official duty', val: counts.official_duty || 0, cls: 'bg-purple-50 text-purple-700' },
  ];

  return (
    <div className="space-y-5">
      {/* Year selector + overall % */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {[year - 1, year, year + 1].filter(y => y <= new Date().getFullYear()).map(y => (
            <button
              key={y}
              onClick={() => setYear(y)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${y === year ? 'bg-brand-500 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
            >
              {y}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold text-gray-900">{percentage ?? 0}%</span>
          <span className="text-xs text-gray-400">effective attendance</span>
        </div>
      </div>

      {/* Status summary grid */}
      <div className="grid grid-cols-3 gap-2">
        {summaryItems.map(({ label, val, cls }) => (
          <div key={label} className={`${cls} rounded-xl p-3 text-center`}>
            <p className="text-lg font-bold">{val}</p>
            <p className="text-[11px] font-semibold mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Monthly grid */}
      <div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Monthly breakdown</p>
        <div className="grid grid-cols-6 gap-2">
          {Object.entries(monthlyBreakdown).map(([m, stats]) => {
            const effective = (stats.present || 0) + (stats.late || 0) + (stats.half_day || 0) + (stats.official_duty || 0);
            const pctVal = stats.total ? Math.round((effective / stats.total) * 100) : null;
            const color = pctVal === null ? 'bg-gray-100 text-gray-400'
              : pctVal >= 75 ? 'bg-emerald-100 text-emerald-700'
              : pctVal >= 50 ? 'bg-amber-100 text-amber-700'
              : 'bg-red-100 text-red-600';
            return (
              <div key={m} className={`${color} rounded-lg p-2 text-center`}>
                <p className="text-[10px] font-semibold">{MONTH_NAMES[parseInt(m) - 1]}</p>
                <p className="text-sm font-bold mt-0.5">{pctVal !== null ? `${pctVal}%` : '—'}</p>
                <p className="text-[10px] mt-0.5">{stats.total || 0}d</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── Classes tab ───────────────────────────────────────────────────────────────

function ClassesTab({ teacherId }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    teacherService.getTeacherClasses(teacherId)
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [teacherId]);

  if (loading) return <Spinner />;
  if (!data) return <ErrorMsg msg="Failed to load classes" />;

  const noHome = !data.homeClasses?.length;
  const noTimetable = !data.timetableClasses?.length;

  return (
    <div className="space-y-6">
      {/* Home room classes */}
      <div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Class teacher of</p>
        {noHome ? (
          <p className="text-sm text-gray-400 italic">Not assigned as class teacher</p>
        ) : (
          <div className="space-y-2">
            {data.homeClasses.map((c) => (
              <div key={c.id} className="flex items-center gap-3 bg-brand-50 border border-brand-100 rounded-xl px-4 py-3">
                <GraduationCap className="w-4 h-4 text-brand-500 shrink-0" />
                <p className="font-semibold text-gray-800 flex-1">{c.className}</p>
                <div className="flex items-center gap-1 text-xs text-gray-400">
                  <Users className="w-3 h-3" /> {c.studentCount} students
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Timetable teaching assignments */}
      <div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Teaching periods</p>
        {noTimetable ? (
          <p className="text-sm text-gray-400 italic">No timetable entries found</p>
        ) : (
          <div className="space-y-4">
            {data.timetableClasses.map((tc) => {
              const byDay = {};
              for (const p of tc.periods) {
                if (!byDay[p.day]) byDay[p.day] = [];
                byDay[p.day].push(p);
              }
              return (
                <div key={tc.classId} className="border border-gray-200 rounded-xl overflow-hidden">
                  <div className="bg-gray-50 px-4 py-2.5 border-b border-gray-100">
                    <p className="text-sm font-bold text-gray-800">{tc.className}</p>
                  </div>
                  <div className="divide-y divide-gray-50">
                    {DAY_ORDER.filter(d => byDay[d]).map((day) => (
                      <div key={day} className="flex items-start gap-3 px-4 py-2.5">
                        <span className="text-xs font-semibold text-gray-400 w-20 shrink-0 pt-0.5">{day.slice(0, 3)}</span>
                        <div className="flex flex-wrap gap-1.5">
                          {byDay[day].sort((a, b) => a.period - b.period).map((p) => (
                            <span key={p.period} className="text-xs bg-white border border-gray-200 rounded-lg px-2 py-1 text-gray-700 font-medium">
                              P{p.period} · {p.subject}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Salary tab ────────────────────────────────────────────────────────────────

function SalaryTab({ teacher }) {
  const salary = parseFloat(teacher.salary || 0);
  const annualCTC = salary * 12;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-emerald-50 rounded-xl p-4">
          <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wide">Monthly Salary</p>
          <p className="text-2xl font-bold text-emerald-700 mt-1">{salary > 0 ? money(salary) : '—'}</p>
        </div>
        <div className="bg-gray-50 rounded-xl p-4">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Annual CTC</p>
          <p className="text-2xl font-bold text-gray-700 mt-1">{annualCTC > 0 ? money(annualCTC) : '—'}</p>
        </div>
      </div>

      <div className="flex items-center gap-3 bg-amber-50 border border-amber-100 rounded-xl px-4 py-3 text-sm text-amber-700">
        <IndianRupee className="w-4 h-4 shrink-0" />
        Salary payment history will appear here once salary disbursements are recorded.
      </div>
    </div>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function Spinner() {
  return (
    <div className="flex items-center justify-center py-16">
      <Loader2 className="w-6 h-6 text-brand-500 animate-spin" />
    </div>
  );
}

function ErrorMsg({ msg }) {
  return (
    <div className="flex items-center gap-2 text-red-500 text-sm py-8 justify-center">
      <AlertCircle className="w-4 h-4" /> {msg}
    </div>
  );
}

// ── Main Drawer ───────────────────────────────────────────────────────────────

export default function TeacherProfileDrawer({ teacher, onClose }) {
  const [activeTab, setActiveTab] = useState('info');

  if (!teacher) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/40 z-40 transition-opacity" onClick={onClose} />

      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-full max-w-lg bg-white z-50 flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center gap-4 px-6 py-5 border-b border-gray-100 shrink-0">
          <div className="w-10 h-10 rounded-full bg-teacher-100 flex items-center justify-center text-teacher-600 font-bold text-lg shrink-0">
            {(teacher.user?.name || '?')[0].toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-display font-bold text-gray-900 truncate">{teacher.user?.name || 'Teacher'}</h2>
            <p className="text-xs text-gray-400 mt-0.5">
              {teacher.subject || 'No subject'}{teacher.joining_date ? ` · Joined ${new Date(teacher.joining_date).getFullYear()}` : ''}
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors shrink-0">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-100 shrink-0 overflow-x-auto">
          {TABS.map(({ key, label, Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`flex items-center gap-1.5 px-5 py-3 text-xs font-semibold whitespace-nowrap border-b-2 transition-all ${activeTab === key ? 'border-brand-500 text-brand-600' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'info'       && <InfoTab teacher={teacher} />}
          {activeTab === 'attendance' && <AttendanceTab teacherId={teacher.id} />}
          {activeTab === 'classes'    && <ClassesTab teacherId={teacher.id} />}
          {activeTab === 'salary'     && <SalaryTab teacher={teacher} />}
        </div>
      </div>
    </>
  );
}
