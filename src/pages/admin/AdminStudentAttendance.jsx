import { useState, useEffect, useMemo } from 'react';
import studentService from '@/services/studentService';
import { getClassAttendanceSummary } from '@/services/reportService';
import { CalendarCheck, Loader2, Download, Search } from 'lucide-react';

const filterCls = 'px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-brand-400 bg-white';

// Default range: 1st of the current month → today.
const todayIso = () => new Date().toISOString().split('T')[0];
const monthStartIso = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`;
};

const AdminStudentAttendance = () => {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [from, setFrom] = useState(monthStartIso());
  const [to, setTo] = useState(todayIso());
  const [search, setSearch] = useState('');
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    studentService.getClasses()
      .then((res) => setClasses(res.classes || []))
      .catch(console.error);
  }, []);

  const load = () => {
    if (!selectedClass) return;
    setLoading(true);
    getClassAttendanceSummary({ classId: selectedClass, from, to })
      .then((res) => { setRows(res.data.students || []); setLoaded(true); })
      .catch((err) => { console.error(err); setRows([]); })
      .finally(() => setLoading(false));
  };

  // Auto-load when class changes; also reload when dates change (if a class is picked).
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [selectedClass, from, to]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(
      (r) =>
        (r.name || '').toLowerCase().includes(q) ||
        String(r.admissionNumber || '').toLowerCase().includes(q)
    );
  }, [rows, search]);

  const pctColor = (p) => {
    if (p == null) return 'text-gray-400 bg-gray-50 border border-gray-200';
    if (p >= 90) return 'text-green-600 bg-green-50 border border-green-200';
    if (p >= 75) return 'text-amber-600 bg-amber-50 border border-amber-200';
    return 'text-red-600 bg-red-50 border border-red-200';
  };

  const exportCsv = () => {
    const header = ['Roll No', 'Admission No', 'Name', 'Present', 'Absent', 'Total', 'Percentage'];
    const csvRows = filtered.map((r) => [
      r.rollNumber ?? '',
      `"${r.admissionNumber ?? ''}"`,
      `"${(r.name || '').replace(/"/g, '""')}"`,
      r.present, r.absent, r.total, r.percentage != null ? r.percentage : '-',
    ]);
    const csv = [header, ...csvRows].map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance-${from}_to_${to}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800 font-display flex items-center gap-2">
          <CalendarCheck className="w-6 h-6 text-brand-500" /> Student Attendance
        </h1>
        <p className="text-gray-400 text-sm mt-1">
          Attendance summary per student over a date range.
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white border border-gray-200 rounded-2xl px-5 py-4">
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Class</label>
            <select value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)} className={filterCls}>
              <option value="">— Select a class —</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>{c.class_name}-{c.section}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide">From</label>
            <input type="date" value={from} max={to} onChange={(e) => setFrom(e.target.value)} className={filterCls} />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide">To</label>
            <input type="date" value={to} min={from} max={todayIso()} onChange={(e) => setTo(e.target.value)} className={filterCls} />
          </div>
          <div className="flex flex-col gap-1 flex-1 min-w-[180px]">
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Search</label>
            <div className="relative">
              <Search className="w-4 h-4 text-gray-300 absolute left-3 top-1/2 -translate-y-1/2" />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Name or admission no…" className={filterCls + ' pl-9 w-full'} />
            </div>
          </div>
          {loaded && selectedClass && (
            <button onClick={exportCsv} disabled={filtered.length === 0}
              className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-all disabled:opacity-50">
              <Download className="w-4 h-4" /> Export CSV
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      {!selectedClass ? (
        <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center text-gray-400">
          Select a class to view attendance.
        </div>
      ) : loading ? (
        <div className="flex items-center justify-center h-48 text-gray-400 gap-2">
          <Loader2 className="w-5 h-5 animate-spin" /> Loading attendance...
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center text-gray-400">
          No attendance records for this class in the selected range.
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
          <table className="w-full">
            <thead className="bg-brand-50">
              <tr>
                <th className="px-4 py-3 text-xs font-semibold text-brand-500 uppercase text-left">Roll</th>
                <th className="px-4 py-3 text-xs font-semibold text-brand-500 uppercase text-left">Adm No.</th>
                <th className="px-4 py-3 text-xs font-semibold text-brand-500 uppercase text-left">Name</th>
                <th className="px-4 py-3 text-xs font-semibold text-brand-500 uppercase text-center">Present</th>
                <th className="px-4 py-3 text-xs font-semibold text-brand-500 uppercase text-center">Absent</th>
                <th className="px-4 py-3 text-xs font-semibold text-brand-500 uppercase text-center">Total</th>
                <th className="px-4 py-3 text-xs font-semibold text-brand-500 uppercase text-center">%</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r, i) => (
                <tr key={r.id} className={`border-t border-gray-100 ${i % 2 === 0 ? '' : 'bg-gray-50/30'}`}>
                  <td className="px-4 py-2.5 text-sm text-gray-500 tabular-nums">{r.rollNumber}</td>
                  <td className="px-4 py-2.5 text-sm text-gray-500 tabular-nums">{r.admissionNumber || '—'}</td>
                  <td className="px-4 py-2.5 text-sm font-medium text-gray-800">{r.name}</td>
                  <td className="px-4 py-2.5 text-sm text-center text-green-600 font-semibold tabular-nums">{r.present}</td>
                  <td className="px-4 py-2.5 text-sm text-center text-red-500 font-semibold tabular-nums">{r.absent}</td>
                  <td className="px-4 py-2.5 text-sm text-center text-gray-600 tabular-nums">{r.total}</td>
                  <td className="px-4 py-2.5 text-center">
                    <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${pctColor(r.percentage)}`}>
                      {r.percentage != null ? `${r.percentage}%` : '—'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminStudentAttendance;
