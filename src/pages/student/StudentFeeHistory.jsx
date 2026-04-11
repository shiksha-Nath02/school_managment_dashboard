import { useState, useEffect } from 'react';
import { getOwnFees } from '@/services/feeService';
import { Receipt, AlertCircle, Loader2, IndianRupee, Clock } from 'lucide-react';

const MONTH_NAMES = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const StudentFeeHistory = () => {
  const [feeData, setFeeData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getOwnFees()
      .then(res => setFeeData(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center h-64 text-gray-400 gap-2">
        <Loader2 className="w-5 h-5 animate-spin" /> Loading fee details...
      </div>
    );
  }

  const pending = feeData?.currentPending || 0;
  const fine = feeData?.fine?.fine || 0;
  const totalDue = Math.max(0, pending) + fine;
  const isCredit = pending < 0;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 font-display flex items-center gap-2">
          <Receipt className="w-6 h-6 text-student-500" />
          Fee History
        </h1>
        <p className="text-gray-400 text-sm mt-1">Your fee payments and pending dues</p>
      </div>

      {/* Status cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Pending / Credit */}
        <div className={`border rounded-2xl p-5 ${
          isCredit
            ? 'bg-green-50 border-green-200'
            : pending > 0
              ? 'bg-red-50 border-red-200'
              : 'bg-white border-gray-200'
        }`}>
          <div className="flex items-center gap-2 mb-2">
            <IndianRupee className={`w-4 h-4 ${isCredit ? 'text-green-500' : pending > 0 ? 'text-red-400' : 'text-gray-300'}`} />
            <span className="text-xs text-gray-500">{isCredit ? 'Credit Balance' : 'Pending Amount'}</span>
          </div>
          <div className={`text-2xl font-bold font-display ${
            isCredit ? 'text-green-600' : pending > 0 ? 'text-red-600' : 'text-gray-800'
          }`}>
            ₹{Math.abs(pending).toLocaleString()}
          </div>
        </div>

        {/* Fine (only shown if > 0) */}
        {fine > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-amber-500" />
              <span className="text-xs text-gray-500">Late Fine</span>
            </div>
            <div className="text-2xl font-bold text-amber-600 font-display">₹{fine.toLocaleString()}</div>
            <p className="text-xs text-amber-500 mt-1">
              {feeData.fine.daysLate} days × ₹{feeData.fine.finePerDay}/day
            </p>
          </div>
        )}

        {/* Total due / all clear */}
        {totalDue > 0 ? (
          <div className="bg-student-50 border border-student-500/20 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="w-4 h-4 text-student-500" />
              <span className="text-xs text-gray-500">Total Due</span>
            </div>
            <div className="text-2xl font-bold text-student-500 font-display">₹{totalDue.toLocaleString()}</div>
          </div>
        ) : (
          <div className={`bg-green-50 border border-green-200 rounded-2xl p-5 flex items-center justify-center ${fine > 0 ? '' : 'col-span-2'}`}>
            <p className="text-green-600 font-semibold font-display text-sm">All fees cleared!</p>
          </div>
        )}
      </div>

      {/* Payment history table */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="px-5 py-4 border-b border-gray-100">
          <h3 className="text-sm font-semibold text-gray-800 font-display">Payment History</h3>
        </div>

        {!feeData?.payments?.length ? (
          <div className="p-10 text-center text-gray-400">No payment records yet</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-student-50">
                <tr>
                  {['Date', 'Receipt', 'Month', 'Paid', 'Pending After', 'Method'].map(h => (
                    <th key={h} className={`px-4 py-3 text-xs font-semibold text-student-500 uppercase ${
                      ['Paid', 'Pending After'].includes(h) ? 'text-right' : 'text-left'
                    }`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {feeData.payments.map((p, i) => {
                  const amountPaid = parseFloat(p.amount_paid ?? p.amount ?? 0);
                  const pendingAfter = parseFloat(p.pending_after ?? 0);
                  return (
                    <tr
                      key={p.id}
                      className={`border-t border-gray-100 ${
                        p.is_reversal
                          ? 'bg-red-50/40'
                          : p.is_system_generated
                            ? 'bg-gray-50/30'
                            : i % 2 === 0
                              ? 'bg-white'
                              : 'bg-gray-50/20'
                      }`}
                    >
                      <td className="px-4 py-2.5 text-sm text-gray-600 tabular-nums">{p.payment_date || '—'}</td>
                      <td className="px-4 py-2.5 text-xs text-gray-400 font-mono">{p.receipt_number || '—'}</td>
                      <td className="px-4 py-2.5 text-sm text-gray-600">
                        {p.billing_month ? `${MONTH_NAMES[p.billing_month]} ${p.billing_year}` : '—'}
                      </td>
                      <td className={`px-4 py-2.5 text-sm text-right font-semibold tabular-nums ${
                        p.is_reversal ? 'text-red-500' : amountPaid > 0 ? 'text-green-600' : 'text-gray-400'
                      }`}>
                        {amountPaid !== 0 ? `₹${Math.abs(amountPaid).toLocaleString()}` : '—'}
                        {p.is_reversal && <span className="text-xs font-normal ml-1 opacity-70">(Reversed)</span>}
                      </td>
                      <td className={`px-4 py-2.5 text-sm text-right font-semibold tabular-nums ${
                        pendingAfter > 0 ? 'text-red-500' : pendingAfter < 0 ? 'text-green-600' : 'text-gray-400'
                      }`}>
                        ₹{Math.abs(pendingAfter).toLocaleString()}
                        {pendingAfter < 0 && <span className="text-xs font-normal ml-1 text-green-500">(Credit)</span>}
                      </td>
                      <td className="px-4 py-2.5 text-xs text-gray-400">
                        {p.is_system_generated ? (
                          <span className="px-2 py-0.5 bg-gray-100 text-gray-400 rounded-full text-[10px]">Auto</span>
                        ) : (
                          <span className="capitalize">{p.payment_method?.replace('_', ' ') || '—'}</span>
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
    </div>
  );
};

export default StudentFeeHistory;
