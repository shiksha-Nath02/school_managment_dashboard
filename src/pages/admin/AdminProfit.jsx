import { useState, useEffect } from 'react';
import { getProfit, getPaymentLog, addPaymentLogEntry } from '@/services/feeService';
import { TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, Plus, Loader2, X } from 'lucide-react';

const ENTRY_TYPES = [
  'stationery', 'salary', 'maintenance', 'pantry', 'books',
  'uniform', 'electricity', 'rent', 'fees', 'fine', 'other',
];

const AdminProfit = () => {
  const [profitData, setProfitData] = useState(null);
  const [logs, setLogs] = useState([]);
  const [from, setFrom] = useState(() => {
    const d = new Date();
    d.setDate(1);
    return d.toISOString().split('T')[0];
  });
  const [to, setTo] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [toast, setToast] = useState(null);
  const [entryForm, setEntryForm] = useState({
    type: 'stationery',
    direction: 'expenditure',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    description: '',
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [profitRes, logRes] = await Promise.all([
        getProfit(from, to),
        getPaymentLog({ from, to }),
      ]);
      setProfitData(profitRes.data);
      setLogs(logRes.data.logs || []);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [from, to]);

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  const handleAddEntry = async () => {
    if (!entryForm.amount || !entryForm.type) {
      showToast('error', 'Amount and type are required');
      return;
    }
    try {
      await addPaymentLogEntry(entryForm);
      showToast('success', 'Entry added successfully');
      setShowAddModal(false);
      setEntryForm({ type: 'stationery', direction: 'expenditure', amount: '', date: new Date().toISOString().split('T')[0], description: '' });
      fetchData();
    } catch (err) {
      showToast('error', 'Failed to add entry');
    }
  };

  const setPreset = (preset) => {
    const now = new Date();
    let newFrom;
    if (preset === 'month') newFrom = new Date(now.getFullYear(), now.getMonth(), 1);
    else if (preset === '3months') newFrom = new Date(now.getFullYear(), now.getMonth() - 2, 1);
    else if (preset === 'year') newFrom = new Date(now.getFullYear(), 3, 1);
    setFrom(newFrom.toISOString().split('T')[0]);
    setTo(now.toISOString().split('T')[0]);
  };

  const income = parseFloat(profitData?.totalIncome || 0);
  const expenditure = parseFloat(profitData?.totalExpenditure || 0);
  const profit = parseFloat(profitData?.profit ?? (income - expenditure));

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 font-display flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-brand-500" />
            Profit & Loss
          </h1>
          <p className="text-gray-400 text-sm mt-1">Total income, expenditure, and profit overview</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-brand-500 text-white rounded-xl text-sm font-semibold hover:bg-brand-600 transition-colors shadow-lg shadow-brand-500/20"
        >
          <Plus className="w-4 h-4" /> Add Expense / Income
        </button>
      </div>

      {toast && (
        <div className={`mb-4 px-4 py-3 rounded-xl text-sm font-medium ${
          toast.type === 'success'
            ? 'bg-green-50 text-green-700 border border-green-200'
            : 'bg-red-50 text-red-700 border border-red-200'
        }`}>{toast.message}</div>
      )}

      {/* Date controls */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <input type="date" value={from} onChange={(e) => setFrom(e.target.value)}
          className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-1 focus:ring-brand-500/20 outline-none" />
        <span className="text-gray-300 text-sm">to</span>
        <input type="date" value={to} onChange={(e) => setTo(e.target.value)}
          className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-1 focus:ring-brand-500/20 outline-none" />
        <div className="flex gap-1 ml-1">
          {[['month', 'This Month'], ['3months', 'Last 3 Mo.'], ['year', 'This Session']].map(([key, label]) => (
            <button key={key} onClick={() => setPreset(key)}
              className="px-3 py-1.5 bg-gray-100 text-gray-500 rounded-lg text-xs font-medium hover:bg-gray-200 transition-colors">
              {label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48 text-gray-400 gap-2">
          <Loader2 className="w-5 h-5 animate-spin" /> Calculating...
        </div>
      ) : (
        <>
          {/* KPI cards */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-green-50 border border-green-200 rounded-2xl p-5">
              <div className="flex items-center gap-1.5 text-green-500 text-xs mb-2">
                <ArrowUpRight className="w-3.5 h-3.5" /> Total Income
              </div>
              <div className="text-2xl font-bold text-green-700 font-display">₹{income.toLocaleString()}</div>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-2xl p-5">
              <div className="flex items-center gap-1.5 text-red-400 text-xs mb-2">
                <ArrowDownRight className="w-3.5 h-3.5" /> Total Expenditure
              </div>
              <div className="text-2xl font-bold text-red-700 font-display">₹{expenditure.toLocaleString()}</div>
            </div>
            <div className={`border rounded-2xl p-5 ${profit >= 0 ? 'bg-brand-50 border-brand-500/20' : 'bg-red-50 border-red-200'}`}>
              <div className={`flex items-center gap-1.5 text-xs mb-2 ${profit >= 0 ? 'text-brand-500' : 'text-red-500'}`}>
                {profit >= 0 ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                {profit >= 0 ? 'Net Profit' : 'Net Loss'}
              </div>
              <div className={`text-2xl font-bold font-display ${profit >= 0 ? 'text-brand-500' : 'text-red-700'}`}>
                ₹{Math.abs(profit).toLocaleString()}
              </div>
            </div>
          </div>

          {/* Breakdown */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-white border border-gray-200 rounded-2xl p-5">
              <h3 className="text-sm font-semibold text-gray-800 font-display mb-3">Income by Type</h3>
              {profitData?.incomeByType?.length ? profitData.incomeByType.map(item => (
                <div key={item.type} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <span className="text-sm text-gray-600 capitalize">{item.type}</span>
                  <span className="text-sm font-semibold text-green-600 tabular-nums">₹{parseFloat(item.total).toLocaleString()}</span>
                </div>
              )) : <p className="text-sm text-gray-300">No income recorded</p>}
            </div>
            <div className="bg-white border border-gray-200 rounded-2xl p-5">
              <h3 className="text-sm font-semibold text-gray-800 font-display mb-3">Expenditure by Type</h3>
              {profitData?.expenditureByType?.length ? profitData.expenditureByType.map(item => (
                <div key={item.type} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <span className="text-sm text-gray-600 capitalize">{item.type}</span>
                  <span className="text-sm font-semibold text-red-500 tabular-nums">₹{parseFloat(item.total).toLocaleString()}</span>
                </div>
              )) : <p className="text-sm text-gray-300">No expenditure recorded</p>}
            </div>
          </div>

          {/* Transaction log */}
          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
            <div className="px-5 py-4 border-b border-gray-100">
              <h3 className="text-sm font-semibold text-gray-800 font-display">Transaction Log</h3>
            </div>
            {logs.length === 0 ? (
              <div className="p-10 text-center text-gray-400">No transactions in this period</div>
            ) : (
              <div className="max-h-96 overflow-y-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      {['Date', 'Type', 'Description', 'Amount'].map(h => (
                        <th key={h} className={`px-4 py-2.5 text-xs font-semibold text-gray-400 uppercase ${h === 'Amount' ? 'text-right' : 'text-left'}`}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {logs.map((log, i) => (
                      <tr key={log.id} className={`border-t border-gray-100 ${i % 2 === 0 ? '' : 'bg-gray-50/30'}`}>
                        <td className="px-4 py-2.5 text-sm text-gray-500 tabular-nums">{log.date}</td>
                        <td className="px-4 py-2.5">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            log.direction === 'income' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'
                          }`}>{log.type}</span>
                        </td>
                        <td className="px-4 py-2.5 text-sm text-gray-600 truncate max-w-xs">{log.description || '—'}</td>
                        <td className={`px-4 py-2.5 text-sm text-right font-semibold tabular-nums ${
                          log.direction === 'income' ? 'text-green-600' : 'text-red-500'
                        }`}>
                          {log.direction === 'income' ? '+' : '-'}₹{Math.abs(parseFloat(log.amount)).toLocaleString()}
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

      {/* Add Entry Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-gray-800 font-display">Add Entry</h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-300 hover:text-gray-500 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Type</label>
                  <select value={entryForm.type}
                    onChange={(e) => setEntryForm(prev => ({ ...prev, type: e.target.value }))}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none">
                    {ENTRY_TYPES.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Direction</label>
                  <select value={entryForm.direction}
                    onChange={(e) => setEntryForm(prev => ({ ...prev, direction: e.target.value }))}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none">
                    <option value="expenditure">Expenditure</option>
                    <option value="income">Income</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Amount (₹)</label>
                  <input type="number" value={entryForm.amount}
                    onChange={(e) => setEntryForm(prev => ({ ...prev, amount: e.target.value }))}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Date</label>
                  <input type="date" value={entryForm.date}
                    onChange={(e) => setEntryForm(prev => ({ ...prev, date: e.target.value }))}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Description</label>
                <input type="text" value={entryForm.description} placeholder="e.g. Purchased markers and chalk"
                  onChange={(e) => setEntryForm(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none" />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setShowAddModal(false)}
                className="px-4 py-2.5 text-sm text-gray-500 hover:text-gray-700 transition-colors">
                Cancel
              </button>
              <button onClick={handleAddEntry}
                className="px-5 py-2.5 bg-brand-500 text-white rounded-xl text-sm font-semibold hover:bg-brand-600 transition-colors shadow-lg shadow-brand-500/20">
                Add Entry
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProfit;
