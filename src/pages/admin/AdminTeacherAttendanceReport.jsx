import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Pencil, X, Check, Loader2, AlertCircle, CheckCircle2, Download } from 'lucide-react';
import svc from '@/services/teacherAttendanceService';

const STATUS_OPTIONS = [
  { value: 'present',       label: 'Present' },
  { value: 'late',          label: 'Late' },
  { value: 'half_day',      label: 'Half Day' },
  { value: 'absent',        label: 'Absent' },
  { value: 'on_leave',      label: 'On Leave' },
  { value: 'official_duty', label: 'Official Duty' },
];

const LEAVE_OPTIONS = [
  { value: 'casual', label: 'Casual Leave (CL)' },
  { value: 'sick',   label: 'Sick Leave (SL)' },
  { value: 'earned', label: 'Earned Leave (EL)' },
  { value: 'unpaid', label: 'Unpaid Leave' },
];

const STATUS_CONFIG = {
  present:       { label: 'Present',       cls: 'bg-emerald-100 text-emerald-700' },
  late:          { label: 'Late',           cls: 'bg-amber-100 text-amber-700' },
  absent:        { label: 'Absent',         cls: 'bg-red-100 text-red-600' },
  half_day:      { label: 'Half Day',       cls: 'bg-orange-100 text-orange-700' },
  on_leave:      { label: 'On Leave',       cls: 'bg-blue-100 text-blue-700' },
  official_duty: { label: 'Official Duty',  cls: 'bg-purple-100 text-purple-700' },
};

const LEAVE_LABELS = { casual: 'Casual', sick: 'Sick', earned: 'Earned', unpaid: 'Unpaid' };
const LEAVE_CODE = { casual: 'CL', sick: 'SL', earned: 'EL', unpaid: 'UL' };

// Per-day cell codes/colours for the monthly register grid.
const DAY_CODE = {
  present:       { code: 'P',  cls: 'bg-emerald-100 text-emerald-700' },
  late:          { code: 'LT', cls: 'bg-amber-100 text-amber-700' },
  half_day:      { code: 'HD', cls: 'bg-orange-100 text-orange-700' },
  absent:        { code: 'A',  cls: 'bg-red-100 text-red-600' },
  on_leave:      { code: 'L',  cls: 'bg-blue-100 text-blue-700' },
  official_duty: { code: 'OD', cls: 'bg-purple-100 text-purple-700' },
};

// Compact "9:05a" from "09:05:00".
const shortTime = (t) => {
  if (!t) return '';
  const [h, m] = t.split(':');
  const hr = parseInt(h);
  return `${hr % 12 || 12}:${m}${hr >= 12 ? 'p' : 'a'}`;
};

// One cell in the monthly grid: in/out times for present/late days, else a status code.
const renderDayCell = (rec) => {
  if (!rec) return <span className="text-gray-200">·</span>;
  if (rec.status === 'present' || rec.status === 'late') {
    const inT = shortTime(rec.checkInTime);
    const outT = shortTime(rec.checkOutTime);
    if (!inT && !outT) {
      const dc = DAY_CODE[rec.status];
      return <span className={`inline-block px-1 rounded text-[10px] font-bold ${dc.cls}`}>{dc.code}</span>;
    }
    return (
      <div className="leading-tight">
        <div className={`text-[10px] font-semibold ${rec.status === 'late' ? 'text-amber-700' : 'text-emerald-700'}`}>{inT || '—'}</div>
        <div className="text-[10px] text-gray-400">{outT || '—'}</div>
      </div>
    );
  }
  const dc = DAY_CODE[rec.status] || { code: rec.status, cls: 'bg-gray-100 text-gray-600' };
  const label = rec.status === 'on_leave' ? (LEAVE_CODE[rec.leaveType] || 'L') : dc.code;
  return <span className={`inline-block px-1 rounded text-[10px] font-bold ${dc.cls}`}>{label}</span>;
};

const formatTime = (t) => {
  if (!t) return '—';
  const [h, m] = t.split(':');
  const hr = parseInt(h);
  return `${hr % 12 || 12}:${m} ${hr >= 12 ? 'PM' : 'AM'}`;
};

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

export default function AdminTeacherAttendanceReport() {
  const todayStr = new Date().toISOString().split('T')[0];
  const todayMonth = new Date().getMonth() + 1;
  const todayYear = new Date().getFullYear();

  const [view, setView] = useState('date'); // 'date' | 'monthly'
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [selectedMonth, setSelectedMonth] = useState(todayMonth);
  const [selectedYear, setSelectedYear] = useState(todayYear);

  const [teachers, setTeachers] = useState([]);
  const [records, setRecords] = useState([]); // flat array for date view
  const [summary, setSummary] = useState([]); // for monthly view
  const [daysInMonth, setDaysInMonth] = useState(31);

  const [loadingDate, setLoadingDate] = useState(false);
  const [loadingMonthly, setLoadingMonthly] = useState(false);
  const [loadingTeachers, setLoadingTeachers] = useState(true);

  const [editTarget, setEditTarget] = useState(null); // { teacher, record | null }
  const [modalForm, setModalForm] = useState({ status: 'present', leaveType: '', checkInTime: '', checkOutTime: '', remarks: '' });
  const [saving, setSaving] = useState(false);

  const [toast, setToast] = useState(null);

  const showToastMsg = useCallback((type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  }, []);

  // Load teachers once
  useEffect(() => {
    svc.getAllTeachers().then((d) => {
      setTeachers(d.teachers || []);
      setLoadingTeachers(false);
    }).catch(() => setLoadingTeachers(false));
  }, []);

  // Load date view
  useEffect(() => {
    if (view !== 'date') return;
    setLoadingDate(true);
    svc.getAttendance(selectedDate)
      .then((d) => setRecords(d.records || []))
      .catch(() => showToastMsg('error', 'Failed to load attendance'))
      .finally(() => setLoadingDate(false));
  }, [view, selectedDate]);

  // Load monthly summary
  useEffect(() => {
    if (view !== 'monthly') return;
    setLoadingMonthly(true);
    svc.getMonthlySummary(selectedMonth, selectedYear)
      .then((d) => { setSummary(d.summary || []); setDaysInMonth(d.daysInMonth || 31); })
      .catch(() => showToastMsg('error', 'Failed to load summary'))
      .finally(() => setLoadingMonthly(false));
  }, [view, selectedMonth, selectedYear]);

  const openEdit = (teacher, record) => {
    setEditTarget({ teacher, record });
    setModalForm({
      status: record?.status || 'present',
      leaveType: record?.leaveType || '',
      checkInTime: record?.checkInTime ? record.checkInTime.slice(0, 5) : '',
      checkOutTime: record?.checkOutTime ? record.checkOutTime.slice(0, 5) : '',
      remarks: record?.remarks || '',
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        status: modalForm.status,
        leaveType: modalForm.leaveType || null,
        checkInTime: modalForm.checkInTime ? `${modalForm.checkInTime}:00` : null,
        checkOutTime: modalForm.checkOutTime ? `${modalForm.checkOutTime}:00` : null,
        remarks: modalForm.remarks || null,
      };

      if (editTarget.record) {
        await svc.updateRecord(editTarget.record.id, payload);
      } else {
        await svc.markStatus({ teacherId: editTarget.teacher.id, date: selectedDate, ...payload });
      }

      // Refresh date view
      const d = await svc.getAttendance(selectedDate);
      setRecords(d.records || []);
      setEditTarget(null);
      showToastMsg('success', 'Record saved');
    } catch (err) {
      showToastMsg('error', err.response?.data?.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const needsLeaveType = ['absent', 'on_leave'].includes(modalForm.status);

  // Build record map for date view table
  const recordMap = {};
  records.forEach((r) => { recordMap[r.teacherId] = r; });

  const yearOptions = Array.from({ length: 5 }, (_, i) => todayYear - i);

  // Days 1..N for the monthly grid columns.
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const dowOf = (d) => new Date(selectedYear, selectedMonth - 1, d).getDay(); // 0=Sun

  const exportGridCsv = () => {
    const dayHeaders = days.map((d) => String(d));
    const header = ['Teacher', 'Subject', 'Present', 'Late', 'Half Day', 'Leave', 'Absent', 'Official Duty', 'Total', ...dayHeaders];
    const rows = summary.map((row) => {
      const dayCells = days.map((d) => {
        const rec = row.days?.[d];
        if (!rec) return '';
        if (rec.status === 'present' || rec.status === 'late') {
          return `${rec.checkInTime || ''}${rec.checkOutTime ? ' - ' + rec.checkOutTime : ''}`.trim();
        }
        if (rec.status === 'on_leave') return LEAVE_CODE[rec.leaveType] || 'L';
        return DAY_CODE[rec.status]?.code || rec.status;
      });
      return [
        `"${(row.teacherName || '').replace(/"/g, '""')}"`,
        `"${(row.subject || '').replace(/"/g, '""')}"`,
        row.present, row.late, row.half_day, row.on_leave, row.absent, row.official_duty, row.total,
        ...dayCells,
      ];
    });
    const csv = [header, ...rows].map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `teacher-attendance-${MONTHS[selectedMonth - 1]}-${selectedYear}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-xl shadow-lg text-white text-sm font-medium ${toast.type === 'success' ? 'bg-emerald-600' : 'bg-red-500'}`}>
          {toast.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          {toast.message}
        </div>
      )}

      {/* Edit Modal */}
      {editTarget && (
        <div className="fixed inset-0 bg-black/40 z-40 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-elevated">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div>
                <h3 className="font-display font-bold text-gray-900">Edit Attendance</h3>
                <p className="text-xs text-gray-400 mt-0.5">{editTarget.teacher.user?.name} — {selectedDate}</p>
              </div>
              <button onClick={() => setEditTarget(null)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="px-6 py-5 space-y-4">
              {/* Status */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Status</label>
                <select
                  value={modalForm.status}
                  onChange={(e) => setModalForm((f) => ({ ...f, status: e.target.value, leaveType: '' }))}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-brand-400"
                >
                  {STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>

              {/* Leave type */}
              <div>
                <label className={`block text-sm font-semibold mb-1.5 ${needsLeaveType ? 'text-gray-700' : 'text-gray-300'}`}>Leave Type</label>
                <select
                  value={modalForm.leaveType}
                  onChange={(e) => setModalForm((f) => ({ ...f, leaveType: e.target.value }))}
                  disabled={!needsLeaveType}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-brand-400 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <option value="">— None —</option>
                  {LEAVE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>

              {/* Times */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Check-In Time</label>
                  <input
                    type="time"
                    value={modalForm.checkInTime}
                    onChange={(e) => setModalForm((f) => ({ ...f, checkInTime: e.target.value }))}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-brand-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Check-Out Time</label>
                  <input
                    type="time"
                    value={modalForm.checkOutTime}
                    onChange={(e) => setModalForm((f) => ({ ...f, checkOutTime: e.target.value }))}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-brand-400"
                  />
                </div>
              </div>

              {/* Remarks */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Remarks</label>
                <textarea
                  rows={2}
                  value={modalForm.remarks}
                  onChange={(e) => setModalForm((f) => ({ ...f, remarks: e.target.value }))}
                  placeholder="Optional notes..."
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm resize-none focus:outline-none focus:border-brand-400"
                />
              </div>
            </div>

            <div className="flex gap-3 px-6 pb-6">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-brand-500 text-white text-sm font-semibold hover:bg-brand-600 disabled:opacity-50 transition-all"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                Save
              </button>
              <button
                onClick={() => setEditTarget(null)}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-semibold hover:bg-gray-50 transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Page header */}
      <div className="flex items-center gap-4">
        <Link to="/admin/teacher-attendance" className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back
        </Link>
        <div>
          <h1 className="text-2xl font-display font-bold text-gray-900">Attendance Report</h1>
          <p className="text-sm text-gray-500 mt-0.5">View and edit teacher attendance records</p>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 flex flex-wrap items-end gap-6">
        {/* View toggle */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">View</label>
          <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
            {[['date', 'Date View'], ['monthly', 'Monthly Summary']].map(([v, l]) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`px-4 py-2 rounded-[10px] text-sm font-semibold transition-all ${view === v ? 'bg-white text-brand-500 shadow-soft' : 'text-gray-400 hover:text-gray-600'}`}
              >
                {l}
              </button>
            ))}
          </div>
        </div>

        {view === 'date' ? (
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">Date</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              max={todayStr}
              className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-800 focus:outline-none focus:border-brand-400"
            />
          </div>
        ) : (
          <div className="flex gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">Month</label>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
                className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-800 focus:outline-none focus:border-brand-400"
              >
                {MONTHS.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">Year</label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-800 focus:outline-none focus:border-brand-400"
              >
                {yearOptions.map((y) => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* ── DATE VIEW ── */}
      {view === 'date' && (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="font-display font-bold text-gray-900">
              {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">{teachers.length} teachers • {records.length} records</p>
          </div>

          {loadingDate || loadingTeachers ? (
            <div className="p-12 flex justify-center"><Loader2 className="w-6 h-6 text-brand-500 animate-spin" /></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50/70 text-xs font-semibold text-gray-400 uppercase tracking-wide">
                    <th className="px-6 py-3 text-left">#</th>
                    <th className="px-4 py-3 text-left">Teacher</th>
                    <th className="px-4 py-3 text-left">Status</th>
                    <th className="px-4 py-3 text-left">Check In</th>
                    <th className="px-4 py-3 text-left">Check Out</th>
                    <th className="px-4 py-3 text-left">Leave</th>
                    <th className="px-4 py-3 text-left">Remarks</th>
                    <th className="px-6 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {teachers.map((teacher, idx) => {
                    const r = recordMap[teacher.id] || null;
                    const cfg = r ? (STATUS_CONFIG[r.status] || STATUS_CONFIG.present) : null;
                    return (
                      <tr key={teacher.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-3.5 text-xs font-mono text-gray-400">{idx + 1}</td>
                        <td className="px-4 py-3.5">
                          <p className="font-semibold text-gray-900">{teacher.user?.name || 'Unknown'}</p>
                          <p className="text-xs text-gray-400">{teacher.subject || '—'}</p>
                        </td>
                        <td className="px-4 py-3.5">
                          {r ? (
                            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${cfg.cls}`}>{cfg.label}</span>
                          ) : (
                            <span className="text-gray-300 text-xs">No record</span>
                          )}
                        </td>
                        <td className="px-4 py-3.5 text-gray-600">{formatTime(r?.checkInTime)}</td>
                        <td className="px-4 py-3.5 text-gray-600">{formatTime(r?.checkOutTime)}</td>
                        <td className="px-4 py-3.5 text-gray-500 text-xs">{r?.leaveType ? LEAVE_LABELS[r.leaveType] || r.leaveType : '—'}</td>
                        <td className="px-4 py-3.5 text-gray-500 text-xs max-w-[140px] truncate">{r?.remarks || '—'}</td>
                        <td className="px-6 py-3.5 text-right">
                          <button
                            onClick={() => openEdit(teacher, r)}
                            className="flex items-center gap-1 ml-auto px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-semibold text-gray-600 hover:border-brand-400 hover:text-brand-500 transition-all"
                          >
                            <Pencil className="w-3 h-3" /> Edit
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── MONTHLY REGISTER GRID ── */}
      {view === 'monthly' && (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between gap-3 flex-wrap">
            <div>
              <h2 className="font-display font-bold text-gray-900">{MONTHS[selectedMonth - 1]} {selectedYear} — Register</h2>
              <p className="text-xs text-gray-400 mt-0.5">In / out time per day, with monthly totals. Scroll right for all dates.</p>
            </div>
            <button
              onClick={exportGridCsv}
              disabled={summary.length === 0}
              className="flex items-center gap-2 px-3 py-2 border border-gray-200 text-gray-600 rounded-xl text-xs font-semibold hover:bg-gray-50 transition-all disabled:opacity-50"
            >
              <Download className="w-4 h-4" /> Export CSV
            </button>
          </div>

          {/* Legend */}
          <div className="px-6 py-2.5 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-gray-500 border-b border-gray-50">
            <span><b className="text-emerald-700">9:05a</b> / <b className="text-gray-400">4:30p</b> = in / out</span>
            <span><b className="text-orange-700">HD</b> half day</span>
            <span><b className="text-blue-700">CL/SL/EL/UL</b> leave</span>
            <span><b className="text-red-600">A</b> absent</span>
            <span><b className="text-purple-700">OD</b> official duty</span>
            <span><b className="text-amber-700">LT</b> late</span>
          </div>

          {loadingMonthly ? (
            <div className="p-12 flex justify-center"><Loader2 className="w-6 h-6 text-brand-500 animate-spin" /></div>
          ) : summary.length === 0 ? (
            <p className="text-center text-gray-400 text-sm py-12">No teachers found</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="text-sm border-collapse">
                <thead>
                  <tr className="bg-gray-50/70 text-[11px] font-semibold text-gray-400 uppercase tracking-wide">
                    <th className="px-3 py-2 text-left sticky left-0 bg-gray-50 z-20 min-w-[150px]">Teacher</th>
                    <th className="px-1.5 py-2 text-center" title="Present">P</th>
                    <th className="px-1.5 py-2 text-center" title="Late">LT</th>
                    <th className="px-1.5 py-2 text-center" title="Half Day">HD</th>
                    <th className="px-1.5 py-2 text-center" title="Leave">Lv</th>
                    <th className="px-1.5 py-2 text-center" title="Absent">A</th>
                    <th className="px-1.5 py-2 text-center" title="Official Duty">OD</th>
                    <th className="px-1.5 py-2 text-center border-r border-gray-200" title="Total marked days">Tot</th>
                    {days.map((d) => {
                      const weekend = dowOf(d) === 0;
                      return (
                        <th key={d} className={`px-1 py-2 text-center min-w-[44px] ${weekend ? 'bg-rose-50 text-rose-400' : ''}`}>
                          <div>{d}</div>
                          <div className="font-normal text-[9px]">{['S', 'M', 'T', 'W', 'T', 'F', 'S'][dowOf(d)]}</div>
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {summary.map((row) => (
                    <tr key={row.teacherId} className="hover:bg-gray-50/40 transition-colors">
                      <td className="px-3 py-2 sticky left-0 bg-white z-10 min-w-[150px] border-r border-gray-100">
                        <p className="font-semibold text-gray-900 text-xs truncate max-w-[140px]">{row.teacherName}</p>
                        <p className="text-[10px] text-gray-400 truncate max-w-[140px]">{row.subject || '—'}</p>
                      </td>
                      <td className="px-1.5 py-2 text-center text-xs font-bold text-emerald-700">{row.present || ''}</td>
                      <td className="px-1.5 py-2 text-center text-xs font-bold text-amber-700">{row.late || ''}</td>
                      <td className="px-1.5 py-2 text-center text-xs font-bold text-orange-700">{row.half_day || ''}</td>
                      <td className="px-1.5 py-2 text-center text-xs font-bold text-blue-700">{row.on_leave || ''}</td>
                      <td className="px-1.5 py-2 text-center text-xs font-bold text-red-600">{row.absent || ''}</td>
                      <td className="px-1.5 py-2 text-center text-xs font-bold text-purple-700">{row.official_duty || ''}</td>
                      <td className="px-1.5 py-2 text-center text-xs font-bold text-gray-900 border-r border-gray-200">{row.total || ''}</td>
                      {days.map((d) => {
                        const weekend = dowOf(d) === 0;
                        return (
                          <td key={d} className={`px-1 py-1.5 text-center ${weekend ? 'bg-rose-50/40' : ''}`}>
                            {renderDayCell(row.days?.[d])}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
