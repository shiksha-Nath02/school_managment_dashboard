import { useState, useEffect, useMemo } from 'react';
import { getProfit } from '@/services/feeService';
import { TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, Loader2 } from 'lucide-react';

const fmtMoney = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;
const filterCls = 'px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-brand-400 bg-white';

const AdminProfit = () => {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);

  const [from, setFrom] = useState(() => {
    const d = new Date(); d.setDate(1);
    return d.toISOString().split('T')[0];
  });
  const [to, setTo] = useState(new Date().toISOString().split('T')[0]);

  const [filterIncomeType, setFilterIncomeType] = useState('all');
  const [filterExpType,    setFilterExpType]    = useState('all');

  useEffect(() => {
    setLoading(true);
    getProfit(from, to)
      .then(res => setData(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [from, to]);

  const setPreset = (preset) => {
    const now = new Date();
    let newFrom;
    if (preset === 'month')    newFrom = new Date(now.getFullYear(), now.getMonth(), 1);
    else if (preset === '3m')  newFrom = new Date(now.getFullYear(), now.getMonth() - 2, 1);
    else if (preset === 'year') newFrom = new Date(now.getFullYear(), 3, 1);
    setFrom(newFrom.toISOString().split('T')[0]);
    setTo(now.toISOString().split('T')[0]);
  };

  const filteredTxns = useMemo(() => {
    if (!data?.transactions) return [];
    return data.transactions.filter(t => {
      if (t.direction === 'income')      return filterIncomeType === 'all' || t.type === filterIncomeType;
      if (t.direction === 'expenditure') return filterExpType    === 'all' || t.type === filterExpType;
      return true;
    });
  }, [data, filterIncomeType, filterExpType]);

  const totalIncome      = useMemo(() => filteredTxns.filter(t => t.direction === 'income').reduce((s, t) => s + t.amount, 0), [filteredTxns]);
  const totalExpenditure = useMemo(() => filteredTxns.filter(t => t.direction === 'expenditure').reduce((s, t) => s + t.amount, 0), [filteredTxns]);
  const profit           = totalIncome - totalExpenditure;

  const incomeByType = useMemo(() => {
    const map = {};
    for (const t of filteredTxns.filter(t => t.direction === 'income')) {
      if (!map[t.type]) map[t.type] = { type: t.type, total: 0 };
      map[t.type].total += t.amount;
    }
    return Object.values(map).sort((a, b) => b.total - a.total);
  }, [filteredTxns]);

  const expenditureByType = useMemo(() => {
    const map = {};
    for (const t of filteredTxns.filter(t => t.direction === 'expenditure')) {
      if (!map[t.type]) map[t.type] = { type: t.type, total: 0 };
      map[t.type].total += t.amount;
    }
    return Object.values(map).sort((a, b) => b.total - a.total);
  }, [filteredTxns]);

  const incomeTypes = useMemo(() => [...new Set((data?.transactions || []).filter(t => t.direction === 'income').map(t => t.type))], [data]);
  const expTypes    = useMemo(() => [...new Set((data?.transactions || []).filter(t => t.direction === 'expenditure').map(t => t.type))], [data]);

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800 font-display flex items-center gap-2">
          <TrendingUp className="w-6 h-6 text-brand-500" /> Profit & Loss
        </h1>
        <p className="text-gray-400 text-sm mt-1">All transactions — fees, uniform, books, stationery, pantry</p>
      </div>

      {/* Filters */}
      <div className="bg-white border border-gray-200 rounded-2xl px-5 py-4">
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide">From Date</label>
            <input type="date" value={from} onChange={e => setFrom(e.target.value)} className={filterCls} />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide">To Date</label>
            <input type="date" value={to} onChange={e => setTo(e.target.value)} className={filterCls} />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Income Type</label>
            <select value={filterIncomeType} onChange={e => setFilterIncomeType(e.target.value)} className={filterCls}>
              <option value="all">All Income</option>
              {incomeTypes.map(t => (
                <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Expenditure Type</label>
            <select value={filterExpType} onChange={e => setFilterExpType(e.target.value)} className={filterCls}>
              <option value="all">All Expenditure</option>
              {expTypes.map(t => (
                <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
              ))}
            </select>
          </div>
          <div className="flex gap-1.5 self-end pb-0.5">
            {[['month', 'This Month'], ['3m', 'Last 3 Mo.'], ['year', 'This Session']].map(([key, label]) => (
              <button key={key} onClick={() => setPreset(key)}
                className="px-3 py-2 bg-gray-100 text-gray-500 rounded-lg text-xs font-medium hover:bg-gray-200 transition-colors">
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48 text-gray-400 gap-2">
          <Loader2 className="w-5 h-5 animate-spin" /> Calculating...
        </div>
      ) : (
        <>
          {/* KPI cards */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-green-50 border border-green-200 rounded-2xl p-5">
              <div className="flex items-center gap-1.5 text-green-500 text-xs mb-2">
                <ArrowUpRight className="w-3.5 h-3.5" /> Total Income
              </div>
              <div className="text-2xl font-bold text-green-700 font-display">{fmtMoney(totalIncome)}</div>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-2xl p-5">
              <div className="flex items-center gap-1.5 text-red-400 text-xs mb-2">
                <ArrowDownRight className="w-3.5 h-3.5" /> Total Expenditure
              </div>
              <div className="text-2xl font-bold text-red-700 font-display">{fmtMoney(totalExpenditure)}</div>
            </div>
            <div className={`border rounded-2xl p-5 ${profit >= 0 ? 'bg-brand-50 border-brand-500/20' : 'bg-red-50 border-red-200'}`}>
              <div className={`flex items-center gap-1.5 text-xs mb-2 ${profit >= 0 ? 'text-brand-500' : 'text-red-500'}`}>
                {profit >= 0 ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                {profit >= 0 ? 'Net Profit' : 'Net Loss'}
              </div>
              <div className={`text-2xl font-bold font-display ${profit >= 0 ? 'text-brand-500' : 'text-red-700'}`}>
                {fmtMoney(Math.abs(profit))}
              </div>
            </div>
          </div>

          {/* Breakdown panels */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white border border-gray-200 rounded-2xl p-5">
              <h3 className="text-sm font-semibold text-gray-800 font-display mb-3">Income by Type</h3>
              {incomeByType.length ? incomeByType.map(item => (
                <div key={item.type} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <span className="text-sm text-gray-600 capitalize">{item.type}</span>
                  <span className="text-sm font-semibold text-green-600 tabular-nums">{fmtMoney(item.total)}</span>
                </div>
              )) : <p className="text-sm text-gray-300">No income in this range</p>}
            </div>
            <div className="bg-white border border-gray-200 rounded-2xl p-5">
              <h3 className="text-sm font-semibold text-gray-800 font-display mb-3">Expenditure by Type</h3>
              {expenditureByType.length ? expenditureByType.map(item => (
                <div key={item.type} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <span className="text-sm text-gray-600 capitalize">{item.type}</span>
                  <span className="text-sm font-semibold text-red-500 tabular-nums">{fmtMoney(item.total)}</span>
                </div>
              )) : <p className="text-sm text-gray-300">No expenditure in this range</p>}
            </div>
          </div>

          {/* Transaction log */}
          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-800 font-display">All Transactions</h3>
              <span className="text-xs text-gray-400">{filteredTxns.length} entries</span>
            </div>
            {filteredTxns.length === 0 ? (
              <div className="p-10 text-center text-gray-400">No transactions in this period</div>
            ) : (
              <div className="max-h-[28rem] overflow-y-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      {['Date', 'Type', 'Description', 'Amount'].map(h => (
                        <th key={h} className={`px-4 py-2.5 text-xs font-semibold text-gray-400 uppercase ${h === 'Amount' ? 'text-right' : 'text-left'}`}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTxns.map((txn, i) => (
                      <tr key={txn.id} className={`border-t border-gray-100 ${i % 2 === 0 ? '' : 'bg-gray-50/30'}`}>
                        <td className="px-4 py-2.5 text-sm text-gray-500 tabular-nums whitespace-nowrap">{txn.date}</td>
                        <td className="px-4 py-2.5">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            txn.direction === 'income' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'
                          }`}>{txn.type}</span>
                        </td>
                        <td className="px-4 py-2.5 text-sm text-gray-600 truncate max-w-xs">{txn.description || '—'}</td>
                        <td className={`px-4 py-2.5 text-sm text-right font-semibold tabular-nums ${
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
          </div>
        </>
      )}
    </div>
  );
};

export default AdminProfit;
