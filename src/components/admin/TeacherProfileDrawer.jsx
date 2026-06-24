import { useState, useEffect } from 'react';
import {
  X, User, Calendar, BookOpen, IndianRupee,
  Loader2, AlertCircle, GraduationCap, Users,
  Pencil, CheckCircle2, ShieldCheck, Eye, EyeOff,
} from 'lucide-react';
import teacherService from '../../services/teacherService';
import { useAuth } from '../../contexts/AuthContext';
import { TEACHER_GROUPS, TEACHER_FIELD_NAMES, buildTeacherPayload } from '../../constants/teacherFields';

const editInp =
  'w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 placeholder:text-gray-300 outline-none transition-all focus:border-brand-400 focus:ring-2 focus:ring-brand-500/10';
const editLabel = 'block text-xs font-semibold text-gray-500 mb-1';

// Build the edit form's initial state from a teacher record.
function teacherToForm(teacher) {
  const u = teacher.user || {};
  const form = {
    name: u.name || '', username: u.username || '', phone: u.phone || '', email: u.email || '', password: '',
  };
  TEACHER_FIELD_NAMES.forEach((k) => {
    const v = teacher[k];
    // Trim ISO date columns down to YYYY-MM-DD for <input type="date">.
    form[k] = v == null ? '' : (typeof v === 'string' && v.includes('T') ? v.split('T')[0] : v);
  });
  return form;
}

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

function InfoTab({ teacher, onUpdated, isSuperAdmin }) {
  const [editing, setEditing]   = useState(false);
  const [form, setForm]         = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [saving, setSaving]     = useState(false);
  const [saveErr, setSaveErr]   = useState('');
  // Local mirror so the toggle reflects instantly; seeded from the teacher record.
  const [canEdit, setCanEdit]   = useState(!!teacher.can_edit_students);
  const [permSaving, setPermSaving] = useState(false);

  useEffect(() => { setCanEdit(!!teacher.can_edit_students); }, [teacher]);

  const u = teacher.user || {};
  const rows = [
    ['Login ID',     u.username],
    ['Full name',    u.name],
    ['Email',        u.email],
    ['Phone',        u.phone || '—'],
    ['Subject',      teacher.subject || '—'],
    ['Designation',  teacher.designation || '—'],
    ['Qualification',teacher.qualification || '—'],
    ['Monthly salary', teacher.salary ? money(teacher.salary) : '—'],
    ['Joining date', teacher.joining_date
      ? new Date(teacher.joining_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
      : '—'],
    ['Status', teacher.user?.is_active !== false ? 'Active' : 'Inactive'],
  ];

  const openEdit = () => {
    setForm(teacherToForm(teacher));
    setSaveErr('');
    setShowPassword(false);
    setEditing(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    setSaveErr('');
  };

  const handleSave = async () => {
    if (!form.name?.trim())     { setSaveErr('Name is required'); return; }
    if (!form.username?.trim()) { setSaveErr('Login ID is required'); return; }
    if (form.email && !/\S+@\S+\.\S+/.test(form.email)) { setSaveErr('Enter a valid email'); return; }
    setSaving(true);
    setSaveErr('');
    try {
      // Drop the password field entirely when left blank so we don't reset it.
      const payload = buildTeacherPayload(form);
      const res = await teacherService.updateTeacher(teacher.id, payload);
      setEditing(false);
      onUpdated?.(res.teacher || null);
    } catch (e) {
      setSaveErr(e.response?.data?.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const togglePermission = async () => {
    const next = !canEdit;
    setPermSaving(true);
    setCanEdit(next); // optimistic
    try {
      await teacherService.setTeacherPermissions(teacher.id, next);
      onUpdated?.(null);
    } catch {
      setCanEdit(!next); // revert on failure
    } finally {
      setPermSaving(false);
    }
  };

  const renderField = (fld) => (
    <div key={fld.name} className={fld.full ? 'col-span-2' : ''}>
      <label className={editLabel}>{fld.label}</label>
      {fld.options ? (
        <select name={fld.name} value={form[fld.name] ?? ''} onChange={handleChange} className={`${editInp} bg-white`}>
          <option value="">Select…</option>
          {fld.options.map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
      ) : fld.textarea ? (
        <textarea name={fld.name} value={form[fld.name] ?? ''} onChange={handleChange} rows={2} placeholder={fld.placeholder} className={`${editInp} resize-none`} />
      ) : (
        <input type={fld.type || 'text'} name={fld.name} value={form[fld.name] ?? ''} onChange={handleChange} placeholder={fld.placeholder} min={fld.type === 'number' ? '0' : undefined} className={editInp} />
      )}
    </div>
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Teacher Details</p>
        <button onClick={openEdit} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-brand-600 border border-brand-200 rounded-lg hover:bg-brand-50 transition-all">
          <Pencil className="w-3 h-3" /> Edit Details
        </button>
      </div>

      <dl className="divide-y divide-gray-100">
        {rows.map(([label, val]) => (
          <div key={label} className="flex items-start gap-4 py-3">
            <dt className="w-36 shrink-0 text-xs font-semibold text-gray-400 uppercase tracking-wide">{label}</dt>
            <dd className="text-sm text-gray-800 font-medium">{val ?? '—'}</dd>
          </div>
        ))}
      </dl>

      {/* Superadmin-only: lets this teacher edit students in her own class. */}
      {isSuperAdmin && (
        <div className="mt-5 flex items-start gap-3 bg-amber-50 border border-amber-100 rounded-xl px-4 py-3.5">
          <ShieldCheck className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-gray-800">Can edit students</p>
            <p className="text-xs text-gray-500 mt-0.5">Allow this teacher to edit profiles of students in her own class.</p>
          </div>
          <button
            onClick={togglePermission}
            disabled={permSaving}
            role="switch"
            aria-checked={canEdit}
            className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors disabled:opacity-50 ${canEdit ? 'bg-emerald-500' : 'bg-gray-300'}`}
          >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${canEdit ? 'translate-x-6' : 'translate-x-1'}`} />
          </button>
        </div>
      )}

      {/* Edit modal */}
      {editing && (
        <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
              <h3 className="font-display font-bold text-gray-900">Edit Teacher</h3>
              <button onClick={() => setEditing(false)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>

            <div className="overflow-y-auto px-6 py-4 space-y-5">
              {/* Identity & login */}
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Identity & login</p>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className={editLabel}>Full name *</label><input name="name" value={form.name ?? ''} onChange={handleChange} className={editInp} /></div>
                  <div><label className={editLabel}>Login ID *</label><input name="username" value={form.username ?? ''} onChange={handleChange} className={editInp} /></div>
                  <div><label className={editLabel}>Phone</label><input name="phone" value={form.phone ?? ''} onChange={handleChange} className={editInp} /></div>
                  <div><label className={editLabel}>Email</label><input type="email" name="email" value={form.email ?? ''} onChange={handleChange} className={editInp} /></div>
                  <div className="col-span-2">
                    <label className={editLabel}>New password (leave blank to keep current)</label>
                    <div className="relative">
                      <input type={showPassword ? 'text' : 'password'} name="password" value={form.password ?? ''} onChange={handleChange} placeholder="••••••••" className={`${editInp} pr-10`} />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500">
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {TEACHER_GROUPS.map((g) => (
                <div key={g.title}>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">{g.title}</p>
                  <div className="grid grid-cols-2 gap-3">
                    {g.fields.map(renderField)}
                  </div>
                </div>
              ))}

              {saveErr && <p className="text-xs text-red-500">{saveErr}</p>}
            </div>

            <div className="flex gap-3 px-6 py-4 border-t border-gray-100 shrink-0">
              <button onClick={handleSave} disabled={saving}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-brand-500 text-white rounded-xl text-sm font-semibold hover:bg-brand-600 disabled:opacity-50 transition-all">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                Save Changes
              </button>
              <button onClick={() => setEditing(false)} className="flex-1 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-all">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
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

export default function TeacherProfileDrawer({ teacher, onClose, onUpdated }) {
  const [activeTab, setActiveTab] = useState('info');
  const { user } = useAuth();
  const isSuperAdmin = user?.role === 'superadmin';

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
          {activeTab === 'info'       && <InfoTab teacher={teacher} onUpdated={onUpdated} isSuperAdmin={isSuperAdmin} />}
          {activeTab === 'attendance' && <AttendanceTab teacherId={teacher.id} />}
          {activeTab === 'classes'    && <ClassesTab teacherId={teacher.id} />}
          {activeTab === 'salary'     && <SalaryTab teacher={teacher} />}
        </div>
      </div>
    </>
  );
}
