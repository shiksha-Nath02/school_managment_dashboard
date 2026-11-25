import { useState, useEffect, useCallback, useMemo } from 'react';
import { Loader2, CheckCircle2, AlertCircle, Trash2, Phone, UserPlus, LogOut, RotateCcw, Search, DoorOpen, Users, Clock } from 'lucide-react';
import svc from '@/services/visitorService';

const todayISO = () => {
  const n = new Date();
  return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, '0')}-${String(n.getDate()).padStart(2, '0')}`;
};
const fmtDate = (d) => (d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—');
const fmtTime = (d) => (d ? new Date(d).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : null);

const inputCls = 'border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-700 focus:outline-none focus:border-brand-400 bg-white w-full';
const labelCls = 'text-xs font-semibold text-gray-400 uppercase tracking-wide';

const EMPTY = { name: '', phone: '', whomToMeet: '', purpose: '', numPersons: 1, remarks: '' };

export default function AdminVisitors() {
  const [visitors, setVisitors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [date, setDate] = useState(todayISO());
  const [q, setQ] = useState('');
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  const showToast = useCallback((type, msg) => { setToast({ type, msg }); setTimeout(() => setToast(null), 4000); }, []);

  const load = useCallback(async () => {
    setLoading(true);
    try { const d = await svc.getVisitors({ date }); setVisitors(d.visitors || []); }
    catch { showToast('error', 'Failed to load visitors'); }
    finally { setLoading(false); }
  }, [date, showToast]);

  useEffect(() => { load(); }, [load]);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return visitors;
    return visitors.filter((v) =>
      [v.name, v.phone, v.whomToMeet, v.purpose].filter(Boolean).some((f) => f.toLowerCase().includes(term))
    );
  }, [visitors, q]);

  const insideCount = visitors.filter((v) => !v.timeOut).length;
  const peopleCount = visitors.reduce((s, v) => s + (v.numPersons || 1), 0);

  const setField = (k, val) => setForm((f) => ({ ...f, [k]: val }));

  const add = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { showToast('error', 'Visitor name is required'); return; }
    setSaving(true);
    try {
      await svc.createVisitor({ ...form, visitDate: date });
      setForm(EMPTY);
      showToast('success', 'Visitor logged');
      load();
    } catch (err) { showToast('error', err.response?.data?.message || 'Failed to log visitor'); }
    finally { setSaving(false); }
  };

  const checkout = async (v) => {
    try {
      const d = await svc.updateVisitor(v.id, { checkout: !v.timeOut });
      setVisitors((prev) => prev.map((x) => (x.id === v.id ? d.visitor : x)));
    } catch (err) { showToast('error', err.response?.data?.message || 'Failed to update'); }
  };

  const remove = async (v) => {
    if (!confirm(`Delete visitor entry for ${v.name}?`)) return;
    try { await svc.deleteVisitor(v.id); setVisitors((prev) => prev.filter((x) => x.id !== v.id)); showToast('success', 'Deleted'); }
    catch (err) { showToast('error', err.response?.data?.message || 'Failed to delete'); }
  };

  return (
    <div className="space-y-6">
      {toast && (
        <div className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-xl shadow-lg text-white text-sm font-medium ${toast.type === 'success' ? 'bg-emerald-600' : 'bg-red-500'}`}>
          {toast.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-brand-50 border border-brand-500/20 rounded-2xl flex items-center justify-center"><DoorOpen className="w-6 h-6 text-brand-500" /></div>
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900">Visitor Log</h1>
          <p className="text-sm text-gray-400 mt-0.5">{visitors.length} entries · {peopleCount} people · {insideCount} still in</p>
        </div>
      </div>

      {/* Add visitor */}
      <form onSubmit={add} className="bg-white border border-gray-200 rounded-2xl p-5 space-y-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-gray-700"><UserPlus className="w-4 h-4 text-brand-500" /> Log a visitor</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <div className="flex flex-col gap-1">
            <label className={labelCls}>Name *</label>
            <input value={form.name} onChange={(e) => setField('name', e.target.value)} className={inputCls} placeholder="Visitor name" />
          </div>
          <div className="flex flex-col gap-1">
            <label className={labelCls}>Phone</label>
            <input value={form.phone} onChange={(e) => setField('phone', e.target.value)} className={inputCls} placeholder="Mobile number" />
          </div>
          <div className="flex flex-col gap-1">
            <label className={labelCls}>Whom to meet</label>
            <input value={form.whomToMeet} onChange={(e) => setField('whomToMeet', e.target.value)} className={inputCls} placeholder="Principal / teacher / office" />
          </div>
          <div className="flex flex-col gap-1 lg:col-span-2">
            <label className={labelCls}>Purpose</label>
            <input value={form.purpose} onChange={(e) => setField('purpose', e.target.value)} className={inputCls} placeholder="Reason for visit" />
          </div>
          <div className="flex flex-col gap-1">
            <label className={labelCls}>No. of persons</label>
            <input type="number" min="1" value={form.numPersons} onChange={(e) => setField('numPersons', e.target.value)} className={inputCls} />
          </div>
          <div className="flex flex-col gap-1 lg:col-span-3">
            <label className={labelCls}>Remarks</label>
            <input value={form.remarks} onChange={(e) => setField('remarks', e.target.value)} className={inputCls} placeholder="Optional notes" />
          </div>
        </div>
        <div className="flex items-center justify-between flex-wrap gap-3">
          <p className="text-xs text-gray-400">Logging for <span className="font-semibold text-gray-600">{fmtDate(date)}</span> · check-in time stamped automatically</p>
          <button type="submit" disabled={saving} className="flex items-center gap-2 bg-brand-500 hover:bg-brand-600 disabled:opacity-60 text-white text-sm font-semibold px-4 py-2 rounded-xl">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />} Add visitor
          </button>
        </div>
      </form>

      {/* Filters */}
      <div className="bg-white border border-gray-200 rounded-2xl px-5 py-4 flex flex-wrap items-end gap-3">
        <div className="flex flex-col gap-1">
          <label className={labelCls}>Date</label>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={inputCls} />
        </div>
        <div className="flex flex-col gap-1 flex-1 min-w-[200px]">
          <label className={labelCls}>Search</label>
          <div className="relative">
            <Search className="w-4 h-4 text-gray-300 absolute left-3 top-1/2 -translate-y-1/2" />
            <input value={q} onChange={(e) => setQ(e.target.value)} className={`${inputCls} pl-9`} placeholder="Name, phone, whom to meet…" />
          </div>
        </div>
        <button onClick={() => setDate(todayISO())} className="text-sm text-brand-600 font-semibold px-3 py-2 hover:underline">Today</button>
      </div>

      {/* List */}
      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 text-brand-500 animate-spin" /></div>
      ) : filtered.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-2xl py-16 text-center text-gray-400">
          <Users className="w-8 h-8 mx-auto mb-2 text-gray-300" />
          <p className="text-sm">No visitors{visitors.length ? ' match the search' : ' logged for this date'}.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((v) => (
            <div key={v.id} className="bg-white border border-gray-200 rounded-2xl p-4">
              <div className="flex items-start gap-3 flex-wrap">
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md uppercase mt-0.5 ${v.timeOut ? 'bg-gray-100 text-gray-500' : 'bg-emerald-100 text-emerald-700'}`}>
                  {v.timeOut ? 'left' : 'in'}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800">
                    {v.name}
                    {v.numPersons > 1 && <span className="text-gray-400 font-normal"> · {v.numPersons} persons</span>}
                    {v.whomToMeet && <span className="text-gray-400 font-normal"> → {v.whomToMeet}</span>}
                  </p>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-xs text-gray-500">
                    {v.phone && <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {v.phone}</span>}
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> In {fmtTime(v.timeIn)}{v.timeOut ? ` · Out ${fmtTime(v.timeOut)}` : ''}</span>
                  </div>
                  {v.purpose && <p className="text-sm text-gray-600 mt-2">{v.purpose}</p>}
                  {v.remarks && <p className="text-xs text-gray-400 mt-1 italic">{v.remarks}</p>}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => checkout(v)}
                    className={`flex items-center gap-1 text-xs font-semibold rounded-lg px-2.5 py-1.5 ${v.timeOut ? 'bg-gray-100 text-gray-500 hover:bg-gray-200' : 'bg-brand-50 text-brand-600 hover:bg-brand-100'}`}
                  >
                    {v.timeOut ? <><RotateCcw className="w-3.5 h-3.5" /> Undo</> : <><LogOut className="w-3.5 h-3.5" /> Check out</>}
                  </button>
                  <button onClick={() => remove(v)} className="text-gray-300 hover:text-red-500 p-1"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
