import { useState, useEffect, useMemo } from 'react';
import { getStudentFeeDetails, recordPayment, reversePayment } from '@/services/feeService';
import api from '@/services/api';
import { Receipt, Search, CreditCard, Undo2, Loader2, User, IndianRupee, Download, Upload } from 'lucide-react';
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

const AdminFeeIndividual = () => {
  const [searchQuery, setSearchQuery]   = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [feeData, setFeeData]           = useState(null);
  const [loading, setLoading]           = useState(false);
  const [toast, setToast]               = useState(null);
  const [csvOpen, setCsvOpen]           = useState(false);

  const [payForm, setPayForm] = useState({
    amount: '',
    payment_date: new Date().toISOString().split('T')[0],
    payment_method: 'cash',
    billing_month: new Date().getMonth() + 1,
    billing_year: new Date().getFullYear(),
    include_fine: false,
    remarks: '',
  });
  const [paying, setPaying] = useState(false);

  const [reversalTarget, setReversalTarget] = useState(null);
  const [reversalReason, setReversalReason] = useState('');

  // ── payment history filters
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo,   setFilterDateTo]   = useState('');
  const [filterMethod,   setFilterMethod]   = useState('');
  const [filterStatus,   setFilterStatus]   = useState('all'); // 'all'|'active'|'reversed'

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!searchQuery || searchQuery.length < 2) { setSearchResults([]); return; }
      api.get(`/admin/students?search=${encodeURIComponent(searchQuery)}`)
        .then(res => setSearchResults(res.data.students || res.data || []))
        .catch(() => {});
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

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

  const handlePay = async () => {
    if (!payForm.amount || parseFloat(payForm.amount) <= 0) { showToast('error', 'Enter a valid amount'); return; }
    setPaying(true);
    try {
      const res = await recordPayment({
        student_id: selectedStudent.id,
        amount: parseFloat(payForm.amount),
        payment_date: payForm.payment_date,
        payment_method: payForm.payment_method,
        billing_month: parseInt(payForm.billing_month),
        billing_year: parseInt(payForm.billing_year),
        include_fine: payForm.include_fine,
        remarks: payForm.remarks,
      });
      showToast('success', `Payment recorded! Receipt: ${res.data.receipt_number}`);
      setPayForm(prev => ({ ...prev, amount: '', remarks: '' }));
      const refreshed = await getStudentFeeDetails(selectedStudent.id);
      setFeeData(refreshed.data);
    } catch (err) { showToast('error', err.response?.data?.message || 'Failed to record payment'); }
    setPaying(false);
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

  // ── filtered payments
  const allPayments = feeData?.payments || [];
  const filteredPayments = useMemo(() => allPayments.filter((p) => {
    const d = p.payment_date?.split('T')[0] || '';
    if (filterDateFrom && d < filterDateFrom)                                        return false;
    if (filterDateTo   && d > filterDateTo)                                          return false;
    if (filterMethod   && p.payment_method !== filterMethod)                         return false;
    if (filterStatus === 'active'   &&  p.is_reversed)                              return false;
    if (filterStatus === 'reversed' && !p.is_reversed)                              return false;
    return true;
  }), [allPayments, filterDateFrom, filterDateTo, filterMethod, filterStatus]);

  const hasFilters = filterDateFrom || filterDateTo || filterMethod || filterStatus !== 'all';

  const exportPaymentsCsv = () => {
    const header = ['Adm No', 'Student', 'Date', 'Receipt', 'Month', 'Paid', 'Fine', 'Pending After', 'Method', 'Status'];
    const rows   = filteredPayments.map((p) => [
      selectedStudent?.id,
      `"${feeData?.student?.user?.name || ''}"`,
      p.payment_date?.split('T')[0] || '',
      p.receipt_number,
      p.billing_month ? `${MONTH_NAMES[p.billing_month]} ${p.billing_year}` : '',
      p.amount || 0, p.fine_amount || 0, p.pending_after || 0,
      p.payment_method,
      p.is_reversed ? 'Reversed' : 'Active',
    ]);
    const csv  = [header, ...rows].map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url  = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'fee-payments.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
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
          <p className="text-gray-400 text-sm mt-1">Search for a student to view fee details and record payments</p>
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

      {/* Search */}
      <div className="relative mb-6">
        <div className="flex items-center bg-white border border-gray-200 rounded-2xl px-4 py-3 shadow-sm">
          <Search className="w-5 h-5 text-gray-300 mr-3 shrink-0" />
          <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search student by name…"
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
              <div className="text-sm font-semibold text-gray-800 font-display truncate">{feeData.student?.user?.name}</div>
              <div className="text-xs text-brand-500 font-bold mt-0.5">Adm #{selectedStudent.id}</div>
              <div className="text-xs text-gray-400 mt-0.5">
                Class {feeData.student?.class?.class_name}-{feeData.student?.class?.section}
              </div>
            </div>
            <div className="bg-white border border-gray-200 rounded-2xl p-4">
              <div className="text-xs text-gray-400 mb-1">Monthly Fee</div>
              <div className="text-xl font-bold text-gray-800 font-display">
                ₹{feeData.feeConfig?.monthly_fee?.toLocaleString() || '—'}
              </div>
              {feeData.feeConfig?.discount > 0 && (
                <div className="text-xs text-green-600 mt-0.5">Discount: ₹{feeData.feeConfig.discount}</div>
              )}
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

          {/* Record Payment */}
          <div className="bg-white border border-gray-200 rounded-2xl p-5 mb-6">
            <h3 className="text-sm font-semibold text-gray-800 font-display mb-4 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-brand-500" /> Record Payment
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Amount (₹)</label>
                <input type="number" value={payForm.amount} placeholder="0"
                  onChange={(e) => setPayForm(prev => ({ ...prev, amount: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Payment Date</label>
                <input type="date" value={payForm.payment_date}
                  onChange={(e) => setPayForm(prev => ({ ...prev, payment_date: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Method</label>
                <select value={payForm.payment_method}
                  onChange={(e) => setPayForm(prev => ({ ...prev, payment_method: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none">
                  <option value="cash">Cash</option>
                  <option value="upi">UPI</option>
                  <option value="cheque">Cheque</option>
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="online">Online</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Billing Month</label>
                <div className="flex gap-1">
                  <select value={payForm.billing_month}
                    onChange={(e) => setPayForm(prev => ({ ...prev, billing_month: e.target.value }))}
                    className="flex-1 px-2 py-2 border border-gray-200 rounded-lg text-sm focus:ring-1 outline-none">
                    {MONTH_NAMES.slice(1).map((m, i) => (
                      <option key={i + 1} value={i + 1}>{m}</option>
                    ))}
                  </select>
                  <input type="number" value={payForm.billing_year}
                    onChange={(e) => setPayForm(prev => ({ ...prev, billing_year: e.target.value }))}
                    className="w-20 px-2 py-2 border border-gray-200 rounded-lg text-sm focus:ring-1 outline-none" />
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4 mb-4">
              <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer select-none">
                <input type="checkbox" checked={payForm.include_fine}
                  onChange={(e) => setPayForm(prev => ({ ...prev, include_fine: e.target.checked }))}
                  className="w-4 h-4 rounded border-gray-300 text-brand-500 focus:ring-brand-500" />
                Include fine (₹{feeData.fine?.fine || 0})
              </label>
              <input type="text" value={payForm.remarks} placeholder="Remarks (optional)"
                onChange={(e) => setPayForm(prev => ({ ...prev, remarks: e.target.value }))}
                className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-1 outline-none" />
            </div>
            <button onClick={handlePay} disabled={paying}
              className="flex items-center gap-2 px-6 py-2.5 bg-brand-500 text-white rounded-xl text-sm font-semibold hover:bg-brand-600 transition-colors disabled:opacity-50 shadow-lg shadow-brand-500/20">
              {paying ? <Loader2 className="w-4 h-4 animate-spin" /> : <IndianRupee className="w-4 h-4" />}
              {paying ? 'Recording...' : 'Record Payment'}
            </button>
          </div>

          {/* Payment History */}
          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
            {/* history header + filters */}
            <div className="px-5 py-4 border-b border-gray-100 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-800 font-display">Payment History</h3>
                <button onClick={exportPaymentsCsv} className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-all">
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
                    {filteredPayments.length} of {allPayments.length} records
                  </span>
                )}
              </div>
            </div>

            {!filteredPayments.length ? (
              <div className="p-10 text-center text-gray-400">
                {allPayments.length === 0 ? 'No payment records yet' : 'No records match the current filters'}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      {['Adm No', 'Date', 'Receipt', 'Month', 'Paid', 'Fine', 'Pending After', 'Method', ''].map(h => (
                        <th key={h} className={`px-4 py-3 text-xs font-semibold text-gray-400 uppercase ${['Paid', 'Fine', 'Pending After'].includes(h) ? 'text-right' : 'text-left'}`}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPayments.map((p, i) => (
                      <tr key={p.id} className={`border-b border-gray-50 last:border-0 ${p.is_reversed ? 'opacity-50' : ''} ${i % 2 === 0 ? '' : 'bg-gray-50/40'}`}>
                        <td className="px-4 py-3 font-mono text-xs font-bold text-brand-600">{selectedStudent.id}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {new Date(p.payment_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </td>
                        <td className="px-4 py-3 text-sm font-mono text-gray-500">{p.receipt_number}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {p.billing_month ? `${MONTH_NAMES[p.billing_month]} ${p.billing_year}` : '—'}
                        </td>
                        <td className="px-4 py-3 text-sm font-semibold text-gray-800 text-right">₹{p.amount?.toLocaleString()}</td>
                        <td className="px-4 py-3 text-sm text-amber-600 text-right">{p.fine_amount > 0 ? `₹${p.fine_amount}` : '—'}</td>
                        <td className={`px-4 py-3 text-sm font-semibold text-right ${p.pending_after > 0 ? 'text-red-500' : p.pending_after < 0 ? 'text-green-600' : 'text-gray-500'}`}>
                          {p.pending_after !== undefined ? `₹${Math.abs(p.pending_after).toLocaleString()}` : '—'}
                        </td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-xs rounded-full capitalize">{p.payment_method}</span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          {!p.is_reversed ? (
                            <button onClick={() => setReversalTarget(p)} className="text-red-400 hover:text-red-600 transition-colors" title="Reverse payment">
                              <Undo2 className="w-4 h-4" />
                            </button>
                          ) : (
                            <span className="text-xs text-red-400 font-medium">Reversed</span>
                          )}
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

      {/* Reversal Modal */}
      {reversalTarget && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <h3 className="text-lg font-bold text-gray-800 font-display mb-2">Reverse Payment</h3>
            <p className="text-sm text-gray-500 mb-4">
              Reversing <strong>₹{reversalTarget.amount?.toLocaleString()}</strong> — Receipt <strong>{reversalTarget.receipt_number}</strong>
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
