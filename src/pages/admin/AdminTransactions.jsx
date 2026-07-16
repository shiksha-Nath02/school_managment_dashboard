import { useState, useEffect, useCallback } from 'react';
import { getTransactions } from '@/services/feeService';
import { ArrowLeftRight, ArrowUpRight, ArrowDownRight, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';

const PAGE_SIZE = 50;
const today = () => new Date().toISOString().split('T')[0];
const fmtMoney = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;
const filterCls = 'px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-brand-400 bg-white';

const AdminTransactions = () => {
  const [from, setFrom]           = useState(today());
  const [to, setTo]               = useState(today());
  const [direction, setDirection] = useState('all');
  const [offset, setOffset]       = useState(0);

  const [data, setData]           = useState(null);
  const [loading, setLoading]     = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    getTransactions({
      from,
      to,
      direction: direction === 'all' ? undefined : direction,
      limit: PAGE_SIZE,
      offset,
    })
      .then((res) => setData(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [from, to, direction, offset]);

  useEffect(() => { load(); }, [load]);

  // Any filter change resets to the first page.
  const onFilter = (setter) => (value) => { setOffset(0); setter(value); };

  const total   = data?.total || 0;
  const txns    = data?.transactions || [];
  const start   = total === 0 ? 0 : offset + 1;
  const end     = Math.min(offset + PAGE_SIZE, total);
  const canPrev = offset > 0;
  const canNext = offset + PAGE_SIZE < total;

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800 font-display flex items-center gap-2">
          <ArrowLeftRight className="w-6 h-6 text-brand-500" /> Transactions
        </h1>
        <p className="text-gray-400 text-sm mt-1">Every money movement — fees, fine, admission, uniform, books & expenses — for the selected dates</p>
      </div>

      {/* Filters */}
      <div className="bg-white border border-gray-200 rounded-2xl px-5 py-4">
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide">From Date</label>
            <input type="date" value={from} max={to} onChange={(e) => onFilter(setFrom)(e.target.value)} className={filterCls} />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide">To Date</label>
            <input type="date" value={to} min={from} onChange={(e) => onFilter(setTo)(e.target.value)} className={filterCls} />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Direction</label>
            <select value={direction} onChange={(e) => onFilter(setDirection)(e.target.value)} className={filterCls}>
              <option value="all">All</option>
              <option value="income">Income</option>
              <option value="expenditure">Expenditure</option>
            </select>
          </div>
          <div className="flex gap-1.5 self-end pb-0.5">
            <button onClick={() => { setOffset(0); setFrom(today()); setTo(today()); }}
              className="px-3 py-2 bg-gray-100 text-gray-500 rounded-lg text-xs font-medium hover:bg-gray-200 transition-colors">
              Today
            </button>
          </div>
        </div>
      </div>

      {/* Range totals */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-green-50 border border-green-200 rounded-2xl p-4">
          <div className="flex items-center gap-1.5 text-green-500 text-xs mb-1"><ArrowUpRight className="w-3.5 h-3.5" /> Income</div>
          <div className="text-xl font-bold text-green-700 font-display">{fmtMoney(data?.totalIncome)}</div>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
          <div className="flex items-center gap-1.5 text-red-400 text-xs mb-1"><ArrowDownRight className="w-3.5 h-3.5" /> Expenditure</div>
          <div className="text-xl font-bold text-red-700 font-display">{fmtMoney(data?.totalExpenditure)}</div>
        </div>
        <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4">
          <div className="text-xs text-gray-400 mb-1">Total Entries</div>
          <div className="text-xl font-bold text-gray-800 font-display tabular-nums">{total}</div>
        </div>
      </div>

      {/* Transaction table */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-800 font-display">Transactions</h3>
          <span className="text-xs text-gray-400 tabular-nums">
            {total === 0 ? '0' : `${start}–${end}`} of {total}
          </span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-48 text-gray-400 gap-2">
            <Loader2 className="w-5 h-5 animate-spin" /> Loading...
          </div>
        ) : txns.length === 0 ? (
          <div className="p-10 text-center text-gray-400">No transactions in this period</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  {['Date', 'Type', 'Description', 'Amount'].map((h) => (
                    <th key={h} className={`px-4 py-2.5 text-xs font-semibold text-gray-400 uppercase ${h === 'Amount' ? 'text-right' : 'text-left'}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {txns.map((txn, i) => (
                  <tr key={txn.id} className={`border-t border-gray-100 ${i % 2 === 0 ? '' : 'bg-gray-50/30'}`}>
                    <td className="px-4 py-2.5 text-sm text-gray-500 tabular-nums whitespace-nowrap">{txn.date}</td>
                    <td className="px-4 py-2.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        txn.direction === 'income' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'
                      }`}>{txn.type}</span>
                    </td>
                    <td className="px-4 py-2.5 text-sm text-gray-600 truncate max-w-md">{txn.description || '—'}</td>
                    <td className={`px-4 py-2.5 text-sm text-right font-semibold tabular-nums whitespace-nowrap ${
                      txn.direction === 'income' ? 'text-green-600' : 'text-red-500'
                    }`}>
                      {txn.direction === 'income' ? '+' : '-'}{fmtMoney(Math.abs(txn.amount))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {total > PAGE_SIZE && (
          <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between">
            <span className="text-xs text-gray-400 tabular-nums">Showing {start}–{end} of {total}</span>
            <div className="flex items-center gap-2">
              <button onClick={() => setOffset((o) => Math.max(0, o - PAGE_SIZE))} disabled={!canPrev}
                className="flex items-center gap-1 px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                <ChevronLeft className="w-4 h-4" /> Prev
              </button>
              <button onClick={() => setOffset((o) => o + PAGE_SIZE)} disabled={!canNext}
                className="flex items-center gap-1 px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                Next <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminTransactions;
