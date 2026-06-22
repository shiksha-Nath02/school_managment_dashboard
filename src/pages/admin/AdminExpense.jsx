import { useState, useEffect, useCallback, useMemo } from 'react';
import { Plus, Trash2, Loader2, CheckCircle2, AlertCircle, X, IndianRupee, Download, Upload } from 'lucide-react';
import svc from '@/services/expenseService';
import CsvModal from '@/components/common/CsvModal';

const META = {
  stationary: { label: 'Stationery', icon: '✏️', color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200' },
  pantry:     { label: 'Pantry',     icon: '🍽️', color: 'text-green-600', bg: 'bg-green-50',  border: 'border-green-200' },
};

const CSV_COLUMNS = [
  { key: 'description', label: 'Description', required: true, example: 'A4 paper reams' },
  { key: 'amount',      label: 'Amount',       required: true, example: '350' },
  { key: 'date',        label: 'Date',                        example: new Date().toISOString().split('T')[0] },
];

const inputCls   = 'w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-800 focus:outline-none focus:border-brand-400';
const filterCls  = 'border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-700 focus:outline-none focus:border-brand-400 bg-white';
const today      = () => new Date().toISOString().split('T')[0];
const fmtDate    = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
const fmtMoney   = (n) => `₹${parseFloat(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;

export default function AdminExpense({ category }) {
  const meta = META[category] || META.stationary;

  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [modal, setModal]       = useState(false);
  const [csvOpen, setCsvOpen]   = useState(false);
  const [form, setForm]         = useState({ description: '', amount: '', date: today() });
  const [saving, setSaving]     = useState(false);
  const [toast, setToast]       = useState(null);

  // ── filters
  const [filterFrom,   setFilterFrom]   = useState('');
  const [filterTo,     setFilterTo]     = useState('');
  const [filterMinAmt, setFilterMinAmt] = useState('');
  const [filterMaxAmt, setFilterMaxAmt] = useState('');

  const showToast = useCallback((type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 4000);
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const d = await svc.getExpenses(category);
      setExpenses(d.expenses || []);
    } catch {
      showToast('error', 'Failed to load expenses');
    } finally {
      setLoading(false);
    }
  }, [category, showToast]);

  useEffect(() => { load(); }, [load]);

  // ── client-side filter
  const filteredExpenses = useMemo(() => expenses.filter((e) => {
    if (filterFrom   && e.date < filterFrom)                                  return false;
    if (filterTo     && e.date > filterTo)                                    return false;
    if (filterMinAmt && parseFloat(e.amount) < parseFloat(filterMinAmt))     return false;
    if (filterMaxAmt && parseFloat(e.amount) > parseFloat(filterMaxAmt))     return false;
    return true;
  }), [expenses, filterFrom, filterTo, filterMinAmt, filterMaxAmt]);

  const filteredTotal = filteredExpenses.reduce((s, e) => s + parseFloat(e.amount || 0), 0);
  const hasFilters    = filterFrom || filterTo || filterMinAmt || filterMaxAmt;
  const clearFilters  = () => { setFilterFrom(''); setFilterTo(''); setFilterMinAmt(''); setFilterMaxAmt(''); };

  const openModal = () => {
    setForm({ description: '', amount: '', date: today() });
    setModal(true);
  };

  const handleAdd = async () => {
    if (!form.description?.trim()) return showToast('error', 'Description is required');
    if (!form.amount || parseFloat(form.amount) <= 0) return showToast('error', 'Enter a valid amount');
    setSaving(true);
    try {
      await svc.addExpense({ category, description: form.description.trim(), amount: parseFloat(form.amount), date: form.date });
      setModal(false);
      load();
      showToast('success', 'Expense added');
    } catch (e) {
      showToast('error', e.response?.data?.message || 'Failed to add');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (expense) => {
    if (!confirm(`Delete "${expense.description}" (${fmtMoney(expense.amount)})?`)) return;
    try {
      await svc.deleteExpense(expense.id);
      setExpenses((prev) => prev.filter((e) => e.id !== expense.id));
      showToast('success', 'Expense deleted');
    } catch {
      showToast('error', 'Failed to delete');
    }
  };

  const exportCsv = () => {
    const header = ['Date', 'Description', 'Amount'];
    const rows   = filteredExpenses.map((e) => [e.date, `"${e.description || ''}"`, e.amount]);
    const csv    = [header, ...rows].map((r) => r.join(',')).join('\n');
    const blob   = new Blob([csv], { type: 'text/csv' });
    const url    = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `${category}-expenses.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  const handleCsvRow = async (row) => {
    if (!row.description || !row.amount) throw new Error('description and amount required');
    await svc.addExpense({ category, description: row.description, amount: parseFloat(row.amount), date: row.date || today() });
  };

  return (
    <div className="space-y-6">
      <CsvModal
        open={csvOpen}
        onClose={() => { setCsvOpen(false); load(); }}
        title={`Import ${meta.label} Expenses`}
        columns={CSV_COLUMNS}
        templateName={`${category}-expenses-template.csv`}
        onUploadRow={handleCsvRow}
      />

      {toast && (
        <div className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-xl shadow-lg text-white text-sm font-medium ${toast.type === 'success' ? 'bg-emerald-600' : 'bg-red-500'}`}>
          {toast.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 ${meta.bg} ${meta.border} border rounded-2xl flex items-center justify-center text-2xl`}>
            {meta.icon}
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold text-gray-900">{meta.label} Expenses</h1>
            <p className="text-sm text-gray-400 mt-0.5">{expenses.length} entries</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={exportCsv} className="flex items-center gap-2 px-3 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-all">
            <Download className="w-4 h-4" /> Export CSV
          </button>
          <button onClick={() => setCsvOpen(true)} className="flex items-center gap-2 px-3 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-all">
            <Upload className="w-4 h-4" /> Import CSV
          </button>
          <button onClick={openModal} className="flex items-center gap-2 bg-brand-500 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-brand-600 hover:-translate-y-0.5 transition-all shadow-lg shadow-brand-500/20">
            <Plus size={16} /> Add Expense
          </button>
        </div>
      </div>

      {/* Total card */}
      <div className={`${meta.bg} ${meta.border} border rounded-2xl p-5 flex items-center gap-4`}>
        <div className={`w-10 h-10 bg-white rounded-xl flex items-center justify-center border ${meta.border}`}>
          <IndianRupee className={`w-5 h-5 ${meta.color}`} />
        </div>
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
            {hasFilters ? 'Filtered' : 'Total'} {meta.label} Expenditure
          </p>
          <p className={`text-3xl font-display font-bold mt-0.5 ${meta.color}`}>{fmtMoney(filteredTotal)}</p>
          {hasFilters && <p className="text-xs text-gray-400 mt-0.5">Showing {filteredExpenses.length} of {expenses.length} records</p>}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border border-gray-200 rounded-2xl px-5 py-4">
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide">From Date</label>
            <input type="date" value={filterFrom} onChange={(e) => setFilterFrom(e.target.value)} className={filterCls} />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide">To Date</label>
            <input type="date" value={filterTo} onChange={(e) => setFilterTo(e.target.value)} className={filterCls} />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Min Amount (₹)</label>
            <input type="number" min="0" value={filterMinAmt} onChange={(e) => setFilterMinAmt(e.target.value)} placeholder="0" className={`${filterCls} w-28`} />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Max Amount (₹)</label>
            <input type="number" min="0" value={filterMaxAmt} onChange={(e) => setFilterMaxAmt(e.target.value)} placeholder="Any" className={`${filterCls} w-28`} />
          </div>
          {hasFilters && (
            <button onClick={clearFilters} className="text-xs text-brand-500 font-semibold hover:text-brand-700 self-end pb-2">
              Clear filters
            </button>
          )}
        </div>
      </div>

      {/* Expenses list */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
        <div className="hidden sm:grid grid-cols-[7rem_1fr_8rem_4rem] gap-4 px-6 py-2 bg-gray-50 border-b border-gray-100 text-xs font-semibold text-gray-400 uppercase tracking-wide">
          <span>Date</span><span>Description</span><span className="text-right">Amount</span><span></span>
        </div>

        {loading ? (
          <div className="p-10 flex justify-center"><Loader2 className="w-6 h-6 text-brand-500 animate-spin" /></div>
        ) : filteredExpenses.length === 0 ? (
          <div className="p-10 text-center text-sm text-gray-400">
            {expenses.length === 0 ? 'No expenses recorded yet.' : 'No records match the current filters.'}
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredExpenses.map((e) => (
              <div key={e.id} className="grid grid-cols-[1fr_auto] sm:grid-cols-[7rem_1fr_8rem_4rem] gap-4 px-6 py-3.5 items-center hover:bg-gray-50/50 transition-colors">
                <span className="hidden sm:inline text-xs text-gray-400 font-medium">{fmtDate(e.date)}</span>
                <p className="text-sm font-medium text-gray-800">
                  {e.description || '—'}
                  <span className="sm:hidden text-xs text-gray-400 ml-2">{fmtDate(e.date)}</span>
                </p>
                <p className="hidden sm:block text-sm font-bold text-gray-900 text-right">{fmtMoney(e.amount)}</p>
                <div className="flex items-center justify-end gap-2">
                  <p className="sm:hidden text-sm font-bold text-gray-900">{fmtMoney(e.amount)}</p>
                  <button onClick={() => handleDelete(e)} className="text-gray-300 hover:text-red-500 transition-colors p-1">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Expense Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/40 z-40 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-elevated">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="font-display font-bold text-gray-900">Add {meta.label} Expense</h3>
              <button onClick={() => setModal(false)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Description <span className="text-red-400">*</span></label>
                <input type="text" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  placeholder="e.g. A4 paper reams" className={inputCls} autoFocus />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Amount (₹) <span className="text-red-400">*</span></label>
                  <input type="number" min="0" step="0.01" value={form.amount} onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))} placeholder="0.00" className={inputCls} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Date</label>
                  <input type="date" value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} className={inputCls} />
                </div>
              </div>
              <div className="flex gap-3 pt-1">
                <button onClick={handleAdd} disabled={saving}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-brand-500 text-white rounded-xl text-sm font-semibold hover:bg-brand-600 disabled:opacity-50 transition-all">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  Add Expense
                </button>
                <button onClick={() => setModal(false)} className="flex-1 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-all">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
