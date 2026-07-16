import { useState, useEffect, useCallback } from 'react';
import { Plus, Trash2, Loader2, ArrowUpRight, ArrowDownRight, Wallet } from 'lucide-react';
import svc from '@/services/expenseService';

const today    = () => new Date().toISOString().split('T')[0];
const fmtMoney = (n) => `₹${Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
const fmtDate  = (d) => (d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—');
const inputCls = 'w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-800 focus:outline-none focus:border-brand-400';

// One reconciliation column: cash / online / total.
function SummaryCard({ title, data, tone, icon }) {
  const toneCls = tone === 'income'
    ? 'bg-green-50 border-green-200 text-green-700'
    : tone === 'exp'
      ? 'bg-red-50 border-red-200 text-red-700'
      : 'bg-brand-50 border-brand-500/20 text-brand-600';
  return (
    <div className={`border rounded-2xl p-4 ${toneCls.split(' ').slice(0, 2).join(' ')}`}>
      <div className="flex items-center gap-1.5 text-xs mb-2 font-semibold uppercase tracking-wide opacity-80">
        {icon} {title}
      </div>
      <div className="space-y-1">
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Cash</span>
          <span className="font-semibold tabular-nums text-gray-800">{fmtMoney(data?.cash)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Online</span>
          <span className="font-semibold tabular-nums text-gray-800">{fmtMoney(data?.online)}</span>
        </div>
        <div className={`flex justify-between text-base pt-1.5 mt-1 border-t border-black/5 font-bold font-display ${toneCls.split(' ').slice(2).join(' ')}`}>
          <span>Total</span>
          <span className="tabular-nums">{fmtMoney(data?.total)}</span>
        </div>
      </div>
    </div>
  );
}

export default function HandoverPanel() {
  const [from, setFrom] = useState(today());
  const [to, setTo]     = useState(today());

  const [summary, setSummary]     = useState(null);
  const [handovers, setHandovers] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [saving, setSaving]       = useState(false);
  const [toast, setToast]         = useState(null);

  const [form, setForm] = useState({ date: today(), cash: '', online: '', remarks: '' });

  const showToast = (type, msg) => { setToast({ type, msg }); setTimeout(() => setToast(null), 4000); };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [s, h] = await Promise.all([
        svc.getHandoverSummary({ from, to }),
        svc.getHandovers({ from, to }),
      ]);
      setSummary(s);
      setHandovers(h.handovers || []);
    } catch {
      showToast('error', 'Failed to load handover data');
    } finally {
      setLoading(false);
    }
  }, [from, to]);

  useEffect(() => { load(); }, [load]);

  const handleAdd = async () => {
    const cash = parseFloat(form.cash) || 0;
    const online = parseFloat(form.online) || 0;
    if (!form.date) return showToast('error', 'Pick a date');
    if (cash <= 0 && online <= 0) return showToast('error', 'Enter a cash and/or online amount');
    setSaving(true);
    try {
      await svc.addHandover({ date: form.date, cash_amount: cash, online_amount: online, remarks: form.remarks || null });
      setForm({ date: today(), cash: '', online: '', remarks: '' });
      showToast('success', 'Handover recorded');
      load();
    } catch (e) {
      showToast('error', e.response?.data?.message || 'Failed to record handover');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (h) => {
    if (!confirm(`Delete handover of ${fmtMoney(h.total)} on ${fmtDate(h.date)}?`)) return;
    try {
      await svc.deleteHandover(h.id);
      setHandovers((prev) => prev.filter((x) => x.id !== h.id));
      load();
    } catch {
      showToast('error', 'Failed to delete');
    }
  };

  // Reconciliation: (income − expenditure) should equal the handover.
  const expectedTotal = (summary?.income?.total || 0) - (summary?.expenditure?.total || 0);
  const diff = expectedTotal - (summary?.handover?.total || 0);
  const balanced = Math.abs(diff) < 0.01;

  return (
    <div className="space-y-6">
      {toast && (
        <div className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-xl shadow-lg text-white text-sm font-medium ${toast.type === 'success' ? 'bg-emerald-600' : 'bg-red-500'}`}>
          {toast.msg}
        </div>
      )}

      {/* Date range */}
      <div className="bg-white border border-gray-200 rounded-2xl px-5 py-4 flex flex-wrap items-end gap-3">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide">From</label>
          <input type="date" value={from} max={to} onChange={(e) => setFrom(e.target.value)} className={`${inputCls} w-auto`} />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide">To</label>
          <input type="date" value={to} min={from} onChange={(e) => setTo(e.target.value)} className={`${inputCls} w-auto`} />
        </div>
        <button onClick={() => { setFrom(today()); setTo(today()); }}
          className="px-3 py-2 bg-gray-100 text-gray-500 rounded-lg text-xs font-medium hover:bg-gray-200 transition-colors self-end">
          Today
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-40 text-gray-400 gap-2"><Loader2 className="w-5 h-5 animate-spin" /> Loading...</div>
      ) : (
        <>
          {/* Three totals: income / expenditure / handover (each cash + online) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <SummaryCard title="Income"      data={summary?.income}      tone="income" icon={<ArrowUpRight className="w-3.5 h-3.5" />} />
            <SummaryCard title="Expenditure" data={summary?.expenditure} tone="exp"    icon={<ArrowDownRight className="w-3.5 h-3.5" />} />
            <SummaryCard title="Handover"    data={summary?.handover}    tone="handover" icon={<Wallet className="w-3.5 h-3.5" />} />
          </div>

          {/* Reconciliation status (slim strip, not a card) */}
          <div className={`rounded-xl px-4 py-2.5 text-sm font-medium flex items-center justify-between ${balanced ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-amber-50 text-amber-700 border border-amber-200'}`}>
            <span>{balanced ? '✓ Balanced — handover matches income − expenditure' : 'Not balanced'}</span>
            {!balanced && <span className="tabular-nums">Off by {fmtMoney(Math.abs(diff))}{diff > 0 ? ' (short)' : ' (excess)'}</span>}
          </div>

          {/* Add handover */}
          <div className="bg-white border border-gray-200 rounded-2xl p-5">
            <h3 className="text-sm font-semibold text-gray-800 font-display mb-3">Record a handover</h3>
            <div className="flex flex-wrap items-end gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Date</label>
                <input type="date" value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} className={`${inputCls} w-auto`} />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Cash (₹)</label>
                <input type="number" min="0" step="0.01" value={form.cash} onChange={(e) => setForm((f) => ({ ...f, cash: e.target.value }))} placeholder="0" className={`${inputCls} w-32`} />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Online (₹)</label>
                <input type="number" min="0" step="0.01" value={form.online} onChange={(e) => setForm((f) => ({ ...f, online: e.target.value }))} placeholder="0" className={`${inputCls} w-32`} />
              </div>
              <div className="flex flex-col gap-1 flex-1 min-w-[10rem]">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Remarks</label>
                <input type="text" value={form.remarks} onChange={(e) => setForm((f) => ({ ...f, remarks: e.target.value }))} placeholder="optional" className={inputCls} />
              </div>
              <button onClick={handleAdd} disabled={saving}
                className="flex items-center gap-2 bg-brand-500 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-brand-600 disabled:opacity-50 transition-all">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />} Record
              </button>
            </div>
          </div>

          {/* Handover log */}
          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
            <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-800 font-display">Handover log</h3>
              <span className="text-xs text-gray-400">{handovers.length} entries</span>
            </div>
            {handovers.length === 0 ? (
              <div className="p-8 text-center text-sm text-gray-400">No handovers recorded for this range.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      {['Date', 'Cash', 'Online', 'Total', 'Remarks', ''].map((h) => (
                        <th key={h} className={`px-4 py-2.5 text-xs font-semibold text-gray-400 uppercase ${['Cash', 'Online', 'Total'].includes(h) ? 'text-right' : 'text-left'}`}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {handovers.map((h, i) => (
                      <tr key={h.id} className={`border-t border-gray-100 ${i % 2 === 0 ? '' : 'bg-gray-50/30'}`}>
                        <td className="px-4 py-2.5 text-sm text-gray-500 whitespace-nowrap">{fmtDate(h.date)}</td>
                        <td className="px-4 py-2.5 text-sm text-right tabular-nums text-gray-700">{h.cash > 0 ? fmtMoney(h.cash) : '—'}</td>
                        <td className="px-4 py-2.5 text-sm text-right tabular-nums text-gray-700">{h.online > 0 ? fmtMoney(h.online) : '—'}</td>
                        <td className="px-4 py-2.5 text-sm text-right tabular-nums font-bold text-gray-900">{fmtMoney(h.total)}</td>
                        <td className="px-4 py-2.5 text-sm text-gray-500 truncate max-w-xs">{h.remarks || '—'}</td>
                        <td className="px-4 py-2.5 text-right">
                          <button onClick={() => handleDelete(h)} className="text-gray-300 hover:text-red-500 transition-colors p-1">
                            <Trash2 className="w-4 h-4" />
                          </button>
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
