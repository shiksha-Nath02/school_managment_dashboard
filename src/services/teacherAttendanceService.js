import api from './api';

const svc = {
  // Teacher's own attendance view
  getMyAttendance: (month, year) => api.get('/teacher/my-attendance', { params: { month, year } }).then((r) => r.data),

  getAllTeachers: () => api.get('/admin/teachers').then((r) => r.data),
  getAttendance: (date) => api.get('/admin/teacher-attendance', { params: { date } }).then((r) => r.data),
  checkIn: (teacherId) => api.post('/admin/teacher-attendance/check-in', { teacherId }).then((r) => r.data),
  checkOut: (teacherId) => api.post('/admin/teacher-attendance/check-out', { teacherId }).then((r) => r.data),
  markStatus: (data) => api.post('/admin/teacher-attendance/mark-status', data).then((r) => r.data),
  updateRecord: (id, data) => api.put(`/admin/teacher-attendance/${id}`, data).then((r) => r.data),
  bulkMarkAbsent: (date) => api.post('/admin/teacher-attendance/bulk-absent', { date }).then((r) => r.data),
  getMonthlySummary: (month, year) => api.get('/admin/teacher-attendance/summary', { params: { month, year } }).then((r) => r.data),
};

export default svc;
