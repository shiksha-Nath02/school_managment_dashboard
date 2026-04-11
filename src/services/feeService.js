import api from './api';

// ===== SESSION — mounted at /admin/sessions =====
export const getSessions = () => api.get('/admin/sessions');
export const getActiveSession = () => api.get('/admin/sessions/active');
export const createSession = (data) => api.post('/admin/sessions', data);
export const updateSessionFees = (sessionId, data) => api.put(`/admin/sessions/${sessionId}/fees`, data);
export const promoteStudents = (sessionId, promotions) =>
  api.post(`/admin/sessions/${sessionId}/promote`, { promotions });

// ===== INDIVIDUAL FEE — /admin/fees/* =====
export const getStudentFeeDetails = (studentId) => api.get(`/admin/fees/student/${studentId}`);
export const recordPayment = (data) => api.post('/admin/fees/pay', data);
export const reversePayment = (paymentId, reason) =>
  api.post(`/admin/fees/reverse/${paymentId}`, { reason });

// ===== BULK PAYMENT =====
export const recordBulkPayment = (data) => api.post('/admin/fees/bulk-pay', data);

// ===== DUES & REPORTS =====
export const getStudentsWithDues = (class_id) =>
  api.get('/admin/fees/dues', { params: class_id ? { class_id } : {} });
export const getClasswiseReport = (params) => api.get('/admin/fees/classwise', { params });
export const getClassWiseReport = (params) => api.get('/admin/fees/classwise', { params });

// ===== PROFIT & PAYMENT LOG — /admin/* =====
export const getProfit = (from, to) => api.get('/admin/profit', { params: { from, to } });
export const getPaymentLog = (params) => api.get('/admin/payment-log', { params });
export const addPaymentLogEntry = (data) => api.post('/admin/payment-log', data);

// ===== STUDENT PORTAL — /student/fee-history =====
export const getOwnFees = () => api.get('/student/fee-history');
export const getMyFeeHistory = (params) => api.get('/student/fee-history', { params });
export const getMyFeeSummary = () => api.get('/student/fee-history');
export const initOnlinePayment = (data) => api.post('/student/fee/pay', data);
