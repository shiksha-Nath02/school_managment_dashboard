import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Users, Clock, CheckCircle2, AlertCircle, Loader2, LogIn, LogOut, BarChart2, X, ShieldCheck, ToggleLeft, ToggleRight } from 'lucide-react';
import svc from '@/services/teacherAttendanceService';
import CameraCapture from '@/components/common/CameraCapture';

const API_BASE = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api').replace('/api', '');

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
  const [attendanceMap, setAttendanceMap] = useState({});
  const [now, setNow] = useState(new Date());
  const [actioningId, setActioningId] = useState(null);
  const [loadingInit, setLoadingInit] = useState(true);
  const [toast, setToast] = useState(null);
  const [showBulkConfirm, setShowBulkConfirm] = useState(false);
  const [bulkLoading, setBulkLoading] = useState(false);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [verifyingId, setVerifyingId] = useState(null);

  // Camera state
  const [cameraOpen, setCameraOpen] = useState(false);
  const [cameraTarget, setCameraTarget] = useState(null); // { teacher, action: 'checkin'|'checkout' }

  // Self-attendance toggle
  const [selfEnabled, setSelfEnabled] = useState(false);
  const [selfToggling, setSelfToggling] = useState(false);

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
        const [teachersData, attData, settingData] = await Promise.all([
          svc.getAllTeachers(),
          svc.getAttendance(today),
          svc.getSelfAttendanceSetting(),
        ]);
        const list = teachersData.teachers || [];
        setTeachers(list);
        const map = {};
        list.forEach((t) => { map[t.id] = null; });
        (attData.records || []).forEach((r) => { map[r.teacherId] = r; });
        setAttendanceMap(map);
        setSelfEnabled(settingData.enabled || false);
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

  // Open camera for admin check-in/out
  const openCamera = (teacher, action) => {
    setCameraTarget({ teacher, action });
    setCameraOpen(true);
  };

  const handleCapture = async (dataUrl) => {
    if (!cameraTarget) return;
    const { teacher, action } = cameraTarget;
    setActioningId(teacher.id);
    try {
      if (action === 'checkin') {
        const data = await svc.checkIn(teacher.id, dataUrl);
        updateRecord(teacher.id, data.record);
        showToastMsg('success', data.message);
      } else {
        const data = await svc.checkOut(teacher.id, dataUrl);
        updateRecord(teacher.id, data.record);
        showToastMsg('success', data.halfDay ? 'Checked out — marked as Half Day' : 'Checked out');
      }
    } catch (err) {
      showToastMsg('error', err.response?.data?.message || 'Action failed');
    } finally {
      setActioningId(null);
      setCameraTarget(null);
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

  const handleVerify = async (record) => {
    setVerifyingId(record.id);
    try {
      const data = await svc.verifyAttendance(record.id);
      updateRecord(record.teacherId, data.record);
      showToastMsg('success', 'Attendance verified');
    } catch (err) {
      showToastMsg('error', err.response?.data?.message || 'Failed to verify');
    } finally {
      setVerifyingId(null);
    }
  };

  const handleBulkAbsent = async () => {
    setBulkLoading(true);
    try {
      const data = await svc.bulkMarkAbsent(today);
      if (data.count > 0) {
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

  const handleToggleSelf = async () => {
    setSelfToggling(true);
    try {
      const data = await svc.setSelfAttendanceSetting(!selfEnabled);
      setSelfEnabled(data.enabled);
      showToastMsg('success', data.enabled ? 'Self check-in enabled for today' : 'Self check-in disabled');
    } catch (err) {
      showToastMsg('error', 'Failed to update setting');
    } finally {
      setSelfToggling(false);
    }
  };

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

  return (
    <div className="space-y-6">
      {/* Camera modal */}
      <CameraCapture
        open={cameraOpen}
        onClose={() => { setCameraOpen(false); setCameraTarget(null); }}
        onCapture={handleCapture}
        title={cameraTarget?.action === 'checkin' ? 'Check-In Photo' : 'Check-Out Photo'}
        hint={`Capture a photo of ${cameraTarget?.teacher?.user?.name || 'teacher'} for attendance record`}
      />

      {/* Photo preview modal */}
      {photoPreview && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={() => setPhotoPreview(null)}>
          <div className="relative max-w-lg w-full" onClick={(e) => e.stopPropagation()}>
            <img src={photoPreview} alt="Attendance photo" className="w-full rounded-2xl shadow-2xl" />
            <button
              onClick={() => setPhotoPreview(null)}
              className="absolute top-3 right-3 w-8 h-8 bg-black/60 text-white rounded-full flex items-center justify-center hover:bg-black/80 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
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

      {/* Self-attendance toggle */}
      <div className={`flex items-center justify-between px-5 py-4 rounded-2xl border ${selfEnabled ? 'bg-indigo-50 border-indigo-200' : 'bg-white border-gray-200'} transition-colors`}>
        <div>
          <p className="text-sm font-semibold text-gray-900">Allow Teacher Self Check-In Today</p>
          <p className="text-xs text-gray-500 mt-0.5">
            {selfEnabled
              ? 'Teachers can check in/out from their own devices today'
              : 'Admin manages check-in/out — teachers cannot self-record'}
          </p>
        </div>
        <button
          onClick={handleToggleSelf}
          disabled={selfToggling}
          className="flex items-center gap-2 transition-all"
        >
          {selfToggling ? (
            <Loader2 className="w-6 h-6 text-indigo-500 animate-spin" />
          ) : selfEnabled ? (
            <ToggleRight className="w-10 h-10 text-indigo-500" />
          ) : (
            <ToggleLeft className="w-10 h-10 text-gray-300" />
          )}
        </button>
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
        <div className="hidden sm:grid grid-cols-[2rem_1fr_6rem_8rem_8rem_6rem_10rem] gap-4 px-6 py-2 bg-gray-50/70 border-b border-gray-100 text-xs font-semibold text-gray-400 uppercase tracking-wide">
          <span>#</span><span>Teacher</span><span>Status</span><span className="hidden md:block">Check In</span><span className="hidden md:block">Check Out</span><span className="hidden md:block">Verify</span><span>Actions</span>
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
              <div key={teacher.id} className="grid grid-cols-[2rem_1fr_auto] sm:grid-cols-[2rem_1fr_6rem_8rem_8rem_6rem_10rem] gap-4 px-6 py-3.5 items-center hover:bg-gray-50/50 transition-colors">
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

                {/* Check In time + photo */}
                <div className="hidden md:flex items-center gap-1.5">
                  <span className="text-sm text-gray-600 font-medium">{formatTime(record?.checkInTime)}</span>
                  {record?.checkInImage && (
                    <button onClick={() => setPhotoPreview(`${API_BASE}/${record.checkInImage}`)} title="View check-in photo">
                      <img src={`${API_BASE}/${record.checkInImage}`} alt="" className="w-7 h-7 rounded-lg object-cover border border-emerald-200 hover:scale-110 transition-transform cursor-zoom-in" />
                    </button>
                  )}
                </div>

                {/* Check Out time + photo */}
                <div className="hidden md:flex items-center gap-1.5">
                  <span className="text-sm text-gray-600 font-medium">{formatTime(record?.checkOutTime)}</span>
                  {record?.checkOutImage && (
                    <button onClick={() => setPhotoPreview(`${API_BASE}/${record.checkOutImage}`)} title="View check-out photo">
                      <img src={`${API_BASE}/${record.checkOutImage}`} alt="" className="w-7 h-7 rounded-lg object-cover border border-amber-200 hover:scale-110 transition-transform cursor-zoom-in" />
                    </button>
                  )}
                </div>

                {/* Verify badge / button */}
                <div className="hidden md:flex items-center justify-center">
                  {record?.isVerified ? (
                    <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                      <ShieldCheck className="w-3 h-3" /> Verified
                    </span>
                  ) : record?.checkInImage || record?.checkOutImage ? (
                    <button
                      onClick={() => handleVerify(record)}
                      disabled={verifyingId === record?.id}
                      className="flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200 transition-colors disabled:opacity-50"
                    >
                      {verifyingId === record?.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <ShieldCheck className="w-3 h-3" />}
                      Verify
                    </button>
                  ) : <span />}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 justify-end">
                  {isActioning ? (
                    <Loader2 className="w-4 h-4 animate-spin text-brand-500" />
                  ) : !record ? (
                    <>
                      <button
                        onClick={() => openCamera(teacher, 'checkin')}
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
                      onClick={() => openCamera(teacher, 'checkout')}
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
