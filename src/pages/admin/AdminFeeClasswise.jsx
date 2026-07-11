import { useState, useEffect, useMemo } from 'react';
import { getClassWiseReport } from '@/services/feeService';
import { useAuth } from '@/contexts/AuthContext';
import { BarChart3, Loader2, Download } from 'lucide-react';

const fmtMoney = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;
const filterCls = 'px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-brand-400 bg-white';

const AdminFeeClasswise = () => {
  const { user } = useAuth();
  // Only superadmin sees money figures; a regular admin sees counts + % only.
  const showMoney = user?.role === 'superadmin';
  const [report, setReport]       = useState([]);
  const [loading, setLoading]     = useState(true);
  const [filterStatus, setFilterStatus] = useState('all'); // 'all'|'good'|'average'|'poor'

  useEffect(() => {
    getClassWiseReport()
      .then(res => setReport(res.data.report || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filteredReport = useMemo(() => report.filter((r) => {
    const rate = r.collection_rate || 0;
    if (filterStatus === 'good')    return rate >= 90;
    if (filterStatus === 'average') return rate >= 75 && rate < 90;
    if (filterStatus === 'poor')    return rate < 75;
    return true;
  }), [report, filterStatus]);

  const totals = filteredReport.reduce(
    (acc, r) => ({
      students:  acc.students  + (r.student_count   || 0),
      expected:  acc.expected  + (r.total_expected  || 0),
      collected: acc.collected + (r.total_collected || 0),
      pending:   acc.pending   + (r.total_pending   || 0),
    }),
    { students: 0, expected: 0, collected: 0, pending: 0 }
  );

  const collectionColor = (rate) => {
    if (rate >= 90) return 'text-green-600 bg-green-50 border border-green-200';
    if (rate >= 75) return 'text-amber-600 bg-amber-50 border border-amber-200';
    return 'text-red-600 bg-red-50 border border-red-200';
  };

  const progressColor = (rate) => {
    if (rate >= 90) return 'bg-green-500';
    if (rate >= 75) return 'bg-amber-400';
    return 'bg-red-400';
  };

  const exportCsv = () => {
    const header = ['Class', 'Students', 'Expected', 'Collected', 'Pending', 'Collection %'];
    const rows   = filteredReport.map((r) => [
      `"${r.class_name}"`, r.student_count,
      r.total_expected || 0, r.total_collected || 0, r.total_pending || 0,
      r.collection_rate || 0,
    ]);
    const csv  = [header, ...rows].map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url  = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'fee-classwise-report.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 font-display flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-brand-500" /> Class-wise Fee Report
          </h1>
          <p className="text-gray-400 text-sm mt-1">Fee collection overview for each class</p>
        </div>
        {showMoney && (
          <button onClick={exportCsv} className="flex items-center gap-2 px-3 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-all">
            <Download className="w-4 h-4" /> Export CSV
          </button>
        )}
      </div>

      {/* Summary cards */}
      <div className={`grid gap-4 ${showMoney ? 'grid-cols-4' : 'grid-cols-1'}`}>
        <div className="bg-white border border-gray-200 rounded-2xl p-4">
          <div className="text-xs text-gray-400 mb-1">Total Students</div>
          <div className="text-xl font-bold text-gray-800 font-display">{totals.students}</div>
        </div>
        {showMoney && (
          <>
            <div className="bg-white border border-gray-200 rounded-2xl p-4">
              <div className="text-xs text-gray-400 mb-1">Expected</div>
              <div className="text-xl font-bold text-gray-800 font-display">{fmtMoney(totals.expected)}</div>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-2xl p-4">
              <div className="text-xs text-green-500 mb-1">Collected</div>
              <div className="text-xl font-bold text-green-600 font-display">{fmtMoney(totals.collected)}</div>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
              <div className="text-xs text-red-400 mb-1">Pending</div>
              <div className="text-xl font-bold text-red-600 font-display">{fmtMoney(totals.pending)}</div>
            </div>
          </>
        )}
      </div>

      {/* Filter */}
      <div className="bg-white border border-gray-200 rounded-2xl px-5 py-4">
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Collection Status</label>
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className={filterCls}>
              <option value="all">All Classes</option>
              <option value="good">Good (≥90%)</option>
              <option value="average">Average (75–90%)</option>
              <option value="poor">Poor (&lt;75%)</option>
            </select>
          </div>
          {filterStatus !== 'all' && (
            <button onClick={() => setFilterStatus('all')} className="text-xs text-brand-500 font-semibold hover:text-brand-700 self-end pb-2">
              Clear filter
            </button>
          )}
          {filterStatus !== 'all' && (
            <span className="text-xs text-gray-400 self-end pb-2">
              Showing {filteredReport.length} of {report.length} classes
            </span>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48 text-gray-400 gap-2">
          <Loader2 className="w-5 h-5 animate-spin" /> Loading report...
        </div>
      ) : filteredReport.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center text-gray-400">
          No data matches the current filter.
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
          <table className="w-full">
            <thead className="bg-brand-50">
              <tr>
                {(showMoney
                  ? ['Class', 'Students', 'Expected', 'Collected', 'Pending', 'Collection %']
                  : ['Class', 'Students', 'Collection %']
                ).map(h => (
                  <th key={h} className={`px-4 py-3 text-xs font-semibold text-brand-500 uppercase ${
                    ['Students', 'Collection %'].includes(h) ? 'text-center'
                    : ['Expected', 'Collected', 'Pending'].includes(h) ? 'text-right'
                    : 'text-left'
                  }`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredReport.map((row, i) => {
                const rate = row.collection_rate || 0;
                return (
                  <tr key={row.class_id} className={`border-t border-gray-100 ${i % 2 === 0 ? '' : 'bg-gray-50/30'}`}>
                    <td className="px-4 py-3 text-sm font-semibold text-gray-800 font-display">{row.class_name}</td>
                    <td className="px-4 py-3 text-sm text-center text-gray-600 tabular-nums">{row.student_count}</td>
                    {showMoney && (
                      <>
                        <td className="px-4 py-3 text-sm text-right text-gray-600 tabular-nums">{fmtMoney(row.total_expected)}</td>
                        <td className="px-4 py-3 text-sm text-right font-semibold text-green-600 tabular-nums">{fmtMoney(row.total_collected)}</td>
                        <td className="px-4 py-3 text-sm text-right font-semibold text-red-500 tabular-nums">
                          {row.total_pending > 0 ? fmtMoney(row.total_pending) : '₹0'}
                        </td>
                      </>
                    )}
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-20 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${progressColor(rate)}`} style={{ width: `${Math.min(rate, 100)}%` }} />
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${collectionColor(rate)}`}>{rate}%</span>
                      </div>
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

export default AdminFeeClasswise;
