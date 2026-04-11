import { useState, useEffect } from 'react';
import { getClassWiseReport } from '@/services/feeService';
import { BarChart3, Loader2 } from 'lucide-react';

const AdminFeeClasswise = () => {
  const [report, setReport] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getClassWiseReport()
      .then(res => setReport(res.data.report || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const totals = report.reduce(
    (acc, r) => ({
      students: acc.students + (r.student_count || 0),
      expected: acc.expected + (r.total_expected || 0),
      collected: acc.collected + (r.total_collected || 0),
      pending: acc.pending + (r.total_pending || 0),
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

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 font-display flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-brand-500" />
          Class-wise Fee Report
        </h1>
        <p className="text-gray-400 text-sm mt-1">Fee collection overview for each class</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white border border-gray-200 rounded-2xl p-4">
          <div className="text-xs text-gray-400 mb-1">Total Students</div>
          <div className="text-xl font-bold text-gray-800 font-display">{totals.students}</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-2xl p-4">
          <div className="text-xs text-gray-400 mb-1">Expected</div>
          <div className="text-xl font-bold text-gray-800 font-display">₹{totals.expected.toLocaleString()}</div>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-2xl p-4">
          <div className="text-xs text-green-500 mb-1">Collected</div>
          <div className="text-xl font-bold text-green-600 font-display">₹{totals.collected.toLocaleString()}</div>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
          <div className="text-xs text-red-400 mb-1">Pending</div>
          <div className="text-xl font-bold text-red-600 font-display">₹{totals.pending.toLocaleString()}</div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48 text-gray-400 gap-2">
          <Loader2 className="w-5 h-5 animate-spin" /> Loading report...
        </div>
      ) : report.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center text-gray-400">
          No data available yet.
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
          <table className="w-full">
            <thead className="bg-brand-50">
              <tr>
                {['Class', 'Students', 'Expected', 'Collected', 'Pending', 'Collection %'].map(h => (
                  <th key={h} className={`px-4 py-3 text-xs font-semibold text-brand-500 uppercase ${
                    ['Students', 'Collection %'].includes(h) ? 'text-center' : ['Expected', 'Collected', 'Pending'].includes(h) ? 'text-right' : 'text-left'
                  }`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {report.map((row, i) => {
                const rate = row.collection_rate || 0;
                return (
                  <tr key={row.class_id} className={`border-t border-gray-100 ${i % 2 === 0 ? '' : 'bg-gray-50/30'}`}>
                    <td className="px-4 py-3 text-sm font-semibold text-gray-800 font-display">{row.class_name}</td>
                    <td className="px-4 py-3 text-sm text-center text-gray-600 tabular-nums">{row.student_count}</td>
                    <td className="px-4 py-3 text-sm text-right text-gray-600 tabular-nums">₹{(row.total_expected || 0).toLocaleString()}</td>
                    <td className="px-4 py-3 text-sm text-right font-semibold text-green-600 tabular-nums">₹{(row.total_collected || 0).toLocaleString()}</td>
                    <td className="px-4 py-3 text-sm text-right font-semibold text-red-500 tabular-nums">
                      {row.total_pending > 0 ? `₹${row.total_pending.toLocaleString()}` : '₹0'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-20 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${progressColor(rate)}`}
                            style={{ width: `${Math.min(rate, 100)}%` }}
                          />
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${collectionColor(rate)}`}>
                          {rate}%
                        </span>
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
