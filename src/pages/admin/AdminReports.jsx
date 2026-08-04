import { useState, useEffect, useMemo } from 'react';
import studentService from '@/services/studentService';
import { getClassReportCards } from '@/services/reportService';
import { getSiteConfig } from '@/config/siteConfig';
import { printReportCards, computeGrade } from '@/utils/reportCard';
import { EXAM_TYPES } from '@/constants';
import { FileText, Loader2, Download, Printer, Search } from 'lucide-react';

const filterCls = 'px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-brand-400 bg-white';

const AdminReports = () => {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [examType, setExamType] = useState('FA-1');
  const [search, setSearch] = useState('');
  const [data, setData] = useState(null); // { class, session, students }
  const [loading, setLoading] = useState(false);

  // Load classes once.
  useEffect(() => {
    studentService.getClasses()
      .then((res) => setClasses(res.classes || []))
      .catch(console.error);
  }, []);

  // Load the whole class's consolidated report data when the class changes.
  useEffect(() => {
    if (!selectedClass) { setData(null); return; }
    setLoading(true);
    getClassReportCards(selectedClass)
      .then((res) => setData(res.data))
      .catch((err) => { console.error(err); setData(null); })
      .finally(() => setLoading(false));
  }, [selectedClass]);

  const students = data?.students || [];

  // Client-side search by name or admission number.
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return students;
    return students.filter(
      (s) =>
        (s.name || '').toLowerCase().includes(q) ||
        String(s.admissionNumber || '').toLowerCase().includes(q)
    );
  }, [students, search]);

  // Subjects that have marks for the selected exam type (stable columns for the table).
  const subjects = useMemo(() => {
    const set = new Set();
    students.forEach((s) =>
      (s.marks || []).forEach((m) => { if (m.examType === examType) set.add(m.subject); })
    );
    return [...set].sort();
  }, [students, examType]);

  // Build a row of {subject->mark} + totals for one student & the selected exam.
  const rowFor = (student) => {
    const cells = {};
    let obtained = 0;
    let max = 0;
    let hasAny = false;
    subjects.forEach((subj) => {
      const m = (student.marks || []).find((x) => x.examType === examType && x.subject === subj);
      cells[subj] = m;
      if (m && !(m.marksObtained === null && !m.isAbsent)) {
        hasAny = true;
        obtained += m.isAbsent ? 0 : Number(m.marksObtained || 0);
        max += m.maxMarks || 0;
      }
    });
    const pct = max ? Math.round((obtained / max) * 10000) / 100 : null;
    return { cells, obtained, max, pct, hasAny };
  };

  const meta = () => {
    const cfg = getSiteConfig();
    // Report-card logo: use the config value if the school set one (e.g. an S3 URL),
    // otherwise the conventional public path per hostname. A missing file is hidden
    // by the generator's <img onerror>, so this never shows a broken image.
    const host = (typeof window !== 'undefined' ? window.location.hostname : '').replace(/^www\./, '');
    return {
      schoolName: cfg.name,
      schoolLogo: cfg.logo || (host ? `/schools/${host}/logo.png` : ''),
      address: cfg.contact?.address || '',
      className: data?.class?.className || '',
      section: data?.class?.section || '',
      sessionLabel: data?.session ? `${data.session.startYear}-${data.session.endYear}` : '',
    };
  };

  const handlePrint = () => {
    if (filtered.length === 0) return;
    printReportCards(filtered, meta());
  };

  const exportCsv = () => {
    const header = ['Roll No', 'Admission No', 'Name', ...subjects, 'Total', 'Max', 'Percentage', 'Grade'];
    const rows = filtered.map((s) => {
      const r = rowFor(s);
      const subjCols = subjects.map((subj) => {
        const m = r.cells[subj];
        if (!m) return '-';
        if (m.isAbsent) return 'AB';
        return m.marksObtained ?? '-';
      });
      return [
        s.rollNumber ?? '',
        `"${s.admissionNumber ?? ''}"`,
        `"${(s.name || '').replace(/"/g, '""')}"`,
        ...subjCols,
        r.hasAny ? r.obtained : '-',
        r.hasAny ? r.max : '-',
        r.pct != null ? r.pct : '-',
        computeGrade(r.pct),
      ];
    });
    const csv = [header, ...rows].map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `report-${data?.class?.className || 'class'}-${data?.class?.section || ''}-${examType}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const classLabel = data?.class ? `${data.class.className}-${data.class.section}` : '';

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800 font-display flex items-center gap-2">
          <FileText className="w-6 h-6 text-brand-500" /> Student Reports
        </h1>
        <p className="text-gray-400 text-sm mt-1">
          View marks per student and download report cards (one page per student).
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
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Test Type</label>
            <select value={examType} onChange={(e) => setExamType(e.target.value)} className={filterCls}>
              {EXAM_TYPES.map((et) => (
                <option key={et.value} value={et.value}>{et.label}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1 flex-1 min-w-[200px]">
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Search (name / admission no.)</label>
            <div className="relative">
              <Search className="w-4 h-4 text-gray-300 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Type a name or admission number…"
                className={filterCls + ' pl-9 w-full'}
              />
            </div>
          </div>
        </div>

        {data && (
          <div className="flex flex-wrap gap-3 mt-4">
            <button
              onClick={handlePrint}
              disabled={filtered.length === 0}
              className="flex items-center gap-2 px-4 py-2.5 bg-brand-500 text-white rounded-xl text-sm font-semibold hover:bg-brand-600 transition-all disabled:opacity-50"
            >
              <Printer className="w-4 h-4" />
              Download Report Card{filtered.length === 1 ? '' : `s (${filtered.length})`}
            </button>
            <button
              onClick={exportCsv}
              disabled={filtered.length === 0}
              className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-all disabled:opacity-50"
            >
              <Download className="w-4 h-4" /> Download CSV
            </button>
            <span className="text-xs text-gray-400 self-center">
              {classLabel} · {filtered.length} of {students.length} students · {examType}
            </span>
          </div>
        )}
      </div>

      {/* Table */}
      {!selectedClass ? (
        <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center text-gray-400">
          Select a class to view student reports.
        </div>
      ) : loading ? (
        <div className="flex items-center justify-center h-48 text-gray-400 gap-2">
          <Loader2 className="w-5 h-5 animate-spin" /> Loading reports...
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center text-gray-400">
          No students match the current filter.
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-brand-50">
                <tr>
                  <th className="px-3 py-3 text-xs font-semibold text-brand-500 uppercase text-left">Roll</th>
                  <th className="px-3 py-3 text-xs font-semibold text-brand-500 uppercase text-left">Adm No.</th>
                  <th className="px-3 py-3 text-xs font-semibold text-brand-500 uppercase text-left">Name</th>
                  {subjects.map((s) => (
                    <th key={s} className="px-3 py-3 text-xs font-semibold text-brand-500 uppercase text-center whitespace-nowrap">{s}</th>
                  ))}
                  <th className="px-3 py-3 text-xs font-semibold text-brand-500 uppercase text-center">Total</th>
                  <th className="px-3 py-3 text-xs font-semibold text-brand-500 uppercase text-center">%</th>
                  <th className="px-3 py-3 text-xs font-semibold text-brand-500 uppercase text-center">Grade</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((s, i) => {
                  const r = rowFor(s);
                  return (
                    <tr key={s.id} className={`border-t border-gray-100 ${i % 2 === 0 ? '' : 'bg-gray-50/30'}`}>
                      <td className="px-3 py-2.5 text-sm text-gray-500 tabular-nums">{s.rollNumber}</td>
                      <td className="px-3 py-2.5 text-sm text-gray-500 tabular-nums">{s.admissionNumber || '—'}</td>
                      <td className="px-3 py-2.5 text-sm font-medium text-gray-800">{s.name}</td>
                      {subjects.map((subj) => {
                        const m = r.cells[subj];
                        return (
                          <td key={subj} className="px-3 py-2.5 text-sm text-center tabular-nums text-gray-700">
                            {!m ? '—' : m.isAbsent ? <span className="text-red-500">AB</span> : (m.marksObtained ?? '—')}
                          </td>
                        );
                      })}
                      <td className="px-3 py-2.5 text-sm text-center font-semibold tabular-nums">{r.hasAny ? `${r.obtained}/${r.max}` : '—'}</td>
                      <td className="px-3 py-2.5 text-sm text-center tabular-nums">{r.pct != null ? `${r.pct}%` : '—'}</td>
                      <td className="px-3 py-2.5 text-sm text-center font-bold">{computeGrade(r.pct)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminReports;
