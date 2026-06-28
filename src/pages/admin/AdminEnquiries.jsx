import { useState, useEffect, useCallback, useMemo } from 'react';
import { Loader2, CheckCircle2, AlertCircle, Trash2, Mail, Phone, MessageSquare, Inbox } from 'lucide-react';
import svc from '@/services/enquiryService';

const fmtDate = (d) => (d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—');
const STATUS = ['new', 'contacted', 'closed'];
const STATUS_BADGE = {
  new:       'bg-blue-100 text-blue-700',
  contacted: 'bg-amber-100 text-amber-700',
  closed:    'bg-gray-100 text-gray-500',
};
const TYPE_BADGE = {
  student: 'bg-brand-100 text-brand-600',
  teacher: 'bg-purple-100 text-purple-600',
};
const filterCls = 'border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-700 focus:outline-none focus:border-brand-400 bg-white';

export default function AdminEnquiries() {
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const showToast = useCallback((type, msg) => { setToast({ type, msg }); setTimeout(() => setToast(null), 4000); }, []);

  const load = useCallback(async () => {
    setLoading(true);
    try { const d = await svc.getEnquiries(); setEnquiries(d.enquiries || []); }
    catch { showToast('error', 'Failed to load enquiries'); }
    finally { setLoading(false); }
  }, [showToast]);

  useEffect(() => { load(); }, [load]);

  const filtered = useMemo(() => enquiries.filter((e) =>
    (!typeFilter || e.type === typeFilter) && (!statusFilter || e.status === statusFilter)
  ), [enquiries, typeFilter, statusFilter]);

  const newCount = enquiries.filter((e) => e.status === 'new').length;

  const setStatus = async (e, status) => {
    try {
      await svc.updateEnquiry(e.id, { status });
      setEnquiries((prev) => prev.map((x) => (x.id === e.id ? { ...x, status } : x)));
    } catch { showToast('error', 'Failed to update'); }
  };

  const remove = async (e) => {
    if (!confirm(`Delete enquiry from ${e.name}?`)) return;
    try { await svc.deleteEnquiry(e.id); setEnquiries((prev) => prev.filter((x) => x.id !== e.id)); showToast('success', 'Deleted'); }
    catch { showToast('error', 'Failed to delete'); }
  };

  return (
    <div className="space-y-6">
      {toast && (
        <div className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-xl shadow-lg text-white text-sm font-medium ${toast.type === 'success' ? 'bg-emerald-600' : 'bg-red-500'}`}>
          {toast.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          {toast.msg}
        </div>
      )}

      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-brand-50 border border-brand-500/20 rounded-2xl flex items-center justify-center"><Inbox className="w-6 h-6 text-brand-500" /></div>
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900">Enquiries</h1>
          <p className="text-sm text-gray-400 mt-0.5">{enquiries.length} total · {newCount} new</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border border-gray-200 rounded-2xl px-5 py-4 flex flex-wrap items-end gap-3">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Type</label>
          <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className={filterCls}>
            <option value="">All</option>
            <option value="student">Student</option>
            <option value="teacher">Teacher</option>
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Status</label>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className={filterCls}>
            <option value="">All</option>
            {STATUS.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 text-brand-500 animate-spin" /></div>
      ) : filtered.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-2xl py-16 text-center text-gray-400">
          <Inbox className="w-8 h-8 mx-auto mb-2 text-gray-300" />
          <p className="text-sm">No enquiries{enquiries.length ? ' match the filters' : ' yet'}.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((e) => (
            <div key={e.id} className="bg-white border border-gray-200 rounded-2xl p-4">
              <div className="flex items-start gap-3 flex-wrap">
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md uppercase mt-0.5 ${TYPE_BADGE[e.type]}`}>{e.type}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800">{e.name}{e.detail ? <span className="text-gray-400 font-normal"> · {e.detail}</span> : null}</p>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-xs text-gray-500">
                    {e.phone && <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {e.phone}</span>}
                    {e.email && <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {e.email}</span>}
                    <span>{fmtDate(e.createdAt)}</span>
                  </div>
                  {e.message && <p className="text-sm text-gray-600 mt-2 flex items-start gap-1.5"><MessageSquare className="w-3.5 h-3.5 mt-0.5 shrink-0 text-gray-300" /> {e.message}</p>}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <select value={e.status} onChange={(ev) => setStatus(e, ev.target.value)} className={`text-xs font-semibold rounded-lg px-2 py-1 border-0 cursor-pointer ${STATUS_BADGE[e.status]}`}>
                    {STATUS.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <button onClick={() => remove(e)} className="text-gray-300 hover:text-red-500 p-1"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
