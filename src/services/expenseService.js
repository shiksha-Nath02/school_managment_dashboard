import api from './api';

const svc = {
  getExpenses:   (category) => api.get('/admin/expenses', { params: { category } }).then((r) => r.data),
  addExpense:    (data)     => api.post('/admin/expenses', data).then((r) => r.data),
  deleteExpense: (id)       => api.delete(`/admin/expenses/${id}`).then((r) => r.data),

  // Handover reconciliation
  getHandovers:       (params) => api.get('/admin/handovers', { params }).then((r) => r.data),
  addHandover:        (data)   => api.post('/admin/handovers', data).then((r) => r.data),
  deleteHandover:     (id)     => api.delete(`/admin/handovers/${id}`).then((r) => r.data),
  getHandoverSummary: (params) => api.get('/admin/handover-summary', { params }).then((r) => r.data),
};

export default svc;
