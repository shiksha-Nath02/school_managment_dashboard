import api from './api';

// ========================
// TEACHER - Attendance APIs
// ========================

// Get classes assigned to the logged-in teacher
export const getTeacherClasses = () => api.get('/teacher/classes');

// Get students in a specific class
export const getStudentsByClass = (classId) => api.get(`/teacher/students/${classId}`);

// Submit attendance for a class on a date
// data: { classId, date, records: [{ studentId, status }] }
export const submitAttendance = (data) => api.post('/teacher/attendance', data);

// Check if attendance already exists for a class on a date
export const getAttendanceByDate = (classId, date) =>
  api.get(`/teacher/attendance/${classId}`, { params: { date } });

// ========================
// STUDENT - Attendance APIs
// ========================

// Get own attendance for a specific month/year
export const getMyAttendance = (month, year) =>
  api.get('/student/attendance', { params: { month, year } });

// Get yearly attendance summary (month-by-month breakdown)
export const getAttendanceSummary = (year) =>
  api.get('/student/attendance/summary', { params: { year } });