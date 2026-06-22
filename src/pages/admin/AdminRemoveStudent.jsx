import { useState, useCallback } from 'react';
import { Search, Trash2, Loader2, AlertCircle, CheckCircle2, X, UserX } from 'lucide-react';
import studentService from '../../services/studentService';

const STATUS_BADGE = {
  active:   'bg-emerald-100 text-emerald-700',
  inactive: 'bg-red-100 text-red-600',
  promoted: 'bg-blue-100 text-blue-700',
};

export default function AdminRemoveStudent() {
  const [query, setQuery] = useState('');
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [toast, setToast] = useState(null);
  const [confirmId, setConfirmId] = useState(null);

  const showToast = useCallback((type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 4000);
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setSearched(true);
    try {
      const data = await studentService.getStudents({ search: query.trim() });
      setStudents(data.students || []);
    } catch {
      showToast('error', 'Search failed. Please try again.');
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async () => {
    if (!confirmId) return;
    try {
      await studentService.removeStudent(confirmId);
      showToast('success', 'Student removed successfully');
      setStudents((prev) => prev.map((s) => s.id === confirmId ? { ...s, status: 'inactive' } : s));
      setConfirmId(null);
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Failed to remove student');
      setConfirmId(null);
    }
  };

  const confirmStudent = students.find((s) => s.id === confirmId);

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-xl shadow-lg text-white text-sm font-medium ${toast.type === 'success' ? 'bg-emerald-600' : 'bg-red-500'}`}>
          {toast.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          {toast.msg}
        </div>
      )}

      {/* Confirm modal */}
      {confirmId && (
        <div className="fixed inset-0 bg-black/40 z-40 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-elevated p-7">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                <UserX className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <h3 className="font-display font-bold text-gray-900">Remove student?</h3>
                <p className="text-sm text-gray-400">Account will be deactivated. Data is preserved.</p>
              </div>
            </div>
            {confirmStudent && (
              <div className="bg-gray-50 rounded-xl px-4 py-3 mb-5 text-sm text-gray-600">
                <p className="font-semibold text-gray-900">{confirmStudent.user?.name}</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {confirmStudent.class ? `Class ${confirmStudent.class.class_name} ${confirmStudent.class.section}` : ''} · Roll #{confirmStudent.roll_number}
                </p>
              </div>
            )}
            <div className="flex gap-3">
              <button onClick={handleRemove} className="flex-1 py-2.5 bg-red-500 text-white rounded-xl text-sm font-semibold hover:bg-red-600 transition-all">Remove</button>
              <button onClick={() => setConfirmId(null)} className="flex-1 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-all">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div>
        <h1 className="font-display text-2xl font-bold text-gray-900">Remove Student</h1>
        <p className="text-sm text-gray-400 mt-1">Search for a student to deactivate their account.</p>
      </div>

      {/* Info banner */}
      <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 text-amber-700 text-sm px-5 py-4 rounded-xl">
        <AlertCircle size={18} className="mt-0.5 shrink-0" />
        <span>Removing a student is a soft delete — all attendance, marks, and fee history are preserved. The student loses login access and is marked as inactive.</span>
      </div>

      {/* Search */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6">
        <form onSubmit={handleSearch} className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
            <input
              type="text"
              value={query}
              onChange={(e) => { setQuery(e.target.value); setSearched(false); }}
              placeholder="Search by student name..."
              className="w-full pl-10 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-brand-400"
            />
            {query && (
              <button type="button" onClick={() => { setQuery(''); setStudents([]); setSearched(false); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <button
            type="submit"
            disabled={!query.trim() || loading}
            className="px-6 py-3 bg-brand-500 text-white rounded-xl text-sm font-semibold hover:bg-brand-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
            Search
          </button>
        </form>
      </div>

      {/* Results */}
      {searched && (
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center h-32"><Loader2 className="w-6 h-6 text-brand-500 animate-spin" /></div>
          ) : students.length === 0 ? (
            <div className="py-12 text-center text-gray-400">
              <p className="font-medium">No students found for "{query}"</p>
            </div>
          ) : (
            <>
              <div className="px-6 py-4 border-b border-gray-100">
                <p className="text-sm font-medium text-gray-600">{students.length} result{students.length !== 1 ? 's' : ''} for "{query}"</p>
              </div>
              <div className="divide-y divide-gray-100">
                {students.map((s) => (
                  <div key={s.id} className="flex items-center justify-between px-6 py-4 hover:bg-gray-50/50 transition-colors">
                    <div>
                      <p className="font-semibold text-gray-900">{s.user?.name}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {s.class ? `Class ${s.class.class_name} ${s.class.section}` : ''} · Roll #{s.roll_number} · {s.user?.email}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${STATUS_BADGE[s.status] || 'bg-gray-100 text-gray-500'}`}>
                        {s.status}
                      </span>
                      {s.status !== 'inactive' && (
                        <button
                          onClick={() => setConfirmId(s.id)}
                          className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-red-200 text-red-500 text-xs font-semibold hover:bg-red-50 transition-all"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Remove
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
