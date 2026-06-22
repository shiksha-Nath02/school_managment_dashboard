import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlus, Trash2, Loader2, AlertCircle, CheckCircle2, RefreshCw, BookOpen, KeyRound } from 'lucide-react';
import teacherService from '../../services/teacherService';
import TeacherProfileDrawer from '../../components/admin/TeacherProfileDrawer';
import ResetPasswordModal from '../../components/common/ResetPasswordModal';
import { useAuth } from '../../contexts/AuthContext';

export default function AdminTeachers() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isSuperAdmin = user?.role === 'superadmin';
  const [resetUser, setResetUser] = useState(null);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [confirmId, setConfirmId] = useState(null);
  const [profileTeacher, setProfileTeacher] = useState(null);

  const showToast = useCallback((type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 4000);
  }, []);

  const fetchTeachers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await teacherService.getTeachers();
      setTeachers(data.teachers || []);
    } catch {
      showToast('error', 'Failed to load teachers');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => { fetchTeachers(); }, [fetchTeachers]);

  const handleRemove = async () => {
    if (!confirmId) return;
    try {
      await teacherService.removeTeacher(confirmId);
      showToast('success', 'Teacher removed successfully');
      setConfirmId(null);
      fetchTeachers();
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Failed to remove teacher');
      setConfirmId(null);
    }
  };

  const confirmTeacher = teachers.find((t) => t.id === confirmId);

  return (
    <div className="space-y-6">
      {/* Teacher profile drawer */}
      <TeacherProfileDrawer
        teacher={profileTeacher}
        onClose={() => setProfileTeacher(null)}
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
                <h3 className="font-display font-bold text-gray-900">Remove teacher?</h3>
                <p className="text-sm text-gray-400">Their account will be deactivated</p>
              </div>
            </div>
            {confirmTeacher && (
              <p className="text-sm text-gray-600 bg-gray-50 rounded-xl px-4 py-3 mb-5">
                <span className="font-semibold">{confirmTeacher.user?.name}</span>
                {confirmTeacher.subject ? ` — ${confirmTeacher.subject}` : ''}
              </p>
            )}
            <div className="flex gap-3">
              <button onClick={handleRemove} className="flex-1 py-2.5 bg-red-500 text-white rounded-xl text-sm font-semibold hover:bg-red-600 transition-all">
                Remove
              </button>
              <button onClick={() => setConfirmId(null)} className="flex-1 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-all">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900">All Teachers</h1>
          <p className="text-sm text-gray-400 mt-1">{teachers.length} active teachers</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={fetchTeachers} className="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-700 transition-colors">
            <RefreshCw size={14} /> Refresh
          </button>
          <button
            onClick={() => navigate('/admin/add-teacher')}
            className="flex items-center gap-2 bg-brand-500 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-brand-600 hover:-translate-y-0.5 transition-all shadow-lg shadow-brand-500/20"
          >
            <UserPlus size={16} /> Add teacher
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <Loader2 className="w-6 h-6 text-brand-500 animate-spin" />
          </div>
        ) : teachers.length === 0 ? (
          <div className="py-16 text-center text-gray-400">
            <BookOpen className="w-10 h-10 mx-auto mb-3 text-gray-200" />
            <p className="font-medium">No teachers found</p>
            <button onClick={() => navigate('/admin/add-teacher')} className="mt-3 text-sm text-brand-500 hover:text-brand-600 font-semibold">
              Add the first teacher
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50/70 text-xs font-semibold text-gray-400 uppercase tracking-wide">
                  <th className="px-6 py-3 text-left">#</th>
                  <th className="px-4 py-3 text-left">Name</th>
                  <th className="px-4 py-3 text-left">Subject</th>
                  <th className="px-4 py-3 text-left">Email</th>
                  <th className="px-4 py-3 text-left">Phone</th>
                  <th className="px-4 py-3 text-left">Salary</th>
                  <th className="px-4 py-3 text-left">Joined</th>
                  <th className="px-6 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {teachers.map((t, idx) => (
                  <tr
                    key={t.id}
                    onClick={() => setProfileTeacher(t)}
                    className="hover:bg-brand-50/40 transition-colors cursor-pointer"
                  >
                    <td className="px-6 py-3.5 font-mono text-xs text-gray-400">{idx + 1}</td>
                    <td className="px-4 py-3.5">
                      <p className="font-semibold text-gray-900">{t.user?.name || '—'}</p>
                      <p className="text-xs text-gray-400">{t.user?.email || '—'}</p>
                    </td>
                    <td className="px-4 py-3.5 text-gray-600">{t.subject || '—'}</td>
                    <td className="px-4 py-3.5 text-gray-500">{t.user?.email || '—'}</td>
                    <td className="px-4 py-3.5 text-gray-500">{t.user?.phone || '—'}</td>
                    <td className="px-4 py-3.5 text-gray-700 font-medium">
                      {t.salary ? `₹${Number(t.salary).toLocaleString()}` : '—'}
                    </td>
                    <td className="px-4 py-3.5 text-gray-500">
                      {t.joining_date ? new Date(t.joining_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                    </td>
                    <td className="px-6 py-3.5 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-2">
                        {isSuperAdmin && t.user?.id && (
                          <button
                            onClick={() => setResetUser({ id: t.user.id, name: t.user.name || `Teacher ${t.id}` })}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-semibold text-gray-500 hover:border-brand-300 hover:text-brand-600 transition-all"
                          >
                            <KeyRound className="w-3 h-3" /> Reset
                          </button>
                        )}
                        <button
                          onClick={() => setConfirmId(t.id)}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-semibold text-gray-500 hover:border-red-300 hover:text-red-500 transition-all"
                        >
                          <Trash2 className="w-3 h-3" /> Remove
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
