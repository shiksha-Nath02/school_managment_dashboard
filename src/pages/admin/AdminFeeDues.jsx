import { useState, useEffect } from 'react';
import { getStudentsWithDues } from '@/services/feeService';
import api from '@/services/api';
import { AlertCircle, Filter, Loader2 } from 'lucide-react';

const AdminFeeDues = () => {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalDues, setTotalDues] = useState(0);

  useEffect(() => {
    api.get('/admin/classes')
      .then(res => setClasses(res.data.classes || res.data || []))
      .catch(console.error);
  }, []);

  useEffect(() => {
    fetchDues();
  }, [selectedClass]);

  const fetchDues = async () => {
    setLoading(true);
    try {
      const res = await getStudentsWithDues(selectedClass || null);
      const list = res.data.students || [];
      setStudents(list);
      setTotalDues(res.data.total_dues || 0);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 font-display flex items-center gap-2">
            <AlertCircle className="w-6 h-6 text-brand-500" />
            Students with Dues
          </h1>
          <p className="text-gray-400 text-sm mt-1">All students with pending fee payments</p>
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-300" />
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none"
          >
            <option value="">All Classes</option>
            {classes.map(cls => (
              <option key={cls.id} value={cls.id}>Class {cls.class_name}-{cls.section}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-5">
          <div className="text-xs text-red-400 mb-1">Total Outstanding</div>
          <div className="text-2xl font-bold text-red-600 font-display">₹{totalDues.toLocaleString()}</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-2xl p-5">
          <div className="text-xs text-gray-400 mb-1">Students with Dues</div>
          <div className="text-2xl font-bold text-gray-800 font-display">{students.length}</div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48 text-gray-400 gap-2">
          <Loader2 className="w-5 h-5 animate-spin" /> Loading...
        </div>
      ) : students.length === 0 ? (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-10 text-center">
          <p className="text-green-600 font-semibold font-display">All fees are cleared! No pending dues.</p>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                {['Student', 'Class', 'Pending', 'Fine', 'Total Due', 'Last Payment'].map(h => (
                  <th key={h} className={`px-4 py-3 text-xs font-semibold text-gray-400 uppercase ${
                    ['Pending', 'Fine', 'Total Due'].includes(h) ? 'text-right' : 'text-left'
                  }`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {students.map((item, i) => (
                <tr key={item.id ?? i} className={`border-t border-gray-100 ${i % 2 === 0 ? '' : 'bg-gray-50/30'}`}>
                  <td className="px-4 py-3 text-sm font-medium text-gray-800">
                    {item.name || `Student ${item.id}`}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {item.class || '–'}
                  </td>
                  <td className="px-4 py-3 text-sm text-right font-semibold text-red-500 tabular-nums">
                    ₹{(item.pending || 0).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-sm text-right text-amber-500 tabular-nums">
                    {item.fine > 0 ? `₹${item.fine.toLocaleString()}` : '—'}
                  </td>
                  <td className="px-4 py-3 text-sm text-right font-bold text-red-600 font-display tabular-nums">
                    ₹{(item.total_due || 0).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-400">
                    {item.last_billing_month
                      ? `${item.last_billing_month}/${item.last_billing_year}`
                      : 'Never'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminFeeDues;
