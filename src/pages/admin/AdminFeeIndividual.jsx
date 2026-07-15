import { useState, useEffect, useMemo } from 'react';
import { getStudentFeeDetails, recordPayment, reversePayment, getActiveSession, updateSessionFees } from '@/services/feeService';
import api from '@/services/api';
import { Receipt, Search, Undo2, Loader2, User, Download, Upload, Pencil } from 'lucide-react';
import CsvModal from '@/components/common/CsvModal';

const MONTH_NAMES = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const BULK_CSV_COLS = [
  { key: 'admission_number', label: 'Admission No',    required: true,  example: '5' },
  { key: 'amount',           label: 'Amount',          required: true,  example: '1500' },
  { key: 'payment_date',     label: 'Payment Date',                     example: new Date().toISOString().split('T')[0] },
  { key: 'billing_month',    label: 'Billing Month',                    example: String(new Date().getMonth() + 1) },
  { key: 'billing_year',     label: 'Billing Year',                     example: String(new Date().getFullYear()) },
  { key: 'payment_method',   label: 'Method',                           example: 'cash' },
  { key: 'remarks',          label: 'Remarks',                          example: '' },
];

const filterCls = 'px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-brand-400 bg-white';

const rupee = (n) => `₹${(Number(n) || 0).toLocaleString('en-IN')}`;
const fmtDate = (d) => d
  ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
  : '—';
const fmtDateTime = (d) => d
  ? new Date(d).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
  : '—';

// visual tag per transaction type
const TYPE_TAG = {
  payment:   { label: 'Payment',      cls: 'bg-brand-50 text-brand-600' },
  advance:   { label: 'Advance',      cls: 'bg-blue-50 text-blue-600' },
  prevdues:  { label: 'Previous dues', cls: 'bg-amber-50 text-amber-700' },
  reversal:  { label: 'Reversal',     cls: 'bg-red-50 text-red-600' },
  admission: { label: 'Admission',    cls: 'bg-purple-50 text-purple-600' },
};

const AdminFeeIndividual = () => {
  const [searchQuery, setSearchQuery]   = useState('');
  const [classFilter, setClassFilter]   = useState('');
  const [classes, setClasses]           = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [feeData, setFeeData]           = useState(null);
  const [loading, setLoading]           = useState(false);
  const [toast, setToast]               = useState(null);
  const [csvOpen, setCsvOpen]           = useState(false);

  const [reversalTarget, setReversalTarget] = useState(null);
  const [reversalReason, setReversalReason] = useState('');

  // ── assign / edit fee
  const [activeSession, setActiveSession] = useState(null);
  const [feeModal, setFeeModal] = useState(false);
  const [feeForm, setFeeForm] = useState({ monthly_fee: '', discount: '', discount_reason: '' });
  const [savingFee, setSavingFee] = useState(false);

  // ── transaction log filters
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo,   setFilterDateTo]   = useState('');
  const [filterMethod,   setFilterMethod]   = useState('');
  const [filterStatus,   setFilterStatus]   = useState('all'); // 'all'|'active'|'reversed'

  useEffect(() => {
    api.get('/admin/classes')
      .then(res => setClasses(res.data.classes || res.data || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      const hasSearch = searchQuery && searchQuery.length >= 2;
      if (!hasSearch && !classFilter) { setSearchResults([]); return; }
      const params = new URLSearchParams();
      if (hasSearch)   params.set('search', searchQuery);
      if (classFilter) params.set('class_id', classFilter);
      api.get(`/admin/students?${params.toString()}`)
        .then(res => setSearchResults(res.data.students || res.data || []))
        .catch(() => {});
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, classFilter]);

  useEffect(() => {
    getActiveSession()
      .then(res => setActiveSession(res.data?.session || null))
      .catch(() => setActiveSession(null));
  }, []);

  const selectStudent = async (student) => {
    setSelectedStudent(student);
    setSearchQuery('');
    setSearchResults([]);
    setLoading(true);
    try {
      const res = await getStudentFeeDetails(student.id);
      setFeeData(res.data);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  const handleReversal = async () => {
    if (!reversalTarget) return;
    try {
      const res = await reversePayment(reversalTarget.id, reversalReason);
      showToast('success', `Reversed! Receipt: ${res.data.reversal_receipt}`);
      setReversalTarget(null); setReversalReason('');
      const refreshed = await getStudentFeeDetails(selectedStudent.id);
      setFeeData(refreshed.data);
    } catch (err) { showToast('error', err.response?.data?.message || 'Failed to reverse'); }
  };

  // ── assign / edit fee (active session)
  const activeConfig = (feeData?.feeConfigs || []).find(
    (c) => activeSession && c.session_id === activeSession.id
  ) || null;

  const openFeeModal = () => {
    setFeeForm({
      monthly_fee: activeConfig?.monthly_fee ?? '',
      discount: activeConfig?.discount ?? '',
      discount_reason: activeConfig?.discount_reason ?? '',
    });
    setFeeModal(true);
  };

  const handleSaveFee = async () => {
    if (!activeSession) { showToast('error', 'No active session to assign a fee to'); return; }
    if (!feeForm.monthly_fee || parseFloat(feeForm.monthly_fee) <= 0) { showToast('error', 'Enter a valid monthly fee'); return; }
    setSavingFee(true);
    try {
      await updateSessionFees(activeSession.id, {
        student_fees: [{
          student_id: selectedStudent.id,
          monthly_fee: parseFloat(feeForm.monthly_fee),
          discount: parseFloat(feeForm.discount) || 0,
          discount_reason: feeForm.discount_reason || null,
        }],
      });
      showToast('success', 'Fee saved');
      setFeeModal(false);
      const refreshed = await getStudentFeeDetails(selectedStudent.id);
      setFeeData(refreshed.data);
    } catch (err) { showToast('error', err.response?.data?.message || 'Failed to save fee'); }
    setSavingFee(false);
  };

  // ── bulk CSV upload
  const handleBulkCsvRow = async (row) => {
    if (!row.admission_number || !row.amount) throw new Error('admission_number and amount required');
    await recordPayment({
      student_id:     parseInt(row.admission_number, 10),
      amount:         parseFloat(row.amount),
      payment_date:   row.payment_date || new Date().toISOString().split('T')[0],
      billing_month:  parseInt(row.billing_month || new Date().getMonth() + 1, 10),
      billing_year:   parseInt(row.billing_year  || new Date().getFullYear(),  10),
      payment_method: row.payment_method || 'cash',
      remarks:        row.remarks || '',
    });
  };

  // ── unified fee transaction log (fee_payments rows + admission-fee rows)
  const allEntries = useMemo(() => {
    const feeEntries = (feeData?.payments || [])
      // keep only rows that represent a real entry (drop ₹0 auto-billed placeholder months)
      .filter(p => p.amount_paid > 0 || p.fine_amount > 0 || p.adjustment > 0 || p.advance > 0 || p.is_reversal)
      .map(p => {
        let type = 'payment';
        if (p.is_reversal) type = 'reversal';
        else if (p.advance > 0 && p.amount_paid === 0 && p.adjustment === 0) type = 'advance';
        else if (p.adjustment > 0 && p.amount_paid === 0 && p.advance === 0) type = 'prevdues';
        return {
          key: `f${p.id}`, kind: 'fee', raw: p, type,
          entered_at: p.created_at,
          payment_date: p.payment_date,
          detail: p.billing_month ? `${MONTH_NAMES[p.billing_month]} ${p.billing_year}` : 'Fee',
          paid: p.amount_paid, fine: p.fine_amount, prev_dues: p.adjustment, advance: p.advance,
          pending_after: p.pending_after,
          method: p.payment_method, receipt: p.receipt_number,
          is_reversal: p.is_reversal, is_system: p.is_system_generated,
        };
      });

    const admEntries = (feeData?.admissionPayments || [])
      .filter(a => a.paid_amount > 0 || a.annual_charge > 0 || a.discount > 0)
      .map(a => ({
        key: `a${a.id}`, kind: 'admission', raw: a, type: 'admission',
        entered_at: a.created_at,
        payment_date: null,
        detail: `Admission fee${a.session_name ? ` · ${a.session_name}` : ''}`,
        paid: a.paid_amount, fine: 0, prev_dues: 0, advance: 0, discount: a.discount,
        pending_after: undefined,
        method: null, receipt: null,
        is_reversal: false, is_system: false,
      }));

    return [...feeEntries, ...admEntries].sort((x, y) => {
      const dx = x.entered_at ? new Date(x.entered_at).getTime() : 0;
      const dy = y.entered_at ? new Date(y.entered_at).getTime() : 0;
      return dx - dy;
    });
  }, [feeData]);

  const filteredEntries = useMemo(() => allEntries.filter((e) => {
    const raw = e.payment_date || e.entered_at || '';
    const d = typeof raw === 'string' ? raw.split('T')[0] : '';
    if (filterDateFrom && d && d < filterDateFrom)      return false;
    if (filterDateTo   && d && d > filterDateTo)        return false;
    if (filterMethod   && e.method !== filterMethod)    return false;
    if (filterStatus === 'active'   &&  e.is_reversal)  return false;
    if (filterStatus === 'reversed' && !e.is_reversal)  return false;
    return true;
  }), [allEntries, filterDateFrom, filterDateTo, filterMethod, filterStatus]);

  const hasFilters = filterDateFrom || filterDateTo || filterMethod || filterStatus !== 'all';

  const exportCsv = () => {
    const header = ['Entered On', 'Payment Date', 'Details', 'Type', 'Paid', 'Fine', 'Previous Dues', 'Advance', 'Pending After', 'Method', 'Receipt'];
    const rows   = filteredEntries.map((e) => [
      `"${fmtDateTime(e.entered_at)}"`,
      e.payment_date ? fmtDate(e.payment_date) : '',
      `"${e.detail}"`,
      TYPE_TAG[e.type]?.label || e.type,
      e.paid || 0, e.fine || 0, e.prev_dues || 0, e.advance || 0,
      e.pending_after !== undefined ? e.pending_after : '',
      e.method || '',
      e.receipt || '',
    ]);
    const csv  = [header, ...rows].map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url  = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'fee-transactions.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <CsvModal
        open={csvOpen}
        onClose={() => setCsvOpen(false)}
        title="Bulk Record Payments"
        columns={BULK_CSV_COLS}
        templateName="bulk-payment-template.csv"
        onUploadRow={handleBulkCsvRow}
      />

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 font-display flex items-center gap-2">
            <Receipt className="w-6 h-6 text-brand-500" /> Individual Fee Management
          </h1>
          <p className="text-gray-400 text-sm mt-1">Search for a student to view their fee transaction log</p>
        </div>
        <button onClick={() => setCsvOpen(true)} className="flex items-center gap-2 px-3 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-all">
          <Upload className="w-4 h-4" /> Bulk Upload Payments
        </button>
      </div>

      {toast && (
        <div className={`mb-4 px-4 py-3 rounded-xl text-sm font-medium ${
          toast.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
        }`}>{toast.message}</div>
      )}

      {/* Search + class filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <div className="flex items-center bg-white border border-gray-200 rounded-2xl px-4 py-3 shadow-sm">
            <Search className="w-5 h-5 text-gray-300 mr-3 shrink-0" />
            <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name or admission number…"
              className="flex-1 text-sm outline-none text-gray-800 placeholder:text-gray-300" />
          </div>
          {searchResults.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-2xl shadow-lg z-10 max-h-60 overflow-y-auto">
            {searchResults.map(s => (
              <button key={s.id} onClick={() => selectStudent(s)}
                className="w-full px-4 py-3 text-left hover:bg-brand-50 flex items-center gap-3 border-b border-gray-50 last:border-0 transition-colors">
                <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center shrink-0">
                  <User className="w-4 h-4 text-brand-500" />
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-800">{s.user?.name || s.name}</div>
                  <div className="text-xs text-gray-400">
                    Adm #{s.id} · {s.user?.email || s.email}
                    {s.class && ` · Class ${s.class.class_name}-${s.class.section}`}
                  </div>
                </div>
              </button>
            ))}
          </div>
          )}
        </div>
        <select value={classFilter} onChange={(e) => setClassFilter(e.target.value)}
          className="bg-white border border-gray-200 rounded-2xl px-4 py-3 shadow-sm text-sm text-gray-700 outline-none focus:border-brand-400 sm:w-56">
          <option value="">All classes</option>
          {classes.map(c => (
            <option key={c.id} value={c.id}>Class {c.class_name}-{c.section}</option>
          ))}
        </select>
      </div>

      {!selectedStudent && !loading && (
        <div className="bg-white border border-gray-200 rounded-2xl p-14 text-center">
          <Search className="w-10 h-10 text-gray-200 mx-auto mb-3" />
          <p className="text-gray-400">Search for a student to get started</p>
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center h-48 text-gray-400 gap-2">
          <Loader2 className="w-5 h-5 animate-spin" /> Loading fee details...
        </div>
      )}

      {feeData && selectedStudent && !loading && (
        <>
          {/* Stats row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white border border-gray-200 rounded-2xl p-4">
              <div className="text-xs text-gray-400 mb-1">Student</div>
              <div className="text-sm font-semibold text-gray-800 font-display truncate">{feeData.student?.name}</div>
              <div className="text-xs text-brand-500 font-bold mt-0.5">Adm #{selectedStudent.id}</div>
              <div className="text-xs text-gray-400 mt-0.5">Class {feeData.student?.class}</div>
            </div>
            <div className="bg-white border border-gray-200 rounded-2xl p-4">
              <div className="flex items-center justify-between mb-1">
                <div className="text-xs text-gray-400">Monthly Fee</div>
                <button onClick={openFeeModal} disabled={!activeSession}
                  className="flex items-center gap-1 text-[11px] font-semibold text-brand-500 hover:text-brand-700 disabled:text-gray-300"
                  title={activeSession ? 'Assign / edit fee for the active session' : 'No active session'}>
                  <Pencil className="w-3 h-3" /> {activeConfig ? 'Edit' : 'Set fee'}
                </button>
              </div>
              <div className="text-xl font-bold text-gray-800 font-display">
                {activeConfig ? `₹${Number(activeConfig.monthly_fee).toLocaleString()}` : '—'}
              </div>
              {activeConfig?.discount > 0 && (
                <div className="text-xs text-green-600 mt-0.5">Discount: ₹{Number(activeConfig.discount).toLocaleString()}</div>
              )}
              {!activeConfig && <div className="text-[11px] text-amber-600 mt-0.5">No fee set for active session</div>}
            </div>
            <div className={`border rounded-2xl p-4 ${feeData.currentPending > 0 ? 'bg-red-50 border-red-200' : feeData.currentPending < 0 ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'}`}>
              <div className="text-xs text-gray-400 mb-1">{feeData.currentPending < 0 ? 'Credit Balance' : 'Pending'}</div>
              <div className={`text-xl font-bold font-display ${feeData.currentPending > 0 ? 'text-red-600' : feeData.currentPending < 0 ? 'text-green-600' : 'text-gray-800'}`}>
                ₹{Math.abs(feeData.currentPending || 0).toLocaleString()}
              </div>
            </div>
            <div className={`border rounded-2xl p-4 ${feeData.fine?.fine > 0 ? 'bg-amber-50 border-amber-200' : 'bg-white border-gray-200'}`}>
              <div className="text-xs text-gray-400 mb-1">Fine</div>
              <div className={`text-xl font-bold font-display ${feeData.fine?.fine > 0 ? 'text-amber-600' : 'text-gray-800'}`}>
                ₹{feeData.fine?.fine || 0}
              </div>
              {feeData.fine?.daysLate > 0 && (
                <div className="text-xs text-amber-600 mt-0.5">{feeData.fine.daysLate}d late × ₹{feeData.fine.finePerDay}</div>
              )}
            </div>
          </div>

          {/* Fee Transaction Log */}
          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-gray-800 font-display">Fee Transactions</h3>
                  <p className="text-[11px] text-gray-400 mt-0.5">Every fee-related entry — payments, fines, previous dues, advance & admission fee. Advance & previous dues adjust the balance but are not counted as income.</p>
                </div>
                <button onClick={exportCsv} className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-all shrink-0">
                  <Download className="w-3.5 h-3.5" /> Export CSV
                </button>
              </div>
              <div className="flex flex-wrap items-end gap-2">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">From</label>
                  <input type="date" value={filterDateFrom} onChange={(e) => setFilterDateFrom(e.target.value)} className={`${filterCls} text-xs`} />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">To</label>
                  <input type="date" value={filterDateTo} onChange={(e) => setFilterDateTo(e.target.value)} className={`${filterCls} text-xs`} />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">Method</label>
                  <select value={filterMethod} onChange={(e) => setFilterMethod(e.target.value)} className={`${filterCls} text-xs`}>
                    <option value="">All</option>
                    <option value="cash">Cash</option>
                    <option value="upi">UPI</option>
                    <option value="cheque">Cheque</option>
                    <option value="bank_transfer">Bank Transfer</option>
                    <option value="online">Online</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">Status</label>
                  <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className={`${filterCls} text-xs`}>
                    <option value="all">All</option>
                    <option value="active">Active</option>
                    <option value="reversed">Reversed</option>
                  </select>
                </div>
                {hasFilters && (
                  <button onClick={() => { setFilterDateFrom(''); setFilterDateTo(''); setFilterMethod(''); setFilterStatus('all'); }}
                    className="text-xs text-brand-500 font-semibold hover:text-brand-700 self-end pb-1">
                    Clear
                  </button>
                )}
                {hasFilters && (
                  <span className="text-xs text-gray-400 self-end pb-1">
                    {filteredEntries.length} of {allEntries.length} records
                  </span>
                )}
              </div>
            </div>

            {!filteredEntries.length ? (
              <div className="p-10 text-center text-gray-400">
                {allEntries.length === 0 ? 'No fee transactions yet' : 'No records match the current filters'}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      {['Entered On', 'Payment Date', 'Details', 'Type', 'Paid', 'Fine', 'Prev Dues', 'Advance', 'Pending After', 'Method', ''].map(h => (
                        <th key={h} className={`px-4 py-3 text-xs font-semibold text-gray-400 uppercase whitespace-nowrap ${['Paid', 'Fine', 'Prev Dues', 'Advance', 'Pending After'].includes(h) ? 'text-right' : 'text-left'}`}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredEntries.map((e, i) => {
                      const tag = TYPE_TAG[e.type] || TYPE_TAG.payment;
                      return (
                        <tr key={e.key} className={`border-b border-gray-50 last:border-0 ${e.is_reversal ? 'opacity-60' : ''} ${i % 2 === 0 ? '' : 'bg-gray-50/40'}`}>
                          <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">{fmtDateTime(e.entered_at)}</td>
                          <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{fmtDate(e.payment_date)}</td>
                          <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">
                            {e.detail}
                            {e.receipt && <span className="block text-[11px] font-mono text-gray-400">{e.receipt}</span>}
                          </td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-0.5 text-[11px] font-semibold rounded-full ${tag.cls}`}>{tag.label}</span>
                          </td>
                          <td className="px-4 py-3 text-sm font-semibold text-gray-800 text-right whitespace-nowrap">{e.paid > 0 ? rupee(e.paid) : '—'}</td>
                          <td className="px-4 py-3 text-sm text-amber-600 text-right whitespace-nowrap">{e.fine > 0 ? rupee(e.fine) : '—'}</td>
                          <td className="px-4 py-3 text-sm text-amber-700 text-right whitespace-nowrap">{e.prev_dues > 0 ? rupee(e.prev_dues) : '—'}</td>
                          <td className="px-4 py-3 text-sm text-blue-600 text-right whitespace-nowrap">{e.advance > 0 ? rupee(e.advance) : '—'}</td>
                          <td className={`px-4 py-3 text-sm font-semibold text-right whitespace-nowrap ${e.pending_after > 0 ? 'text-red-500' : e.pending_after < 0 ? 'text-green-600' : 'text-gray-500'}`}>
                            {e.pending_after !== undefined ? rupee(Math.abs(e.pending_after)) : '—'}
                          </td>
                          <td className="px-4 py-3">
                            <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-xs rounded-full capitalize whitespace-nowrap">{e.method || '—'}</span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            {e.kind === 'fee' && !e.is_reversal && !e.is_system ? (
                              <button onClick={() => setReversalTarget(e.raw)} className="text-red-400 hover:text-red-600 transition-colors" title="Reverse payment">
                                <Undo2 className="w-4 h-4" />
                              </button>
                            ) : e.is_reversal ? (
                              <span className="text-xs text-red-400 font-medium">Reversed</span>
                            ) : null}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {/* Assign / Edit Fee Modal */}
      {feeModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <h3 className="text-lg font-bold text-gray-800 font-display mb-1">
              {activeConfig ? 'Edit Fee' : 'Assign Fee'}
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              {feeData?.student?.name}{activeSession ? ` · ${activeSession.name} session` : ''}
            </p>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Monthly Fee (₹) *</label>
                <input type="number" min="0" value={feeForm.monthly_fee} placeholder="e.g. 1500"
                  onChange={(e) => setFeeForm(prev => ({ ...prev, monthly_fee: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Discount (₹)</label>
                <input type="number" min="0" value={feeForm.discount} placeholder="0"
                  onChange={(e) => setFeeForm(prev => ({ ...prev, discount: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Discount Reason</label>
                <input type="text" value={feeForm.discount_reason} placeholder="e.g. Sibling, Staff ward (optional)"
                  onChange={(e) => setFeeForm(prev => ({ ...prev, discount_reason: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none" />
              </div>
            </div>
            {activeConfig && (
              <p className="mt-3 text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                Changing the fee recalculates every month of this session, including months already billed.
              </p>
            )}
            <div className="flex gap-3 justify-end mt-5">
              <button onClick={() => setFeeModal(false)}
                className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-200 transition-colors">
                Cancel
              </button>
              <button onClick={handleSaveFee} disabled={savingFee}
                className="flex items-center gap-2 px-5 py-2.5 bg-brand-500 text-white rounded-xl text-sm font-semibold hover:bg-brand-600 transition-colors disabled:opacity-50">
                {savingFee && <Loader2 className="w-4 h-4 animate-spin" />} Save Fee
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reversal Modal */}
      {reversalTarget && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <h3 className="text-lg font-bold text-gray-800 font-display mb-2">Reverse Payment</h3>
            <p className="text-sm text-gray-500 mb-4">
              Reversing <strong>₹{Number(reversalTarget.amount_paid || 0).toLocaleString()}</strong> — Receipt <strong>{reversalTarget.receipt_number}</strong>
            </p>
            <div className="mb-4">
              <label className="block text-xs font-medium text-gray-500 mb-1">Reason for reversal</label>
              <input type="text" value={reversalReason} onChange={(e) => setReversalReason(e.target.value)}
                placeholder="e.g. Duplicate entry, cheque bounced…"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-red-500/20 focus:border-red-400 outline-none" />
            </div>
            <div className="flex gap-3 justify-end">
              <button onClick={() => { setReversalTarget(null); setReversalReason(''); }}
                className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-200 transition-colors">
                Cancel
              </button>
              <button onClick={handleReversal}
                className="px-5 py-2.5 bg-red-500 text-white rounded-xl text-sm font-semibold hover:bg-red-600 transition-colors">
                Confirm Reversal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminFeeIndividual;
