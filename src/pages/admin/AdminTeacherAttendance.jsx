import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Users, Clock, CheckCircle2, AlertCircle, Loader2, LogIn, LogOut, BarChart2, X } from 'lucide-react';
import svc from '@/services/teacherAttendanceService';

const STATUS_CONFIG = {
  present:       { label: 'Present',       cls: 'bg-emerald-100 text-emerald-700' },
  late:          { label: 'Late',           cls: 'bg-amber-100 text-amber-700' },
  absent:        { label: 'Absent',         cls: 'bg-red-100 text-red-600' },
  half_day:      { label: 'Half Day',       cls: 'bg-orange-100 text-orange-700' },
  on_leave:      { label: 'On Leave',       cls: 'bg-blue-100 text-blue-700' },
  official_duty: { label: 'Official Duty',  cls: 'bg-purple-100 text-purple-700' },
  not_arrived:   { label: 'Not Arrived',    cls: 'bg-gray-100 text-gray-500' },
};

const MARK_OPTIONS = [
  { value: 'absent',              label: 'Absent' },
  { value: 'on_leave:casual',     label: 'Casual Leave' },
  { value: 'on_leave:sick',       label: 'Sick Leave' },
  { value: 'on_leave:earned',     label: 'Earned Leave' },
  { value: 'official_duty',       label: 'Official Duty' },
];

const formatTime = (t) => {
  if (!t) return '—';
  const [h, m] = t.split(':');
  const hr = parseInt(h);
  return `${hr % 12 || 12}:${m} ${hr >= 12 ? 'PM' : 'AM'}`;
};

const getInitials = (name = '') =>
  name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2) || 'T';

export default function AdminTeacherAttendance() {
  const today = new Date().toISOString().split('T')[0];

  const [teachers, setTeachers] = useState([]);
  const [attendanceMap, setAttendanceMap] = useState({}); // { [teacherId]: record | null }
  const [now, setNow] = useState(new Date());
  const [actioningId, setActioningId] = useState(null);
  const [loadingInit, setLoadingInit] = useState(true);
  const [toast, setToast] = useState(null);
  const [showBulkConfirm, setShowBulkConfirm] = useState(false);
  const [bulkLoading, setBulkLoading] = useState(false);
  // { teacher, action: 'checkin'|'checkout', time: Date }
  const [confirmDialog, setConfirmDialog] = useState(null);

  // Live clock
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  // Initial load
  useEffect(() => {
    (async () => {
      try {
        setLoadingInit(true);
        const [teachersData, attData] = await Promise.all([
          svc.getAllTeachers(),
          svc.getAttendance(today),
        ]);
        const list = teachersData.teachers || [];
        setTeachers(list);

        const map = {};
        list.forEach((t) => { map[t.id] = null; });
        (attData.records || []).forEach((r) => { map[r.teacherId] = r; });
        setAttendanceMap(map);
      } catch (err) {
        console.error(err);
        showToastMsg('error', 'Failed to load data');
      } finally {
        setLoadingInit(false);
      }
    })();
  }, []);

  const showToastMsg = useCallback((type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  }, []);

  const updateRecord = (teacherId, record) =>
    setAttendanceMap((prev) => ({ ...prev, [teacherId]: record }));

  const openConfirm = (teacher, action) => {
    setConfirmDialog({ teacher, action, time: new Date() });
  };

  const handleConfirm = async () => {
    const { teacher, action } = confirmDialog;
    setConfirmDialog(null);
    setActioningId(teacher.id);
    try {
      if (action === 'checkin') {
        const data = await svc.checkIn(teacher.id);
        updateRecord(teacher.id, data.record);
        showToastMsg('success', data.message);
      } else {
        const data = await svc.checkOut(teacher.id);
        updateRecord(teacher.id, data.record);
        showToastMsg('success', data.halfDay ? 'Checked out — marked as Half Day' : 'Checked out');
      }
    } catch (err) {
      showToastMsg('error', err.response?.data?.message || 'Action failed');
    } finally {
      setActioningId(null);
    }
  };

  const handleMarkStatus = async (teacherId, value) => {
    const [status, leaveType] = value.split(':');
    setActioningId(teacherId);
    try {
      const data = await svc.markStatus({ teacherId, date: today, status, leaveType: leaveType || null });
      updateRecord(teacherId, data.record);
      showToastMsg('success', `Marked as ${STATUS_CONFIG[status]?.label || status}`);
    } catch (err) {
      showToastMsg('error', err.response?.data?.message || 'Failed to update status');
    } finally {
      setActioningId(null);
    }
  };

  const handleBulkAbsent = async () => {
    setBulkLoading(true);
    try {
      const data = await svc.bulkMarkAbsent(today);
      if (data.count > 0) {
        // Refresh attendance
        const attData = await svc.getAttendance(today);
        const map = {};
        teachers.forEach((t) => { map[t.id] = null; });
        (attData.records || []).forEach((r) => { map[r.teacherId] = r; });
        setAttendanceMap(map);
        showToastMsg('success', data.message);
      } else {
        showToastMsg('success', 'All teachers already have records');
      }
    } catch (err) {
      showToastMsg('error', 'Failed to bulk mark absent');
    } finally {
      setBulkLoading(false);
      setShowBulkConfirm(false);
    }
  };

  // Stats
  const stats = teachers.reduce(
    (acc, t) => {
      const r = attendanceMap[t.id];
      if (!r) { acc.notArrived++; return acc; }
      if (r.checkInTime && r.checkOutTime) { acc.checkedOut++; return acc; }
      if (r.checkInTime) { acc.checkedIn++; return acc; }
      acc.notArrived++;
      return acc;
    },
    { checkedIn: 0, notArrived: 0, checkedOut: 0 }
  );

  const dateStr = now.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const timeStr = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  if (loadingInit) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
      </div>
    );
  }

  const confirmTime = confirmDialog?.time;
  const confirmTimeStr = confirmTime
    ? confirmTime.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    : '';

  return (
    <div className="space-y-6">
      {/* Confirmation Dialog */}
      {confirmDialog && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-elevated">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="font-display font-bold text-gray-900">
                {confirmDialog.action === 'checkin' ? 'Confirm Check In' : 'Confirm Check Out'}
              </h3>
              <button onClick={() => setConfirmDialog(null)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-brand-100 flex items-center justify-center text-brand-500 font-bold text-sm flex-shrink-0">
                  {getInitials(confirmDialog.teacher.user?.name)}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{confirmDialog.teacher.user?.name}</p>
                  <p className="text-xs text-gray-400">{confirmDialog.teacher.subject || '—'}</p>
                </div>
              </div>
              <div className={`rounded-xl px-4 py-3 flex items-center gap-3 ${confirmDialog.action === 'checkin' ? 'bg-emerald-50' : 'bg-amber-50'}`}>
                <Clock className={`w-4 h-4 flex-shrink-0 ${confirmDialog.action === 'checkin' ? 'text-emerald-600' : 'text-amber-600'}`} />
                <div>
                  <p className={`text-xs font-medium ${confirmDialog.action === 'checkin' ? 'text-emerald-600' : 'text-amber-600'}`}>
                    {confirmDialog.action === 'checkin' ? 'Check-in time' : 'Check-out time'}
                  </p>
                  <p className={`text-lg font-bold font-mono ${confirmDialog.action === 'checkin' ? 'text-emerald-700' : 'text-amber-700'}`}>
                    {confirmTimeStr}
                  </p>
                </div>
              </div>
              <p className="text-xs text-gray-400 text-center">
                This timestamp will be recorded. Are you sure?
              </p>
            </div>
            <div className="flex gap-3 px-6 pb-6">
              <button
                onClick={handleConfirm}
                className={`flex-1 py-2.5 rounded-xl text-white text-sm font-semibold transition-all ${confirmDialog.action === 'checkin' ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-amber-500 hover:bg-amber-600'}`}
              >
                {confirmDialog.action === 'checkin' ? 'Yes, Check In' : 'Yes, Check Out'}
              </button>
              <button
                onClick={() => setConfirmDialog(null)}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-semibold hover:bg-gray-50 transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-xl shadow-lg text-white text-sm font-medium ${toast.type === 'success' ? 'bg-emerald-600' : 'bg-red-500'}`}>
          {toast.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          {toast.message}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-gray-900">Teacher Attendance</h1>
          <p className="text-sm text-gray-500 mt-0.5">{dateStr}</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-4 py-2 text-sm font-mono font-semibold text-gray-700">
            <Clock className="w-4 h-4 text-brand-500" />
            {timeStr}
          </div>
          <Link
            to="/admin/teacher-attendance-report"
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 bg-white text-sm font-semibold text-gray-600 hover:border-brand-500 hover:text-brand-500 transition-all"
          >
            <BarChart2 className="w-4 h-4" /> Report
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total', value: teachers.length, color: 'text-gray-900', bg: 'bg-white' },
          { label: 'Checked In', value: stats.checkedIn, color: 'text-emerald-700', bg: 'bg-emerald-50' },
          { label: 'Not Arrived', value: stats.notArrived, color: 'text-gray-500', bg: 'bg-white' },
          { label: 'Checked Out', value: stats.checkedOut, color: 'text-brand-500', bg: 'bg-brand-50' },
        ].map((s) => (
          <div key={s.label} className={`${s.bg} border border-gray-200 rounded-2xl p-5`}>
            <p className="text-xs text-gray-400 font-medium">{s.label}</p>
            <p className={`text-3xl font-display font-bold mt-1 ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Teacher list */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        {/* Card header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-gray-400" />
            <span className="font-display font-bold text-gray-900">All Teachers</span>
          </div>
          <div>
            {showBulkConfirm ? (
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">Mark all without records as absent?</span>
                <button
                  onClick={handleBulkAbsent}
                  disabled={bulkLoading}
                  className="text-xs px-3 py-1.5 rounded-lg bg-red-500 text-white font-semibold hover:bg-red-600 disabled:opacity-50"
                >
                  {bulkLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Confirm'}
                </button>
                <button
                  onClick={() => setShowBulkConfirm(false)}
                  className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowBulkConfirm(true)}
                className="text-xs px-3 py-1.5 rounded-lg bg-red-50 text-red-600 font-semibold hover:bg-red-100 transition-colors"
              >
                Mark Remaining Absent
              </button>
            )}
          </div>
        </div>

        {/* Column headers */}
        <div className="hidden sm:grid grid-cols-[2rem_1fr_6rem_7rem_5rem_5rem_10rem] gap-4 px-6 py-2 bg-gray-50/70 border-b border-gray-100 text-xs font-semibold text-gray-400 uppercase tracking-wide">
          <span>#</span><span>Teacher</span><span>Status</span><span className="hidden md:block">Check In</span><span className="hidden md:block">Check Out</span><span></span><span>Actions</span>
        </div>

        {/* Rows */}
        <div className="divide-y divide-gray-100">
          {teachers.map((teacher, idx) => {
            const record = attendanceMap[teacher.id];
            const isActioning = actioningId === teacher.id;
            const hasCheckedIn = !!record?.checkInTime;
            const hasCheckedOut = !!record?.checkOutTime;
            const isNoShow = record && !hasCheckedIn;
            const statusKey = !record ? 'not_arrived' : record.status;
            const cfg = STATUS_CONFIG[statusKey] || STATUS_CONFIG.not_arrived;

            return (
              <div key={teacher.id} className="grid grid-cols-[2rem_1fr_auto] sm:grid-cols-[2rem_1fr_6rem_7rem_5rem_5rem_10rem] gap-4 px-6 py-3.5 items-center hover:bg-gray-50/50 transition-colors">
                {/* # */}
                <span className="text-xs font-mono text-gray-400">{idx + 1}</span>

                {/* Avatar + Name */}
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold ${!record || statusKey === 'not_arrived' ? 'bg-gray-100 text-gray-500' : statusKey === 'absent' ? 'bg-red-50 text-red-500' : 'bg-brand-100 text-brand-500'}`}>
                    {getInitials(teacher.user?.name)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{teacher.user?.name || 'Unknown'}</p>
                    <p className="text-xs text-gray-400 truncate">{teacher.subject || '—'}</p>
                  </div>
                </div>

                {/* Status badge */}
                <span className={`hidden sm:inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${cfg.cls}`}>
                  {cfg.label}
                </span>

                {/* Check In time */}
                <span className="hidden md:block text-sm text-gray-600 font-medium">{formatTime(record?.checkInTime)}</span>

                {/* Check Out time */}
                <span className="hidden md:block text-sm text-gray-600 font-medium">{formatTime(record?.checkOutTime)}</span>

                {/* spacer */}
                <span />

                {/* Actions */}
                <div className="flex items-center gap-2 justify-end">
                  {isActioning ? (
                    <Loader2 className="w-4 h-4 animate-spin text-brand-500" />
                  ) : !record ? (
                    <>
                      <button
                        onClick={() => openConfirm(teacher, 'checkin')}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-500 text-white text-xs font-semibold hover:bg-emerald-600 transition-colors"
                      >
                        <LogIn className="w-3.5 h-3.5" /> Check In
                      </button>
                      <select
                        defaultValue=""
                        onChange={(e) => { if (e.target.value) { handleMarkStatus(teacher.id, e.target.value); e.target.value = ''; } }}
                        className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-gray-50 text-gray-600 cursor-pointer focus:outline-none focus:border-brand-400"
                      >
                        <option value="" disabled>Mark as…</option>
                        {MARK_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                      </select>
                    </>
                  ) : hasCheckedIn && !hasCheckedOut ? (
                    <button
                      onClick={() => openConfirm(teacher, 'checkout')}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-amber-500 text-white text-xs font-semibold hover:bg-amber-600 transition-colors"
                    >
                      <LogOut className="w-3.5 h-3.5" /> Check Out
                    </button>
                  ) : hasCheckedOut ? (
                    <span className="flex items-center gap-1 text-xs text-gray-400 font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Done
                    </span>
                  ) : isNoShow ? (
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${cfg.cls}`}>{cfg.label}</span>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {teachers.length === 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 flex flex-col items-center gap-3">
          <Users className="w-10 h-10 text-gray-300" />
          <p className="text-gray-500 text-sm">No teachers found</p>
        </div>
      )}
    </div>
  );
}
