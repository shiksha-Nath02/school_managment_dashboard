import { useState, useEffect, useCallback } from 'react';
import { Plus, Pencil, Trash2, Loader2, CheckCircle2, AlertCircle, X, Users } from 'lucide-react';
import svc from '@/services/staffService';

const inputCls = 'w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-800 focus:outline-none focus:border-brand-400';
const money = (n) => (n != null ? `₹${Number(n).toLocaleString('en-IN')}` : '—');
const EMPTY = { name: '', designation: '', salary: '', phone: '' };

export default function AdminStaff() {
  const [staff, setStaff]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal]     = useState(null); // null | {} (add) | staff (edit)
  const [form, setForm]       = useState(EMPTY);
  const [saving, setSaving]   = useState(false);
  const [toast, setToast]     = useState(null);

  const showToast = useCallback((type, msg) => { setToast({ type, msg }); setTimeout(() => setToast(null), 4000); }, []);

  const load = useCallback(async () => {
    setLoading(true);
    try { const d = await svc.getStaff(); setStaff(d.staff || []); }
    catch { showToast('error', 'Failed to load staff'); }
    finally { setLoading(false); }
  }, [showToast]);

  useEffect(() => { load(); }, [load]);

  const openAdd = () => { setForm(EMPTY); setModal({}); };
  const openEdit = (s) => { setForm({ name: s.name, designation: s.designation || '', salary: s.salary ?? '', phone: s.phone || '' }); setModal(s); };

  const save = async () => {
    if (!form.name.trim()) return showToast('error', 'Name is required');
    setSaving(true);
    try {
      if (modal && modal.id) await svc.updateStaff(modal.id, form);
      else await svc.addStaff(form);
      setModal(null); load();
      showToast('success', modal && modal.id ? 'Staff updated' : 'Staff added');
    } catch (e) { showToast('error', e.response?.data?.message || 'Failed to save'); }
    finally { setSaving(false); }
  };

  const remove = async (s) => {
    if (!confirm(`Remove ${s.name}?`)) return;
    try { const d = await svc.deleteStaff(s.id); load(); showToast('success', d.message || 'Removed'); }
    catch { showToast('error', 'Failed to remove'); }
  };

  return (
    <div className="space-y-6">
      {toast && (
        <div className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-xl shadow-lg text-white text-sm font-medium ${toast.type === 'success' ? 'bg-emerald-600' : 'bg-red-500'}`}>
          {toast.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          {toast.msg}
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-brand-50 border border-brand-500/20 rounded-2xl flex items-center justify-center"><Users className="w-6 h-6 text-brand-500" /></div>
          <div>
            <h1 className="font-display text-2xl font-bold text-gray-900">Non-Teaching Staff</h1>
            <p className="text-sm text-gray-400 mt-0.5">{staff.length} staff · used for salary payments</p>
          </div>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 bg-brand-500 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-brand-600 hover:-translate-y-0.5 transition-all shadow-lg shadow-brand-500/20">
          <Plus size={16} /> Add Staff
        </button>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
        <div className="hidden sm:grid grid-cols-[1fr_1fr_8rem_8rem_5rem] gap-4 px-6 py-2 bg-gray-50 border-b border-gray-100 text-xs font-semibold text-gray-400 uppercase tracking-wide">
          <span>Name</span><span>Designation</span><span className="text-right">Salary</span><span>Phone</span><span></span>
        </div>
        {loading ? (
          <div className="p-10 flex justify-center"><Loader2 className="w-6 h-6 text-brand-500 animate-spin" /></div>
        ) : staff.length === 0 ? (
          <div className="p-10 text-center text-sm text-gray-400">No staff added yet.</div>
        ) : (
          <div className="divide-y divide-gray-100">
            {staff.map((s) => (
              <div key={s.id} className={`grid grid-cols-[1fr_auto] sm:grid-cols-[1fr_1fr_8rem_8rem_5rem] gap-4 px-6 py-3.5 items-center hover:bg-gray-50/50 ${s.isActive ? '' : 'opacity-50'}`}>
                <span className="text-sm font-semibold text-gray-800">{s.name}{!s.isActive && <span className="ml-2 text-[10px] text-red-500 font-bold">INACTIVE</span>}</span>
                <span className="hidden sm:inline text-sm text-gray-500">{s.designation || '—'}</span>
                <span className="hidden sm:inline text-sm font-bold text-gray-900 text-right">{money(s.salary)}</span>
                <span className="hidden sm:inline text-sm text-gray-500">{s.phone || '—'}</span>
                <div className="flex items-center justify-end gap-2">
                  <button onClick={() => openEdit(s)} className="text-gray-300 hover:text-brand-500 p-1"><Pencil className="w-4 h-4" /></button>
                  <button onClick={() => remove(s)} className="text-gray-300 hover:text-red-500 p-1"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {modal && (
        <div className="fixed inset-0 bg-black/40 z-40 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-elevated">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="font-display font-bold text-gray-900">{modal.id ? 'Edit Staff' : 'Add Staff'}</h3>
              <button onClick={() => setModal(null)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Name <span className="text-red-400">*</span></label>
                <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="Full name" className={inputCls} autoFocus />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Designation</label>
                <input value={form.designation} onChange={(e) => setForm((f) => ({ ...f, designation: e.target.value }))} placeholder="e.g. Guard, Cleaner, Accountant" className={inputCls} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Monthly Salary (₹)</label>
                  <input type="number" min="0" value={form.salary} onChange={(e) => setForm((f) => ({ ...f, salary: e.target.value }))} placeholder="0" className={inputCls} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Phone</label>
                  <input value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} placeholder="9876543210" className={inputCls} />
                </div>
              </div>
              <div className="flex gap-3 pt-1">
                <button onClick={save} disabled={saving} className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-brand-500 text-white rounded-xl text-sm font-semibold hover:bg-brand-600 disabled:opacity-50 transition-all">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />} Save
                </button>
                <button onClick={() => setModal(null)} className="flex-1 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-all">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
