import { useState, useEffect } from 'react';
import {
  Users,
  Calendar,
  Check,
  Loader2,
  ChevronDown,
  Send,
  AlertCircle,
  CheckSquare,
  XSquare,
} from 'lucide-react';
import {
  getTeacherClasses,
  getStudentsByClass,
  submitAttendance,
  getAttendanceByDate,
} from '@/services/attendanceService';

export default function TeacherUploadAttendance() {
  // State
  const [classes, setClasses] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState('');
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [students, setStudents] = useState([]);
  const [classInfo, setClassInfo] = useState(null);
  const [attendance, setAttendance] = useState({}); // { studentId: 'present' | 'absent' }
  const [teacherId, setTeacherId] = useState(null);
  const [alreadyMarked, setAlreadyMarked] = useState(false);

  // Loading / feedback
  const [loadingClasses, setLoadingClasses] = useState(true);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null); // { type: 'success' | 'error', message }

  // Fetch teacher's classes on mount
  useEffect(() => {
    fetchClasses();
  }, []);

  // Fetch students when class or date changes
  useEffect(() => {
    if (selectedClassId) {
      fetchStudents(selectedClassId);
    }
  }, [selectedClassId, selectedDate]);

  const fetchClasses = async () => {
    try {
      setLoadingClasses(true);
      const res = await getTeacherClasses();
      setClasses(res.data.classes || []);
      setTeacherId(res.data.teacherId);
    } catch (err) {
      console.error('Failed to fetch classes:', err);
      showToast('error', 'Failed to load your classes');
    } finally {
      setLoadingClasses(false);
    }
  };

  const fetchStudents = async (classId) => {
    try {
      setLoadingStudents(true);
      setAlreadyMarked(false);

      // Fetch students list
      const studentsRes = await getStudentsByClass(classId);
      const studentsList = studentsRes.data.students || [];
      setStudents(studentsList);
      setClassInfo(studentsRes.data.classInfo);

      // Check if attendance already marked for this date
      const attendanceRes = await getAttendanceByDate(classId, selectedDate);
      if (attendanceRes.data.alreadyMarked) {
        setAlreadyMarked(true);
        // Pre-fill with existing attendance
        const existing = {};
        attendanceRes.data.records.forEach((r) => {
          existing[r.studentId] = r.status;
        });
        setAttendance(existing);
      } else {
        // Default all to 'present'
        const defaultAttendance = {};
        studentsList.forEach((s) => {
          defaultAttendance[s.id] = 'present';
        });
        setAttendance(defaultAttendance);
      }
    } catch (err) {
      console.error('Failed to fetch students:', err);
      showToast('error', 'Failed to load students');
    } finally {
      setLoadingStudents(false);
    }
  };

  const toggleStatus = (studentId) => {
    setAttendance((prev) => ({
      ...prev,
      [studentId]: prev[studentId] === 'present' ? 'absent' : 'present',
    }));
  };

  const markAllPresent = () => {
    const all = {};
    students.forEach((s) => {
      all[s.id] = 'present';
    });
    setAttendance(all);
  };

  const markAllAbsent = () => {
    const all = {};
    students.forEach((s) => {
      all[s.id] = 'absent';
    });
    setAttendance(all);
  };

  const handleSubmit = async () => {
    if (!selectedClassId || students.length === 0) return;

    try {
      setSubmitting(true);
      const records = Object.entries(attendance).map(([studentId, status]) => ({
        studentId: parseInt(studentId),
        status,
      }));

      const res = await submitAttendance({
        classId: parseInt(selectedClassId),
        date: selectedDate,
        records,
      });

      showToast(
        'success',
        `${alreadyMarked ? 'Updated' : 'Submitted'} — ${res.data.present} present, ${res.data.absent} absent`
      );
      setAlreadyMarked(true);
    } catch (err) {
      console.error('Failed to submit:', err);
      showToast('error', err.response?.data?.message || 'Failed to submit attendance');
    } finally {
      setSubmitting(false);
    }
  };

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  // Stats
  const presentCount = Object.values(attendance).filter((s) => s === 'present').length;
  const absentCount = Object.values(attendance).filter((s) => s === 'absent').length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-display font-bold text-gray-900">
          Upload Attendance
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Mark daily attendance for your assigned classes
        </p>
      </div>

      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-xl shadow-lg text-white text-sm font-medium transition-all duration-300 ${
            toast.type === 'success'
              ? 'bg-emerald-600'
              : 'bg-red-500'
          }`}
        >
          {toast.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
          )}
          {toast.message}
        </div>
      )}

      {/* Controls Card: Class + Date */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Class Selector */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Select Class
            </label>
            <div className="relative">
              <select
                value={selectedClassId}
                onChange={(e) => setSelectedClassId(e.target.value)}
                disabled={loadingClasses}
                className="w-full appearance-none bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 pr-10 text-sm font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-teacher-primary/30 focus:border-teacher-primary transition-all"
              >
                <option value="">
                  {loadingClasses ? 'Loading classes...' : '— Choose a class —'}
                </option>
                {classes.map((cls) => (
                  <option key={cls.id} value={cls.id}>
                    Class {cls.class_name} - Section {cls.section}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Date Picker */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Date
            </label>
            <div className="relative">
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                max={new Date().toISOString().split('T')[0]}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-teacher-primary/30 focus:border-teacher-primary transition-all"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loadingStudents && (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 text-teacher-primary animate-spin" />
          <p className="text-sm text-gray-500">Loading students...</p>
        </div>
      )}

      {/* No Class Selected */}
      {!selectedClassId && !loadingStudents && (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 flex flex-col items-center justify-center gap-3">
          <Users className="w-10 h-10 text-gray-300" />
          <p className="text-gray-400 text-sm">Select a class to mark attendance</p>
        </div>
      )}

      {/* Students Attendance List */}
      {selectedClassId && !loadingStudents && students.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          {/* Header Bar */}
          <div className="px-6 py-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-display font-bold text-gray-900">
                {classInfo
                  ? `Class ${classInfo.class_name} - ${classInfo.section}`
                  : 'Attendance'}
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                {students.length} students •{' '}
                {new Date(selectedDate).toLocaleDateString('en-IN', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
                {alreadyMarked && (
                  <span className="ml-2 inline-flex items-center gap-1 text-amber-600 font-medium">
                    <AlertCircle className="w-3 h-3" /> Already marked — editing
                  </span>
                )}
              </p>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={markAllPresent}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors"
              >
                <CheckSquare className="w-3.5 h-3.5" /> Select All
              </button>
              <button
                onClick={markAllAbsent}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
              >
                <XSquare className="w-3.5 h-3.5" /> Deselect All
              </button>
            </div>
          </div>

          {/* Stats Summary */}
          <div className="px-6 py-3 bg-gray-50/50 border-b border-gray-100 flex items-center gap-6">
            <div className="flex items-center gap-2 text-sm">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span className="text-gray-600">
                Present: <span className="font-bold text-gray-900">{presentCount}</span>
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
              <span className="text-gray-600">
                Absent: <span className="font-bold text-gray-900">{absentCount}</span>
              </span>
            </div>
            <div className="text-sm text-gray-400">
              {students.length > 0 &&
                `${((presentCount / students.length) * 100).toFixed(0)}% attendance`}
            </div>
          </div>

          {/* Student Rows */}
          <div className="divide-y divide-gray-100">
            {students.map((student, idx) => {
              const status = attendance[student.id] || 'present';
              const isPresent = status === 'present';

              return (
                <div
                  key={student.id}
                  onClick={() => toggleStatus(student.id)}
                  className="flex items-center px-6 py-3.5 cursor-pointer transition-colors hover:bg-gray-50/60"
                >
                  {/* Roll Number */}
                  <span className="text-xs font-mono text-gray-400 w-7 text-center">
                    {student.roll_number || idx + 1}
                  </span>

                  {/* Avatar */}
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center ml-2.5 flex-shrink-0 ${
                      isPresent ? 'bg-teacher-light' : 'bg-red-50'
                    }`}
                  >
                    <span
                      className={`text-sm font-bold ${
                        isPresent ? 'text-teacher-primary' : 'text-red-500'
                      }`}
                    >
                      {(student.user?.name || 'S')[0].toUpperCase()}
                    </span>
                  </div>

                  {/* Name — turns red when absent */}
                  <div className="ml-2.5 flex-1 min-w-0">
                    <p
                      className={`text-sm font-semibold transition-colors duration-150 ${
                        isPresent ? 'text-gray-900' : 'text-red-500'
                      }`}
                    >
                      {student.user?.name || 'Unknown Student'}
                    </p>
                    <p className="text-xs text-gray-400">
                      Roll #{student.roll_number}
                    </p>
                  </div>

                  {/* Checkbox on the right */}
                  <div
                    className={`w-[22px] h-[22px] rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all duration-150 ${
                      isPresent
                        ? 'bg-emerald-500 border-emerald-500'
                        : 'bg-transparent border-gray-300'
                    }`}
                  >
                    {isPresent && <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Submit Footer */}
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
            <p className="text-xs text-gray-500">
              Review before submitting. You can update later for the same date.
            </p>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-teacher-primary text-white text-sm font-semibold hover:bg-teacher-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Submitting...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  {alreadyMarked ? 'Update Attendance' : 'Submit Attendance'}
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Empty State: Class selected but no students */}
      {selectedClassId && !loadingStudents && students.length === 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 flex flex-col items-center justify-center gap-3">
          <Users className="w-10 h-10 text-gray-300" />
          <p className="text-gray-500 text-sm">No students enrolled in this class</p>
        </div>
      )}
    </div>
  );
}