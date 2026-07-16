import { useState, useEffect, useMemo } from 'react';
import { getStudentsWithDues } from '@/services/feeService';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/services/api';
import { AlertCircle, Filter, Loader2, Download } from 'lucide-react';

const fmtMoney = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;
const filterCls = 'px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-brand-400 bg-white';

const AdminFeeDues = () => {
  const { user } = useAuth();
  // Only superadmin sees the ₹ figures; a regular admin sees who owes, not amounts.
  const showMoney = user?.role === 'superadmin';
  const [classes, setClasses]       = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [students, setStudents]     = useState([]);
  const [loading, setLoading]       = useState(true);

  // ── filters (client-side)
  const [filterSearch,    setFilterSearch]    = useState('');
  const [filterMinDue,    setFilterMinDue]    = useState('');
  const [filterCategory,  setFilterCategory]  = useState('');

  useEffect(() => {
    api.get('/admin/classes')
      .then(res => setClasses(res.data.classes || res.data || []))
      .catch(console.error);
  }, []);

  useEffect(() => { fetchDues(); }, [selectedClass]);

  const fetchDues = async () => {
    setLoading(true);
    try {
      const res = await getStudentsWithDues(selectedClass || null);
      setStudents(res.data.students || []);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const filteredStudents = useMemo(() => students.filter((s) => {
    if (filterSearch   && !s.name?.toLowerCase().includes(filterSearch.toLowerCase()) && !String(s.id).includes(filterSearch)) return false;
    if (filterMinDue   && (s.total_due || 0) < parseFloat(filterMinDue)) return false;
    if (filterCategory && s.category !== filterCategory) return false;
    return true;
  }), [students, filterSearch, filterMinDue, filterCategory]);

  const totalDues    = filteredStudents.reduce((sum, s) => sum + (s.total_due || 0), 0);
  const hasFilters   = filterSearch || filterMinDue || filterCategory;
  const clearFilters = () => { setFilterSearch(''); setFilterMinDue(''); setFilterCategory(''); };

  const exportCsv = () => {
    const header = ['Adm No', 'Student Name', 'Class', 'Phone', 'Pending', 'Fine', 'Total Due', 'Last Payment'];
    const rows   = filteredStudents.map((s) => [
      s.id, `"${s.name || ''}"`, `"${s.class || ''}"`, `"${s.father_phone || ''}"`,
      s.pending || 0, s.fine || 0, s.total_due || 0,
      s.last_billing_month ? `${s.last_billing_month}/${s.last_billing_year}` : 'Never',
    ]);
    const csv  = [header, ...rows].map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url  = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'fee-dues.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 font-display flex items-center gap-2">
            <AlertCircle className="w-6 h-6 text-brand-500" /> Students with Dues
          </h1>
          <p className="text-gray-400 text-sm mt-1">All students with pending fee payments</p>
        </div>
        {showMoney && (
          <button onClick={exportCsv} className="flex items-center gap-2 px-3 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-all">
            <Download className="w-4 h-4" /> Export CSV
          </button>
        )}
      </div>

      {/* Summary */}
      <div className={`grid gap-4 ${showMoney ? 'grid-cols-2' : 'grid-cols-1'}`}>
        {showMoney && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-5">
            <div className="text-xs text-red-400 mb-1">{hasFilters ? 'Filtered' : 'Total'} Outstanding</div>
            <div className="text-2xl font-bold text-red-600 font-display">{fmtMoney(totalDues)}</div>
          </div>
        )}
        <div className="bg-white border border-gray-200 rounded-2xl p-5">
          <div className="text-xs text-gray-400 mb-1">Students with Dues</div>
          <div className="text-2xl font-bold text-gray-800 font-display">
            {filteredStudents.length}{hasFilters && <span className="text-sm text-gray-400 font-normal ml-1">of {students.length}</span>}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border border-gray-200 rounded-2xl px-5 py-4">
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Class</label>
            <select value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)} className={filterCls}>
              <option value="">All Classes</option>
              {classes.map(cls => (
                <option key={cls.id} value={cls.id}>Class {cls.class_name}-{cls.section}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Name / Adm No</label>
            <input value={filterSearch} onChange={(e) => setFilterSearch(e.target.value)} placeholder="Search…" className={`${filterCls} w-40`} />
          </div>
          {showMoney && (
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Min Due (₹)</label>
              <input type="number" min="0" value={filterMinDue} onChange={(e) => setFilterMinDue(e.target.value)} placeholder="0" className={`${filterCls} w-28`} />
            </div>
          )}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Category</label>
            <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className={filterCls}>
              <option value="">All</option>
              {['General', 'OBC', 'SC', 'ST', 'EWS'].map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          {hasFilters && (
            <button onClick={clearFilters} className="text-xs text-brand-500 font-semibold hover:text-brand-700 self-end pb-2">Clear filters</button>
          )}
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center h-48 text-gray-400 gap-2">
          <Loader2 className="w-5 h-5 animate-spin" /> Loading...
        </div>
      ) : filteredStudents.length === 0 ? (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-10 text-center">
          <p className="text-green-600 font-semibold font-display">
            {students.length === 0 ? 'All fees are cleared! No pending dues.' : 'No records match the current filters.'}
          </p>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                {(showMoney
                  ? ['Adm No', 'Student', 'Class', 'Phone', 'Pending', 'Fine', 'Total Due', 'Last Payment']
                  : ['Adm No', 'Student', 'Class', 'Phone', 'Last Payment']
                ).map(h => (
                  <th key={h} className={`px-4 py-3 text-xs font-semibold text-gray-400 uppercase ${['Pending', 'Fine', 'Total Due'].includes(h) ? 'text-right' : 'text-left'}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((item, i) => (
                <tr key={item.id ?? i} className={`border-t border-gray-100 ${i % 2 === 0 ? '' : 'bg-gray-50/30'}`}>
                  <td className="px-4 py-3 font-mono text-xs font-bold text-brand-600">{item.id}</td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-800">{item.name || `Student ${item.id}`}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{item.class || '–'}</td>
                  <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">
                    {item.father_phone
                      ? <a href={`tel:${item.father_phone}`} className="hover:text-brand-600">{item.father_phone}</a>
                      : '—'}
                  </td>
                  {showMoney && (
                    <>
                      <td className="px-4 py-3 text-sm text-right font-semibold text-red-500 tabular-nums">{fmtMoney(item.pending)}</td>
                      <td className="px-4 py-3 text-sm text-right text-amber-500 tabular-nums">{item.fine > 0 ? fmtMoney(item.fine) : '—'}</td>
                      <td className="px-4 py-3 text-sm text-right font-bold text-red-600 font-display tabular-nums">{fmtMoney(item.total_due)}</td>
                    </>
                  )}
                  <td className="px-4 py-3 text-sm text-gray-400">
                    {item.last_billing_month ? `${item.last_billing_month}/${item.last_billing_year}` : 'Never'}
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
