import api from './api';

// Consolidated report-card data for a whole class (or one student via ?studentId).
// Returns { class, session, students:[{ profile, marks[], attendance }] }.
export const getClassReportCards = (classId, params = {}) =>
  api.get(`/admin/report-cards/${classId}`, { params });

// Per-student attendance summary over a date range.
// Returns { from, to, students:[{ present, absent, total, percentage }] }.
export const getClassAttendanceSummary = (params = {}) =>
  api.get('/admin/class-attendance', { params });

export default { getClassReportCards, getClassAttendanceSummary };
