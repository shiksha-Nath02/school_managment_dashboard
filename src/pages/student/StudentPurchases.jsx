import { useState, useEffect } from 'react';
import { Loader2, ShoppingBag, IndianRupee, AlertCircle } from 'lucide-react';
import api from '../../services/api';

const money = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;
const fmtDate = (d) => (d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—');

export default function StudentPurchases() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/student/purchases')
      .then((r) => setData(r.data))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center py-24"><Loader2 className="w-6 h-6 text-brand-500 animate-spin" /></div>;
  }

  const txns = data?.transactions || [];
  const summary = data?.summary || { totalTransactions: 0, totalSpent: 0, totalPending: 0 };

  return (
    <div className="space-y-6 animate-fade-up animate-start">
      <div>
        <h1 className="text-2xl font-display font-bold text-gray-900">My Purchases</h1>
        <p className="text-sm text-gray-500 mt-0.5">Uniform &amp; book purchases with payment status</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white border border-gray-200 rounded-2xl p-4 text-center">
          <p className="text-xl font-bold text-gray-800">{summary.totalTransactions}</p>
          <p className="text-xs font-semibold text-gray-400 mt-0.5">Items</p>
        </div>
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-center">
          <p className="text-xl font-bold text-emerald-700">{money(summary.totalSpent)}</p>
          <p className="text-xs font-semibold text-emerald-600 mt-0.5">Paid</p>
        </div>
        <div className={`rounded-2xl p-4 text-center border ${summary.totalPending > 0 ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-200'}`}>
          <p className={`text-xl font-bold ${summary.totalPending > 0 ? 'text-red-600' : 'text-gray-500'}`}>{money(summary.totalPending)}</p>
          <p className={`text-xs font-semibold mt-0.5 ${summary.totalPending > 0 ? 'text-red-500' : 'text-gray-400'}`}>Pending</p>
        </div>
      </div>

      {/* List */}
      {txns.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-2xl py-16 text-center text-gray-400">
          <ShoppingBag className="w-8 h-8 mx-auto mb-2 text-gray-300" />
          <p className="text-sm">No uniform or book purchases yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {txns.map((t) => {
            const fullyPaid = t.left <= 0;
            return (
              <div key={`${t.type}-${t.id}`} className="bg-white border border-gray-200 rounded-2xl p-4">
                <div className="flex items-start gap-3">
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md uppercase mt-0.5 shrink-0 ${t.type === 'uniform' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'}`}>
                    {t.type}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800">{t.itemName}</p>
                    {(t.className || t.subject) && (
                      <p className="text-xs text-gray-400">{[t.className, t.subject].filter(Boolean).join(' · ')}</p>
                    )}
                    <p className="text-xs text-gray-400 mt-0.5">Qty {t.quantity} · {fmtDate(t.date)}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold text-gray-900">{money(t.toBePaid)}</p>
                    {fullyPaid
                      ? <span className="text-[10px] font-semibold text-emerald-500">Paid</span>
                      : <span className="text-[10px] font-semibold text-red-400">Due {money(t.left)}</span>}
                  </div>
                </div>

                {t.payments.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-100 space-y-1.5">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide flex items-center gap-1"><IndianRupee className="w-3 h-3" /> Payments</p>
                    {t.payments.map((p) => (
                      <div key={p.id} className="flex items-center justify-between text-xs text-gray-600">
                        <span>{fmtDate(p.paymentDate)}{p.remarks ? ` · ${p.remarks}` : ''}</span>
                        <span className="font-semibold text-emerald-600">{money(p.amountPaid)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {data === null && (
        <div className="flex items-center gap-2 text-red-500 text-sm justify-center py-4">
          <AlertCircle className="w-4 h-4" /> Failed to load purchases
        </div>
      )}
    </div>
  );
}
