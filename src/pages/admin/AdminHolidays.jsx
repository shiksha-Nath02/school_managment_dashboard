import { useState, useEffect, useMemo } from 'react';
import holidayService from '@/services/holidayService';
import { CalendarOff, Plus, Trash2, Loader2 } from 'lucide-react';

const inputCls =
  'px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-brand-400 bg-white';

// Format 'YYYY-MM-DD' → "Mon, 24 Aug 2026" and the weekday name.
function fmt(dateStr) {
  const d = new Date(`${dateStr}T00:00:00`);
  if (Number.isNaN(d.getTime())) return { label: dateStr, weekday: '' };
  return {
    label: d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
    weekday: d.toLocaleDateString('en-IN', { weekday: 'long' }),
  };
}

const AdminHolidays = () => {
  const thisYear = new Date().getFullYear();
  const [year, setYear] = useState(thisYear);
  const [holidays, setHolidays] = useState([]);
  const [loading, setLoading] = useState(false);
  const [date, setDate] = useState('');
  const [reason, setReason] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const load = () => {
    setLoading(true);
    holidayService
      .getHolidays({ from: `${year}-01-01`, to: `${year}-12-31` })
      .then((res) => setHolidays(res.data.holidays || []))
      .catch((err) => setError(err.response?.data?.message || 'Failed to load holidays'))
      .finally(() => setLoading(false));
  };

  useEffect(load, [year]);

  const add = async (e) => {
    e.preventDefault();
    setError(null);
    if (!date || !reason.trim()) {
      setError('Please pick a date and enter a reason.');
      return;
    }
    setSaving(true);
    try {
      await holidayService.addHoliday({ date, reason: reason.trim() });
      setDate('');
      setReason('');
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add holiday');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (h) => {
    if (!window.confirm(`Remove holiday on ${fmt(h.date).label} (${h.reason})?`)) return;
    try {
      await holidayService.deleteHoliday(h.id);
      setHolidays((prev) => prev.filter((x) => x.id !== h.id));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete holiday');
    }
  };

  const yearOptions = useMemo(
    () => [thisYear - 1, thisYear, thisYear + 1],
    [thisYear]
  );

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800 font-display flex items-center gap-2">
          <CalendarOff className="w-6 h-6 text-brand-500" /> Holidays
        </h1>
        <p className="text-gray-400 text-sm mt-1">
          Declare school-wide non-working days. Sundays are treated as holidays automatically
          and don&apos;t need to be added. On a holiday, classes aren&apos;t flagged as
          &ldquo;attendance pending&rdquo; on the dashboard.
        </p>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Add holiday */}
      <form onSubmit={add} className="bg-white border border-gray-200 rounded-2xl px-5 py-4">
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Date</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={inputCls} />
          </div>
          <div className="flex flex-col gap-1 flex-1 min-w-[220px]">
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Reason</label>
            <input
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Independence Day"
              className={inputCls + ' w-full'}
            />
          </div>
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2.5 bg-brand-500 text-white rounded-xl text-sm font-semibold hover:bg-brand-600 transition-all disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            Add Holiday
          </button>
        </div>
      </form>

      {/* List */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
          <h3 className="font-semibold text-gray-700 text-sm">Declared holidays</h3>
          <select value={year} onChange={(e) => setYear(Number(e.target.value))} className={inputCls}>
            {yearOptions.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-32 text-gray-400 gap-2">
            <Loader2 className="w-5 h-5 animate-spin" /> Loading…
          </div>
        ) : holidays.length === 0 ? (
          <div className="p-10 text-center text-gray-400 text-sm">
            No holidays declared for {year}. (Sundays are off automatically.)
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-brand-50">
              <tr>
                <th className="px-5 py-3 text-xs font-semibold text-brand-500 uppercase text-left">Date</th>
                <th className="px-5 py-3 text-xs font-semibold text-brand-500 uppercase text-left">Day</th>
                <th className="px-5 py-3 text-xs font-semibold text-brand-500 uppercase text-left">Reason</th>
                <th className="px-5 py-3 text-xs font-semibold text-brand-500 uppercase text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {holidays.map((h, i) => {
                const f = fmt(h.date);
                return (
                  <tr key={h.id} className={`border-t border-gray-100 ${i % 2 ? 'bg-gray-50/30' : ''}`}>
                    <td className="px-5 py-3 text-sm font-medium text-gray-800">{f.label}</td>
                    <td className="px-5 py-3 text-sm text-gray-500">{f.weekday}</td>
                    <td className="px-5 py-3 text-sm text-gray-700">{h.reason}</td>
                    <td className="px-5 py-3 text-right">
                      <button
                        onClick={() => remove(h)}
                        className="inline-flex items-center gap-1 text-red-500 hover:text-red-600 text-sm font-medium"
                      >
                        <Trash2 className="w-4 h-4" /> Remove
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AdminHolidays;
