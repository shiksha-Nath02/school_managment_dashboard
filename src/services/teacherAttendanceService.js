import api from './api';

const svc = {
  // Teacher's own attendance view
  getMyAttendance: (month, year) => api.get('/teacher/my-attendance', { params: { month, year } }).then((r) => r.data),
  selfCheckIn: (image_base64) => api.post('/teacher/self-checkin', { image_base64 }).then((r) => r.data),
  selfCheckOut: (image_base64) => api.post('/teacher/self-checkout', { image_base64 }).then((r) => r.data),

  // Admin attendance management
  getAllTeachers: () => api.get('/admin/teachers').then((r) => r.data),
  getAttendance: (date) => api.get('/admin/teacher-attendance', { params: { date } }).then((r) => r.data),
  checkIn: (teacherId, image_base64) => api.post('/admin/teacher-attendance/check-in', { teacherId, image_base64 }).then((r) => r.data),
  checkOut: (teacherId, image_base64) => api.post('/admin/teacher-attendance/check-out', { teacherId, image_base64 }).then((r) => r.data),
  markStatus: (data) => api.post('/admin/teacher-attendance/mark-status', data).then((r) => r.data),
  updateRecord: (id, data) => api.put(`/admin/teacher-attendance/${id}`, data).then((r) => r.data),
  bulkMarkAbsent: (date) => api.post('/admin/teacher-attendance/bulk-absent', { date }).then((r) => r.data),
  getMonthlySummary: (month, year) => api.get('/admin/teacher-attendance/summary', { params: { month, year } }).then((r) => r.data),
  verifyAttendance: (id) => api.post(`/admin/teacher-attendance/${id}/verify`).then((r) => r.data),

  // Self-attendance setting
  getSelfAttendanceSetting: (date) => api.get('/admin/settings/self-attendance', { params: date ? { date } : {} }).then((r) => r.data),
  setSelfAttendanceSetting: (enabled, date) => api.post('/admin/settings/self-attendance', { enabled, ...(date ? { date } : {}) }).then((r) => r.data),
};

export default svc;
