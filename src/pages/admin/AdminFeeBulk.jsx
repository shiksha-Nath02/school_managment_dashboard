import { useState, useEffect } from 'react';
import { recordBulkPayment, getStudentFeeDetails } from '@/services/feeService';
import api from '@/services/api';
import { Banknote, Save, Loader2, CheckCircle } from 'lucide-react';

const MONTH_NAMES = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const AdminFeeBulk = () => {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [students, setStudents] = useState([]);
  const [billingMonth, setBillingMonth] = useState(new Date().getMonth() + 1);
  const [billingYear, setBillingYear] = useState(new Date().getFullYear());
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [payments, setPayments] = useState({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [results, setResults] = useState(null);

  useEffect(() => {
    api.get('/admin/classes')
      .then(res => {
        const raw = res.data.classes || res.data || [];
        const sorted = [...raw].sort((a, b) => {
          const na = parseInt(a.class_name, 10);
          const nb = parseInt(b.class_name, 10);
          return na !== nb ? na - nb : a.section.localeCompare(b.section);
        });
        setClasses(sorted);
        if (sorted.length > 0) setSelectedClass(sorted[0].id);
      })
      .catch(console.error);
  }, []);

  const fetchStudents = async ({ clearResults = true } = {}) => {
    if (!selectedClass) return;
    if (clearResults) setResults(null);
    setLoading(true);
    try {
      const res = await api.get(`/admin/students?class_id=${selectedClass}`);
      const body = res?.data ?? res;
      const studentList = body?.students ?? (Array.isArray(body) ? body : []);

      const enriched = await Promise.all(
        studentList.map(async (s) => {
          try {
            const feeRes = await getStudentFeeDetails(s.id);
            const feeBody = feeRes?.data ?? feeRes;
            return { ...s, currentPending: feeBody?.currentPending || 0, fineAmount: feeBody?.fine?.fine || 0 };
          } catch {
            return { ...s, currentPending: 0, fineAmount: 0 };
          }
        })
      );

      setStudents(enriched);
      const payMap = {};
      enriched.forEach(s => { payMap[s.id] = { amount: '', payment_method: 'cash' }; });
      setPayments(payMap);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchStudents({ clearResults: true });
  }, [selectedClass]);

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  const handlePaymentChange = (studentId, field, value) => {
    setPayments(prev => ({ ...prev, [studentId]: { ...prev[studentId], [field]: value } }));
  };

  const handleSaveAll = async () => {
    const paymentsList = Object.entries(payments)
      .filter(([_, v]) => v.amount && parseFloat(v.amount) > 0)
      .map(([studentId, v]) => ({
        student_id: parseInt(studentId),
        amount: parseFloat(v.amount),
        payment_method: v.payment_method,
      }));

    if (paymentsList.length === 0) {
      showToast('error', 'Enter at least one payment amount');
      return;
    }

    setSaving(true);
    try {
      const res = await recordBulkPayment({
        payments: paymentsList,
        billing_month: parseInt(billingMonth),
        billing_year: parseInt(billingYear),
        payment_date: paymentDate,
      });
      const saveBody = res?.data ?? res;
      showToast('success', `${saveBody.results?.length ?? 0} payments recorded successfully!`);
      setResults(saveBody.results ?? []);
      await fetchStudents({ clearResults: false });
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Failed to record payments');
    }
    setSaving(false);
  };

  const totalBeingPaid = Object.values(payments).reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);
  const payingCount = Object.values(payments).filter(p => p.amount && parseFloat(p.amount) > 0).length;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 font-display flex items-center gap-2">
          <Banknote className="w-6 h-6 text-brand-500" />
          Bulk Payment Entry
        </h1>
        <p className="text-gray-400 text-sm mt-1">Record multiple payments at once for a class</p>
      </div>

      {toast && (
        <div className={`mb-4 px-4 py-3 rounded-xl text-sm font-medium ${
          toast.type === 'success'
            ? 'bg-green-50 text-green-700 border border-green-200'
            : 'bg-red-50 text-red-700 border border-red-200'
        }`}>{toast.message}</div>
      )}

      {/* Controls */}
      <div className="flex flex-wrap items-end gap-4 mb-5">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Class</label>
          <select value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)}
            className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none">
            {classes.map(cls => (
              <option key={cls.id} value={cls.id}>Class {cls.class_name}-{cls.section}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Billing Month</label>
          <div className="flex gap-1">
            <select value={billingMonth} onChange={(e) => { setBillingMonth(e.target.value); setResults(null); }}
              className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-1 focus:ring-brand-500/20 outline-none">
              {MONTH_NAMES.slice(1).map((m, i) => <option key={i + 1} value={i + 1}>{m}</option>)}
            </select>
            <input type="number" value={billingYear} onChange={(e) => { setBillingYear(e.target.value); setResults(null); }}
              className="w-20 px-2 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-1 focus:ring-brand-500/20 outline-none" />
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Payment Date</label>
          <input type="date" value={paymentDate} onChange={(e) => setPaymentDate(e.target.value)}
            className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none" />
        </div>
      </div>

      {/* Summary + save bar */}
      {payingCount > 0 && (
        <div className="flex items-center justify-between bg-brand-50 border border-brand-500/20 rounded-xl px-5 py-3 mb-5">
          <div className="text-sm text-brand-500">
            <strong>{payingCount}</strong> student{payingCount !== 1 ? 's' : ''} &nbsp;·&nbsp; Total: <strong>₹{totalBeingPaid.toLocaleString()}</strong>
          </div>
          <button
            onClick={handleSaveAll}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2 bg-brand-500 text-white rounded-lg text-sm font-semibold hover:bg-brand-600 transition-colors disabled:opacity-50 shadow-lg shadow-brand-500/20"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? 'Saving...' : 'Save All Payments'}
          </button>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center h-48 text-gray-400 gap-2">
          <Loader2 className="w-5 h-5 animate-spin" /> Loading students...
        </div>
      ) : students.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center text-gray-400">
          No students found for this class.
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
          <table className="w-full">
            <thead className="bg-brand-50">
              <tr>
                {['Roll', 'Student Name', 'Pending', 'Amount (₹)', 'Method', 'Status'].map((h) => (
                  <th key={h} className={`px-4 py-3 text-xs font-semibold text-brand-500 uppercase ${h === 'Pending' ? 'text-right' : h === 'Status' ? 'text-center' : 'text-left'}`}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {students.map((student, i) => {
                const pay = payments[student.id] || {};
                const result = results?.find(r => r.student_id === student.id);
                return (
                  <tr key={student.id} className={`border-t border-gray-100 ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}`}>
                    <td className="px-4 py-3 text-sm text-gray-400 tabular-nums">{student.roll_number}</td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-800">
                      {student.user?.name || `Student ${student.id}`}
                    </td>
                    <td className={`px-4 py-3 text-sm text-right font-semibold tabular-nums ${
                      student.currentPending > 0 ? 'text-red-500' : 'text-gray-300'
                    }`}>
                      {student.currentPending > 0 ? `₹${student.currentPending.toLocaleString()}` : '₹0'}
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        value={pay.amount || ''}
                        onChange={(e) => handlePaymentChange(student.id, 'amount', e.target.value)}
                        placeholder="0"
                        disabled={!!results}
                        className="w-28 px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none disabled:bg-gray-50"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={pay.payment_method || 'cash'}
                        onChange={(e) => handlePaymentChange(student.id, 'payment_method', e.target.value)}
                        disabled={!!results}
                        className="px-2 py-1.5 border border-gray-200 rounded-lg text-sm focus:ring-1 focus:ring-brand-500/20 outline-none disabled:bg-gray-50"
                      >
                        <option value="cash">Cash</option>
                        <option value="upi">UPI</option>
                        <option value="cheque">Cheque</option>
                        <option value="bank_transfer">Bank</option>
                        <option value="online">Online</option>
                      </select>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {result && (
                        <span className="inline-flex items-center gap-1 text-green-600 text-xs font-medium">
                          <CheckCircle className="w-3.5 h-3.5" /> {result.receipt_number}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminFeeBulk;
