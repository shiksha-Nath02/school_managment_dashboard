import { useState, useEffect, useCallback, useMemo } from 'react';
import { Search, Download, Loader2, AlertCircle, CheckCircle2, X, RefreshCw, FolderOpen } from 'lucide-react';
import api from '../../services/api';
import StudentProfileDrawer from '../../components/admin/StudentProfileDrawer';
import StudentDocsTab from '../../components/admin/StudentDocsTab';

const STATUS_BADGE = {
  active:   'bg-emerald-100 text-emerald-700',
  inactive: 'bg-red-100 text-red-600',
  promoted: 'bg-blue-100 text-blue-700',
};

export default function TeacherStudents() {
  const [tab, setTab] = useState('list');
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [classFilter, setClassFilter] = useState('');
  const [toast, setToast] = useState(null);
  const [profileStudent, setProfileStudent] = useState(null);
  const [canEditStudents, setCanEditStudents] = useState(false);

  const showToast = useCallback((type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 4000);
  }, []);

  const fetchStudents = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (classFilter) params.class_id = classFilter;
      const r = await api.get('/teacher/my-students', { params });
      setStudents(r.data.students || []);
      setCanEditStudents(!!r.data.canEditStudents);
      if (!classFilter && r.data.classes?.length) setClasses(r.data.classes);
    } catch {
      showToast('error', 'Failed to load students');
    } finally {
      setLoading(false);
    }
  }, [classFilter, showToast]);

  useEffect(() => { fetchStudents(); }, [fetchStudents]);

  const filteredStudents = useMemo(() => {
    if (!search) return students;
    const q = search.toLowerCase();
    return students.filter((s) => (s.user?.name || '').toLowerCase().includes(q));
  }, [students, search]);

  const exportCsv = () => {
    const q = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
    const header = ['Adm No', 'Roll No', 'Name', 'Email', 'Phone', 'Class', 'Status'];
    const rows = filteredStudents.map((s) => [
      s.admission_number ?? s.id, s.roll_number,
      q(s.user?.name), q(s.user?.email), q(s.user?.phone || ''),
      q(s.class ? `Class ${s.class.class_name} ${s.class.section}` : ''),
      s.status,
    ]);
    const csv = [header, ...rows].map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `my-students${classFilter ? `-class${classFilter}` : ''}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <StudentProfileDrawer
        student={profileStudent}
        onClose={() => setProfileStudent(null)}
        readOnly={!canEditStudents}
        updateStudent={async (id, data) => {
          const res = await api.put(`/teacher/students/${id}`, data);
          showToast('success', 'Student updated');
          return res.data;
        }}
        onUpdated={fetchStudents}
      />

      {toast && (
        <div className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-xl shadow-lg text-white text-sm font-medium ${toast.type === 'success' ? 'bg-emerald-600' : 'bg-red-500'}`}>
          {toast.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900">My Students</h1>
          {tab === 'list' && (
            <p className="text-sm text-gray-400 mt-1">{filteredStudents.length} students</p>
          )}
        </div>
        {tab === 'list' && (
          <button onClick={exportCsv} disabled={filteredStudents.length === 0}
            className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm font-semibold hover:bg-gray-50 disabled:opacity-40 transition-all">
            <Download size={15} /> Export CSV
          </button>
        )}
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 w-fit">
        <button
          onClick={() => setTab('list')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${tab === 'list' ? 'bg-white shadow text-teacher-600' : 'text-gray-500 hover:text-gray-700'}`}
        >
          <Search className="w-4 h-4" /> Student List
        </button>
        <button
          onClick={() => setTab('docs')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${tab === 'docs' ? 'bg-white shadow text-teacher-600' : 'text-gray-500 hover:text-gray-700'}`}
        >
          <FolderOpen className="w-4 h-4" /> Documents
        </button>
      </div>

      {tab === 'docs' && <StudentDocsTab role="teacher" />}

      {tab === 'list' && (
        <>
          {/* Filters */}
          <div className="bg-white border border-gray-200 rounded-2xl p-5 flex flex-wrap items-center gap-4">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name..."
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-teacher-400"
              />
              {search && (
                <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {classes.length > 1 && (
              <select
                value={classFilter}
                onChange={(e) => setClassFilter(e.target.value)}
                className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-700 focus:outline-none focus:border-teacher-400"
              >
                <option value="">All my classes</option>
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>Class {c.class_name} {c.section}</option>
                ))}
              </select>
            )}

            <button onClick={fetchStudents} className="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-700 transition-colors">
              <RefreshCw size={14} /> Refresh
            </button>
          </div>

          {/* Table */}
          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
            {loading ? (
              <div className="flex items-center justify-center h-48">
                <Loader2 className="w-6 h-6 text-teacher-500 animate-spin" />
              </div>
            ) : filteredStudents.length === 0 ? (
              <div className="py-16 text-center text-gray-400">
                <p className="font-medium">No students found</p>
                <p className="text-sm mt-1">Try adjusting your search or filter</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50/70 text-xs font-semibold text-gray-400 uppercase tracking-wide">
                      <th className="px-6 py-3 text-left">Adm No</th>
                      <th className="px-4 py-3 text-left">Roll</th>
                      <th className="px-4 py-3 text-left">Name</th>
                      <th className="px-4 py-3 text-left">Class</th>
                      <th className="px-4 py-3 text-left">Email</th>
                      <th className="px-4 py-3 text-left">Phone</th>
                      <th className="px-4 py-3 text-left">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredStudents.map((s) => (
                      <tr
                        key={s.id}
                        onClick={() => setProfileStudent(s)}
                        className="hover:bg-teacher-50/40 transition-colors cursor-pointer"
                      >
                        <td className="px-6 py-3.5 font-mono text-xs font-bold text-teacher-600">{s.admission_number ?? s.id}</td>
                        <td className="px-4 py-3.5 font-mono text-xs text-gray-400">{s.roll_number}</td>
                        <td className="px-4 py-3.5 font-semibold text-gray-900">{s.user?.name || '—'}</td>
                        <td className="px-4 py-3.5 text-gray-600">
                          {s.class ? `Class ${s.class.class_name} ${s.class.section}` : '—'}
                        </td>
                        <td className="px-4 py-3.5 text-gray-500">{s.user?.email || '—'}</td>
                        <td className="px-4 py-3.5 text-gray-500">{s.user?.phone || '—'}</td>
                        <td className="px-4 py-3.5">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${STATUS_BADGE[s.status] || 'bg-gray-100 text-gray-500'}`}>
                            {s.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
