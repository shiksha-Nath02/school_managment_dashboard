import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, UserPlus, Trash2, Loader2, AlertCircle, X, CheckCircle2, RefreshCw, Download, FolderOpen, KeyRound } from 'lucide-react';
import studentService from '../../services/studentService';
import StudentProfileDrawer from '../../components/admin/StudentProfileDrawer';
import StudentDocsTab from '../../components/admin/StudentDocsTab';
import ResetPasswordModal from '../../components/common/ResetPasswordModal';
import { useAuth } from '../../contexts/AuthContext';

const STATUS_BADGE = {
  active:   'bg-emerald-100 text-emerald-700',
  inactive: 'bg-red-100 text-red-600',
  promoted: 'bg-blue-100 text-blue-700',
};

export default function AdminStudents() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isSuperAdmin = user?.role === 'superadmin';
  const [resetUser, setResetUser] = useState(null); // { id, name } of user whose password to reset
  const [tab, setTab] = useState('list');
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [classFilter, setClassFilter] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [toast, setToast] = useState(null);
  const [confirmId, setConfirmId] = useState(null); // student id to remove
  const [profileStudent, setProfileStudent] = useState(null); // student object for drawer

  const showToast = useCallback((type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 4000);
  }, []);

  const fetchStudents = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (classFilter) params.class_id = classFilter;
      if (search) params.search = search;
      const data = await studentService.getStudents(params);
      setStudents(data.students || []);
    } catch {
      showToast('error', 'Failed to load students');
    } finally {
      setLoading(false);
    }
  }, [classFilter, search, showToast]);

  useEffect(() => {
    studentService.getClasses().then((d) => setClasses(d.classes || []));
  }, []);

  useEffect(() => {
    const t = setTimeout(fetchStudents, search ? 400 : 0);
    return () => clearTimeout(t);
  }, [fetchStudents, search]);

  const handleRemove = async () => {
    if (!confirmId) return;
    try {
      await studentService.removeStudent(confirmId);
      showToast('success', 'Student removed successfully');
      setConfirmId(null);
      fetchStudents();
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Failed to remove student');
      setConfirmId(null);
    }
  };

  const filteredStudents = useMemo(() => {
    if (!filterCategory) return students;
    return students.filter((s) => s.category === filterCategory);
  }, [students, filterCategory]);

  const confirmStudent = students.find((s) => s.id === confirmId);

  const exportCsv = () => {
    const q = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
    const header = [
      'Adm No', 'Roll No', 'Name', 'Email', 'Phone', 'Class', 'Status',
      'Date of Birth', 'Blood Group', 'Category', 'Religion', 'Nationality',
      'Aadhaar No', 'Address', 'City', 'State', 'Pincode', 'Admission Date',
      "Father's Name", "Father's Phone", "Father's Aadhaar",
      "Mother's Name", "Mother's Phone", "Mother's Aadhaar",
      "Parents' PAN", 'Birth Certificate No', 'EWS/Category Cert. No',
    ];
    const rows = filteredStudents.map((s) => [
      s.admission_number ?? s.id, s.roll_number,
      q(s.user?.name), q(s.user?.email), q(s.user?.phone || ''),
      q(s.class ? `Class ${s.class.class_name} ${s.class.section}` : ''),
      s.status,
      s.date_of_birth || '', s.blood_group || '', s.category || '',
      q(s.religion || ''), q(s.nationality || 'Indian'),
      s.aadhaar_number || '', q(s.address || ''),
      q(s.city || ''), q(s.state || ''), s.pincode || '',
      s.admission_date || '',
      q(s.father_name || ''), q(s.father_phone || ''), s.father_aadhaar || '',
      q(s.mother_name || ''), q(s.mother_phone || ''), s.mother_aadhaar || '',
      s.parents_pan || '', s.birth_certificate_number || '', s.ews_certificate_number || '',
    ]);
    const csv = [header, ...rows].map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `students${classFilter ? `-class${classFilter}` : ''}${filterCategory ? `-${filterCategory}` : ''}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Student profile drawer */}
      <StudentProfileDrawer
        student={profileStudent}
        onClose={() => setProfileStudent(null)}
        onUpdated={fetchStudents}
      />

      {/* Reset password modal (super admin only) */}
      <ResetPasswordModal
        open={!!resetUser}
        userId={resetUser?.id}
        userName={resetUser?.name}
        onClose={() => setResetUser(null)}
        onSuccess={() => showToast('success', 'Password reset successfully')}
      />

      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-xl shadow-lg text-white text-sm font-medium ${toast.type === 'success' ? 'bg-emerald-600' : 'bg-red-500'}`}>
          {toast.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          {toast.msg}
        </div>
      )}

      {/* Confirm removal modal */}
      {confirmId && (
        <div className="fixed inset-0 bg-black/40 z-40 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-elevated p-7">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                <Trash2 className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <h3 className="font-display font-bold text-gray-900">Remove student?</h3>
                <p className="text-sm text-gray-400">This will deactivate the account</p>
              </div>
            </div>
            {confirmStudent && (
              <p className="text-sm text-gray-600 bg-gray-50 rounded-xl px-4 py-3 mb-5">
                <span className="font-semibold">{confirmStudent.user?.name}</span>
                {' — '}Class {confirmStudent.class?.class_name}{confirmStudent.class?.section ? ` ${confirmStudent.class.section}` : ''}
              </p>
            )}
            <div className="flex gap-3">
              <button
                onClick={handleRemove}
                className="flex-1 py-2.5 bg-red-500 text-white rounded-xl text-sm font-semibold hover:bg-red-600 transition-all"
              >
                Remove
              </button>
              <button
                onClick={() => setConfirmId(null)}
                className="flex-1 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900">Students</h1>
          {tab === 'list' && (
            <p className="text-sm text-gray-400 mt-1">{filteredStudents.length}{filterCategory || classFilter ? ` of ${students.length}` : ''} students{classFilter ? ' in selected class' : ''}</p>
          )}
        </div>
        {tab === 'list' && (
          <div className="flex items-center gap-2">
            <button onClick={exportCsv} disabled={filteredStudents.length === 0}
              className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm font-semibold hover:bg-gray-50 disabled:opacity-40 transition-all">
              <Download size={15} /> Export CSV
            </button>
            <button
              onClick={() => navigate('/admin/add-student')}
              className="flex items-center gap-2 bg-brand-500 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-brand-600 hover:-translate-y-0.5 transition-all shadow-lg shadow-brand-500/20"
            >
              <UserPlus size={16} /> Add student
            </button>
          </div>
        )}
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 w-fit">
        <button
          onClick={() => setTab('list')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${tab === 'list' ? 'bg-white shadow text-brand-600' : 'text-gray-500 hover:text-gray-700'}`}
        >
          <Search className="w-4 h-4" /> Student List
        </button>
        <button
          onClick={() => setTab('docs')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${tab === 'docs' ? 'bg-white shadow text-brand-600' : 'text-gray-500 hover:text-gray-700'}`}
        >
          <FolderOpen className="w-4 h-4" /> Documents
        </button>
      </div>

      {/* Documents tab */}
      {tab === 'docs' && <StudentDocsTab />}

      {tab === 'list' && <>
      {/* Filters */}
      <div className="bg-white border border-gray-200 rounded-2xl p-5 flex flex-wrap items-center gap-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name..."
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-brand-400"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <select
          value={classFilter}
          onChange={(e) => setClassFilter(e.target.value)}
          className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-700 focus:outline-none focus:border-brand-400"
        >
          <option value="">All classes</option>
          {classes.map((c) => (
            <option key={c.id} value={c.id}>Class {c.class_name} {c.section}</option>
          ))}
        </select>

        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-700 focus:outline-none focus:border-brand-400"
        >
          <option value="">All categories</option>
          {['General', 'OBC', 'SC', 'ST', 'EWS'].map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>

        <button onClick={fetchStudents} className="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-700 transition-colors">
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <Loader2 className="w-6 h-6 text-brand-500 animate-spin" />
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
                  <th className="px-6 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredStudents.map((s) => (
                  <tr
                    key={s.id}
                    onClick={() => setProfileStudent(s)}
                    className="hover:bg-brand-50/40 transition-colors cursor-pointer"
                  >
                    <td className="px-6 py-3.5 font-mono text-xs font-bold text-brand-600">{s.admission_number ?? s.id}</td>
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
                    <td className="px-6 py-3.5 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-2">
                        {isSuperAdmin && s.user?.id && (
                          <button
                            onClick={() => setResetUser({ id: s.user.id, name: s.user.name || `Student ${s.id}` })}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-semibold text-gray-500 hover:border-brand-300 hover:text-brand-600 transition-all"
                          >
                            <KeyRound className="w-3 h-3" /> Reset
                          </button>
                        )}
                        {s.status !== 'inactive' && (
                          <button
                            onClick={() => setConfirmId(s.id)}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-semibold text-gray-500 hover:border-red-300 hover:text-red-500 transition-all"
                          >
                            <Trash2 className="w-3 h-3" /> Remove
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      </>}
    </div>
  );
}
