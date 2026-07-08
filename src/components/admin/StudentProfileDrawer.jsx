import { useState, useEffect } from 'react';
import {
  X, User, BookOpen, Calendar, IndianRupee, ShoppingBag,
  Loader2, AlertCircle, CheckCircle2, Pencil, Maximize2, Minimize2,
} from 'lucide-react';
import studentService from '../../services/studentService';

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const ALL_TABS = [
  { key: 'info',       label: 'Info',       Icon: User },
  { key: 'attendance', label: 'Attendance', Icon: Calendar },
  { key: 'marks',      label: 'Results',    Icon: BookOpen },
  { key: 'fees',       label: 'Fees',       Icon: IndianRupee,  adminOnly: true },
  { key: 'inventory',  label: 'Inventory',  Icon: ShoppingBag,  adminOnly: true },
];

function pct(n) { return `${n ?? 0}%`; }
function money(n) { return `₹${Number(n || 0).toLocaleString('en-IN')}`; }

const inp = 'w-full border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-800 focus:outline-none focus:border-brand-400';
const sel = `${inp} bg-white`;

const EXTENDED_DEFAULTS = {
  // identity & academic
  name: '', email: '', phone: '',
  admission_number: '', roll_number: '', class_id: '', date_of_birth: '', admission_date: '', status: 'active',
  pen_number: '', apaar_id: '',
  aadhaar_number: '', father_name: '', father_phone: '', father_aadhaar: '',
  mother_name: '', mother_phone: '', mother_aadhaar: '', parents_pan: '',
  category: '', religion: '', nationality: 'Indian', blood_group: '',
  birth_certificate_number: '', ews_certificate_number: '',
  address: '', city: '', state: '', pincode: '',
};

// DB dates arrive as ISO datetimes; <input type="date"> needs YYYY-MM-DD.
const dateOnly = (v) => (v ? String(v).slice(0, 10) : '');

// ── InfoTab ──────────────────────────────────────────────────────────────────

function InfoTab({ student, onUpdated, readOnly, updateStudent }) {
  const [editing, setEditing]   = useState(false);
  const [form, setForm]         = useState({});
  const [saving, setSaving]     = useState(false);
  const [saveErr, setSaveErr]   = useState('');
  const [classes, setClasses]   = useState([]);

  // Load the class list once so the edit form can offer a "change class" dropdown.
  useEffect(() => {
    if (readOnly) return;
    studentService.getClasses().then((d) => setClasses(d.classes || [])).catch(() => {});
  }, [readOnly]);

  const openEdit = () => {
    setForm({
      ...EXTENDED_DEFAULTS,
      name:                     student.user?.name               || '',
      email:                    student.user?.email              || '',
      phone:                    student.user?.phone              || '',
      admission_number:         student.admission_number         || '',
      roll_number:              student.roll_number ?? '',
      class_id:                 student.class_id ?? student.class?.id ?? '',
      date_of_birth:            dateOnly(student.date_of_birth),
      admission_date:           dateOnly(student.admission_date),
      status:                   student.status                   || 'active',
      pen_number:               student.pen_number               || '',
      apaar_id:                 student.apaar_id                 || '',
      aadhaar_number:           student.aadhaar_number           || '',
      father_name:              student.father_name              || '',
      father_phone:             student.father_phone             || '',
      father_aadhaar:           student.father_aadhaar           || '',
      mother_name:              student.mother_name              || '',
      mother_phone:             student.mother_phone             || '',
      mother_aadhaar:           student.mother_aadhaar           || '',
      parents_pan:              student.parents_pan              || '',
      category:                 student.category                 || '',
      religion:                 student.religion                 || '',
      nationality:              student.nationality              || 'Indian',
      blood_group:              student.blood_group              || '',
      birth_certificate_number: student.birth_certificate_number || '',
      ews_certificate_number:   student.ews_certificate_number   || '',
      address:                  student.address                  || '',
      city:                     student.city                     || '',
      state:                    student.state                    || '',
      pincode:                  student.pincode                  || '',
    });
    setSaveErr('');
    setEditing(true);
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveErr('');
    try {
      const save = updateStudent || studentService.updateStudent;
      // Coerce empty optional fields so the server doesn't try to write '' into a
      // DATE column or hit the unique-email constraint with an empty string.
      const payload = {
        ...form,
        email: form.email || null,
        date_of_birth: form.date_of_birth || null,
        admission_date: form.admission_date || null,
      };
      // Don't send a blank class — leave the student's class unchanged rather
      // than writing an empty value into the class_id FK.
      if (!payload.class_id) delete payload.class_id;
      const res = await save(student.id, payload);
      setEditing(false);
      onUpdated?.(res.student || null);
    } catch (e) {
      setSaveErr(e.response?.data?.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const f = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }));

  const u = student.user || {};
  const c = student.class || {};

  const section = (label) => (
    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-4 mb-1.5 col-span-2">{label}</p>
  );

  const row = (label, val) => (
    <div key={label} className="flex items-start gap-4 py-2.5 border-b border-gray-50 last:border-0">
      <dt className="w-40 shrink-0 text-xs font-semibold text-gray-400 uppercase tracking-wide">{label}</dt>
      <dd className="text-sm text-gray-800 font-medium break-words">{val || '—'}</dd>
    </div>
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Student Details</p>
        {!readOnly && (
          <button onClick={openEdit} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-brand-600 border border-brand-200 rounded-lg hover:bg-brand-50 transition-all">
            <Pencil className="w-3 h-3" /> Edit Details
          </button>
        )}
      </div>

      <dl>
        {row('Admission No', student.admission_number ?? student.id)}
        {row('Full Name', u.name)}
        {row('Email', u.email)}
        {row('Phone', u.phone)}
        {row('Class', c.class_name ? `Class ${c.class_name} ${c.section}` : null)}
        {row('Roll Number', student.roll_number)}
        {row('Status', student.status)}
        {row('Date of Birth', student.date_of_birth)}
        {row('Blood Group', student.blood_group)}
        {row('Category', student.category)}
        {row('Religion', student.religion)}
        {row('Nationality', student.nationality || 'Indian')}
        {row('Aadhaar No', student.aadhaar_number)}
        {row('Address', student.address)}
        {row('City', student.city)}
        {row('State', student.state)}
        {row('Pincode', student.pincode)}
        {row('Admission Date', student.admission_date)}
        {row("Father's Name", student.father_name)}
        {row("Father's Phone", student.father_phone)}
        {row("Father's Aadhaar", student.father_aadhaar)}
        {row("Mother's Name", student.mother_name)}
        {row("Mother's Phone", student.mother_phone)}
        {row("Mother's Aadhaar", student.mother_aadhaar)}
        {row("Parents' PAN", student.parents_pan)}
        {row('Birth Cert. No', student.birth_certificate_number)}
        {row('EWS/Category Cert.', student.ews_certificate_number)}
        {row('PEN Number', student.pen_number)}
        {row('APAAR ID', student.apaar_id)}
      </dl>

      {/* Edit modal */}
      {editing && (
        <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
              <h3 className="font-display font-bold text-gray-900">Edit Student Details</h3>
              <button onClick={() => setEditing(false)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>

            <div className="overflow-y-auto px-6 py-4 space-y-4">
              {/* Identity & Academic */}
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Identity & Academic</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2"><label className="text-xs text-gray-500 mb-1 block">Full Name</label><input value={form.name} onChange={f('name')} className={inp} /></div>
                <div><label className="text-xs text-gray-500 mb-1 block">Admission No <span className="text-gray-400">(login ID)</span></label><input value={form.admission_number} onChange={f('admission_number')} className={inp} /></div>
                <div><label className="text-xs text-gray-500 mb-1 block">Roll No</label><input type="number" value={form.roll_number} onChange={f('roll_number')} min="1" className={inp} /></div>
                {classes.length > 0 && (
                  <div className="col-span-2"><label className="text-xs text-gray-500 mb-1 block">Class</label>
                    <select value={form.class_id} onChange={f('class_id')} className={sel}>
                      <option value="">Select class</option>
                      {classes.map((c) => (
                        <option key={c.id} value={c.id}>{c.class_name}{c.section ? ` ${c.section}` : ''}</option>
                      ))}
                    </select>
                  </div>
                )}
                <div><label className="text-xs text-gray-500 mb-1 block">Date of Birth</label><input type="date" value={form.date_of_birth} onChange={f('date_of_birth')} className={inp} /></div>
                <div><label className="text-xs text-gray-500 mb-1 block">Admission Date</label><input type="date" value={form.admission_date} onChange={f('admission_date')} className={inp} /></div>
                <div><label className="text-xs text-gray-500 mb-1 block">Status</label>
                  <select value={form.status} onChange={f('status')} className={sel}>
                    {['active', 'inactive', 'promoted'].map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div><label className="text-xs text-gray-500 mb-1 block">Phone</label><input value={form.phone} onChange={f('phone')} className={inp} /></div>
                <div className="col-span-2"><label className="text-xs text-gray-500 mb-1 block">Email</label><input type="email" value={form.email} onChange={f('email')} className={inp} /></div>
              </div>
              <p className="text-[11px] text-amber-600 bg-amber-50 rounded-lg px-3 py-2">Changing the admission number also changes the student's login username.</p>

              {/* Personal */}
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pt-2">Personal</p>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs text-gray-500 mb-1 block">Aadhaar No</label><input value={form.aadhaar_number} onChange={f('aadhaar_number')} maxLength={12} placeholder="12-digit" className={inp} /></div>
                <div><label className="text-xs text-gray-500 mb-1 block">Blood Group</label>
                  <select value={form.blood_group} onChange={f('blood_group')} className={sel}>
                    <option value="">Select</option>
                    {['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>
                <div><label className="text-xs text-gray-500 mb-1 block">Category</label>
                  <select value={form.category} onChange={f('category')} className={sel}>
                    <option value="">Select</option>
                    {['General','OBC','SC','ST','EWS'].map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div><label className="text-xs text-gray-500 mb-1 block">Religion</label><input value={form.religion} onChange={f('religion')} className={inp} /></div>
                <div><label className="text-xs text-gray-500 mb-1 block">Nationality</label><input value={form.nationality} onChange={f('nationality')} className={inp} /></div>
              </div>

              {/* Address */}
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pt-2">Address</p>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Address</label>
                <textarea value={form.address} onChange={f('address')} rows={2} className={`${inp} resize-none`} />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div><label className="text-xs text-gray-500 mb-1 block">City</label><input value={form.city} onChange={f('city')} className={inp} /></div>
                <div><label className="text-xs text-gray-500 mb-1 block">State</label><input value={form.state} onChange={f('state')} className={inp} /></div>
                <div><label className="text-xs text-gray-500 mb-1 block">Pincode</label><input value={form.pincode} onChange={f('pincode')} maxLength={6} className={inp} /></div>
              </div>

              {/* Father */}
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pt-2">Father's Details</p>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs text-gray-500 mb-1 block">Name</label><input value={form.father_name} onChange={f('father_name')} className={inp} /></div>
                <div><label className="text-xs text-gray-500 mb-1 block">Phone</label><input value={form.father_phone} onChange={f('father_phone')} className={inp} /></div>
                <div className="col-span-2"><label className="text-xs text-gray-500 mb-1 block">Aadhaar No</label><input value={form.father_aadhaar} onChange={f('father_aadhaar')} maxLength={12} className={inp} /></div>
              </div>

              {/* Mother */}
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pt-2">Mother's Details</p>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs text-gray-500 mb-1 block">Name</label><input value={form.mother_name} onChange={f('mother_name')} className={inp} /></div>
                <div><label className="text-xs text-gray-500 mb-1 block">Phone</label><input value={form.mother_phone} onChange={f('mother_phone')} className={inp} /></div>
                <div className="col-span-2"><label className="text-xs text-gray-500 mb-1 block">Aadhaar No</label><input value={form.mother_aadhaar} onChange={f('mother_aadhaar')} maxLength={12} className={inp} /></div>
              </div>

              {/* Documents */}
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pt-2">Documents</p>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs text-gray-500 mb-1 block">Parents' PAN</label><input value={form.parents_pan} onChange={f('parents_pan')} maxLength={10} className={inp} /></div>
                <div><label className="text-xs text-gray-500 mb-1 block">Birth Certificate No</label><input value={form.birth_certificate_number} onChange={f('birth_certificate_number')} className={inp} /></div>
                <div className="col-span-2"><label className="text-xs text-gray-500 mb-1 block">EWS / Category Certificate No</label><input value={form.ews_certificate_number} onChange={f('ews_certificate_number')} className={inp} /></div>
                <div><label className="text-xs text-gray-500 mb-1 block">PEN Number</label><input value={form.pen_number} onChange={f('pen_number')} maxLength={20} className={inp} /></div>
                <div><label className="text-xs text-gray-500 mb-1 block">APAAR ID</label><input value={form.apaar_id} onChange={f('apaar_id')} maxLength={20} className={inp} /></div>
              </div>

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

// ── AttendanceTab ─────────────────────────────────────────────────────────────

function AttendanceTab({ studentId }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [year, setYear] = useState(new Date().getFullYear());

  useEffect(() => {
    setLoading(true);
    studentService.getStudentAttendance(studentId, { year })
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [studentId, year]);

  if (loading) return <Spinner />;
  if (!data) return <ErrorMsg msg="Failed to load attendance" />;

  const months = Object.entries(data.monthlyBreakdown || {});

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {[year - 1, year, year + 1].filter(y => y <= new Date().getFullYear()).map(y => (
            <button key={y} onClick={() => setYear(y)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${y === year ? 'bg-brand-500 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
              {y}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <span className="text-2xl font-bold text-gray-900">{pct(data.percentage)}</span>
          <span className="text-xs text-gray-400">attendance</span>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Total days', value: data.totalDays,   color: 'bg-gray-50 text-gray-700' },
          { label: 'Present',    value: data.presentDays, color: 'bg-emerald-50 text-emerald-700' },
          { label: 'Absent',     value: data.absentDays,  color: 'bg-red-50 text-red-600' },
        ].map(({ label, value, color }) => (
          <div key={label} className={`${color} rounded-xl p-3 text-center`}>
            <p className="text-xl font-bold">{value}</p>
            <p className="text-xs font-semibold mt-0.5">{label}</p>
          </div>
        ))}
      </div>
      <div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Monthly breakdown</p>
        <div className="grid grid-cols-6 gap-2">
          {months.map(([m, stats]) => {
            const pctVal = stats.total ? Math.round((stats.present / stats.total) * 100) : null;
            const color = pctVal === null ? 'bg-gray-100 text-gray-400'
              : pctVal >= 75 ? 'bg-emerald-100 text-emerald-700'
              : pctVal >= 50 ? 'bg-amber-100 text-amber-700'
              : 'bg-red-100 text-red-600';
            return (
              <div key={m} className={`${color} rounded-lg p-2 text-center`}>
                <p className="text-[10px] font-semibold">{MONTH_NAMES[parseInt(m) - 1]}</p>
                <p className="text-sm font-bold mt-0.5">{pctVal !== null ? `${pctVal}%` : '—'}</p>
                <p className="text-[10px] mt-0.5">{stats.present}/{stats.total}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── MarksTab ──────────────────────────────────────────────────────────────────

function MarksTab({ studentId }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    studentService.getStudentMarks(studentId)
      .then(setData).catch(() => setData(null)).finally(() => setLoading(false));
  }, [studentId]);

  if (loading) return <Spinner />;
  if (!data) return <ErrorMsg msg="Failed to load results" />;
  if (!data.exams?.length) return <Empty msg="No results recorded yet" />;

  return (
    <div className="space-y-5">
      {data.exams.map((exam) => (
        <div key={exam.examType} className="border border-gray-200 rounded-xl overflow-hidden">
          <div className="flex items-center justify-between bg-gray-50 px-4 py-3 border-b border-gray-200">
            <p className="font-display font-bold text-gray-800 capitalize">{exam.examType.replace(/_/g, ' ')}</p>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-gray-900">{exam.totalObtained}/{exam.totalMax}</span>
              {exam.percentage !== null && (
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${exam.percentage >= 75 ? 'bg-emerald-100 text-emerald-700' : exam.percentage >= 50 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-600'}`}>
                  {exam.percentage}%
                </span>
              )}
            </div>
          </div>
          <table className="w-full text-sm">
            <thead className="text-xs text-gray-400 uppercase tracking-wide">
              <tr className="border-b border-gray-100">
                <th className="px-4 py-2 text-left">Subject</th>
                <th className="px-4 py-2 text-right">Obtained</th>
                <th className="px-4 py-2 text-right">Max</th>
                <th className="px-4 py-2 text-right">%</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {exam.subjects.map((s) => (
                <tr key={s.subject} className="hover:bg-gray-50/50">
                  <td className="px-4 py-2.5 font-medium text-gray-800">{s.subject}</td>
                  <td className="px-4 py-2.5 text-right font-mono text-gray-700">
                    {s.isAbsent ? <span className="text-xs text-red-400 font-semibold">Absent</span> : s.marksObtained}
                  </td>
                  <td className="px-4 py-2.5 text-right font-mono text-gray-400">{s.maxMarks}</td>
                  <td className="px-4 py-2.5 text-right">
                    {s.percentage !== null ? (
                      <span className={`text-xs font-semibold ${s.percentage >= 75 ? 'text-emerald-600' : s.percentage >= 50 ? 'text-amber-600' : 'text-red-500'}`}>
                        {s.percentage}%
                      </span>
                    ) : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
}

// ── FeesTab ───────────────────────────────────────────────────────────────────

function FeesTab({ studentId }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    studentService.getStudentFees(studentId)
      .then(setData).catch(() => setData(null)).finally(() => setLoading(false));
  }, [studentId]);

  if (loading) return <Spinner />;
  if (!data) return <ErrorMsg msg="Failed to load fee data" />;

  const monthNames = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-emerald-50 rounded-xl p-4">
          <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wide">Total Paid</p>
          <p className="text-xl font-bold text-emerald-700 mt-1">{money(data.summary?.totalPaid)}</p>
        </div>
        <div className={`rounded-xl p-4 ${data.summary?.latestPending > 0 ? 'bg-red-50' : 'bg-gray-50'}`}>
          <p className={`text-xs font-semibold uppercase tracking-wide ${data.summary?.latestPending > 0 ? 'text-red-500' : 'text-gray-500'}`}>Outstanding</p>
          <p className={`text-xl font-bold mt-1 ${data.summary?.latestPending > 0 ? 'text-red-600' : 'text-gray-700'}`}>{money(data.summary?.latestPending)}</p>
        </div>
      </div>
      {data.payments?.length > 0 ? (
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Payment history</p>
          <div className="space-y-2">
            {data.payments.filter(p => !p.isReversal).map((p) => (
              <div key={p.id} className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-3">
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-800">{monthNames[p.billingMonth]} {p.billingYear}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{p.paymentDate || 'No date'} · {p.paymentMethod || 'cash'}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-emerald-600">{money(p.amountPaid)}</p>
                  {p.pendingAfter > 0 && <p className="text-xs text-red-400 mt-0.5">Pending: {money(p.pendingAfter)}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : <Empty msg="No payments recorded yet" />}
    </div>
  );
}

// ── InventoryTab ──────────────────────────────────────────────────────────────

function InventoryTab({ studentId }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    studentService.getStudentInventory(studentId)
      .then(setData).catch(() => setData(null)).finally(() => setLoading(false));
  }, [studentId]);

  if (loading) return <Spinner />;
  if (!data) return <ErrorMsg msg="Failed to load purchases" />;
  if (!data.transactions?.length) return <Empty msg="No uniform or book purchases for this student" />;

  const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit' }) : '—';

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-purple-50 rounded-xl p-3 text-center">
          <p className="text-xs font-semibold text-purple-500">{data.summary.totalTransactions} items</p>
        </div>
        <div className="bg-emerald-50 rounded-xl p-3 text-center">
          <p className="text-xs font-semibold text-emerald-600">Paid</p>
          <p className="text-sm font-bold text-emerald-700">{money(data.summary.totalSpent)}</p>
        </div>
        <div className={`rounded-xl p-3 text-center ${data.summary.totalPending > 0 ? 'bg-red-50' : 'bg-gray-50'}`}>
          <p className={`text-xs font-semibold ${data.summary.totalPending > 0 ? 'text-red-500' : 'text-gray-400'}`}>Pending</p>
          <p className={`text-sm font-bold ${data.summary.totalPending > 0 ? 'text-red-600' : 'text-gray-500'}`}>{money(data.summary.totalPending)}</p>
        </div>
      </div>
      <div className="space-y-2">
        {data.transactions.map((t) => {
          const fullyPaid = t.left <= 0;
          return (
            <div key={`${t.type}-${t.id}`} className="border border-gray-100 rounded-xl px-4 py-3 hover:bg-gray-50/50 transition-colors">
              <div className="flex items-start gap-2">
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md uppercase mt-0.5 shrink-0 ${t.type === 'uniform' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'}`}>
                  {t.type}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800 truncate">{t.itemName}</p>
                  {t.className && <p className="text-xs text-gray-400">{t.className}{t.subject ? ` · ${t.subject}` : ''}</p>}
                  <p className="text-xs text-gray-400 mt-0.5">×{t.quantity} · {fmtDate(t.date)}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-bold text-gray-900">{money(t.toBePaid)}</p>
                  {fullyPaid
                    ? <span className="text-[10px] font-semibold text-emerald-500">Paid</span>
                    : <span className="text-[10px] font-semibold text-red-400">Left {money(t.left)}</span>}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function Spinner() {
  return <div className="flex items-center justify-center py-16"><Loader2 className="w-6 h-6 text-brand-500 animate-spin" /></div>;
}
function ErrorMsg({ msg }) {
  return <div className="flex items-center gap-2 text-red-500 text-sm py-8 justify-center"><AlertCircle className="w-4 h-4" /> {msg}</div>;
}
function Empty({ msg }) {
  return <div className="text-center text-gray-400 text-sm py-12"><p>{msg}</p></div>;
}

// ── Main Drawer ───────────────────────────────────────────────────────────────

export default function StudentProfileDrawer({ student: initialStudent, onClose, onUpdated, readOnly = false, updateStudent }) {
  const [activeTab, setActiveTab] = useState('info');
  const [student, setStudent] = useState(initialStudent);
  const [width, setWidth] = useState(512); // px; drawer is resizable (max-w-lg ≈ 512)

  useEffect(() => { setStudent(initialStudent); setActiveTab('info'); }, [initialStudent]);

  // Drag the left edge to resize; clamps between 360px and (viewport − 40px).
  const startResize = (e) => {
    e.preventDefault();
    const onMove = (ev) => {
      const clientX = ev.touches ? ev.touches[0].clientX : ev.clientX;
      setWidth(Math.min(Math.max(window.innerWidth - clientX, 360), window.innerWidth - 40));
    };
    const onUp = () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
      document.removeEventListener('touchmove', onMove);
      document.removeEventListener('touchend', onUp);
      document.body.style.userSelect = '';
    };
    document.body.style.userSelect = 'none';
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
    document.addEventListener('touchmove', onMove, { passive: false });
    document.addEventListener('touchend', onUp);
  };

  const isExpanded = width > 700;
  const toggleExpand = () => setWidth(isExpanded ? 512 : Math.min(1100, window.innerWidth - 80));

  if (!student) return null;

  const tabs = ALL_TABS.filter((t) => !readOnly || !t.adminOnly);

  const handleUpdated = (updatedStudent) => {
    if (updatedStudent) setStudent(updatedStudent);
    onUpdated?.();
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-40 transition-opacity" onClick={onClose} />
      <div className="fixed right-0 top-0 h-full max-w-full bg-white z-50 flex flex-col shadow-2xl" style={{ width }}>
        {/* Drag-to-resize handle (left edge) */}
        <div
          onMouseDown={startResize}
          onTouchStart={startResize}
          title="Drag to resize"
          className="absolute left-0 top-0 h-full w-1.5 cursor-col-resize bg-transparent hover:bg-brand-300 active:bg-brand-400 transition-colors z-10"
        />
        {/* Header */}
        <div className="flex items-center gap-4 px-6 py-5 border-b border-gray-100 shrink-0">
          <div className="w-10 h-10 rounded-full bg-brand-100 flex items-center justify-center text-brand-600 font-bold text-lg shrink-0">
            {(student.user?.name || '?')[0].toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-display font-bold text-gray-900 truncate">{student.user?.name || 'Student'}</h2>
            <p className="text-xs text-gray-400 mt-0.5">
              {student.class ? `Class ${student.class.class_name} ${student.class.section}` : ''} · Roll #{student.roll_number} · Adm #{student.admission_number ?? student.id}
            </p>
          </div>
          <button onClick={toggleExpand} title={isExpanded ? 'Collapse' : 'Expand'}
            className="text-gray-400 hover:text-brand-600 transition-colors shrink-0">
            {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors shrink-0">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-100 shrink-0 overflow-x-auto">
          {tabs.map(({ key, label, Icon }) => (
            <button key={key} onClick={() => setActiveTab(key)}
              className={`flex items-center gap-1.5 px-4 py-3 text-xs font-semibold whitespace-nowrap border-b-2 transition-all ${activeTab === key ? 'border-brand-500 text-brand-600' : 'border-transparent text-gray-400 hover:text-gray-600'}`}>
              <Icon className="w-3.5 h-3.5" /> {label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'info'       && <InfoTab student={student} onUpdated={handleUpdated} readOnly={readOnly} updateStudent={updateStudent} />}
          {activeTab === 'attendance' && <AttendanceTab studentId={student.id} />}
          {activeTab === 'marks'      && <MarksTab studentId={student.id} />}
          {activeTab === 'fees'       && <FeesTab studentId={student.id} />}
          {activeTab === 'inventory'  && <InventoryTab studentId={student.id} />}
        </div>
      </div>
    </>
  );
}
