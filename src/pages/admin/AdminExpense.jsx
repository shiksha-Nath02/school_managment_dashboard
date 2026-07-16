import { useState, useEffect, useCallback, useMemo } from 'react';
import { Plus, Trash2, Loader2, CheckCircle2, AlertCircle, X, IndianRupee, Download, Upload } from 'lucide-react';
import svc from '@/services/expenseService';
import staffSvc from '@/services/staffService';
import CsvModal from '@/components/common/CsvModal';
import HandoverPanel from '@/components/admin/HandoverPanel';

// Expenditure reasons. The key is the stored category; label/icon are for display.
const REASONS = [
  { key: 'stationary', label: 'Stationery', icon: '✏️' },
  { key: 'pantry',     label: 'Pantry',     icon: '🍽️' },
  { key: 'inventory',  label: 'Inventory',  icon: '📦' },
  { key: 'salary',     label: 'Salary',     icon: '💰' },
  { key: 'other',      label: 'Others',     icon: '📝' },
];
const REASON_LABEL = Object.fromEntries(REASONS.map((r) => [r.key, r.label]));

const PAGE_SIZE = 15;

const CSV_COLUMNS = [
  { key: 'reason',      label: 'Reason', required: true, example: 'stationary' },
  { key: 'description', label: 'Description', required: true, example: 'A4 paper reams' },
  { key: 'amount',      label: 'Amount',      required: true, example: '350' },
  { key: 'date',        label: 'Date',                       example: new Date().toISOString().split('T')[0] },
];

const inputCls  = 'w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-800 focus:outline-none focus:border-brand-400';
const filterCls = 'border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-700 focus:outline-none focus:border-brand-400 bg-white';
const today     = () => new Date().toISOString().split('T')[0];
const fmtDate   = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
const fmtMoney  = (n) => `₹${parseFloat(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;

export default function AdminExpenditure() {
  const [view, setView]         = useState('expenses'); // 'expenses' | 'handover'
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [modal, setModal]       = useState(false);
  const [csvOpen, setCsvOpen]   = useState(false);
  const [form, setForm]         = useState({ reason: 'stationary', description: '', amount: '', date: today(), method: 'cash', payeeKey: '', gross: '', penalty: '' });
  const [saving, setSaving]     = useState(false);
  const [toast, setToast]       = useState(null);
  const [payees, setPayees]     = useState([]);

  // ── filters
  const [filterReason, setFilterReason] = useState('');
  const [filterFrom,   setFilterFrom]   = useState('');
  const [filterTo,     setFilterTo]     = useState('');
  const [page,         setPage]         = useState(1);

  const showToast = useCallback((type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 4000);
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const d = await svc.getExpenses(); // all reasons
      setExpenses(d.expenses || []);
    } catch {
      showToast('error', 'Failed to load expenses');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { staffSvc.getSalaryPayees().then((d) => setPayees(d.payees || [])).catch(() => {}); }, []);

  // ── client-side filter (reason + date)
  const filteredExpenses = useMemo(() => expenses.filter((e) => {
    if (filterReason && e.category !== filterReason) return false;
    if (filterFrom   && e.date < filterFrom)         return false;
    if (filterTo     && e.date > filterTo)           return false;
    return true;
  }), [expenses, filterReason, filterFrom, filterTo]);

  const filteredTotal = filteredExpenses.reduce((s, e) => s + parseFloat(e.amount || 0), 0);
  const hasFilters    = filterReason || filterFrom || filterTo;
  const clearFilters  = () => { setFilterReason(''); setFilterFrom(''); setFilterTo(''); };

  // ── pagination
  const totalPages   = Math.max(1, Math.ceil(filteredExpenses.length / PAGE_SIZE));
  const currentPage  = Math.min(page, totalPages);
  const pagedExpenses = filteredExpenses.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  useEffect(() => { setPage(1); }, [filterReason, filterFrom, filterTo]);

  const openModal = () => {
    setForm({ reason: 'stationary', description: '', amount: '', date: today(), method: 'cash', payeeKey: '', gross: '', penalty: '' });
    setModal(true);
  };

  const isSalary = form.reason === 'salary';
  const selectedPayee = payees.find((p) => `${p.type}:${p.id}` === form.payeeKey) || null;
  const finalAmount = Math.max(0, (parseFloat(form.gross) || 0) - (parseFloat(form.penalty) || 0));

  // Picking a payee pre-fills their configured salary.
  const onPayeeChange = (key) => {
    const p = payees.find((x) => `${x.type}:${x.id}` === key) || null;
    setForm((f) => ({ ...f, payeeKey: key, gross: p && p.salary != null ? String(p.salary) : f.gross }));
  };

  const handleAdd = async () => {
    if (!form.reason) return showToast('error', 'Reason is required');
    setSaving(true);
    try {
      let payload;
      if (isSalary) {
        if (!selectedPayee) { setSaving(false); return showToast('error', 'Select a teacher or staff member'); }
        if (!(parseFloat(form.gross) > 0)) { setSaving(false); return showToast('error', 'Enter the salary amount'); }
        payload = {
          category: 'salary',
          date: form.date,
          amount: finalAmount,
          payment_method: form.method,
          gross_amount: parseFloat(form.gross) || 0,
          deduction: parseFloat(form.penalty) || 0,
          teacher_id: selectedPayee.type === 'teacher' ? selectedPayee.id : undefined,
          staff_id: selectedPayee.type === 'staff' ? selectedPayee.id : undefined,
          description: `${selectedPayee.name}${parseFloat(form.penalty) > 0 ? ` (penalty ₹${form.penalty})` : ''}`,
        };
      } else {
        if (!form.description?.trim()) { setSaving(false); return showToast('error', 'Description is required'); }
        if (!form.amount || parseFloat(form.amount) <= 0) { setSaving(false); return showToast('error', 'Enter a valid amount'); }
        payload = { category: form.reason, description: form.description.trim(), amount: parseFloat(form.amount), date: form.date, payment_method: form.method };
      }
      await svc.addExpense(payload);
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
    const header = ['Date', 'Reason', 'Description', 'Amount'];
    const rows   = filteredExpenses.map((e) => [e.date, REASON_LABEL[e.category] || e.category, `"${e.description || ''}"`, e.amount]);
    const csv    = [header, ...rows].map((r) => r.join(',')).join('\n');
    const blob   = new Blob([csv], { type: 'text/csv' });
    const url    = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'expenditure.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  const handleCsvRow = async (row) => {
    if (!row.reason || !row.description || !row.amount) throw new Error('reason, description and amount required');
    const reason = String(row.reason).trim().toLowerCase();
    if (!REASON_LABEL[reason]) throw new Error(`Invalid reason "${row.reason}". Use: ${REASONS.map((r) => r.key).join(', ')}`);
    await svc.addExpense({ category: reason, description: row.description, amount: parseFloat(row.amount), date: row.date || today() });
  };

  return (
    <div className="space-y-6">
      <CsvModal
        open={csvOpen}
        onClose={() => { setCsvOpen(false); load(); }}
        title="Import Expenditure"
        columns={CSV_COLUMNS}
        templateName="expenditure-template.csv"
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
          <div className="w-12 h-12 bg-brand-50 border border-brand-500/20 rounded-2xl flex items-center justify-center text-2xl">💸</div>
          <div>
            <h1 className="font-display text-2xl font-bold text-gray-900">Expenditure</h1>
            <p className="text-sm text-gray-400 mt-0.5">{expenses.length} entries</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex bg-gray-100 rounded-xl p-1 mr-1">
            <button onClick={() => setView('expenses')} className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${view === 'expenses' ? 'bg-white text-brand-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>Expenses</button>
            <button onClick={() => setView('handover')} className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${view === 'handover' ? 'bg-white text-brand-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>Handover</button>
          </div>
          {view === 'expenses' && (
            <>
              <button onClick={exportCsv} className="flex items-center gap-2 px-3 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-all">
                <Download className="w-4 h-4" /> Export CSV
              </button>
              <button onClick={() => setCsvOpen(true)} className="flex items-center gap-2 px-3 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-all">
                <Upload className="w-4 h-4" /> Import CSV
              </button>
              <button onClick={openModal} className="flex items-center gap-2 bg-brand-500 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-brand-600 hover:-translate-y-0.5 transition-all shadow-lg shadow-brand-500/20">
                <Plus size={16} /> Add Expense
              </button>
            </>
          )}
        </div>
      </div>

      {view === 'handover' && <HandoverPanel />}

      {view === 'expenses' && (
      <>
      {/* Total card */}
      <div className="bg-brand-50 border border-brand-500/20 rounded-2xl p-5 flex items-center gap-4">
        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center border border-brand-500/20">
          <IndianRupee className="w-5 h-5 text-brand-500" />
        </div>
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
            {hasFilters ? 'Filtered' : 'Total'} Expenditure{filterReason ? ` — ${REASON_LABEL[filterReason]}` : ''}
          </p>
          <p className="text-3xl font-display font-bold mt-0.5 text-brand-600">{fmtMoney(filteredTotal)}</p>
          {hasFilters && <p className="text-xs text-gray-400 mt-0.5">Showing {filteredExpenses.length} of {expenses.length} records</p>}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border border-gray-200 rounded-2xl px-5 py-4">
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Reason</label>
            <select value={filterReason} onChange={(e) => setFilterReason(e.target.value)} className={filterCls}>
              <option value="">All reasons</option>
              {REASONS.map((r) => <option key={r.key} value={r.key}>{r.label}</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide">From Date</label>
            <input type="date" value={filterFrom} onChange={(e) => setFilterFrom(e.target.value)} className={filterCls} />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide">To Date</label>
            <input type="date" value={filterTo} onChange={(e) => setFilterTo(e.target.value)} className={filterCls} />
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
        <div className="hidden sm:grid grid-cols-[7rem_8rem_1fr_8rem_4rem] gap-4 px-6 py-2 bg-gray-50 border-b border-gray-100 text-xs font-semibold text-gray-400 uppercase tracking-wide">
          <span>Date</span><span>Reason</span><span>Description</span><span className="text-right">Amount</span><span></span>
        </div>

        {loading ? (
          <div className="p-10 flex justify-center"><Loader2 className="w-6 h-6 text-brand-500 animate-spin" /></div>
        ) : filteredExpenses.length === 0 ? (
          <div className="p-10 text-center text-sm text-gray-400">
            {expenses.length === 0 ? 'No expenses recorded yet.' : 'No records match the current filters.'}
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {pagedExpenses.map((e) => (
              <div key={e.id} className="grid grid-cols-[1fr_auto] sm:grid-cols-[7rem_8rem_1fr_8rem_4rem] gap-4 px-6 py-3.5 items-center hover:bg-gray-50/50 transition-colors">
                <span className="hidden sm:inline text-xs text-gray-400 font-medium">{fmtDate(e.date)}</span>
                <span className="hidden sm:inline text-xs font-semibold text-gray-600">{REASON_LABEL[e.category] || e.category}</span>
                <p className="text-sm font-medium text-gray-800">
                  {e.description || '—'}
                  <span className="sm:hidden text-xs text-gray-400 ml-2">{REASON_LABEL[e.category] || e.category} · {fmtDate(e.date)}</span>
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

      {/* Pagination */}
      {!loading && filteredExpenses.length > 0 && (
        <div className="flex items-center justify-between flex-wrap gap-3">
          <p className="text-sm text-gray-400">
            Showing {(currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, filteredExpenses.length)} of {filteredExpenses.length}
          </p>
          <div className="flex items-center gap-2">
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={currentPage <= 1}
              className="px-4 py-2 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all">
              Previous
            </button>
            <span className="text-sm font-medium text-gray-500 px-2">Page {currentPage} of {totalPages}</span>
            <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage >= totalPages}
              className="px-4 py-2 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all">
              Next
            </button>
          </div>
        </div>
      )}
      </>
      )}

      {/* Add Expense Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/40 z-40 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-elevated">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="font-display font-bold text-gray-900">Add Expense</h3>
              <button onClick={() => setModal(false)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Reason <span className="text-red-400">*</span></label>
                <select value={form.reason} onChange={(e) => setForm((f) => ({ ...f, reason: e.target.value }))} className={inputCls}>
                  {REASONS.map((r) => <option key={r.key} value={r.key}>{r.icon} {r.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Paid via</label>
                <select value={form.method} onChange={(e) => setForm((f) => ({ ...f, method: e.target.value }))} className={inputCls}>
                  <option value="cash">Cash</option>
                  <option value="online">Online</option>
                </select>
              </div>
              {isSalary ? (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Teacher / Staff <span className="text-red-400">*</span></label>
                    <select value={form.payeeKey} onChange={(e) => onPayeeChange(e.target.value)} className={inputCls} autoFocus>
                      <option value="">— Select —</option>
                      <optgroup label="Teachers">
                        {payees.filter((p) => p.type === 'teacher').map((p) => (
                          <option key={`teacher:${p.id}`} value={`teacher:${p.id}`}>{p.name}{p.designation ? ` (${p.designation})` : ''}</option>
                        ))}
                      </optgroup>
                      <optgroup label="Staff">
                        {payees.filter((p) => p.type === 'staff').map((p) => (
                          <option key={`staff:${p.id}`} value={`staff:${p.id}`}>{p.name}{p.designation ? ` (${p.designation})` : ''}</option>
                        ))}
                      </optgroup>
                    </select>
                    {payees.length === 0 && <p className="mt-1 text-xs text-amber-600">No teachers/staff found. Add staff in the Staff tab.</p>}
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Salary (₹)</label>
                      <input type="number" min="0" step="0.01" value={form.gross} onChange={(e) => setForm((f) => ({ ...f, gross: e.target.value }))} placeholder="0.00" className={inputCls} />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Penalty (₹)</label>
                      <input type="number" min="0" step="0.01" value={form.penalty} onChange={(e) => setForm((f) => ({ ...f, penalty: e.target.value }))} placeholder="0.00" className={inputCls} />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Final (₹)</label>
                      <input type="text" value={finalAmount.toLocaleString('en-IN')} readOnly className={`${inputCls} bg-gray-50 font-bold`} />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Date</label>
                    <input type="date" value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} className={inputCls} />
                  </div>
                </>
              ) : (
                <>
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
                </>
              )}
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
